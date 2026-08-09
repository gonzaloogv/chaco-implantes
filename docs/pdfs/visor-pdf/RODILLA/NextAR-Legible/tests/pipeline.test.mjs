import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectDir = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const sharp = require("sharp");

const requiredFiles = Object.freeze([
  "package.json",
  "scripts/prepare-assets.mjs",
  "scripts/build.mjs",
  "scripts/export.mjs",
  "scripts/verify.mjs",
  "scripts/verify-pdf-fonts.py",
]);

async function importProjectFile(relativePath) {
  return import(pathToFileURL(resolve(projectDir, relativePath)).href);
}

test("NEXTAR: incluye un pipeline reproducible de preparación, construcción y control", async () => {
  const missing = [];
  for (const relativePath of requiredFiles) {
    try {
      await access(resolve(projectDir, relativePath));
    } catch {
      missing.push(relativePath);
    }
  }
  assert.deepEqual(missing, [], `faltan archivos del pipeline: ${missing.join(", ")}`);

  const packageJson = JSON.parse(await readFile(resolve(projectDir, "package.json"), "utf8"));
  assert.equal(packageJson.type, "module");
  for (const script of ["prepare", "test", "build", "export", "verify", "verify:fonts", "release"]) {
    assert.equal(typeof packageJson.scripts?.[script], "string", `falta el script npm ${script}`);
  }

  const auditRegistry = await readFile(
    resolve(projectDir, "..", "shared-preview", "audit-contact-sheets.mjs"),
    "utf8",
  );
  assert.match(auditRegistry, /"NextAR-Legible"/, "falta registrar NextAR en la auditoría compartida");
});

test("NEXTAR: prepara únicamente los ocho recursos aprobados y seis fuentes", async () => {
  const { inputAssets, fontVariants } = await importProjectFile("scripts/prepare-assets.mjs");
  assert.deepEqual(
    inputAssets.map(({ output }) => output),
    [
      "nextar-hero.png",
      "nextar-planning.png",
      "nextar-reality.png",
      "nextar-tracking.png",
      "logo-nextar.png",
      "logo-chaco.png",
      "logo-chaco-white.png",
      "logo-medacta.png",
    ],
  );
  assert.equal(fontVariants.length, 6);
  assert.ok(inputAssets.every(({ source }) => !/chatgpt|plataforma/i.test(source)));
});

test("NEXTAR: prepara el logo principal en tinta sobre transparencia", async () => {
  const { data, info } = await sharp(resolve(projectDir, "assets", "source", "logo-nextar.png"))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const totals = [0, 0, 0];
  let visiblePixels = 0;

  for (let offset = 0; offset < data.length; offset += info.channels) {
    if (data[offset + 3] <= 16) continue;
    totals[0] += data[offset];
    totals[1] += data[offset + 1];
    totals[2] += data[offset + 2];
    visiblePixels += 1;
  }

  assert.ok(visiblePixels > 0, "el logo preparado no contiene píxeles visibles");
  const average = totals.map((total) => Math.round(total / visiblePixels));
  assert.deepEqual(average, [25, 35, 56], "el logo debe usar la tinta #192338");
});

test("NEXTAR: construye seis SVG editables, un maestro y una fuente HTML", async () => {
  const tempDir = await mkdtemp(resolve(tmpdir(), "nextar-build-"));
  try {
    const { buildOutputs } = await importProjectFile("scripts/build.mjs");
    const result = await buildOutputs({ outputDir: tempDir });

    assert.equal(result.pageSvgs.length, 6);
    assert.deepEqual(
      result.pageSvgs.map((filePath) => basename(filePath)),
      [
        "nextar-01.svg",
        "nextar-02.svg",
        "nextar-03.svg",
        "nextar-04.svg",
        "nextar-05.svg",
        "nextar-06.svg",
      ],
    );
    const master = await readFile(result.masterSvg, "utf8");
    const html = await readFile(result.printHtml, "utf8");
    assert.match(master, /viewBox="0 0 7350 1698"/);
    assert.match(html, /<html lang="es">/);
    assert.equal((html.match(/class="page"/g) ?? []).length, 6);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("NEXTAR: la verificación detecta entregables ausentes sin ocultar errores", async () => {
  const tempDir = await mkdtemp(resolve(tmpdir(), "nextar-verify-"));
  try {
    const { verifyOutputs } = await importProjectFile("scripts/verify.mjs");
    const report = await verifyOutputs({ outputDir: tempDir, writeReport: false });
    assert.equal(report.passed, false);
    assert.equal(report.pageCount, 6);
    assert.ok(report.errors.length >= 6);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
