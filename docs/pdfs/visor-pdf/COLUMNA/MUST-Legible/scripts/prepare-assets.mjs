import { createRequire } from "node:module";
import { access, copyFile, mkdir } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, "..");
const cutoutDir = resolve(projectDir, "assets", "cutouts");
const sourceDir = resolve(projectDir, "assets", "source");
const fontsDir = resolve(projectDir, "assets", "fonts");
const sharedFontsDir = resolve(projectDir, "..", "AMIS", "assets", "fonts");
const sharedAssetsDir = resolve(projectDir, "..", "assets");

export const inputAssets = Object.freeze([
  { source: resolve(cutoutDir, "construct-posterior.png"), output: "construct-posterior.png", mode: "transparent" },
  { source: resolve(cutoutDir, "construct-lateral.png"), output: "construct-lateral.png", mode: "transparent" },
  { source: resolve(cutoutDir, "screw-polyaxial.png"), output: "screw-polyaxial.png", mode: "transparent" },
  { source: resolve(cutoutDir, "screw-monoaxial.png"), output: "screw-monoaxial.png", mode: "transparent" },
  { source: resolve(cutoutDir, "screw-revision.png"), output: "screw-revision.png", mode: "transparent" },
  { source: resolve(cutoutDir, "screw-reduction.png"), output: "screw-reduction.png", mode: "transparent" },
  { source: resolve(cutoutDir, "screw-augmentable.png"), output: "screw-augmentable.png", mode: "transparent" },
  { source: resolve(cutoutDir, "cross-connector.png"), output: "cross-connector.png", mode: "transparent" },
  { source: resolve(cutoutDir, "lateral-connector.png"), output: "lateral-connector.png", mode: "transparent" },
  { source: resolve(cutoutDir, "pedicle-hook.png"), output: "pedicle-hook.png", mode: "transparent" },
  { source: resolve(cutoutDir, "domino-connector.png"), output: "domino-connector.png", mode: "transparent" },
  { source: resolve(sharedAssetsDir, "logo-chaco.png"), output: "logo-chaco.png", mode: "png" },
  { source: resolve(sharedAssetsDir, "logo-medacta.png"), output: "logo-medacta.png", mode: "png" },
]);

export const fontVariants = Object.freeze([
  { family: "Poppins", weight: 400, output: "poppins-400.woff2" },
  { family: "Poppins", weight: 600, output: "poppins-600.woff2" },
  { family: "Montserrat", weight: 700, output: "montserrat-700.woff2" },
  { family: "Montserrat", weight: 800, output: "montserrat-800.woff2" },
  { family: "Montserrat", weight: 900, output: "montserrat-900.woff2" },
  { family: "Kurale", weight: 400, output: "kurale-400.woff2" },
]);

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function validateInputs() {
  const required = [
    ...inputAssets.map(({ source }) => source),
    ...fontVariants.map(({ output }) => resolve(sharedFontsDir, output)),
  ];
  const missing = [];
  for (const filePath of required) {
    if (!(await exists(filePath))) missing.push(filePath);
  }
  if (missing.length > 0) throw new Error(`Faltan recursos de entrada:\n${missing.join("\n")}`);

  for (const asset of inputAssets.filter(({ mode }) => mode === "transparent")) {
    const metadata = await sharp(asset.source).metadata();
    if (!metadata.hasAlpha) throw new Error(`${asset.output} no conserva canal alfa`);
  }
}

async function normalizeImages() {
  await mkdir(sourceDir, { recursive: true });
  for (const asset of inputAssets) {
    const destination = resolve(sourceDir, asset.output);
    let pipeline = sharp(asset.source).rotate().toColourspace("srgb");
    if (asset.mode === "transparent") {
      pipeline = pipeline.trim({
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        threshold: 10,
      });
    }
    await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(destination);
  }
}

async function copyFonts() {
  await mkdir(fontsDir, { recursive: true });
  for (const font of fontVariants) {
    await copyFile(resolve(sharedFontsDir, font.output), resolve(fontsDir, font.output));
  }
}

export async function prepareAssets() {
  await validateInputs();
  await Promise.all([normalizeImages(), copyFonts()]);
  return {
    images: inputAssets.map(({ output }) => resolve(sourceDir, output)),
    fonts: fontVariants.map(({ output }) => resolve(fontsDir, output)),
  };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const prepared = await prepareAssets();
  process.stdout.write(`${JSON.stringify({ preparedImages: prepared.images.length, preparedFonts: prepared.fonts.length }, null, 2)}\n`);
}
