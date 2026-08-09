import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { PAGE, COLORS } from "./constants.mjs";

const MIME = Object.freeze({
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
});

export function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function dataUri(filePath) {
  const mime = MIME[extname(filePath).toLowerCase()];
  if (!mime) throw new Error(`Tipo de recurso no admitido: ${filePath}`);
  const bytes = await readFile(filePath);
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

export async function fontFaceCss(fontFiles) {
  const rules = [];
  for (const font of fontFiles) {
    const uri = await dataUri(font.path);
    rules.push(
      `@font-face{font-family:"${escapeXml(font.family)}";` +
        `src:url("${uri}") format("woff2");font-style:normal;` +
        `font-weight:${font.weight};font-display:block;}`,
    );
  }
  return rules.join("");
}

export function multilineText({
  x,
  y,
  lines,
  fontSize,
  lineHeight,
  className = "",
  fontFamily = "Poppins",
  fontWeight = 400,
  fill = COLORS.ink,
  textAnchor = "start",
  letterSpacing = 0,
}) {
  const tspans = lines
    .map(
      (textLine, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">` +
        `${escapeXml(textLine)}</tspan>`,
    )
    .join("");
  return (
    `<text x="${x}" y="${y}" class="${escapeXml(className)}" ` +
    `font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" ` +
    `font-weight="${fontWeight}" fill="${fill}" text-anchor="${textAnchor}" ` +
    `letter-spacing="${letterSpacing}">${tspans}</text>`
  );
}

export function svgImage({
  href,
  x,
  y,
  width,
  height,
  id = "",
  preserveAspectRatio = "xMidYMid meet",
  opacity = 1,
  filter = "",
  clipPath = "",
}) {
  return (
    `<image${id ? ` id="${escapeXml(id)}"` : ""} href="${href}" ` +
    `x="${x}" y="${y}" width="${width}" height="${height}" ` +
    `preserveAspectRatio="${preserveAspectRatio}" opacity="${opacity}"` +
    `${filter ? ` filter="${filter}"` : ""}` +
    `${clipPath ? ` clip-path="${clipPath}"` : ""}/>`
  );
}

export function svgDocument({ pageNumber, label, body, embeddedCss, defs = "" }) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${PAGE.width}" height="${PAGE.height}" ` +
    `viewBox="0 0 ${PAGE.width} ${PAGE.height}" data-page="${pageNumber}" ` +
    `role="img" aria-label="${escapeXml(label)}">` +
    `<title>${escapeXml(label)}</title><style>${embeddedCss}</style>` +
    `<defs>${defs}</defs>` +
    `<rect width="${PAGE.width}" height="${PAGE.height}" ` +
    `fill="${COLORS.background}"/>${body}</svg>`
  );
}
