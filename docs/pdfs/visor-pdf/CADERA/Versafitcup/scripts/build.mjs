import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPages } from "../src/pages.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, "..");
const defaultOutputDir = resolve(projectDir, "output");

const pageNames = Object.freeze([
  "versafitcup-01.svg",
  "versafitcup-02.svg",
  "versafitcup-03.svg",
  "versafitcup-04.svg",
  "versafitcup-05.svg",
]);

async function writeAtomic(filePath, content) {
  await mkdir(dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, content, "utf8");
  await rm(filePath, { force: true });
  await rename(temporaryPath, filePath);
}

function extractSvgBody(svg) {
  const start = svg.indexOf(">") + 1;
  const end = svg.lastIndexOf("</svg>");
  if (start <= 0 || end <= start) throw new Error("SVG de página inválido");
  return svg.slice(start, end);
}

function masterSvg(pages) {
  const groups = pages
    .map(
      (svg, index) =>
        `<g id="pagina-${String(index + 1).padStart(2, "0")}" ` +
        `transform="translate(${index * 1230} 0)">` +
        `${extractSvgBody(svg)}</g>`,
    )
    .join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `xmlns:xlink="http://www.w3.org/1999/xlink" width="6120" height="1698" ` +
    `viewBox="0 0 6120 1698" aria-label="Folleto Versafitcup editable">` +
    `${groups}</svg>`
  );
}

function printHtml(pages) {
  const pageMarkup = pages
    .map(
      (svg, index) =>
        `<div class="page" data-page="${index + 1}">${svg}</div>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Versafitcup · Folleto digital</title>
  <style>
    @page { size: 1200px 1698px; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ffffff; }
    body { width: 1200px; }
    .page {
      width: 1200px;
      height: 1698px;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    .page:last-child { page-break-after: auto; break-after: auto; }
    .page > svg { display: block; width: 1200px; height: 1698px; }
    @media screen {
      body { display: grid; gap: 28px; background: #dfe4ec; }
      .page { box-shadow: 0 12px 34px rgba(25, 35, 56, .18); }
    }
    @media print {
      body { background: #ffffff; }
      .page { box-shadow: none; }
    }
  </style>
</head>
<body>
${pageMarkup}
</body>
</html>
`;
}

export async function buildOutputs({ outputDir = defaultOutputDir } = {}) {
  const absoluteOutput = resolve(outputDir);
  const editableDir = resolve(absoluteOutput, "editable");
  await mkdir(editableDir, { recursive: true });

  const pages = await renderPages();
  if (pages.length !== 5) {
    throw new Error(`Se esperaban 5 páginas y se generaron ${pages.length}`);
  }

  const pageSvgs = [];
  for (let index = 0; index < pages.length; index += 1) {
    const destination = resolve(editableDir, pageNames[index]);
    await writeAtomic(destination, pages[index]);
    pageSvgs.push(destination);
  }

  const masterPath = resolve(
    absoluteOutput,
    "versafitcup-folleto-editable.svg",
  );
  const htmlPath = resolve(
    absoluteOutput,
    "versafitcup-folleto-fuente.html",
  );
  await writeAtomic(masterPath, masterSvg(pages));
  await writeAtomic(htmlPath, printHtml(pages));

  return {
    outputDir: absoluteOutput,
    pageSvgs,
    masterSvg: masterPath,
    printHtml: htmlPath,
  };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = await buildOutputs();
  process.stdout.write(
    `${JSON.stringify(
      {
        pageSvgs: result.pageSvgs.length,
        masterSvg: result.masterSvg,
        printHtml: result.printHtml,
      },
      null,
      2,
    )}\n`,
  );
}
