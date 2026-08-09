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
    `<feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="${COLORS.ink}" flood-opacity="0.13"/>` +
    `</filter>`
  );
}

function sectionHeader(page) {
  return (
    multilineText({ x: 88, y: 92, lines: page.section, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1.1 }) +
    multilineText({ x: 1112, y: 92, lines: "COLUMNA M.U.S.T.", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.ink, textAnchor: "end", letterSpacing: 1.1 }) +
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
    svgImage({ href: images[page.asset], x: 286, y: 642, width: 628, height: 530, role: "editorial-image", asset: page.asset, filter: `url(#p${index}-shadow)` }) +
    multilineText({ x: 600, y: 1200, lines: page.assetLabel, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, textAnchor: "middle", letterSpacing: 0.8 }) +
    line(88, 1328, 1112, 1328, COLORS.accent, 2, 0.75) +
    multilineText({ x: 88, y: 1388, lines: page.statement, fontSize: 26, lineHeight: 34, fontWeight: 600, fill: COLORS.ink, letterSpacing: 1.1 }) +
    `<g id="pie-portada">` +
    multilineText({ x: 88, y: 1522, lines: "FABRICADO POR", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.muted, letterSpacing: 1 }) +
    svgImage({ href: images.logoMedacta, x: 88, y: 1540, width: 250, height: 94, role: "brand-image", asset: "logoMedacta" }) +
    multilineText({ x: 1112, y: 1522, lines: "DISTRIBUIDO POR", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.muted, textAnchor: "end", letterSpacing: 1 }) +
    svgImage({ href: images.logoChaco, x: 948, y: 1534, width: 164, height: 116, role: "brand-image", asset: "logoChaco" }) +
    `</g>`;

  return svgDocument({ pageNumber: index, label: `${config.product} - Portada`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderPlatform({ page, images, css, config, index }) {
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    `<rect x="668" y="500" width="444" height="820" rx="28" fill="${COLORS.softBlue}"/>` +
    svgImage({ href: images[page.asset], x: 710, y: 524, width: 360, height: 724, role: "editorial-image", asset: page.asset, filter: `url(#p${index}-shadow)` }) +
    multilineText({ x: 890, y: 1290, lines: page.assetLabel, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, textAnchor: "middle", letterSpacing: 0.7 }) +
    page.facts.map((fact, factIndex) => {
      const y = 520 + factIndex * 194;
      return (
        line(88, y, 596, y, factIndex === 0 ? COLORS.ink : COLORS.accent, factIndex === 0 ? 2 : 3) +
        multilineText({ x: 88, y: y + 48, lines: fact.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
        multilineText({ x: 88, y: y + 102, lines: fact.value, fontFamily: "Montserrat", fontSize: 32, lineHeight: 38, fontWeight: 800, fill: COLORS.ink }) +
        (fact.copy ? multilineText({ x: 88, y: y + 142, lines: fact.copy, fontSize: 24, lineHeight: 30, fill: COLORS.muted }) : "")
      );
    }).join("") +
    line(88, 1404, 1112, 1404, COLORS.rule, 2) +
    multilineText({ x: 88, y: 1460, lines: page.note, fontSize: 26, lineHeight: 34, fill: COLORS.muted }) +
    interiorFooter(page);

  return svgDocument({ pageNumber: index, label: `${config.product} - Plataforma`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderScrews({ page, images, css, config, index }) {
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    page.items.map((item, itemIndex) => {
      const x = itemIndex === 0 ? 88 : 622;
      const imageWidth = itemIndex === 0 ? 390 : 300;
      const imageX = x + (490 - imageWidth) / 2;
      return (
        `<rect x="${x}" y="500" width="490" height="590" rx="24" fill="${itemIndex === 0 ? COLORS.softBlue : COLORS.white}"/>` +
        svgImage({ href: images[item.asset], x: imageX, y: 520, width: imageWidth, height: 390, role: "editorial-image", asset: item.asset, filter: `url(#p${index}-shadow)` }) +
        multilineText({ x: x + 245, y: 952, lines: item.label, fontSize: 26, lineHeight: 30, fontWeight: 600, fill: COLORS.accent, textAnchor: "middle", letterSpacing: 0.8 }) +
        multilineText({ x: x + 245, y: 1004, lines: item.copy, fontSize: 24, lineHeight: 32, fill: COLORS.muted, textAnchor: "middle" })
      );
    }).join("") +
    page.facts.map((fact, factIndex) => {
      const x = factIndex === 0 ? 88 : 622;
      return (
        line(x, 1160, x + 490, 1160, factIndex === 0 ? COLORS.ink : COLORS.accent, factIndex === 0 ? 2 : 3) +
        multilineText({ x, y: 1210, lines: fact.label, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
        multilineText({ x, y: 1270, lines: fact.value, fontFamily: "Montserrat", fontSize: 31, lineHeight: 38, fontWeight: 800, fill: COLORS.ink })
      );
    }).join("") +
    line(88, 1408, 1112, 1408, COLORS.rule, 2) +
    multilineText({ x: 88, y: 1462, lines: page.note, fontSize: 26, lineHeight: 34, fill: COLORS.muted }) +
    interiorFooter(page);

  return svgDocument({ pageNumber: index, label: `${config.product} - Tornillos pediculares`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderSpecialized({ page, images, css, config, index }) {
  const xs = [88, 440, 792];
  const imageWidths = [268, 180, 184];
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    page.items.map((item, itemIndex) => {
      const x = xs[itemIndex];
      const imageWidth = imageWidths[itemIndex];
      return (
        `<rect x="${x}" y="500" width="320" height="720" rx="24" fill="${itemIndex === 1 ? COLORS.white : COLORS.softBlue}"/>` +
        svgImage({ href: images[item.asset], x: x + (320 - imageWidth) / 2, y: 526, width: imageWidth, height: 446, role: "editorial-image", asset: item.asset, filter: `url(#p${index}-shadow)` }) +
        multilineText({ x: x + 160, y: 1028, lines: item.label, fontSize: 26, lineHeight: 30, fontWeight: 600, fill: COLORS.accent, textAnchor: "middle", letterSpacing: 0.8 }) +
        multilineText({ x: x + 160, y: 1082, lines: item.copy, fontSize: 24, lineHeight: 32, fill: COLORS.muted, textAnchor: "middle" })
      );
    }).join("") +
    line(88, 1344, 1112, 1344, COLORS.rule, 2) +
    multilineText({ x: 88, y: 1404, lines: "SELECCIÓN", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.8 }) +
    multilineText({ x: 300, y: 1404, lines: page.note, fontSize: 26, lineHeight: 34, fill: COLORS.muted }) +
    interiorFooter(page);

  return svgDocument({ pageNumber: index, label: `${config.product} - Opciones específicas`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderConnections({ page, images, css, config, index }) {
  const positions = [
    { x: 88, y: 500 },
    { x: 622, y: 500 },
    { x: 88, y: 1000 },
    { x: 622, y: 1000 },
  ];
  const body =
    sectionHeader(page) +
    pageTitle(page) +
    page.items.map((item, itemIndex) => {
      const { x, y } = positions[itemIndex];
      const isTall = item.asset === "pedicleHook";
      const imageWidth = isTall ? 230 : 420;
      const imageHeight = isTall ? 270 : 260;
      return (
        line(x, y, x + 490, y, itemIndex % 2 === 0 ? COLORS.ink : COLORS.accent, itemIndex % 2 === 0 ? 2 : 3) +
        `<rect x="${x}" y="${y + 30}" width="490" height="300" rx="22" fill="${itemIndex % 2 === 0 ? COLORS.white : COLORS.softBlue}"/>` +
        svgImage({ href: images[item.asset], x: x + (490 - imageWidth) / 2, y: y + 42, width: imageWidth, height: imageHeight, role: "editorial-image", asset: item.asset, filter: `url(#p${index}-shadow)` }) +
        multilineText({ x, y: y + 384, lines: item.label, fontSize: 25, lineHeight: 30, fontWeight: 600, fill: COLORS.accent, letterSpacing: 0.7 }) +
        multilineText({ x, y: y + 430, lines: item.copy, fontSize: 24, lineHeight: 30, fill: COLORS.ink })
      );
    }).join("") +
    interiorFooter(page);

  return svgDocument({ pageNumber: index, label: `${config.product} - Ganchos y conectores`, body, embeddedCss: css, defs: commonDefs(index) });
}

function renderClosing({ page, images, css, config, index }) {
  const body =
    multilineText({ x: 88, y: 92, lines: page.eyebrow, fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.accent, letterSpacing: 1.1 }) +
    line(88, 126, 1112, 126, COLORS.ink, 2) +
    multilineText({ x: 88, y: 214, lines: page.title, fontFamily: "Montserrat", fontSize: 52, lineHeight: 60, fontWeight: 800, fill: COLORS.ink, letterSpacing: -1 }) +
    multilineText({ x: 88, y: 354, lines: page.summary, fontSize: 26, lineHeight: 34, fill: COLORS.muted }) +
    svgImage({ href: images.constructLateral, x: 840, y: 136, width: 272, height: 330, role: "closing-product-image", asset: "constructLateral", filter: `url(#p${index}-shadow)` }) +
    line(88, 480, 1112, 480, COLORS.rule, 2) +
    `<g data-layout="reference-cta">` +
    `<rect x="88" y="540" width="1024" height="356" rx="20" fill="${COLORS.accent}" filter="url(#p${index}-shadow)"/>` +
    multilineText({ x: 136, y: 606, lines: "DOCUMENTO DE REFERENCIA", fontSize: 24, lineHeight: 28, fontWeight: 600, fill: COLORS.white, letterSpacing: 1 }) +
    multilineText({ x: 136, y: 666, lines: "Consultá la técnica quirúrgica completa", fontSize: 34, lineHeight: 40, fontWeight: 600, fill: COLORS.white }) +
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
    multilineText({ x: 88, y: 1174, lines: config.address, fontSize: 24, lineHeight: 34, fill: COLORS.ink }) +
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
  platform: renderPlatform,
  screws: renderScrews,
  specialized: renderSpecialized,
  connections: renderConnections,
  closing: renderClosing,
});

export async function renderPages() {
  const [fontCss, imageEntries] = await Promise.all([
    fontFaceCss(FONT_FILES),
    Promise.all(
      Object.entries(brochure.assets).map(async ([key, file]) => [
        key,
        await dataUri(resolve(assetsDir, file)),
      ]),
    ),
  ]);
  const images = Object.fromEntries(imageEntries);
  const css = baseCss(fontCss);

  return brochure.pages.map((page, pageIndex) => {
    const renderer = RENDERERS[page.type];
    if (!renderer) throw new Error(`Tipo de página desconocido: ${page.type}`);
    return renderer({ page, images, css, config: brochure, index: pageIndex + 1 });
  });
}
