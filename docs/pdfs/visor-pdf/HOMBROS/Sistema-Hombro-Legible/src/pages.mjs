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
    multilineText({ x: 88, y: 92, lines: page.section, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1.1 }) +
    multilineText({ x: 1112, y: 92, lines: "SISTEMA DE HOMBRO", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.ink, textAnchor: "end", letterSpacing: 1.1 }) +
    line(88, 126, 1112, 126, COLORS.ink, 2)
  );
}

function pageTitle(page) {
  return (
    multilineText({ x: 88, y: 230, lines: page.title, fontFamily: "Montserrat", fontSize: TYPOGRAPHY.title, lineHeight: 70, fontWeight: 800, fill: COLORS.ink, letterSpacing: -1 }) +
    multilineText({ x: 88, y: 390, lines: page.summary, fontSize: TYPOGRAPHY.body, lineHeight: 42, fill: COLORS.muted })
  );
}

function interiorFooter(page) {
  return (
    `<g id="pie">` +
    line(88, 1608, 1112, 1608, COLORS.rule, 2) +
    multilineText({ x: 88, y: 1652, lines: "CHACO IMPLANTES", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.ink, letterSpacing: 1 }) +
    multilineText({ x: 1112, y: 1652, lines: page.number, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.ink, textAnchor: "end", letterSpacing: 1 }) +
    `</g>`
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
    multilineText({ x: 88, y: 350, lines: page.title, fontFamily: "Montserrat", fontSize: 90, lineHeight: 94, fontWeight: 900, fill: COLORS.ink, letterSpacing: -2 }) +
    multilineText({ x: 88, y: 536, lines: page.subtitle, fontSize: 30, lineHeight: 40, fill: COLORS.muted }) +
    `<rect x="88" y="626" width="1024" height="610" rx="28" fill="${COLORS.softBlue}"/>` +
    page.items.map((item, itemIndex) => {
      const x = itemIndex === 0 ? 112 : 620;
      return (
        svgImage({ href: images[item.asset], x, y: 654, width: 468, height: 500, role: "editorial-image", asset: item.asset, filter: `url(#p${index}-shadow)` }) +
        multilineText({ x: x + 234, y: 1192, lines: item.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, textAnchor: "middle", letterSpacing: 0.8 })
      );
    }).join("") +
    line(88, 1328, 1112, 1328, COLORS.accent, 2, 0.75) +
    multilineText({ x: 88, y: 1388, lines: page.statement, fontSize: 26, lineHeight: 34, fontWeight: 600, fill: COLORS.ink, letterSpacing: 1.2 }) +
    `<g id="pie-portada">` +
    multilineText({ x: 88, y: 1522, lines: "FABRICADO POR", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.muted, letterSpacing: 1 }) +
    svgImage({ href: images.logoMedacta, x: 88, y: 1540, width: 250, height: 94, role: "brand-image", asset: "logoMedacta" }) +
    multilineText({ x: 1112, y: 1522, lines: "DISTRIBUIDO POR", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.muted, textAnchor: "end", letterSpacing: 1 }) +
    svgImage({ href: images.logoChaco, x: 948, y: 1534, width: 164, height: 116, role: "brand-image", asset: "logoChaco" }) +
    `</g>`;
  return svgDocument({ pageNumber: index, label: `${config.product} - Portada`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderHumeral({ page, images, css, config, index }) {
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    page.items.map((item, itemIndex) => {
      const x = itemIndex === 0 ? 88 : 622;
      return (
        `<rect x="${x}" y="500" width="490" height="472" rx="24" fill="${COLORS.softBlue}"/>` +
        svgImage({ href: images[item.asset], x: x + 30, y: 520, width: 430, height: 390, role: "editorial-image", asset: item.asset, filter: `url(#p${index}-shadow)` }) +
        multilineText({ x: x + 245, y: 940, lines: item.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, textAnchor: "middle", letterSpacing: 0.7 })
      );
    }).join("") +
    page.facts.map((fact, factIndex) => {
      const x = factIndex % 2 === 0 ? 88 : 622;
      const y = factIndex < 2 ? 1052 : 1248;
      return (
        line(x, y, x + 490, y, factIndex % 2 === 0 ? COLORS.ink : COLORS.accent, factIndex % 2 === 0 ? 2 : 3) +
        multilineText({ x, y: y + 46, lines: fact.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
        multilineText({ x, y: y + 96, lines: fact.value, fontFamily: "Montserrat", fontSize: 32, lineHeight: 38, fontWeight: 800, fill: COLORS.ink }) +
        multilineText({ x, y: y + 142, lines: fact.copy, fontSize: 24, lineHeight: 32, fill: COLORS.muted })
      );
    }).join("") +
    line(88, 1458, 1112, 1458, COLORS.rule, 2) +
    multilineText({ x: 88, y: 1510, lines: page.note, fontSize: 26, lineHeight: 34, fill: COLORS.muted }) +
    interiorFooter(page);
  return svgDocument({ pageNumber: index, label: `${config.product} - Plataforma humeral`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderAnatomic({ page, images, css, config, index }) {
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    `<rect x="88" y="500" width="600" height="452" rx="24" fill="${COLORS.softBlue}"/>` +
    svgImage({ href: images[page.assets.detail], x: 112, y: 518, width: 552, height: 400, role: "editorial-image", asset: page.assets.detail, filter: `url(#p${index}-shadow)` }) +
    multilineText({ x: 388, y: 932, lines: "COMPONENTES ANATÓMICOS", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, textAnchor: "middle", letterSpacing: 0.7 }) +
    `<rect x="730" y="500" width="382" height="452" rx="24" fill="${COLORS.white}"/>` +
    svgImage({ href: images[page.assets.head], x: 752, y: 524, width: 338, height: 366, role: "editorial-image", asset: page.assets.head, filter: `url(#p${index}-shadow)` }) +
    multilineText({ x: 921, y: 932, lines: "CABEZA HUMERAL", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, textAnchor: "middle", letterSpacing: 0.7 }) +
    page.facts.map((fact, factIndex) => {
      const x = factIndex % 2 === 0 ? 88 : 622;
      const y = factIndex < 2 ? 1032 : 1246;
      return (
        line(x, y, x + 490, y, factIndex % 2 === 0 ? COLORS.ink : COLORS.accent, factIndex % 2 === 0 ? 2 : 3) +
        multilineText({ x, y: y + 48, lines: fact.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
        multilineText({ x, y: y + 108, lines: fact.value, fontFamily: "Montserrat", fontSize: 31, lineHeight: 38, fontWeight: 800, fill: COLORS.ink })
      );
    }).join("") +
    line(88, 1442, 1112, 1442, COLORS.rule, 2) +
    multilineText({ x: 88, y: 1492, lines: "CONVERTIBILIDAD", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
    multilineText({ x: 360, y: 1492, lines: page.note, fontSize: 26, lineHeight: 34, fill: COLORS.muted }) +
    interiorFooter(page);
  return svgDocument({ pageNumber: index, label: `${config.product} - Configuración anatómica`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderReverse({ page, images, css, config, index }) {
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    `<rect x="630" y="500" width="482" height="820" rx="28" fill="${COLORS.softBlue}"/>` +
    svgImage({ href: images[page.asset], x: 662, y: 524, width: 418, height: 736, role: "editorial-image", asset: page.asset, filter: `url(#p${index}-shadow)` }) +
    multilineText({ x: 871, y: 1290, lines: "CONFIGURACIÓN ENSAMBLADA", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, textAnchor: "middle", letterSpacing: 0.7 }) +
    page.facts.map((fact, factIndex) => {
      const y = 520 + factIndex * 212;
      return (
        line(88, y, 566, y, factIndex === 0 ? COLORS.ink : COLORS.accent, factIndex === 0 ? 2 : 3) +
        multilineText({ x: 88, y: y + 52, lines: fact.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
        multilineText({ x: 88, y: y + 112, lines: fact.value, fontFamily: "Montserrat", fontSize: 32, lineHeight: 40, fontWeight: 800, fill: COLORS.ink })
      );
    }).join("") +
    line(88, 1412, 1112, 1412, COLORS.rule, 2) +
    multilineText({ x: 88, y: 1470, lines: page.note, fontSize: 26, lineHeight: 34, fill: COLORS.muted }) +
    interiorFooter(page);
  return svgDocument({ pageNumber: index, label: `${config.product} - Configuración reversa`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderGlenoidComparison({ page, images, css, config, index }) {
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    page.columns.map((column, columnIndex) => {
      const x = columnIndex === 0 ? 88 : 622;
      return (
        line(x, 500, x + 490, 500, columnIndex === 0 ? COLORS.ink : COLORS.accent, columnIndex === 0 ? 2 : 3) +
        multilineText({ x, y: 548, lines: column.title, fontSize: 26, lineHeight: 32, fontWeight: 600, fill: COLORS.ink, letterSpacing: 0.8 }) +
        `<rect x="${x}" y="580" width="490" height="390" rx="24" fill="${columnIndex === 0 ? COLORS.white : COLORS.softBlue}"/>` +
        svgImage({ href: images[column.asset], x: x + 34, y: 598, width: 422, height: 346, role: "editorial-image", asset: column.asset, filter: `url(#p${index}-shadow)` }) +
        column.facts.map((fact, factIndex) => {
          const y = 1030 + factIndex * 170;
          return (
            multilineText({ x, y, lines: fact.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.7 }) +
            multilineText({ x, y: y + 52, lines: fact.value, fontSize: 27, lineHeight: 34, fontWeight: 600, fill: COLORS.ink })
          );
        }).join("")
      );
    }).join("") +
    interiorFooter(page);
  return svgDocument({ pageNumber: index, label: `${config.product} - Soluciones glenoideas`, body, embeddedCss: css, defs: commonDefs(index) });
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
  humeral: renderHumeral,
  anatomic: renderAnatomic,
  reverse: renderReverse,
  "glenoid-comparison": renderGlenoidComparison,
  closing: renderClosing,
});

export async function renderPages() {
  const config = brochure;
  const [fontCss, imageEntries] = await Promise.all([
    fontFaceCss(FONT_FILES),
    Promise.all(Object.entries(config.assets).map(async ([key, file]) => [key, await dataUri(resolve(assetsDir, file))])),
  ]);
  const images = Object.fromEntries(imageEntries);
  const css = baseCss(fontCss);

  return config.pages.map((page, pageIndex) => {
    const renderer = RENDERERS[page.type];
    if (!renderer) throw new Error(`Tipo de página desconocido: ${page.type}`);
    return renderer({ page, images, css, config, index: pageIndex + 1 });
  });
}
