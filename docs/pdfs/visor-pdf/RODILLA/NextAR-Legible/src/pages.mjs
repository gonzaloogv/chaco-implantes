import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { brochure } from "./content.mjs";
import { COLORS, TYPOGRAPHY } from "./constants.mjs";
import { dataUri, fontFaceCss, multilineText, svgDocument, svgImage } from "./svg-helpers.mjs";

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = resolve(projectDir, "assets", "source");
const fontsDir = resolve(projectDir, "assets", "fonts");

const FONT_FILES = Object.freeze([
  { family: "Poppins", weight: 400, path: resolve(fontsDir, "poppins-400.woff2") },
  { family: "Poppins", weight: 600, path: resolve(fontsDir, "poppins-600.woff2") },
  { family: "Montserrat", weight: 700, path: resolve(fontsDir, "montserrat-700.woff2") },
  { family: "Montserrat", weight: 800, path: resolve(fontsDir, "montserrat-800.woff2") },
  { family: "Montserrat", weight: 900, path: resolve(fontsDir, "montserrat-900.woff2") },
  { family: "Kurale", weight: 400, path: resolve(fontsDir, "kurale-400.woff2") },
]);

function line(x1, y1, x2, y2, color = COLORS.rule, width = 2, opacity = 1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`;
}

function baseCss(fontCss) {
  return (
    `${fontCss}` +
    `text{font-kerning:normal;text-rendering:geometricPrecision}` +
    `.body{font-family:"Poppins";font-size:30px;font-weight:400}` +
    `.body-small{font-family:"Poppins";font-size:26px;font-weight:400}` +
    `.label{font-family:"Poppins";font-size:24px;font-weight:600;letter-spacing:1.2px}` +
    `.title{font-family:"Montserrat";font-size:64px;font-weight:800}`
  );
}

function commonDefs(pageNumber) {
  return (
    `<filter id="p${pageNumber}-shadow" x="-30%" y="-30%" width="160%" height="160%">` +
    `<feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="${COLORS.ink}" flood-opacity="0.18"/>` +
    `</filter>`
  );
}

function sectionHeader(page) {
  return (
    multilineText({
      x: 88,
      y: 92,
      lines: page.section,
      fontSize: TYPOGRAPHY.label,
      lineHeight: 28,
      fontWeight: 600,
      fill: COLORS.accent,
      letterSpacing: 1.2,
    }) +
    multilineText({
      x: 1112,
      y: 92,
      lines: "NEXTAR KNEE",
      fontSize: TYPOGRAPHY.label,
      lineHeight: 28,
      fontWeight: 600,
      fill: COLORS.ink,
      textAnchor: "end",
      letterSpacing: 1.2,
    }) +
    line(88, 126, 1112, 126, COLORS.ink, 2)
  );
}

function interiorFooter(page) {
  return (
    `<g id="pie">` +
    line(88, 1608, 1112, 1608, COLORS.rule, 2) +
    multilineText({
      x: 88,
      y: 1652,
      lines: "CHACO IMPLANTES",
      fontSize: 24,
      lineHeight: 28,
      fontWeight: 600,
      fill: COLORS.ink,
      letterSpacing: 1.1,
    }) +
    multilineText({
      x: 1112,
      y: 1652,
      lines: page.number,
      fontSize: 24,
      lineHeight: 28,
      fontWeight: 600,
      fill: COLORS.ink,
      textAnchor: "end",
      letterSpacing: 1.1,
    }) +
    `</g>`
  );
}

function renderCover({ page, images, css, config, index }) {
  const body =
    `<g id="marca">` +
    svgImage({ href: images.logoChaco, x: 88, y: 58, width: 82, height: 82, role: "brand-image", asset: "logoChaco" }) +
    multilineText({ x: 190, y: 94, lines: "CHACO IMPLANTES", fontSize: 28, lineHeight: 32, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1 }) +
    multilineText({ x: 190, y: 126, lines: "al servicio de la salud", fontFamily: "Kurale", fontSize: 24, lineHeight: 28, fill: COLORS.muted }) +
    multilineText({ x: 1112, y: 92, lines: ["FOLLETO DE PRODUCTO", config.category], fontSize: 24, lineHeight: 30, fontWeight: 600, fill: COLORS.muted, textAnchor: "end", letterSpacing: 1 }) +
    `</g>` +
    `<rect x="88" y="190" width="1024" height="384" rx="28" fill="${COLORS.softBlue}"/>` +
    svgImage({
      href: images[page.asset],
      x: 88,
      y: 190,
      width: 1024,
      height: 384,
      preserveAspectRatio: "xMidYMid meet",
      role: "editorial-image",
      asset: page.asset,
      clipPath: `url(#p${index}-hero-clip)`,
    }) +
    line(88, 640, 230, 640, COLORS.accent, 5) +
    multilineText({ x: 88, y: 710, lines: page.eyebrow, fontSize: 24, lineHeight: 30, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1.3 }) +
    multilineText({ x: 88, y: 838, lines: page.title, fontFamily: "Montserrat", fontSize: 96, lineHeight: 104, fontWeight: 900, fill: COLORS.ink, letterSpacing: -2 }) +
    multilineText({ x: 88, y: 918, lines: page.subtitle, fontSize: 32, lineHeight: 42, fontWeight: 400, fill: COLORS.muted }) +
    `<g id="secuencia-portada">` +
    line(88, 1060, 1112, 1060, COLORS.accent, 2, 0.55) +
    multilineText({ x: 88, y: 1120, lines: page.statement, fontSize: 28, lineHeight: 34, fontWeight: 600, fill: COLORS.ink, letterSpacing: 2 }) +
    `<circle cx="1040" cy="1110" r="34" fill="none" stroke="${COLORS.accent}" stroke-width="2" opacity="0.7"/>` +
    `<circle cx="1040" cy="1110" r="9" fill="${COLORS.accent}"/>` +
    line(1074, 1110, 1112, 1110, COLORS.accent, 2, 0.7) +
    `</g>` +
    `<g id="pie-portada">` +
    `<rect x="0" y="1490" width="1200" height="208" fill="${COLORS.background}"/>` +
    multilineText({ x: 88, y: 1544, lines: "FABRICADO POR", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.muted, letterSpacing: 1.1 }) +
    svgImage({ href: images.logoMedacta, x: 88, y: 1560, width: 250, height: 90, role: "brand-image" }) +
    multilineText({ x: 1112, y: 1544, lines: "DISTRIBUIDO POR", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.muted, textAnchor: "end", letterSpacing: 1.1 }) +
    svgImage({ href: images.logoChaco, x: 948, y: 1548, width: 164, height: 116, role: "brand-image" }) +
    `</g>`;
  const defs = commonDefs(index) + `<clipPath id="p${index}-hero-clip"><rect x="88" y="190" width="1024" height="384" rx="28"/></clipPath>`;
  return svgDocument({ pageNumber: index, label: `${config.product} - Portada`, body, embeddedCss: css, defs, theme: "light" });
}

function renderPlanning({ page, images, css, config, index }) {
  const stageY = 490;
  const body =
    sectionHeader(page) +
    multilineText({ x: 88, y: 230, lines: page.title, fontFamily: "Montserrat", fontSize: 64, lineHeight: 70, fontWeight: 800, fill: COLORS.ink, letterSpacing: -1 }) +
    multilineText({ x: 88, y: 390, lines: page.summary, fontSize: 30, lineHeight: 42, fill: COLORS.muted }) +
    `<rect x="88" y="${stageY}" width="1024" height="590" rx="28" fill="${COLORS.softBlue}"/>` +
    svgImage({ href: images[page.asset], x: 110, y: stageY + 22, width: 980, height: 546, role: "editorial-image", asset: page.asset, preserveAspectRatio: "xMidYMid meet", clipPath: `url(#p${index}-planning-clip)` }) +
    `<g id="hitos-planificacion">` +
    page.milestones
      .map((item, itemIndex) => {
        const x = 88 + itemIndex * 356;
        return (
          line(x, 1188, x + 312, 1188, itemIndex === 0 ? COLORS.ink : COLORS.accent, itemIndex === 0 ? 2 : 3) +
          multilineText({ x, y: 1240, lines: item.number, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1 }) +
          multilineText({ x: x + 56, y: 1240, lines: item.title, fontSize: 26, lineHeight: 32, fontWeight: 600, fill: COLORS.ink }) +
          multilineText({ x, y: 1306, lines: item.copy, fontSize: 26, lineHeight: 36, fill: COLORS.muted })
        );
      })
      .join("") +
    `</g>` +
    interiorFooter(page);
  const defs = commonDefs(index) + `<clipPath id="p${index}-planning-clip"><rect x="110" y="${stageY + 22}" width="980" height="546" rx="20"/></clipPath>`;
  return svgDocument({ pageNumber: index, label: `${config.product} - ${page.section}`, body, embeddedCss: css, defs, theme: "light" });
}

function renderReality({ page, images, css, config, index }) {
  const imageY = 430;
  const body =
    sectionHeader(page) +
    multilineText({ x: 88, y: 230, lines: page.title, fontFamily: "Montserrat", fontSize: 64, lineHeight: 70, fontWeight: 800, fill: COLORS.ink, letterSpacing: -1 }) +
    multilineText({ x: 88, y: 366, lines: page.summary, fontSize: 30, lineHeight: 42, fill: COLORS.muted }) +
    `<rect x="88" y="${imageY}" width="1024" height="683" rx="28" fill="${COLORS.softBlue}"/>` +
    svgImage({ href: images[page.asset], x: 88, y: imageY, width: 1024, height: 683, role: "editorial-image", asset: page.asset, preserveAspectRatio: "xMidYMid meet", clipPath: `url(#p${index}-reality-clip)` }) +
    `<g id="datos-realidad-aumentada">` +
    page.facts
      .map((item, itemIndex) => {
        const x = 88 + itemIndex * 356;
        return (
          line(x, 1210, x + 312, 1210, itemIndex === 0 ? COLORS.ink : COLORS.accent, itemIndex === 0 ? 2 : 3, 0.8) +
          multilineText({ x, y: 1260, lines: item.title, fontSize: 24, lineHeight: 30, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1 }) +
          multilineText({ x, y: 1320, lines: item.copy, fontSize: 26, lineHeight: 36, fill: COLORS.muted })
        );
      })
      .join("") +
    `</g>` +
    interiorFooter(page);
  const defs = commonDefs(index) + `<clipPath id="p${index}-reality-clip"><rect x="88" y="${imageY}" width="1024" height="683" rx="28"/></clipPath>`;
  return svgDocument({ pageNumber: index, label: `${config.product} - ${page.section}`, body, embeddedCss: css, defs, theme: "light" });
}

function renderTracking({ page, images, css, config, index }) {
  const body =
    sectionHeader(page) +
    multilineText({ x: 88, y: 230, lines: page.title, fontFamily: "Montserrat", fontSize: 64, lineHeight: 70, fontWeight: 800, fill: COLORS.ink, letterSpacing: -1 }) +
    multilineText({ x: 88, y: 366, lines: page.summary, fontSize: 30, lineHeight: 42, fill: COLORS.muted }) +
    `<circle cx="318" cy="810" r="250" fill="${COLORS.softBlue}"/>` +
    `<circle cx="318" cy="810" r="205" fill="none" stroke="${COLORS.accent}" stroke-width="2" opacity="0.65"/>` +
    svgImage({ href: images[page.asset], x: 92, y: 500, width: 452, height: 680, role: "editorial-image", asset: page.asset, preserveAspectRatio: "xMidYMid meet", filter: `url(#p${index}-shadow)` }) +
    `<g id="componentes-seguimiento">` +
    line(650, 500, 650, 1220, COLORS.rule, 3) +
    page.components
      .map((item, itemIndex) => {
        const y = 540 + itemIndex * 235;
        return (
          `<circle cx="650" cy="${y}" r="26" fill="${COLORS.background}" stroke="${COLORS.accent}" stroke-width="4"/>` +
          `<circle cx="650" cy="${y}" r="8" fill="${COLORS.accent}"/>` +
          multilineText({ x: 706, y: y - 10, lines: item.number, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1 }) +
          multilineText({ x: 772, y: y - 10, lines: item.title, fontSize: 30, lineHeight: 34, fontWeight: 600, fill: COLORS.ink }) +
          multilineText({ x: 706, y: y + 54, lines: item.copy, fontSize: 26, lineHeight: 36, fill: COLORS.muted })
        );
      })
      .join("") +
    `</g>` +
    line(88, 1350, 1112, 1350, COLORS.rule, 2) +
    multilineText({ x: 88, y: 1410, lines: "CONEXIÓN DEL SISTEMA", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1.1 }) +
    multilineText({ x: 440, y: 1410, lines: "Cámara · objetivos · sensores · unidad de control", fontSize: 26, lineHeight: 34, fill: COLORS.ink, role: "system-connection-copy" }) +
    interiorFooter(page);
  return svgDocument({ pageNumber: index, label: `${config.product} - ${page.section}`, body, embeddedCss: css, defs: commonDefs(index), theme: "light" });
}

function renderFlow({ page, css, config, index }) {
  const startY = 525;
  const body =
    sectionHeader(page) +
    multilineText({ x: 88, y: 230, lines: page.title, fontFamily: "Montserrat", fontSize: 64, lineHeight: 70, fontWeight: 800, fill: COLORS.ink, letterSpacing: -1 }) +
    multilineText({ x: 88, y: 390, lines: page.summary, fontSize: 30, lineHeight: 42, fill: COLORS.muted }) +
    `<g id="flujo-nextar">` +
    line(134, startY, 134, startY + 760, COLORS.accent, 4, 0.85) +
    page.steps
      .map((step, stepIndex) => {
        const y = startY + stepIndex * 190;
        return (
          `<circle cx="134" cy="${y}" r="42" fill="${stepIndex === 0 ? COLORS.accent : COLORS.background}" stroke="${COLORS.accent}" stroke-width="4"/>` +
          multilineText({ x: 134, y: y + 8, lines: step.number, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: stepIndex === 0 ? COLORS.white : COLORS.accent, textAnchor: "middle" }) +
          multilineText({ x: 220, y: y - 5, lines: step.title, fontSize: 32, lineHeight: 36, fontWeight: 600, fill: COLORS.ink, letterSpacing: 0.4 }) +
          multilineText({ x: 510, y: y - 5, lines: step.copy, fontSize: 26, lineHeight: 32, fill: COLORS.muted, role: "flow-copy" }) +
          line(220, y + 70, 1112, y + 70, COLORS.rule, 2)
        );
      })
      .join("") +
    `</g>` +
    `<g id="trama-flujo" opacity="0.28">` +
    line(980, 470, 1112, 470, COLORS.accent, 2) +
    line(1046, 404, 1046, 536, COLORS.accent, 2) +
    `<circle cx="1046" cy="470" r="14" fill="none" stroke="${COLORS.accent}" stroke-width="2"/>` +
    `</g>` +
    interiorFooter(page);
  return svgDocument({ pageNumber: index, label: `${config.product} - ${page.section}`, body, embeddedCss: css, defs: commonDefs(index), theme: "light" });
}

function renderClosing({ page, images, css, config, index }) {
  const contact = config.address;
  const body =
    svgImage({ href: images[page.asset], x: 380, y: 62, width: 440, height: 294, role: "brand-image", asset: page.asset, preserveAspectRatio: "xMidYMid meet" }) +
    line(88, 412, 1112, 412, COLORS.ink, 2) +
    multilineText({ x: 88, y: 515, lines: page.title, fontFamily: "Montserrat", fontSize: 64, lineHeight: 70, fontWeight: 800, fill: COLORS.ink, letterSpacing: -1 }) +
    `<g id="beneficios-cierre">` +
    page.benefits
      .map((benefit, benefitIndex) => {
        const x = 88 + benefitIndex * 356;
        return (
          line(x, 754, x + 312, 754, benefitIndex === 0 ? COLORS.ink : COLORS.accent, benefitIndex === 0 ? 2 : 3) +
          multilineText({ x, y: 812, lines: benefit.title, fontSize: 24, lineHeight: 30, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.9 }) +
          multilineText({ x, y: 870, lines: benefit.copy, fontSize: 26, lineHeight: 36, fill: COLORS.muted })
        );
      })
      .join("") +
    `</g>` +
    `<g data-layout="reference-cta">` +
    `<rect x="88" y="1035" width="1024" height="250" rx="18" fill="${COLORS.accent}" filter="url(#p${index}-shadow)"/>` +
    multilineText({ x: 136, y: 1104, lines: "Consultá la ficha técnica completa", fontSize: 34, lineHeight: 38, fontWeight: 600, fill: COLORS.white }) +
    multilineText({ x: 136, y: 1152, lines: page.documentLine, fontSize: 24, lineHeight: 30, fill: COLORS.white }) +
    line(136, 1192, 1064, 1192, COLORS.white, 1, 0.55) +
    multilineText({ x: 136, y: 1240, lines: "Descargá la ficha completa", fontSize: 28, lineHeight: 34, fontWeight: 600, fill: COLORS.white }) +
    `<g id="download-arrow"><path d="M1016 1230h38m-14-14 14 14-14 14" fill="none" stroke="${COLORS.white}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>` +
    `</g>` +
    `<g data-role="secondary-contact">` +
    `<text x="88" y="1354" font-family="Poppins" font-size="22" font-weight="600" fill="${COLORS.accent}" letter-spacing="1">DIRECCIÓN</text>` +
    `<text x="88" y="1390" font-family="Poppins" font-size="22" font-weight="400" fill="${COLORS.ink}">${contact[0]}</text>` +
    `<text x="88" y="1422" font-family="Poppins" font-size="22" font-weight="400" fill="${COLORS.ink}">${contact[1]}</text>` +
    `<text x="650" y="1354" font-family="Poppins" font-size="22" font-weight="600" fill="${COLORS.accent}" letter-spacing="1">INSTAGRAM</text>` +
    `<text x="650" y="1390" font-family="Poppins" font-size="22" font-weight="400" fill="${COLORS.ink}">${config.instagram}</text>` +
    `</g>` +
    line(88, 1462, 1112, 1462, COLORS.rule, 2) +
    `<g id="marcas-cierre">` +
    svgImage({ href: images.logoChaco, x: 88, y: 1482, width: 160, height: 112, role: "brand-image" }) +
    svgImage({ href: images.logoMedacta, x: 882, y: 1490, width: 230, height: 92, role: "brand-image" }) +
    `</g>` +
    multilineText({ x: 88, y: 1630, lines: `${config.disclaimer} · ${config.email}`, fontSize: 18, lineHeight: 22, fill: COLORS.muted, role: "legal-disclaimer" });
  return svgDocument({ pageNumber: index, label: `${config.product} - Cierre y documentación`, body, embeddedCss: css, defs: commonDefs(index), theme: "light" });
}

const RENDERERS = Object.freeze({
  cover: renderCover,
  planning: renderPlanning,
  reality: renderReality,
  tracking: renderTracking,
  flow: renderFlow,
  closing: renderClosing,
});

export async function renderPages() {
  const config = brochure;

  const [fontCss, imageEntries] = await Promise.all([
    fontFaceCss(FONT_FILES),
    Promise.all(
      Object.entries(config.assets).map(async ([key, file]) => [key, await dataUri(resolve(assetsDir, file))]),
    ),
  ]);
  const images = Object.fromEntries(imageEntries);
  const css = baseCss(fontCss);

  return config.pages.map((page, pageIndex) => {
    const renderer = RENDERERS[page.type];
    if (!renderer) throw new Error(`Tipo de página desconocido: ${page.type}`);
    return renderer({ page, images, css, config, index: pageIndex + 1 });
  });
}
