import { createRequire } from "node:module";
import { access, copyFile, mkdir } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, "..");
const sourceDir = resolve(projectDir, "assets", "source");
const fontsDir = resolve(projectDir, "assets", "fonts");
const sharedFontsDir = resolve(projectDir, "..", "AMIS", "assets", "fonts");
const productDir = "C:/Users/Gonzalo/Documents/PDF FINAL/RODILLA/MOTO MEDIAL";

export const inputAssets = Object.freeze([
  { source: `${productDir}/01_moto_medial_sistema_armado-Photoroom.png`, output: "moto-sistema.png", trim: true },
  { source: `${productDir}/02_moto_medial_implantado_en_anatomia-Photoroom.png`, output: "moto-anatomia.png", trim: true },
  { source: `${productDir}/03_componente_femoral_moto_medial-Photoroom.png`, output: "moto-femoral.png", trim: true },
  { source: `${productDir}/04_base_tibial_moto_medial-Photoroom.png`, output: "moto-tibial.png", trim: true },
  { source: `${productDir}/05_insertos_uhmwpe_y_e_cross-Photoroom.png`, output: "moto-insertos.png", trim: true },
  { source: `${productDir}/06_diseno_anatomico_y_cobertura-copia-Photoroom.png`, output: "moto-cobertura.png", trim: true },
  { source: "C:/Users/Gonzalo/Documents/Folletos/assets/logo-chaco.png", output: "logo-chaco.png", trim: false },
  { source: "C:/Users/Gonzalo/Documents/Folletos/assets/logo-medacta.png", output: "logo-medacta.png", trim: false },
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
    ...inputAssets.map((asset) => asset.source),
    ...fontVariants.map((font) => resolve(sharedFontsDir, font.output)),
  ];
  const missing = [];
  for (const filePath of required) {
    if (!(await exists(filePath))) missing.push(filePath);
  }
  if (missing.length > 0) throw new Error(`Faltan recursos de entrada:\n${missing.join("\n")}`);
}

async function normalizeImages() {
  await mkdir(sourceDir, { recursive: true });
  for (const asset of inputAssets) {
    let pipeline = sharp(asset.source).rotate();
    if (asset.trim) {
      pipeline = pipeline.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });
    }
    await pipeline
      .toColourspace("srgb")
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(resolve(sourceDir, asset.output));
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
    images: inputAssets.map((asset) => resolve(sourceDir, asset.output)),
    fonts: fontVariants.map((font) => resolve(fontsDir, font.output)),
  };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const prepared = await prepareAssets();
  process.stdout.write(
    `${JSON.stringify({ preparedImages: prepared.images.length, preparedFonts: prepared.fonts.length }, null, 2)}\n`,
  );
}
