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
  assert.ok(TYPOGRAPHY.body >= 27);
  assert.ok(TYPOGRAPHY.bodySmall >= 23);
  assert.ok(TYPOGRAPHY.label >= 19);
  assert.ok(TYPOGRAPHY.finePrint >= 18);
});

test("el contenido se distribuye en seis páginas sin relleno", async () => {
  const contentPath = resolve(projectDir, "src", "content.mjs");
  assert.ok(existsSync(contentPath), "falta src/content.mjs");

  const { brochure } = await import(pathToFileURL(contentPath));
  assert.equal(brochure.product, "MASTERLOC");
  assert.equal(brochure.pages.length, 6);
  assert.deepEqual(
    brochure.pages.map((page) => page.number),
    ["01 / 06", "02 / 06", "03 / 06", "04 / 06", "05 / 06", "06 / 06"],
  );
  assert.equal(brochure.pages[1].principles.length, 3);
  assert.match(JSON.stringify(brochure.pages[2]), /MectaGrip|VPS|titanio/);
  assert.equal(brochure.pages[3].features.length, 2);
  assert.deepEqual(
    brochure.pages[4].configurations.map((item) => item.angle),
    ["135°", "127°", "122°"],
  );
  assert.equal(brochure.pages[5].ctaAction, "Descargá la ficha completa");
  assert.equal(brochure.contact.whatsapp, undefined);
});

test("la preparación usa siete imágenes funcionales y dos logotipos", async () => {
  const preparePath = resolve(projectDir, "scripts", "prepare-assets.mjs");
  assert.ok(existsSync(preparePath), "falta scripts/prepare-assets.mjs");

  const { inputAssets, fontVariants } = await import(pathToFileURL(preparePath));
  assert.deepEqual(
    inputAssets.map((asset) => asset.output),
    [
      "masterloc-frontal.png",
      "masterloc-offsets-superpuestos.png",
      "masterloc-microscopia.png",
      "masterloc-cuello-pulido.png",
      "masterloc-vista-superior.png",
      "masterloc-tres-offsets.png",
      "masterloc-implante-final.png",
      "logo-chaco.png",
      "logo-medacta.png",
    ],
  );
  assert.equal(fontVariants.length, 6);
});

test("el render produce seis SVG autocontenidos y sin texto microscópico", async () => {
  const pagesPath = resolve(projectDir, "src", "pages.mjs");
  assert.ok(existsSync(pagesPath), "falta src/pages.mjs");

  const { renderPages } = await import(pathToFileURL(pagesPath));
  const pages = await renderPages();
  assert.equal(pages.length, 6);

  pages.forEach((svg, index) => {
    assert.match(svg, /viewBox="0 0 1200 1698"/);
    assert.match(svg, new RegExp(`data-page="${index + 1}"`));
    assert.match(svg, /data:image\/png;base64,/);
    assert.match(svg, /data:font\/woff2;base64,/);
    assert.doesNotMatch(svg, /\b(?:href|src)="(?:file:|https?:|[A-Z]:[\\/])/i);
    assert.doesNotMatch(svg, /<rect[^>]+fill="#ffffff"/i);
    assert.doesNotMatch(svg, /Ãƒ|Ã‚|ï¿½/);

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

test("los productos no usan elipses decorativas como sombra de contacto", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const pages = await renderPages();

  pages.forEach((svg, index) => {
    assert.doesNotMatch(
      svg,
      /<ellipse\b/i,
      `la página ${index + 1} contiene una elipse de sombra desalineada`,
    );
  });
});

test("la portada presenta el vástago con escala protagonista", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [cover] = await renderPages();
  const product = cover.match(
    /<image id="producto-principal"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(product, "falta el producto principal");
  assert.ok(Number(product[3]) >= 650);
  assert.ok(Number(product[4]) >= 900);
});

test("la página 2 explica tres principios con una geometría grande", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, page2] = await renderPages();
  assert.equal((page2.match(/data-role="design-principle"/g) ?? []).length, 3);
  const image = page2.match(
    /<image id="geometria-principal"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(image, "falta la geometría principal");
  assert.ok(Number(image[3]) >= 560);
  assert.ok(Number(image[4]) >= 800);
  assert.match(page2, /SOLO CON RASPAS/);
});

test("la página 3 da protagonismo real a MectaGrip", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, , page3] = await renderPages();
  const micro = page3.match(
    /<image id="mectagrip-microscopia"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(micro, "falta la microscopía");
  assert.ok(Number(micro[3]) >= 520);
  assert.ok(Number(micro[4]) >= 560);
  assert.equal((page3.match(/data-role="mectagrip-benefit"/g) ?? []).length, 3);
});

test("la página 4 relaciona cuello pulido y geometría reducida", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, , , page4] = await renderPages();
  assert.equal((page4.match(/data-role="neck-feature"/g) ?? []).length, 2);
  assert.match(page4, /id="detalle-cuello-pulido"/);
  assert.match(page4, /id="detalle-cuello-superior"/);
  assert.match(page4, /MAYOR RANGO DE MOVIMIENTO/);
});

test("la página 5 compara los tres offsets con lectura directa", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, , , , page5] = await renderPages();
  const comparison = page5.match(
    /<image id="comparacion-offsets"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(comparison, "falta la comparación de offsets");
  assert.ok(Number(comparison[3]) >= 1000);
  assert.ok(Number(comparison[4]) >= 500);
  assert.equal((page5.match(/data-role="offset-label"/g) ?? []).length, 3);
  assert.match(page5, />135°<\/text>/);
  assert.match(page5, />122°<\/text>/);
});

test("la página 6 replica el cierre documental sin WhatsApp", async () => {
  const { renderPages } = await import(
    pathToFileURL(resolve(projectDir, "src", "pages.mjs"))
  );
  const [, , , , , page6] = await renderPages();
  const product = page6.match(
    /<image id="cierre-producto-image"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(product, "falta el implante de cierre");
  assert.ok(Number(product[3]) >= 680);
  assert.match(page6, /data-layout="reference-cta"/);
  assert.match(page6, /id="download-arrow"/);
  assert.match(page6, />Descargá la ficha completa<\/text>/);
  assert.match(page6, /99\.73\.11DR/);
  assert.doesNotMatch(page6, /WHATSAPP|0362-4571854/);
  assert.match(page6, />DIRECCIÓN<\/text>/);
  assert.match(page6, />INSTAGRAM<\/text>/);
});

test("la compilación genera seis editables y HTML de impresión", async () => {
  const buildPath = resolve(projectDir, "scripts", "build.mjs");
  assert.ok(existsSync(buildPath), "falta scripts/build.mjs");
  const { buildOutputs } = await import(pathToFileURL(buildPath));
  const temporaryOutput = await mkdtemp(resolve(tmpdir(), "masterloc-legible-build-"));
  try {
    const result = await buildOutputs({ outputDir: temporaryOutput });
    assert.equal(result.pageSvgs.length, 6);
    const master = await readFile(result.masterSvg, "utf8");
    assert.match(master, /viewBox="0 0 7350 1698"/);
    assert.equal((master.match(/id="pagina-\d{2}"/g) ?? []).length, 6);
    const html = await readFile(result.printHtml, "utf8");
    assert.equal((html.match(/class="page"/g) ?? []).length, 6);
    assert.match(html, /@page\s*\{\s*size:\s*1200px 1698px/);
  } finally {
    await rm(temporaryOutput, { recursive: true, force: true });
  }
});

test("la exportación genera seis WebP sRGB y un PDF de seis páginas", async () => {
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
  const temporaryOutput = await mkdtemp(resolve(tmpdir(), "masterloc-legible-export-"));
  try {
    const build = await buildOutputs({ outputDir: temporaryOutput });
    const exported = await exportOutputs({
      outputDir: temporaryOutput,
      htmlPath: build.printHtml,
    });
    assert.equal(exported.webps.length, 6);

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
    assert.equal(pdf.getPageCount(), 6);

    const report = await verifyOutputs({ outputDir: temporaryOutput });
    assert.equal(report.passed, true, report.errors.join("\n"));
  } finally {
    await rm(temporaryOutput, { recursive: true, force: true });
  }
});
