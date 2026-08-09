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
const productDir = "C:/Users/Gonzalo/Documents/PDF FINAL/RODILLA/GMK PRIMARY/gmk_primary_medacta_imagenes_oficiales";

export const inputAssets = Object.freeze([
  { source: `${productDir}/01_gmk_primary_sistema_completo_y_sensitin-Photoroom.png`, output: "gmk-sistema-doble.png", trim: true },
  { source: `${productDir}/02_gmk_primary_sistema_completo_identificado-Photoroom.png`, output: "gmk-sistema.png", trim: true },
  { source: `${productDir}/03_componente_femoral_standard-Photoroom.png`, output: "gmk-femoral.png", trim: true },
  { source: `${productDir}/05_componente_tibial_fijo-Photoroom.png`, output: "gmk-tibial-fijo.png", trim: true },
  { source: `${productDir}/06_componente_tibial_movil-Photoroom.png`, output: "gmk-tibial-movil.png", trim: true },
  { source: `${productDir}/07_inserto_fijo_cr-Photoroom.png`, output: "gmk-inserto-fijo-cr.png", trim: true },
  { source: `${productDir}/08_inserto_fijo_ultracongruente-Photoroom.png`, output: "gmk-inserto-fijo-uc.png", trim: true },
  { source: `${productDir}/09_inserto_fijo_posterior_estabilizado-Photoroom.png`, output: "gmk-inserto-fijo-ps.png", trim: true },
  { source: `${productDir}/10_inserto_movil_cr-Photoroom.png`, output: "gmk-inserto-movil-cr.png", trim: true },
  { source: `${productDir}/11_inserto_movil_ultracongruente-Photoroom.png`, output: "gmk-inserto-movil-uc.png", trim: true },
  { source: `${productDir}/12_patela_resurfacing-Photoroom.png`, output: "gmk-patela-resurfacing.png", trim: true },
  { source: `${productDir}/13_patela_inset-Photoroom.png`, output: "gmk-patela-inset.png", trim: true },
  { source: `${productDir}/14_extension_tibial-Photoroom.png`, output: "gmk-extension.png", trim: true },
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
