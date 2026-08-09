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

function browserExecutable() {
  const { chromium } = require("playwright");
  return [
    chromium.executablePath(),
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find((candidate) => existsSync(candidate));
}

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

test("el contenido editorial resume el sistema M-Vizion en siete páginas", async () => {
  const contentPath = resolve(projectDir, "src", "content.mjs");
  assert.ok(existsSync(contentPath), "falta src/content.mjs");

  const { brochure } = await import(pathToFileURL(contentPath));
  assert.equal(brochure.product, "M-VIZION");
  assert.equal(brochure.pages.length, 7);
  assert.deepEqual(
    brochure.pages.map((page) => page.number),
    ["01 / 07", "02 / 07", "03 / 07", "04 / 07", "05 / 07", "06 / 07", "07 / 07"],
  );
  assert.deepEqual(
    brochure.pages[1].modules.map((item) => item.name),
    ["CUERPO PROXIMAL", "TALLO DISTAL", "BLOQUEO"],
  );
  assert.deepEqual(brochure.pages[2].diameters, ["20 mm", "24 mm", "28 mm", "32 mm"]);
  assert.deepEqual(brochure.pages[3].lengths, ["140 mm", "180 mm", "220 mm"]);
  assert.match(JSON.stringify(brochure.pages[4]), /anteversión|offset|longitud/i);
  assert.equal(brochure.pages[5].steps.length, 4);
  for (const pageIndex of [2, 3, 4, 5]) {
    assert.ok(
      brochure.pages[pageIndex].intro.length >= 2,
      `la introducción de la página ${pageIndex + 1} debe estar envuelta manualmente`,
    );
  }
  assert.deepEqual(brochure.pages[5].warning, [
    "NO REUTILIZAR UN TORNILLO",
    "QUE YA FUE AJUSTADO",
  ]);
  assert.equal(brochure.pages[6].title.length, 3);
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
      "m-vizion-armado.png",
      "m-vizion-perspectivas.png",
      "m-vizion-proximal.png",
      "m-vizion-distal.png",
      "m-vizion-dispositivo-mesa.png",
      "m-vizion-proximal-prueba.png",
      "m-vizion-radiografia.png",
      "logo-chaco.png",
      "logo-medacta.png",
    ],
  );
  assert.equal(fontVariants.length, 6);
});

test("el render produce siete SVG autocontenidos, legibles y sin sombras elípticas", async () => {
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

test("los textos e imágenes importantes respetan el área segura de 60 px", async () => {
  const { renderPages } = await import(pathToFileURL(resolve(projectDir, "src", "pages.mjs")));
  const pages = await renderPages();
  const { chromium } = require("playwright");
  const executablePath = browserExecutable();
  assert.ok(executablePath, "no se encontró un navegador Chromium para validar geometría");

  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1698 } });
    await page.setContent(`<main>${pages.join("")}</main>`, { waitUntil: "load" });
    await page.evaluate(async () => document.fonts.ready);
    const violations = await page.evaluate(() => {
      const SAFE = 60;
      const WIDTH = 1200;
      const HEIGHT = 1698;
      return [...document.querySelectorAll("svg")].flatMap((svg, pageIndex) =>
        [...svg.querySelectorAll("text, image")].flatMap((element) => {
          const box = element.getBBox();
          const outside =
            box.x < SAFE - 0.5 ||
            box.y < SAFE - 0.5 ||
            box.x + box.width > WIDTH - SAFE + 0.5 ||
            box.y + box.height > HEIGHT - SAFE + 0.5;
          return outside
            ? [{
                page: pageIndex + 1,
                element: element.tagName,
                text: element.textContent?.trim().slice(0, 80) ?? "",
                box: { x: box.x, y: box.y, width: box.width, height: box.height },
              }]
            : [];
        }),
      );
    });
    assert.deepEqual(violations, []);
  } finally {
    await browser.close();
  }
});

test("la portada presenta el sistema desde tres perspectivas a gran escala", async () => {
  const { renderPages } = await import(pathToFileURL(resolve(projectDir, "src", "pages.mjs")));
  const [cover] = await renderPages();
  const product = cover.match(
    /<image id="producto-principal"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(product, "falta el producto principal");
  assert.ok(Number(product[3]) >= 980);
  assert.ok(Number(product[4]) >= 760);
  assert.match(cover, /SISTEMA FEMORAL MODULAR NO CEMENTADO/);
});

test("la página 2 explica los tres módulos y su unión funcional", async () => {
  const { renderPages } = await import(pathToFileURL(resolve(projectDir, "src", "pages.mjs")));
  const [, page2] = await renderPages();
  assert.equal((page2.match(/data-role="system-module"/g) ?? []).length, 3);
  assert.match(page2, /id="sistema-armado"/);
  assert.match(page2, /id="componente-proximal"/);
  assert.match(page2, /id="componente-distal"/);
  assert.match(page2, /data-layout="modular-architecture"/);
  const connectors = [...page2.matchAll(/<line[^>]+data-role="module-connector"[^>]*>/g)];
  assert.equal(connectors.length, 3);
  connectors.forEach(([connector]) => {
    const x1 = Number(connector.match(/x1="([\d.]+)"/)?.[1]);
    const x2 = Number(connector.match(/x2="([\d.]+)"/)?.[1]);
    assert.ok(Math.max(x1, x2) <= 442, "una línea guía invade el bloque de texto");
  });
});

test("la página 3 presenta configuraciones proximales con imagen protagonista", async () => {
  const { renderPages } = await import(pathToFileURL(resolve(projectDir, "src", "pages.mjs")));
  const [, , page3] = await renderPages();
  const image = page3.match(
    /<image id="proximal-principal"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(image, "falta el cuerpo proximal principal");
  assert.ok(Number(image[3]) >= 650);
  assert.ok(Number(image[4]) >= 680);
  assert.match(page3, />132°<\/text>/);
  assert.equal((page3.match(/data-role="proximal-diameter"/g) ?? []).length, 4);
  assert.match(page3, /data-layout="variant-grid"/);
  assert.equal((page3.match(/MISMA FAMILIA DE ALTURAS/g) ?? []).length, 1);
});

test("la página 4 muestra la fijación distal y sus tres longitudes", async () => {
  const { renderPages } = await import(pathToFileURL(resolve(projectDir, "src", "pages.mjs")));
  const [, , , page4] = await renderPages();
  const image = page4.match(
    /<image id="distal-principal"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(image, "falta el tallo distal principal");
  assert.ok(Number(image[4]) >= 1050);
  assert.equal((page4.match(/data-role="distal-length"/g) ?? []).length, 3);
  assert.match(page4, /12–28 mm/);
  assert.match(page4, /data-layout="diameter-range"/);
  assert.match(page4, />INCREMENTOS<\/tspan>/);
});

test("la página 5 relaciona la prueba proximal con los ajustes clínicos", async () => {
  const { renderPages } = await import(pathToFileURL(resolve(projectDir, "src", "pages.mjs")));
  const [, , , , page5] = await renderPages();
  const image = page5.match(
    /<image id="proximal-prueba"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(image, "falta el cuerpo proximal de prueba");
  assert.ok(Number(image[3]) >= 650);
  assert.equal((page5.match(/data-role="trial-check"/g) ?? []).length, 3);
  assert.match(page5, /MOVILIDAD · ESTABILIDAD/);
  assert.match(page5, /data-role="trial-label-rule"/);
  assert.doesNotMatch(page5, /x1="160" y1="520" x2="480" y2="680"/);
});

test("la página 6 explica el ensamblaje de mesa y el bloqueo en cuatro pasos", async () => {
  const { renderPages } = await import(pathToFileURL(resolve(projectDir, "src", "pages.mjs")));
  const [, , , , , page6] = await renderPages();
  const image = page6.match(
    /<image id="dispositivo-mesa"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(image, "falta el dispositivo de ensamblaje");
  assert.ok(Number(image[4]) >= 980);
  assert.equal((page6.match(/data-role="assembly-step"/g) ?? []).length, 4);
  assert.match(page6, /NO REUTILIZAR/);
  assert.match(page6, /data-layout="warning-card"/);
  assert.match(page6, /NO REUTILIZAR UN TORNILLO<\/tspan><tspan[^>]*>QUE YA FUE AJUSTADO<\/tspan>/);
  assert.doesNotMatch(page6, /tornillo_de_bloqueo|tornillo-bloqueo-principal/);
});

test("la página 7 cierra con radiografía, referencia y descarga documental", async () => {
  const { renderPages } = await import(pathToFileURL(resolve(projectDir, "src", "pages.mjs")));
  const [, , , , , , page7] = await renderPages();
  const image = page7.match(
    /<image id="radiografia-cierre"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/,
  );
  assert.ok(image, "falta la radiografía de cierre");
  assert.ok(Number(image[3]) >= 500);
  assert.ok(Number(image[4]) >= 900);
  assert.match(page7, /data-layout="closing-eyebrow"/);
  assert.match(page7, /SISTEMA FEMORAL MODULAR<\/tspan><tspan[^>]*>DE REVISIÓN<\/tspan>/);
  assert.match(page7, /data-layout="reference-cta"/);
  assert.match(page7, /id="download-arrow"/);
  assert.match(page7, />Descargá la ficha completa<\/text>/);
  assert.match(page7, /99\.66\.12/);
  assert.match(page7, /REV\. 06/);
  assert.doesNotMatch(page7, /WHATSAPP|0362-4571854/);
  assert.match(page7, />DIRECCIÓN<\/text>/);
  assert.match(page7, />INSTAGRAM<\/text>/);
});

test("la compilación genera siete editables y HTML de impresión", async () => {
  const buildPath = resolve(projectDir, "scripts", "build.mjs");
  assert.ok(existsSync(buildPath), "falta scripts/build.mjs");
  const { buildOutputs } = await import(pathToFileURL(buildPath));
  const temporaryOutput = await mkdtemp(resolve(tmpdir(), "m-vizion-legible-build-"));
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

  const [{ buildOutputs }, { exportOutputs }, { verifyOutputs }] = await Promise.all([
    import(pathToFileURL(buildPath)),
    import(pathToFileURL(exportPath)),
    import(pathToFileURL(verifyPath)),
  ]);
  const temporaryOutput = await mkdtemp(resolve(tmpdir(), "m-vizion-legible-export-"));
  try {
    const build = await buildOutputs({ outputDir: temporaryOutput });
    const exported = await exportOutputs({ outputDir: temporaryOutput, htmlPath: build.printHtml });
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
