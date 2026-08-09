import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(testDir, "..");
const require = createRequire(import.meta.url);

test("el lienzo conserva el sistema editorial aprobado", async () => {
  const constantsPath = resolve(projectDir, "src", "constants.mjs");
  assert.ok(existsSync(constantsPath), "falta src/constants.mjs");

  const { PAGE, COLORS } = await import(pathToFileURL(constantsPath));
  assert.deepEqual(PAGE, {
    width: 1200,
    height: 1698,
    safe: 60,
    margin: 88,
    gap: 30,
  });
  assert.equal(COLORS.background, "#eef2f9");
  assert.equal(COLORS.ink, "#192338");
  assert.equal(COLORS.accent, "#2b6cb8");
});

test("el contenido resume cinco páginas de doble movilidad", async () => {
  const contentPath = resolve(projectDir, "src", "content.mjs");
  assert.ok(existsSync(contentPath), "falta src/content.mjs");

  const { brochure } = await import(pathToFileURL(contentPath));
  assert.equal(brochure.product, "Versafitcup");
  assert.equal(brochure.pages.length, 5);
  assert.deepEqual(
    brochure.pages.map((page) => page.number),
    ["01 / 05", "02 / 05", "03 / 05", "04 / 05", "05 / 05"],
  );

  const [, page2, page3, page4, page5] = brochure.pages;
  assert.equal(page2.items.length, 4);
  assert.match(JSON.stringify(page2), /Highcross|press-fit|1976/);
  assert.equal(page3.components.length, 4);
  assert.deepEqual(page4.cupDiameters, [46, 48, 50, 52, 54, 56, 58, 60, 62, 64]);
  assert.deepEqual(page4.headDiameters, ["22,2", "28"]);
  assert.equal(page5.ctaAction, "Descargá la ficha completa");
  assert.equal(brochure.contact.whatsapp, undefined);
});

test("la preparación usa las cinco imágenes oficiales y dos logotipos", async () => {
  const preparePath = resolve(projectDir, "scripts", "prepare-assets.mjs");
  assert.ok(existsSync(preparePath), "falta scripts/prepare-assets.mjs");

  const { inputAssets, fontVariants } = await import(pathToFileURL(preparePath));
  assert.equal(inputAssets.length, 7);
  assert.deepEqual(
    inputAssets.map((asset) => asset.output),
    [
      "versafitcup-interior.png",
      "versafitcup-cotilo.png",
      "versafitcup-despiece.png",
      "versafitcup-conjunto.png",
      "versafitcup-adaptadores.png",
      "logo-chaco.png",
      "logo-medacta.png",
    ],
  );
  assert.equal(fontVariants.length, 6);
});

test("el render produce cinco SVG autocontenidos sin tarjetas blancas", async () => {
  const pagesPath = resolve(projectDir, "src", "pages.mjs");
  assert.ok(existsSync(pagesPath), "falta src/pages.mjs");

  const { renderPages } = await import(pathToFileURL(pagesPath));
  const pages = await renderPages();
  assert.equal(pages.length, 5);

  pages.forEach((svg, index) => {
    assert.match(svg, /viewBox="0 0 1200 1698"/);
    assert.match(svg, new RegExp(`data-page="${index + 1}"`));
    assert.match(svg, /data:image\/png;base64,/);
    assert.match(svg, /data:font\/woff2;base64,/);
    assert.doesNotMatch(
      svg,
      /\b(?:href|src)="(?:file:|https?:|[A-Z]:[\\/])/i,
    );
    assert.doesNotMatch(svg, /<rect[^>]+fill="#ffffff"/i);
    assert.doesNotMatch(svg, /Ã|Â|�/);
  });
});

test("la portada presenta el sistema completo con escala protagonista", async () => {
  const pagesPath = resolve(projectDir, "src", "pages.mjs");
  assert.ok(existsSync(pagesPath), "falta src/pages.mjs");
  const { renderPages } = await import(pathToFileURL(pagesPath));
  const [cover] = await renderPages();

  const product = cover.match(
    /<image id="producto-principal"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(product, "falta el sistema completo");
  assert.ok(Number(product[3]) >= 720);
  assert.ok(Number(product[4]) >= 780);
  assert.ok(Number(product[1]) >= 60 && Number(product[2]) >= 60);
  assert.ok(Number(product[1]) + Number(product[3]) <= 1200);
  assert.ok(Number(product[2]) + Number(product[4]) <= 1440);
});

test("la página 2 relaciona el interior pulido con cuatro ventajas", async () => {
  const pagesPath = resolve(projectDir, "src", "pages.mjs");
  assert.ok(existsSync(pagesPath), "falta src/pages.mjs");
  const { renderPages } = await import(pathToFileURL(pagesPath));
  const [, page2] = await renderPages();

  const detail = page2.match(
    /<image id="detalle-interior"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(detail, "falta el detalle interior");
  assert.ok(Number(detail[3]) >= 500);
  assert.ok(Number(detail[4]) >= 380);
  assert.equal((page2.match(/data-role="benefit"/g) ?? []).length, 4);
  assert.match(page2, /INTERIOR PULIDO A ESPEJO/);
});

test("la página 3 explica cuatro componentes con un único despiece", async () => {
  const pagesPath = resolve(projectDir, "src", "pages.mjs");
  assert.ok(existsSync(pagesPath), "falta src/pages.mjs");
  const { renderPages } = await import(pathToFileURL(pagesPath));
  const [, , page3] = await renderPages();

  const exploded = page3.match(
    /<image id="sistema-despiece"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(exploded, "falta el despiece");
  assert.ok(Number(exploded[3]) >= 900);
  assert.ok(Number(exploded[4]) >= 600);
  assert.equal((page3.match(/data-role="component"/g) ?? []).length, 4);
  assert.match(page3, /DOS SUPERFICIES DE MOVIMIENTO/);
});

test("la página 4 muestra diez diámetros, dos cabezas y adaptadores", async () => {
  const pagesPath = resolve(projectDir, "src", "pages.mjs");
  assert.ok(existsSync(pagesPath), "falta src/pages.mjs");
  const { renderPages } = await import(pathToFileURL(pagesPath));
  const [, , , page4] = await renderPages();

  assert.equal((page4.match(/data-role="diameter-row"/g) ?? []).length, 10);
  assert.match(page4, /CABEZA 22,2/);
  assert.match(page4, /CABEZA 28/);
  const adapters = page4.match(
    /<image id="adaptadores-prueba"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(adapters, "faltan los adaptadores");
  assert.ok(Number(adapters[3]) >= 520);
  assert.ok(Number(adapters[4]) >= 300);
  assert.match(page4, />S<\/text>/);
  assert.match(page4, />XXL<\/text>/);
});

test("la página 5 replica el cierre documental sin WhatsApp", async () => {
  const pagesPath = resolve(projectDir, "src", "pages.mjs");
  assert.ok(existsSync(pagesPath), "falta src/pages.mjs");
  const { renderPages } = await import(pathToFileURL(pagesPath));
  const [, , , , page5] = await renderPages();

  const product = page5.match(
    /<image id="cierre-producto-image"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(product, "falta el cotilo de cierre");
  assert.ok(Number(product[3]) >= 680);
  assert.match(page5, /data-layout="reference-cta"/);
  assert.match(page5, /id="download-arrow"/);
  assert.match(page5, />Descargá la ficha completa<\/text>/);
  assert.match(page5, /99\.16\.12/);
  assert.doesNotMatch(page5, /WHATSAPP|0362-4571854/);
  assert.match(page5, />DIRECCIÓN<\/text>/);
  assert.match(page5, />INSTAGRAM<\/text>/);
});

test("la compilación genera editables y HTML de impresión", async () => {
  const buildPath = resolve(projectDir, "scripts", "build.mjs");
  assert.ok(existsSync(buildPath), "falta scripts/build.mjs");

  const { buildOutputs } = await import(pathToFileURL(buildPath));
  const temporaryOutput = await mkdtemp(
    resolve(tmpdir(), "versafitcup-build-test-"),
  );
  try {
    const result = await buildOutputs({ outputDir: temporaryOutput });
    assert.equal(result.pageSvgs.length, 5);
    assert.ok(existsSync(result.masterSvg));
    assert.ok(existsSync(result.printHtml));

    const master = await readFile(result.masterSvg, "utf8");
    assert.match(master, /viewBox="0 0 6120 1698"/);
    assert.equal((master.match(/id="pagina-\d{2}"/g) ?? []).length, 5);

    const html = await readFile(result.printHtml, "utf8");
    assert.equal((html.match(/class="page"/g) ?? []).length, 5);
    assert.match(html, /@page\s*\{\s*size:\s*1200px 1698px/);
  } finally {
    await rm(temporaryOutput, { recursive: true, force: true });
  }
});

test("la exportación genera cinco WebP sRGB exactos y un PDF de cinco páginas", async () => {
  const buildPath = resolve(projectDir, "scripts", "build.mjs");
  const exportPath = resolve(projectDir, "scripts", "export.mjs");
  const verifyPath = resolve(projectDir, "scripts", "verify.mjs");
  assert.ok(existsSync(buildPath), "falta scripts/build.mjs");
  assert.ok(existsSync(exportPath), "falta scripts/export.mjs");
  assert.ok(existsSync(verifyPath), "falta scripts/verify.mjs");

  const [{ buildOutputs }, { exportOutputs }, { verifyOutputs }] =
    await Promise.all([
      import(pathToFileURL(buildPath)),
      import(pathToFileURL(exportPath)),
      import(pathToFileURL(verifyPath)),
    ]);
  const temporaryOutput = await mkdtemp(
    resolve(tmpdir(), "versafitcup-export-test-"),
  );
  try {
    const build = await buildOutputs({ outputDir: temporaryOutput });
    const exported = await exportOutputs({
      outputDir: temporaryOutput,
      htmlPath: build.printHtml,
    });
    assert.equal(exported.webps.length, 5);

    const sharp = require("sharp");
    for (const webp of exported.webps) {
      const metadata = await sharp(webp.path).metadata();
      assert.equal(metadata.width, 1200);
      assert.equal(metadata.height, 1698);
      assert.equal(metadata.format, "webp");
      assert.equal(metadata.space, "srgb");
      assert.equal(metadata.hasProfile, true);
      assert.ok(webp.bytes <= 200 * 1024);
    }
    sharp.cache(false);

    const { PDFDocument } = require("pdf-lib");
    const pdf = await PDFDocument.load(await readFile(exported.pdfPath));
    assert.equal(pdf.getPageCount(), 5);

    const report = await verifyOutputs({ outputDir: temporaryOutput });
    assert.equal(report.passed, true, report.errors.join("\n"));
  } finally {
    await rm(temporaryOutput, { recursive: true, force: true });
  }
});

