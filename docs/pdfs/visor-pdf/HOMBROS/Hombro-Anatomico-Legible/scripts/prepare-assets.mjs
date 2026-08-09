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
const productDir = "C:/Users/Gonzalo/Documents/PDF FINAL/HOMBROS/Hombro anatomico";

export const inputAssets = Object.freeze([
  { source: resolve(cutoutDir, "01-configuracion.png"), output: "01-configuracion.png", mode: "transparent" },
  { source: resolve(cutoutDir, "02-componentes.png"), output: "02-componentes.png", mode: "transparent" },
  { source: resolve(cutoutDir, "04-diafisis-estandar.png"), output: "04-diafisis-estandar.png", mode: "transparent" },
  { source: resolve(cutoutDir, "07-metafisis-sin-vastago.png"), output: "07-metafisis-sin-vastago.png", mode: "transparent" },
  { source: resolve(cutoutDir, "08-glenoideo-cementado.png"), output: "08-glenoideo-cementado.png", mode: "transparent" },
  { source: resolve(cutoutDir, "09-cabeza-anatomica.png"), output: "09-cabeza-anatomica.png", mode: "transparent" },
  { source: resolve(cutoutDir, "10-doble-excentrico.png"), output: "10-doble-excentrico.png", mode: "transparent" },
  { source: resolve(cutoutDir, "11-metafisis-anatomica.png"), output: "11-metafisis-anatomica.png", mode: "transparent" },
  { source: resolve(cutoutDir, "12-cabeza-sensitin.png"), output: "12-cabeza-sensitin.png", mode: "transparent" },
  { source: `${productDir}/13_microestructura_mectagrip.jpg`, output: "13-microestructura-mectagrip.jpg", mode: "jpeg" },
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
    if (asset.mode === "jpeg") {
      await pipeline.jpeg({ quality: 92, mozjpeg: true }).toFile(destination);
      continue;
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
