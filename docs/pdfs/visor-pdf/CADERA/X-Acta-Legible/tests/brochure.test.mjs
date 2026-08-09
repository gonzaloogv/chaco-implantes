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

test("el lienzo y la tipografía priorizan lectura sin zoom", async () => {
  const constantsPath = resolve(projectDir, "src", "constants.mjs");
  assert.ok(existsSync(constantsPath), "falta src/constants.mjs");

  const { PAGE, COLORS, TYPOGRAPHY } = await import(pathToFileURL(constantsPath));
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
  assert.ok(TYPOGRAPHY.body >= 28);
  assert.ok(TYPOGRAPHY.bodySmall >= 24);
  assert.ok(TYPOGRAPHY.label >= 20);
  assert.ok(TYPOGRAPHY.finePrint >= 18);
});

test("el contenido editorial usa siete páginas y evita tablas densas", async () => {
  const contentPath = resolve(projectDir, "src", "content.mjs");
  assert.ok(existsSync(contentPath), "falta src/content.mjs");

  const { brochure } = await import(pathToFileURL(contentPath));
  assert.equal(brochure.product, "X-ACTA");
  assert.equal(brochure.pages.length, 7);
  assert.deepEqual(
    brochure.pages.map((page) => page.number),
    ["01 / 07", "02 / 07", "03 / 07", "04 / 07", "05 / 07", "06 / 07", "07 / 07"],
  );
  assert.equal(brochure.pages[1].features.length, 6);
  assert.deepEqual(
    brochure.pages[2].centralizers.map((item) => item.name),
    ["SIN ALETAS", "REGULAR", "GRANDE"],
  );
  assert.deepEqual(
    brochure.pages[3].configurations.map((item) => item.offset),
    ["35,5 mm", "37,5 mm", "44 mm", "50 mm"],
  );
  assert.match(JSON.stringify(brochure.pages[4]), /125°|ESTÁNDAR|CORTO/);
  assert.equal(brochure.pages[5].steps.length, 4);
  assert.equal(brochure.pages[6].ctaAction, "Descargá la ficha completa");
  assert.equal(brochure.contact.whatsapp, undefined);
});

test("la preparación usa siete imágenes funcionales y dos logotipos", async () => {
  const preparePath = resolve(projectDir, "scripts", "prepare-assets.mjs");
  assert.ok(existsSync(preparePath), "falta scripts/prepare-assets.mjs");

  const { inputAssets, fontVariants } = await import(pathToFileURL(preparePath));
  assert.deepEqual(
    inputAssets.map((asset) => asset.output),
    [
      "x-acta-vastago-completo.png",
      "x-acta-centralizador-pmma.png",
      "x-acta-detalles-tecnicos.png",
      "x-acta-instrumental.png",
      "x-acta-radiografia.png",
      "x-acta-offsets.png",
      "x-acta-standard-short.png",
      "logo-chaco.png",
      "logo-medacta.png",
    ],
  );
  assert.equal(fontVariants.length, 6);
});

test("el render produce siete SVG autocontenidos y sin texto microscópico", async () => {
  const pagesPath = resolve(projectDir, "src", "pages.mjs");
  assert.ok(existsSync(pagesPath), "falta src/pages.mjs");

  const { renderPages } = await import(pathToFileURL(pagesPath));
  const pages = await renderPages();
  assert.equal(pages.length, 7);

  pages.forEach((svg, index) => {
    assert.match(svg, /viewBox="0 0 1200 1698"/);
    assert.match(svg, new RegExp(`data-page="${index + 1}"`));
    assert.match(svg, /data:image\/png;base64,/);
    assert.match(svg, /data:font\/woff2;base64,/);
    assert.doesNotMatch(svg, /\b(?:href|src)="(?:file:|https?:|[A-Z]:[\\/])/i);
    assert.doesNotMatch(svg, /<rect[^>]+fill="#ffffff"/i);
    assert.doesNotMatch(svg, /Ãƒ|Ã‚|ï¿½|�/);
    assert.doesNotMatch(svg, /<ellipse\b/i);

    const explicitSizes = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(
      (match) => Number(match[1]),
    );
    assert.ok(explicitSizes.length > 0);
    assert.ok(
      explicitSizes.every((size) => size >= 18),
      `la página ${index + 1} contiene texto menor de 18 px`,
    );
  });
});

test("la portada presenta el tallo completo con escala protagonista", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [cover] = await renderPages();
  const product = cover.match(
    /<image id="producto-principal"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(product, "falta el producto principal");
  assert.ok(Number(product[3]) >= 560);
  assert.ok(Number(product[4]) >= 1000);
  assert.match(cover, /TALLO FEMORAL CEMENTADO/);
});

test("la página 2 relaciona seis decisiones de diseño con el producto", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, page2] = await renderPages();
  assert.equal((page2.match(/data-role="design-feature"/g) ?? []).length, 6);
  const image = page2.match(
    /<image id="detalles-tecnicos-principal"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(image, "falta la vista técnica principal");
  assert.ok(Number(image[3]) >= 560);
  assert.ok(Number(image[4]) >= 850);
  assert.match(page2, /data-layout="design-key"/);
});

test("la página 3 explica el centralizador y sus tres configuraciones", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, , page3] = await renderPages();
  assert.equal((page3.match(/data-role="centralizer-option"/g) ?? []).length, 3);
  const image = page3.match(
    /<image id="centralizador-principal"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(image, "falta el centralizador principal");
  assert.ok(Number(image[3]) >= 500);
  assert.ok(Number(image[4]) >= 900);
  assert.match(page3, /Ø10 mm/);
  assert.match(page3, /Ø18 mm/);
});

test("la página 4 separa cuatro offsets en módulos visuales sin superposición", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, , , page4] = await renderPages();
  assert.equal((page4.match(/id="offset-product-\d{2}"/g) ?? []).length, 4);
  assert.equal((page4.match(/clip-path="url\(#offset-clip-\d\)"/g) ?? []).length, 4);
  assert.equal((page4.match(/data-role="offset-label"/g) ?? []).length, 4);
  assert.match(page4, />35,5 mm<\/text>/);
  assert.match(page4, />50 mm<\/text>/);
});

test("la página 5 compara claramente los diseños estándar y corto", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, , , , page5] = await renderPages();
  const comparison = page5.match(
    /<image id="comparacion-longitudes"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(comparison, "falta la comparación de longitudes");
  assert.ok(Number(comparison[2]) >= 460, "el esquema invade el texto introductorio");
  assert.ok(Number(comparison[3]) >= 620);
  assert.ok(Number(comparison[4]) >= 980);
  assert.match(page5, />125°<\/text>/);
  assert.equal((page5.match(/data-role="length-option"/g) ?? []).length, 2);
});

test("la página 6 reemplaza la foto de instrumental por una secuencia de implantación", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, , , , , page6] = await renderPages();
  assert.equal((page6.match(/data-role="workflow-step"/g) ?? []).length, 4);
  assert.doesNotMatch(page6, /id="instrumental-principal"/);
  assert.match(page6, /data-layout="implantation-sequence"/);
  assert.match(page6, /data-layout="implantation-summary"/);
  assert.match(page6, />05 — IMPLANTACIÓN<\/text>/);
  assert.match(page6, />MOVILIDAD · ESTABILIDAD<\/tspan>/);
  assert.match(page6, />LONGITUD DEL MIEMBRO<\/tspan>/);
  const image = page6.match(
    /<image id="implantacion-principal"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(image, "falta el tallo como ancla visual de implantación");
  assert.ok(Number(image[3]) >= 320);
  assert.ok(Number(image[4]) >= 850);
});

test("la página 7 cierra con radiografía y descarga documental", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, , , , , , page7] = await renderPages();
  const image = page7.match(
    /<image id="radiografia-cierre"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(image, "falta la radiografía de cierre");
  assert.ok(Number(image[3]) >= 720);
  assert.match(page7, /preserveAspectRatio="xMidYMin slice"/);
  assert.match(page7, /data-layout="reference-cta"/);
  assert.match(page7, /id="download-arrow"/);
  assert.match(page7, />Descargá la ficha completa<\/text>/);
  assert.match(page7, /99\.60\.12/);
  assert.doesNotMatch(page7, /WHATSAPP|0362-4571854/);
  assert.match(page7, />DIRECCIÓN<\/text>/);
  assert.match(page7, />INSTAGRAM<\/text>/);
});

test("la compilación genera siete editables y HTML de impresión", async () => {
  const buildPath = resolve(projectDir, "scripts", "build.mjs");
  assert.ok(existsSync(buildPath), "falta scripts/build.mjs");
  const { buildOutputs } = await import(pathToFileURL(buildPath));
  const temporaryOutput = await mkdtemp(resolve(tmpdir(), "x-acta-legible-build-"));
  try {
    const result = await buildOutputs({ outputDir: temporaryOutput });
    assert.equal(result.pageSvgs.length, 7);
    const master = await readFile(result.masterSvg, "utf8");
    assert.match(master, /viewBox="0 0 8580 1698"/);
    assert.equal((master.match(/id="pagina-\d{2}"/g) ?? []).length, 7);
    const html = await readFile(result.printHtml, "utf8");
    assert.equal((html.match(/class="page"/g) ?? []).length, 7);
    assert.match(html, /@page\s*\{\s*size:\s*1200px 1698px/);
  } finally {
    await rm(temporaryOutput, { recursive: true, force: true });
  }
});

test("la exportación genera siete WebP sRGB y un PDF de siete páginas", async () => {
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
  const temporaryOutput = await mkdtemp(resolve(tmpdir(), "x-acta-legible-export-"));
  try {
    const build = await buildOutputs({ outputDir: temporaryOutput });
    const exported = await exportOutputs({
      outputDir: temporaryOutput,
      htmlPath: build.printHtml,
    });
    assert.equal(exported.webps.length, 7);

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
    assert.equal(pdf.getPageCount(), 7);

    const report = await verifyOutputs({ outputDir: temporaryOutput });
    assert.equal(report.passed, true, report.errors.join("\n"));
  } finally {
    await rm(temporaryOutput, { recursive: true, force: true });
  }
});
