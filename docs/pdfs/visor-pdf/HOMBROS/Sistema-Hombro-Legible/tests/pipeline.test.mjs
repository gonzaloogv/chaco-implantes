import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const projectDir = resolve(import.meta.dirname, "..");
const cutoutFiles = Object.freeze([
  "anatomica-explotada.png",
  "reversa-explotada.png",
  "anatomica-stemless.png",
  "reversa-stemless.png",
  "anatomica-detalle.png",
  "cabeza-anatomica.png",
  "reversa-armada.png",
  "glenoide-anatomico.png",
  "baseplate-reversa.png",
]);

test("SISTEMA DE HOMBRO: los nueve recortes aprobados conservan transparencia útil", async () => {
  for (const fileName of cutoutFiles) {
    const filePath = resolve(projectDir, "assets", "cutouts", fileName);
    const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.channels, 4, `${fileName} no tiene canal alfa`);
    const cornerOffsets = [
      3,
      (info.width - 1) * 4 + 3,
      (info.height - 1) * info.width * 4 + 3,
      ((info.height - 1) * info.width + info.width - 1) * 4 + 3,
    ];
    cornerOffsets.forEach((offset) => assert.ok(data[offset] <= 5, `${fileName} conserva fondo en una esquina`));
    let visible = 0;
    for (let offset = 3; offset < data.length; offset += 4) {
      if (data[offset] >= 24) visible += 1;
    }
    const coverage = visible / (info.width * info.height);
    assert.ok(coverage >= 0.03 && coverage <= 0.82, `${fileName} tiene cobertura alfa anómala: ${coverage}`);
  }
});

test("SISTEMA DE HOMBRO: los recursos preparados quedan ajustados al objeto", async () => {
  for (const fileName of cutoutFiles) {
    const filePath = resolve(projectDir, "assets", "source", fileName);
    const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let minX = info.width;
    let minY = info.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const alpha = data[(y * info.width + x) * info.channels + 3];
        if (alpha < 24) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    assert.ok(maxX >= 0 && maxY >= 0, `${fileName} no conserva píxeles visibles`);
    assert.ok(minX <= 2, `${fileName} deja margen transparente a la izquierda: ${minX}px`);
    assert.ok(minY <= 2, `${fileName} deja margen transparente arriba: ${minY}px`);
    assert.ok(info.width - 1 - maxX <= 2, `${fileName} deja margen transparente a la derecha`);
    assert.ok(info.height - 1 - maxY <= 2, `${fileName} deja margen transparente abajo`);
  }
});

test("SISTEMA DE HOMBRO: incluye un pipeline reproducible y autocontenido", async () => {
  const required = [
    "package.json",
    "scripts/prepare-assets.mjs",
    "scripts/build.mjs",
    "scripts/export.mjs",
    "scripts/verify.mjs",
    "scripts/verify-pdf-fonts.py",
  ];
  const missing = [];
  for (const relativePath of required) {
    try {
      await access(resolve(projectDir, relativePath));
    } catch {
      missing.push(relativePath);
    }
  }
  assert.deepEqual(missing, []);
});

test("SISTEMA DE HOMBRO: construye seis SVG, un maestro y la fuente HTML", async () => {
  let buildOutputs = null;
  try {
    ({ buildOutputs } = await import("../scripts/build.mjs"));
  } catch {
    buildOutputs = null;
  }
  assert.equal(typeof buildOutputs, "function", "falta implementar la construcción de salidas");

  const tempDir = await mkdtemp(resolve(tmpdir(), "sistema-hombro-build-"));
  try {
    const staleFiles = [
      resolve(tempDir, "sistema-hombro-07.webp"),
      resolve(tempDir, "editable", "sistema-hombro-07.svg"),
      resolve(tempDir, "pdf-rendered", "sistema-hombro-7.png"),
    ];
    await Promise.all([
      mkdir(resolve(tempDir, "editable"), { recursive: true }),
      mkdir(resolve(tempDir, "pdf-rendered"), { recursive: true }),
    ]);
    await Promise.all(staleFiles.map((filePath) => writeFile(filePath, "salida obsoleta", "utf8")));

    const result = await buildOutputs({ outputDir: tempDir });
    assert.equal(result.pageSvgs.length, 6);
    assert.deepEqual(
      result.pageSvgs.map((filePath) => basename(filePath)),
      [1, 2, 3, 4, 5, 6].map((number) => `sistema-hombro-${String(number).padStart(2, "0")}.svg`),
    );
    const master = await readFile(result.masterSvg, "utf8");
    const html = await readFile(result.printHtml, "utf8");
    assert.match(master, /viewBox="0 0 7350 1698"/);
    assert.match(html, /<html lang="es">/);
    assert.equal((html.match(/class="page"/g) ?? []).length, 6);
    for (const staleFile of staleFiles) {
      await assert.rejects(access(staleFile), (error) => error.code === "ENOENT");
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
