import { createRequire } from "node:module";
import { access, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");

const PAGE_COUNT = 6;
const LAST_WEBP = "nextar-06.webp";
const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, "..");
const defaultOutputDir = resolve(projectDir, "output");
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
const mojibakePattern = /Ã.|Â.|â€|�/;
const externalResourcePattern = /\b(?:href|src)="(?:file:|https?:|[A-Z]:[\\/])/i;

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function inspectUtf8File(filePath, report, { selfContained = false } = {}) {
  if (!(await fileExists(filePath))) {
    report.errors.push(`Falta el archivo ${filePath}`);
    return null;
  }
  try {
    const source = utf8Decoder.decode(await readFile(filePath));
    if (mojibakePattern.test(source)) report.errors.push(`Se detectó mojibake en ${filePath}`);
    if (selfContained && externalResourcePattern.test(source)) {
      report.errors.push(`Se detectó un recurso externo en ${filePath}`);
    }
    if (/whatsapp/i.test(source)) report.errors.push(`Se detectó una mención de WhatsApp en ${filePath}`);
    return source;
  } catch (error) {
    report.errors.push(`El archivo no es UTF-8 válido: ${filePath} (${error.message})`);
    return null;
  }
}

export async function verifyOutputs({ outputDir = defaultOutputDir, writeReport = true } = {}) {
  const absoluteOutput = resolve(outputDir);
  const report = {
    generatedAt: new Date().toISOString(),
    passed: false,
    pageCount: PAGE_COUNT,
    specification: {
      width: 1200,
      height: 1698,
      colorSpace: "srgb",
      embeddedColorProfile: true,
      maximumRecommendedBytes: 200 * 1024,
      pageCount: PAGE_COUNT,
      lastWebp: LAST_WEBP,
    },
    webps: [],
    pdf: {},
    editable: {},
    errors: [],
    warnings: [],
  };

  for (let index = 1; index <= PAGE_COUNT; index += 1) {
    const fileName = `nextar-${String(index).padStart(2, "0")}.webp`;
    const filePath = resolve(absoluteOutput, fileName);
    if (!(await fileExists(filePath))) {
      report.errors.push(`Falta ${fileName}`);
      continue;
    }
    try {
      const [metadata, fileStat] = await Promise.all([sharp(filePath).metadata(), stat(filePath)]);
      const result = {
        fileName,
        bytes: fileStat.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        space: metadata.space,
        hasProfile: metadata.hasProfile,
      };
      report.webps.push(result);
      if (metadata.width !== 1200 || metadata.height !== 1698) {
        report.errors.push(`${fileName} mide ${metadata.width} × ${metadata.height} px`);
      }
      if (metadata.format !== "webp") report.errors.push(`${fileName} no está codificado como WebP`);
      if (metadata.space !== "srgb") report.errors.push(`${fileName} no usa el espacio de color sRGB`);
      if (!metadata.hasProfile) report.errors.push(`${fileName} no incorpora un perfil de color`);
      if (fileStat.size > 200 * 1024) report.errors.push(`${fileName} supera el máximo de 200 KB`);
    } catch (error) {
      report.errors.push(`No se pudo inspeccionar ${fileName}: ${error.message}`);
    }
  }
  sharp.cache(false);

  const pdfPath = resolve(absoluteOutput, "nextar-folleto.pdf");
  if (!(await fileExists(pdfPath))) {
    report.errors.push("Falta nextar-folleto.pdf");
  } else {
    try {
      const [pdfBytes, pdfStat] = await Promise.all([readFile(pdfPath), stat(pdfPath)]);
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = pdf.getPages();
      const sizes = pages.map((page) => page.getSize());
      report.pdf = {
        fileName: "nextar-folleto.pdf",
        bytes: pdfStat.size,
        pageCount: pages.length,
        pageSizesPoints: sizes,
      };
      if (pages.length !== PAGE_COUNT) report.errors.push(`El PDF contiene ${pages.length} páginas`);
      sizes.forEach(({ width, height }, index) => {
        if (Math.abs(width - 900) > 0.2 || Math.abs(height - 1273.5) > 0.6) {
          report.errors.push(`La página ${index + 1} del PDF mide ${width} × ${height} pt`);
        }
      });
    } catch (error) {
      report.errors.push(`No se pudo inspeccionar el PDF: ${error.message}`);
    }
  }

  const masterPath = resolve(absoluteOutput, "nextar-folleto-editable.svg");
  const htmlPath = resolve(absoluteOutput, "nextar-folleto-fuente.html");
  const master = await inspectUtf8File(masterPath, report, { selfContained: true });
  const printHtml = await inspectUtf8File(htmlPath, report, { selfContained: true });
  report.editable.master = masterPath;
  report.editable.printHtml = htmlPath;
  if (master && !/viewBox="0 0 7350 1698"/.test(master)) {
    report.errors.push("El SVG maestro no tiene el lienzo aprobado");
  }
  if (master && (master.match(/id="pagina-\d{2}"/g) ?? []).length !== PAGE_COUNT) {
    report.errors.push("El SVG maestro no contiene seis páginas editables");
  }
  if (printHtml && (printHtml.match(/class="page"/g) ?? []).length !== PAGE_COUNT) {
    report.errors.push("El HTML de origen no contiene seis páginas");
  }

  report.editable.pages = [];
  for (let index = 1; index <= PAGE_COUNT; index += 1) {
    const fileName = `nextar-${String(index).padStart(2, "0")}.svg`;
    const filePath = resolve(absoluteOutput, "editable", fileName);
    const page = await inspectUtf8File(filePath, report, { selfContained: true });
    report.editable.pages.push(filePath);
    if (page && !/viewBox="0 0 1200 1698"/.test(page)) {
      report.errors.push(`${fileName} no tiene el lienzo aprobado`);
    }
  }

  report.passed = report.errors.length === 0;
  if (writeReport) {
    await writeFile(resolve(absoluteOutput, "verification-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  return report;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const report = await verifyOutputs();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.passed) process.exitCode = 1;
}
