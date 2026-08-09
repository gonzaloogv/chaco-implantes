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
const productDir = "C:/Users/Gonzalo/Documents/PDF FINAL/RODILLA/NEXTAR KNEE/nextar_knee_medacta_imagenes_oficiales";
const sharedAssetsDir = "C:/Users/Gonzalo/Documents/Folletos/assets";

export const inputAssets = Object.freeze([
  { source: `${productDir}/01_nextar_knee_cirujano_realidad_aumentada.png`, output: "nextar-hero.png", mode: "standard" },
  { source: `${productDir}/02_planificacion_preoperatoria_3d.png`, output: "nextar-planning.png", mode: "standard" },
  { source: `${productDir}/03_visualizacion_intraoperatoria_realidad_aumentada.png`, output: "nextar-reality.png", mode: "standard" },
  { source: `${productDir}/04_sistema_tracking_de_un_solo_uso-Photoroom.png`, output: "nextar-tracking.png", mode: "trim-transparent" },
  { source: `${productDir}/NEXTAR-LOGO.png`, output: "logo-nextar.png", mode: "ink-logo" },
  { source: `${sharedAssetsDir}/logo-chaco.png`, output: "logo-chaco.png", mode: "standard" },
  { source: `${sharedAssetsDir}/logo-circular-white.png`, output: "logo-chaco-white.png", mode: "standard" },
  { source: `${sharedAssetsDir}/logo-medacta.png`, output: "logo-medacta.png", mode: "standard" },
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
  if (missing.length > 0) {
    throw new Error(`Faltan recursos de entrada:\n${missing.join("\n")}`);
  }
}

async function normalizeInkLogo(source, destination) {
  const metadata = await sharp(source).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`No se pudieron leer las dimensiones de ${source}`);
  }
  const alpha = await sharp(source).rotate().greyscale().toBuffer();
  await sharp({
    create: {
      width: metadata.width,
      height: metadata.height,
      channels: 3,
      background: { r: 25, g: 35, b: 56 },
    },
  })
    .joinChannel(alpha)
    .trim({ background: { r: 25, g: 35, b: 56, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(destination);
}

async function normalizeImages() {
  await mkdir(sourceDir, { recursive: true });
  for (const asset of inputAssets) {
    const destination = resolve(sourceDir, asset.output);
    if (asset.mode === "ink-logo") {
      await normalizeInkLogo(asset.source, destination);
      continue;
    }
    let pipeline = sharp(asset.source).rotate();
    if (asset.mode === "trim-transparent") {
      pipeline = pipeline.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });
    }
    await pipeline
      .toColourspace("srgb")
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(destination);
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
  process.stdout.write(
    `${JSON.stringify({ preparedImages: prepared.images.length, preparedFonts: prepared.fonts.length }, null, 2)}\n`,
  );
}
