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
    `.label{font-family:"Poppins";font-size:24px;font-weight:600;letter-spacing:1.1px}` +
    `.title{font-family:"Montserrat";font-size:64px;font-weight:800}`
  );
}

function commonDefs(pageNumber) {
  return (
    `<filter id="p${pageNumber}-shadow" x="-30%" y="-30%" width="160%" height="160%">` +
    `<feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="${COLORS.ink}" flood-opacity="0.14"/>` +
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
      letterSpacing: 1.1,
    }) +
    multilineText({
      x: 1112,
      y: 92,
      lines: "HOMBRO REVERSO",
      fontSize: TYPOGRAPHY.label,
      lineHeight: 28,
      fontWeight: 600,
      fill: COLORS.ink,
      textAnchor: "end",
      letterSpacing: 1.1,
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
      letterSpacing: 1,
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
      letterSpacing: 1,
    }) +
    `</g>`
  );
}

function pageTitle(page) {
  return (
    multilineText({
      x: 88,
      y: 230,
      lines: page.title,
      fontFamily: "Montserrat",
      fontSize: TYPOGRAPHY.title,
      lineHeight: 70,
      fontWeight: 800,
      fill: COLORS.ink,
      letterSpacing: -1,
    }) +
    multilineText({
      x: 88,
      y: 390,
      lines: page.summary,
      fontSize: TYPOGRAPHY.body,
      lineHeight: 42,
      fill: COLORS.muted,
    })
  );
}

function renderCover({ page, images, css, config, index }) {
  const body =
    `<g id="marca">` +
    svgImage({ href: images.logoChaco, x: 88, y: 54, width: 82, height: 82, role: "brand-image", asset: "logoChaco" }) +
    multilineText({ x: 190, y: 92, lines: "CHACO IMPLANTES", fontSize: 28, lineHeight: 32, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1 }) +
    multilineText({ x: 190, y: 124, lines: "al servicio de la salud", fontFamily: "Kurale", fontSize: 24, lineHeight: 28, fill: COLORS.muted }) +
    multilineText({ x: 1112, y: 90, lines: ["FOLLETO DE PRODUCTO", config.category], fontSize: 24, lineHeight: 30, fontWeight: 600, fill: COLORS.muted, textAnchor: "end", letterSpacing: 1 }) +
    `</g>` +
    line(88, 184, 230, 184, COLORS.accent, 5) +
    multilineText({ x: 88, y: 250, lines: page.eyebrow, fontSize: 24, lineHeight: 30, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1.2 }) +
    multilineText({ x: 88, y: 360, lines: page.title, fontFamily: "Montserrat", fontSize: TYPOGRAPHY.display, lineHeight: 98, fontWeight: 900, fill: COLORS.ink, letterSpacing: -2 }) +
    multilineText({ x: 88, y: 515, lines: page.subtitle, fontSize: 32, lineHeight: 40, fill: COLORS.muted }) +
    `<rect x="88" y="570" width="1024" height="690" rx="28" fill="${COLORS.softBlue}"/>` +
    svgImage({ href: images[page.asset], x: 150, y: 586, width: 900, height: 658, role: "editorial-image", asset: page.asset, filter: `url(#p${index}-shadow)` }) +
    line(88, 1348, 1112, 1348, COLORS.accent, 2, 0.75) +
    multilineText({ x: 88, y: 1406, lines: page.statement, fontSize: 26, lineHeight: 34, fontWeight: 600, fill: COLORS.ink, letterSpacing: 1.25 }) +
    `<g id="pie-portada">` +
    multilineText({ x: 88, y: 1534, lines: "FABRICADO POR", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.muted, letterSpacing: 1 }) +
    svgImage({ href: images.logoMedacta, x: 88, y: 1550, width: 250, height: 94, role: "brand-image", asset: "logoMedacta" }) +
    multilineText({ x: 1112, y: 1534, lines: "DISTRIBUIDO POR", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.muted, textAnchor: "end", letterSpacing: 1 }) +
    svgImage({ href: images.logoChaco, x: 948, y: 1546, width: 164, height: 116, role: "brand-image", asset: "logoChaco" }) +
    `</g>`;
  return svgDocument({ pageNumber: index, label: `${config.product} - Portada`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderConfigurations({ page, images, css, config, index }) {
  const itemWidth = 312;
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    `<g id="configuraciones-humerales">` +
    page.items
      .map((item, itemIndex) => {
        const x = 88 + itemIndex * 356;
        const titleLines = Array.isArray(item.title) ? item.title : [item.title];
        const copyY = 1210 + (titleLines.length - 1) * 30;
        return (
          `<rect x="${x}" y="500" width="${itemWidth}" height="535" rx="24" fill="${COLORS.softBlue}"/>` +
          svgImage({ href: images[item.asset], x: x + 12, y: 516, width: itemWidth - 24, height: 500, role: "editorial-image", asset: item.asset, filter: `url(#p${index}-shadow)` }) +
          line(x, 1098, x + itemWidth, 1098, itemIndex === 0 ? COLORS.ink : COLORS.accent, itemIndex === 0 ? 2 : 3) +
          multilineText({ x, y: 1150, lines: titleLines, fontSize: 24, lineHeight: 30, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.35 }) +
          multilineText({ x, y: copyY, lines: item.copy, fontSize: 26, lineHeight: 36, fill: COLORS.muted })
        );
      })
      .join("") +
    `</g>` +
    line(88, 1352, 1112, 1352, COLORS.rule, 2) +
    `<g id="datos-humerales">` +
    page.facts
      .map((fact, factIndex) => {
        const x = 88 + factIndex * 356;
        return (
          multilineText({ x, y: 1410, lines: fact.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.7 }) +
          multilineText({ x, y: 1462, lines: fact.value, fontSize: 26, lineHeight: 32, fontWeight: 600, fill: COLORS.ink })
        );
      })
      .join("") +
    `</g>` +
    interiorFooter(page);
  return svgDocument({ pageNumber: index, label: `${config.product} - Plataforma humeral`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderGlenoid({ page, images, css, config, index }) {
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    `<rect x="88" y="500" width="590" height="840" rx="28" fill="${COLORS.softBlue}"/>` +
    `<circle cx="383" cy="920" r="250" fill="none" stroke="${COLORS.accent}" stroke-width="2" opacity="0.55"/>` +
    svgImage({ href: images[page.asset], x: 112, y: 590, width: 542, height: 650, role: "editorial-image", asset: page.asset, filter: `url(#p${index}-shadow)` }) +
    `<g id="datos-glenoideos">` +
    page.facts
      .map((fact, factIndex) => {
        const y = 545 + factIndex * 250;
        const valueSize = factIndex === 0 ? 32 : 40;
        return (
          line(742, y, 1112, y, factIndex === 0 ? COLORS.ink : COLORS.accent, factIndex === 0 ? 2 : 3) +
          multilineText({ x: 742, y: y + 52, lines: fact.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
          multilineText({ x: 742, y: y + 112, lines: fact.value, fontFamily: "Montserrat", fontSize: valueSize, lineHeight: 44, fontWeight: 800, fill: COLORS.ink }) +
          multilineText({ x: 742, y: y + 168, lines: fact.copy, fontSize: 26, lineHeight: 34, fill: COLORS.muted })
        );
      })
      .join("") +
    `</g>` +
    line(88, 1422, 1112, 1422, COLORS.rule, 2) +
    multilineText({ x: 88, y: 1482, lines: page.note, fontSize: 26, lineHeight: 34, fill: COLORS.muted }) +
    interiorFooter(page);
  return svgDocument({ pageNumber: index, label: `${config.product} - Fijación glenoidea`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderArticulation({ page, images, css, config, index }) {
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    `<rect x="640" y="500" width="472" height="820" rx="28" fill="${COLORS.softBlue}"/>` +
    svgImage({ href: images[page.asset], x: 674, y: 526, width: 404, height: 778, role: "editorial-image", asset: page.asset, filter: `url(#p${index}-shadow)` }) +
    `<g id="datos-articulacion">` +
    page.facts
      .map((fact, factIndex) => {
        const y = 545 + factIndex * 250;
        const valueSize = factIndex === 0 ? 31 : factIndex === 1 ? 36 : 32;
        return (
          line(88, y, 570, y, factIndex === 0 ? COLORS.ink : COLORS.accent, factIndex === 0 ? 2 : 3) +
          multilineText({ x: 88, y: y + 52, lines: fact.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
          multilineText({ x: 88, y: y + 112, lines: fact.value, fontFamily: "Montserrat", fontSize: valueSize, lineHeight: 44, fontWeight: 800, fill: COLORS.ink }) +
          multilineText({ x: 88, y: y + 168, lines: fact.copy, fontSize: 26, lineHeight: 34, fill: COLORS.muted })
        );
      })
      .join("") +
    `</g>` +
    line(88, 1422, 1112, 1422, COLORS.rule, 2) +
    multilineText({ x: 88, y: 1482, lines: "La combinación final se define mediante la matriz de compatibilidad.", fontSize: 26, lineHeight: 34, fill: COLORS.muted }) +
    interiorFooter(page);
  return svgDocument({ pageNumber: index, label: `${config.product} - Glenosfera e inserto`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderClosing({ page, images, css, config, index }) {
  const contact = config.address;
  const body =
    multilineText({ x: 88, y: 92, lines: page.eyebrow, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1.1 }) +
    line(88, 126, 1112, 126, COLORS.ink, 2) +
    multilineText({ x: 88, y: 230, lines: page.title, fontFamily: "Montserrat", fontSize: 62, lineHeight: 70, fontWeight: 800, fill: COLORS.ink, letterSpacing: -1 }) +
    multilineText({ x: 88, y: 388, lines: page.summary, fontSize: 30, lineHeight: 42, fill: COLORS.muted }) +
    line(88, 480, 1112, 480, COLORS.rule, 2) +
    `<g data-layout="reference-cta">` +
    `<rect x="88" y="540" width="1024" height="356" rx="20" fill="${COLORS.accent}" filter="url(#p${index}-shadow)"/>` +
    multilineText({ x: 136, y: 606, lines: "DOCUMENTO DE REFERENCIA", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.white, letterSpacing: 1 }) +
    multilineText({ x: 136, y: 666, lines: "Consultá la ficha técnica completa", fontSize: 34, lineHeight: 40, fontWeight: 600, fill: COLORS.white }) +
    multilineText({ x: 136, y: 728, lines: page.documentLine, fontSize: 24, lineHeight: 34, fill: COLORS.white }) +
    line(136, 804, 1064, 804, COLORS.white, 1, 0.55) +
    multilineText({ x: 136, y: 858, lines: "Descargá la ficha completa", fontSize: 28, lineHeight: 34, fontWeight: 600, fill: COLORS.white }) +
    `<g id="download-arrow"><path d="M1016 848h38m-14-14 14 14-14 14" fill="none" stroke="${COLORS.white}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>` +
    `</g>` +
    `<g data-role="secondary-contact">` +
    multilineText({ x: 88, y: 986, lines: "CONTACTO TÉCNICO", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1 }) +
    line(88, 1024, 570, 1024, COLORS.ink, 2) +
    line(650, 1024, 1112, 1024, COLORS.accent, 3) +
    multilineText({ x: 88, y: 1082, lines: "CHACO IMPLANTES", fontSize: 26, lineHeight: 32, fontWeight: 600, fill: COLORS.ink }) +
    multilineText({ x: 88, y: 1134, lines: "DIRECCIÓN", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
    multilineText({ x: 88, y: 1174, lines: contact, fontSize: 24, lineHeight: 34, fill: COLORS.ink }) +
    multilineText({ x: 88, y: 1260, lines: config.email, fontSize: 24, lineHeight: 30, fill: COLORS.ink }) +
    multilineText({ x: 650, y: 1082, lines: "CANALES", fontSize: 26, lineHeight: 32, fontWeight: 600, fill: COLORS.ink }) +
    multilineText({ x: 650, y: 1134, lines: "INSTAGRAM", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
    multilineText({ x: 650, y: 1174, lines: config.instagram, fontSize: 24, lineHeight: 30, fill: COLORS.ink }) +
    `</g>` +
    line(88, 1332, 1112, 1332, COLORS.rule, 2) +
    `<g id="marcas-cierre">` +
    svgImage({ href: images.logoChaco, x: 88, y: 1370, width: 176, height: 124, role: "brand-image", asset: "logoChaco" }) +
    svgImage({ href: images.logoMedacta, x: 862, y: 1378, width: 250, height: 96, role: "brand-image", asset: "logoMedacta" }) +
    `</g>` +
    multilineText({ x: 88, y: 1572, lines: config.disclaimer, fontSize: 18, lineHeight: 22, fill: COLORS.muted, role: "legal-disclaimer" });
  return svgDocument({ pageNumber: index, label: `${config.product} - Cierre y documentación`, body, embeddedCss: css, defs: commonDefs(index) });
}

const RENDERERS = Object.freeze({
  cover: renderCover,
  configurations: renderConfigurations,
  glenoid: renderGlenoid,
  articulation: renderArticulation,
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
