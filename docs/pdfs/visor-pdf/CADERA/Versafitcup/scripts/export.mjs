import { createRequire } from "node:module";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, "..");
const defaultOutputDir = resolve(projectDir, "output");
const defaultHtmlPath = resolve(
  defaultOutputDir,
  "versafitcup-folleto-fuente.html",
);

async function encodeWebp(pngBuffer) {
  let lastResult;
  for (let quality = 85; quality >= 80; quality -= 1) {
    const data = await sharp(pngBuffer)
      .toColourspace("srgb")
      .withIccProfile("srgb")
      .webp({
        quality,
        alphaQuality: 85,
        smartSubsample: true,
        effort: 6,
      })
      .toBuffer();
    lastResult = { data, quality };
    if (data.length <= 200 * 1024) return lastResult;
  }
  return lastResult;
}

export async function exportOutputs({
  outputDir = defaultOutputDir,
  htmlPath = defaultHtmlPath,
} = {}) {
  const absoluteOutput = resolve(outputDir);
  const absoluteHtml = resolve(htmlPath);
  await mkdir(absoluteOutput, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const webps = [];
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 1698 },
      deviceScaleFactor: 1,
    });
    await page.goto(pathToFileURL(absoluteHtml).href, { waitUntil: "load" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((image) =>
          image.complete
            ? Promise.resolve()
            : new Promise((resolveImage, rejectImage) => {
                image.addEventListener("load", resolveImage, { once: true });
                image.addEventListener("error", rejectImage, { once: true });
              }),
        ),
      );
    });

    await page.emulateMedia({ media: "screen" });
    const pageElements = page.locator(".page");
    const count = await pageElements.count();
    if (count !== 5) {
      throw new Error(`Se esperaban 5 páginas HTML y se encontraron ${count}`);
    }

    for (let index = 0; index < count; index += 1) {
      const pngBuffer = await pageElements.nth(index).screenshot({
        type: "png",
        animations: "disabled",
      });
      const encoded = await encodeWebp(pngBuffer);
      const fileName = `versafitcup-${String(index + 1).padStart(2, "0")}.webp`;
      const destination = resolve(absoluteOutput, fileName);
      await writeFile(destination, encoded.data);
      const fileStat = await stat(destination);
      webps.push({
        path: destination,
        fileName,
        quality: encoded.quality,
        bytes: fileStat.size,
      });
    }

    await page.emulateMedia({ media: "print" });
    const pdfPath = resolve(absoluteOutput, "versafitcup-folleto.pdf");
    await page.pdf({
      path: pdfPath,
      width: "1200px",
      height: "1698px",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    const metadataPath = resolve(absoluteOutput, "export-metadata.json");
    await writeFile(
      metadataPath,
      `${JSON.stringify({ webps, pdfPath }, null, 2)}\n`,
      "utf8",
    );
    return { webps, pdfPath, metadataPath };
  } finally {
    await browser.close();
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = await exportOutputs();
  process.stdout.write(
    `${JSON.stringify(
      {
        pdfPath: result.pdfPath,
        webps: result.webps.map((webp) => ({
          fileName: webp.fileName,
          quality: webp.quality,
          bytes: webp.bytes,
        })),
      },
      null,
      2,
    )}\n`,
  );
}
