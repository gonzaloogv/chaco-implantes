import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brochure } from "./content.mjs";
import { COLORS, TYPOGRAPHY } from "./constants.mjs";
import {
  dataUri,
  escapeXml,
  fontFaceCss,
  multilineText,
  svgDocument,
  svgImage,
} from "./svg-helpers.mjs";

const srcDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(srcDir, "..");
const assetsDir = resolve(projectDir, "assets", "source");
const fontsDir = resolve(projectDir, "assets", "fonts");

const imageFiles = Object.freeze({
  frontal: "masterloc-frontal.png",
  offsetsSuperpuestos: "masterloc-offsets-superpuestos.png",
  microscopia: "masterloc-microscopia.png",
  cuelloPulido: "masterloc-cuello-pulido.png",
  vistaSuperior: "masterloc-vista-superior.png",
  tresOffsets: "masterloc-tres-offsets.png",
  implanteFinal: "masterloc-implante-final.png",
  logoChaco: "logo-chaco.png",
  logoMedacta: "logo-medacta.png",
});

const fontFiles = Object.freeze([
  { family: "Poppins", weight: 400, file: "poppins-400.woff2" },
  { family: "Poppins", weight: 600, file: "poppins-600.woff2" },
  { family: "Montserrat", weight: 700, file: "montserrat-700.woff2" },
  { family: "Montserrat", weight: 800, file: "montserrat-800.woff2" },
  { family: "Montserrat", weight: 900, file: "montserrat-900.woff2" },
  { family: "Kurale", weight: 400, file: "kurale-400.woff2" },
]);

let resourcesPromise;

async function loadResources() {
  if (!resourcesPromise) {
    resourcesPromise = (async () => {
      const imageEntries = await Promise.all(
        Object.entries(imageFiles).map(async ([key, file]) => [
          key,
          await dataUri(resolve(assetsDir, file)),
        ]),
      );
      const embeddedFonts = await fontFaceCss(
        fontFiles.map((font) => ({
          family: font.family,
          weight: font.weight,
          path: resolve(fontsDir, font.file),
        })),
      );
      return { images: Object.fromEntries(imageEntries), embeddedFonts };
    })();
  }
  return resourcesPromise;
}

function singleText({
  x,
  y,
  text,
  size,
  weight = 400,
  family = "Poppins",
  fill = COLORS.ink,
  anchor = "start",
  spacing = 0,
  role = "",
  id = "",
}) {
  return (
    `<text${id ? ` id="${escapeXml(id)}"` : ""} x="${x}" y="${y}" ` +
    `font-family="${escapeXml(family)}" font-size="${size}" ` +
    `font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ` +
    `letter-spacing="${spacing}"${role ? ` data-role="${escapeXml(role)}"` : ""}>` +
    `${escapeXml(text)}</text>`
  );
}

function commonCss(embeddedFonts) {
  return `${embeddedFonts}
    text { text-rendering: geometricPrecision; }
    image { image-rendering: auto; }
  `;
}

function commonDefs() {
  return `
    <filter id="product-shadow" x="-30%" y="-25%" width="170%" height="175%">
      <feDropShadow dx="0" dy="20" stdDeviation="22" flood-color="#26344a" flood-opacity="0.20"/>
    </filter>
    <filter id="soft-shadow" x="-20%" y="-20%" width="150%" height="160%">
      <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#26344a" flood-opacity="0.14"/>
    </filter>
    <clipPath id="micro-clip"><rect x="88" y="485" width="570" height="650" rx="34"/></clipPath>
    <clipPath id="neck-clip"><rect x="88" y="470" width="1024" height="395" rx="34"/></clipPath>
    <linearGradient id="blue-panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#327ec8"/>
      <stop offset="1" stop-color="#275f9f"/>
    </linearGradient>
  `;
}

function pageHeader(content) {
  return (
    singleText({
      x: 88,
      y: 92,
      text: content.section,
      size: TYPOGRAPHY.label,
      weight: 700,
      family: "Montserrat",
      fill: COLORS.accent,
      spacing: 2.2,
    }) +
    singleText({
      x: 1112,
      y: 92,
      text: content.kicker,
      size: TYPOGRAPHY.label,
      weight: 700,
      family: "Montserrat",
      fill: COLORS.muted,
      anchor: "end",
      spacing: 2,
    }) +
    `<line x1="88" y1="136" x2="1112" y2="136" stroke="${COLORS.ink}" stroke-width="2"/>`
  );
}

function pageFooter(content) {
  return (
    singleText({
      x: 88,
      y: 1633,
      text: "CHACO IMPLANTES",
      size: TYPOGRAPHY.finePrint,
      weight: 700,
      family: "Montserrat",
      fill: COLORS.muted,
      spacing: 2.1,
    }) +
    singleText({
      x: 1112,
      y: 1633,
      text: content.number,
      size: TYPOGRAPHY.finePrint,
      weight: 700,
      family: "Montserrat",
      fill: COLORS.muted,
      anchor: "end",
      spacing: 1.8,
    })
  );
}

function renderCover({ content, images, css }) {
  const body = `
    ${svgImage({ href: images.logoChaco, x: 88, y: 66, width: 96, height: 100, preserveAspectRatio: "xMinYMid meet" })}
    ${singleText({ x: 200, y: 103, text: "CHACO IMPLANTES", size: 24, weight: 800, family: "Montserrat", fill: COLORS.accent, spacing: 1.1 })}
    ${singleText({ x: 200, y: 137, text: "al servicio de la salud...", size: 20, family: "Kurale", fill: COLORS.muted })}
    ${singleText({ x: 1112, y: 96, text: "FOLLETO DE PRODUCTO", size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.muted, anchor: "end", spacing: 2.1 })}
    ${singleText({ x: 1112, y: 129, text: "LÍNEA CADERA", size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.muted, anchor: "end", spacing: 2.1 })}

    ${singleText({ x: 88, y: 285, text: content.eyebrow, size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 2.3 })}
    ${singleText({ x: 88, y: 420, text: content.title, size: TYPOGRAPHY.display, weight: 900, family: "Montserrat" })}
    <line x1="88" y1="458" x2="236" y2="458" stroke="${COLORS.accent}" stroke-width="5"/>
    ${multilineText({ x: 88, y: 545, lines: content.subtitle, fontSize: TYPOGRAPHY.subtitle, lineHeight: 50, fontWeight: 700, fontFamily: "Montserrat" })}
    ${multilineText({ x: 88, y: 685, lines: content.statement, fontSize: TYPOGRAPHY.body, lineHeight: 45, fill: COLORS.muted })}

    ${svgImage({ href: images.frontal, id: "producto-principal", x: 470, y: 425, width: 680, height: 1040, filter: "url(#product-shadow)" })}

    <line x1="88" y1="870" x2="420" y2="870" stroke="${COLORS.rule}" stroke-width="2"/>
    ${singleText({ x: 88, y: 920, text: "CUÑA CÓNICA · MECTAGRIP", size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 2.1 })}
    ${multilineText({ x: 88, y: 974, lines: ["Diseño femoral con tres", "opciones progresivas de offset."], fontSize: TYPOGRAPHY.bodySmall, lineHeight: 38, fill: COLORS.muted })}

    <line x1="88" y1="1486" x2="1112" y2="1486" stroke="${COLORS.rule}" stroke-width="2"/>
    ${singleText({ x: 88, y: 1535, text: "FABRICADO POR", size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.muted, spacing: 2 })}
    ${svgImage({ href: images.logoMedacta, x: 88, y: 1550, width: 245, height: 82, preserveAspectRatio: "xMinYMid meet" })}
    ${singleText({ x: 1112, y: 1535, text: "DISTRIBUIDO POR", size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.muted, anchor: "end", spacing: 2 })}
    ${singleText({ x: 1112, y: 1583, text: "CHACO IMPLANTES", size: 22, weight: 800, family: "Montserrat", anchor: "end" })}
    ${singleText({ x: 1112, y: 1623, text: "Resistencia, Chaco · Argentina", size: TYPOGRAPHY.finePrint, fill: COLORS.muted, anchor: "end" })}
    ${singleText({ x: 88, y: 1660, text: brochure.disclaimer, size: TYPOGRAPHY.finePrint, fill: COLORS.muted })}
  `;
  return svgDocument({
    pageNumber: 1,
    label: "Portada del folleto Masterloc",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderDesignPrinciple(principle, index) {
  const y = 565 + index * 226;
  return `
    <g data-role="design-principle">
      <line x1="88" y1="${y - 54}" x2="476" y2="${y - 54}" stroke="${index === 0 ? COLORS.accent : COLORS.rule}" stroke-width="3"/>
      ${singleText({ x: 88, y, text: principle.number, size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
      ${singleText({ x: 146, y, text: principle.title, size: TYPOGRAPHY.heading, weight: 800, family: "Montserrat" })}
      ${multilineText({ x: 146, y: y + 48, lines: principle.description, fontSize: TYPOGRAPHY.bodySmall, lineHeight: 36, fill: COLORS.muted })}
    </g>
  `;
}

function renderPage2({ content, images, css }) {
  const body = `
    ${pageHeader(content)}
    ${multilineText({ x: 88, y: 235, lines: content.title, fontSize: TYPOGRAPHY.title, lineHeight: 72, fontWeight: 900, fontFamily: "Montserrat" })}
    ${multilineText({ x: 88, y: 407, lines: content.summary, fontSize: TYPOGRAPHY.body, lineHeight: 43, fill: COLORS.muted })}
    ${content.principles.map(renderDesignPrinciple).join("")}

    ${svgImage({ href: images.offsetsSuperpuestos, id: "geometria-principal", x: 520, y: 455, width: 610, height: 900, filter: "url(#product-shadow)" })}

    <rect x="88" y="1377" width="1024" height="145" rx="24" fill="${COLORS.softBlue}"/>
    <line x1="88" y1="1377" x2="88" y2="1522" stroke="${COLORS.accent}" stroke-width="7" stroke-linecap="round"/>
    ${content.technical.map((value, index) => {
      const x = [125, 446, 793][index];
      const labels = ["MATERIAL", "FIJACIÓN", "PREPARACIÓN"];
      return singleText({ x, y: 1430, text: labels[index], size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 }) +
        singleText({ x, y: 1487, text: value, size: index === 2 ? 21 : 24, weight: 800, family: "Montserrat" });
    }).join("")}
    ${pageFooter(content)}
  `;
  return svgDocument({
    pageNumber: 2,
    label: "Fundamento de diseño de Masterloc",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderMectaGripBenefit(benefit, index) {
  const y = 620 + index * 210;
  return `
    <g data-role="mectagrip-benefit">
      <line x1="710" y1="${y - 58}" x2="1112" y2="${y - 58}" stroke="${index === 0 ? COLORS.accent : COLORS.rule}" stroke-width="3"/>
      ${singleText({ x: 710, y, text: String(index + 1).padStart(2, "0"), size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.7 })}
      ${singleText({ x: 766, y, text: benefit.title, size: TYPOGRAPHY.heading, weight: 800, family: "Montserrat" })}
      ${multilineText({ x: 766, y: y + 48, lines: benefit.description, fontSize: TYPOGRAPHY.bodySmall, lineHeight: 36, fill: COLORS.muted })}
    </g>
  `;
}

function renderPage3({ content, images, css }) {
  const body = `
    ${pageHeader(content)}
    ${multilineText({ x: 88, y: 235, lines: content.title, fontSize: TYPOGRAPHY.titleCompact, lineHeight: 66, fontWeight: 900, fontFamily: "Montserrat" })}
    ${multilineText({ x: 88, y: 390, lines: content.summary, fontSize: TYPOGRAPHY.body, lineHeight: 43, fill: COLORS.muted })}

    <rect x="88" y="485" width="570" height="650" rx="34" fill="${COLORS.technical}"/>
    ${svgImage({ href: images.microscopia, id: "mectagrip-microscopia", x: 88, y: 485, width: 570, height: 650, preserveAspectRatio: "xMidYMid slice", clipPath: "url(#micro-clip)" })}
    ${content.benefits.map(renderMectaGripBenefit).join("")}

    <line x1="88" y1="1190" x2="1112" y2="1190" stroke="${COLORS.ink}" stroke-width="2"/>
    ${singleText({ x: 88, y: 1250, text: "POROS ABIERTOS INTERCONECTADOS", size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
    ${singleText({ x: 88, y: 1346, text: content.metric, size: 72, weight: 900, family: "Montserrat", fill: COLORS.accent })}
    ${multilineText({ x: 650, y: 1278, lines: ["Microestructura visible", "en el recubrimiento proximal."], fontSize: TYPOGRAPHY.body, lineHeight: 44, fill: COLORS.muted })}

    <rect x="710" y="1410" width="402" height="108" rx="20" fill="${COLORS.softBlue}"/>
    ${singleText({ x: 742, y: 1453, text: "SUPERFICIE", size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
    ${singleText({ x: 742, y: 1495, text: "VPS · TITANIO PURO", size: 22, weight: 800, family: "Montserrat" })}
    ${pageFooter(content)}
  `;
  return svgDocument({
    pageNumber: 3,
    label: "Superficie MectaGrip de Masterloc",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderPage4({ content, images, css }) {
  const first = content.features[0];
  const second = content.features[1];
  const body = `
    ${pageHeader(content)}
    ${multilineText({ x: 88, y: 235, lines: content.title, fontSize: TYPOGRAPHY.titleCompact, lineHeight: 66, fontWeight: 900, fontFamily: "Montserrat" })}
    ${multilineText({ x: 88, y: 390, lines: content.summary, fontSize: TYPOGRAPHY.body, lineHeight: 43, fill: COLORS.muted })}

    <rect x="88" y="470" width="1024" height="395" rx="34" fill="${COLORS.softBlue}"/>
    ${svgImage({ href: images.cuelloPulido, id: "detalle-cuello-pulido", x: 88, y: 470, width: 1024, height: 395, preserveAspectRatio: "xMidYMid slice", clipPath: "url(#neck-clip)", filter: "url(#soft-shadow)" })}

    <g data-role="neck-feature">
      ${singleText({ x: 88, y: 932, text: first.label, size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
      ${singleText({ x: 88, y: 985, text: first.title, size: TYPOGRAPHY.heading, weight: 800, family: "Montserrat" })}
      ${multilineText({ x: 88, y: 1032, lines: first.description, fontSize: TYPOGRAPHY.bodySmall, lineHeight: 36, fill: COLORS.muted })}
    </g>

    <g data-role="neck-feature">
      ${singleText({ x: 88, y: 1190, text: second.label, size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
      ${singleText({ x: 88, y: 1243, text: second.title, size: TYPOGRAPHY.heading, weight: 800, family: "Montserrat" })}
      ${multilineText({ x: 88, y: 1290, lines: second.description, fontSize: TYPOGRAPHY.bodySmall, lineHeight: 36, fill: COLORS.muted })}
    </g>
    ${svgImage({ href: images.vistaSuperior, id: "detalle-cuello-superior", x: 650, y: 1010, width: 462, height: 300, filter: "url(#product-shadow)" })}

    <rect x="88" y="1400" width="1024" height="118" rx="22" fill="${COLORS.technical}"/>
    ${singleText({ x: 600, y: 1474, text: content.callout, size: 30, weight: 800, family: "Montserrat", fill: COLORS.white, anchor: "middle", spacing: 1.2 })}
    ${pageFooter(content)}
  `;
  return svgDocument({
    pageNumber: 4,
    label: "Cuello funcional de Masterloc",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderOffsetLabel(configuration, index) {
  const x = [236, 600, 964][index];
  return `
    <g data-role="offset-label">
      <line x1="${x - 150}" y1="1145" x2="${x + 150}" y2="1145" stroke="${index === 1 ? COLORS.accent : COLORS.rule}" stroke-width="3"/>
      ${singleText({ x, y: 1202, text: configuration.name, size: index === 2 ? 18 : TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, anchor: "middle", spacing: 1.6 })}
      ${singleText({ x, y: 1280, text: configuration.angle, size: 54, weight: 900, family: "Montserrat", anchor: "middle" })}
      ${singleText({ x, y: 1330, text: configuration.offset, size: TYPOGRAPHY.bodySmall, fill: COLORS.muted, anchor: "middle" })}
    </g>
  `;
}

function renderPage5({ content, images, css }) {
  const body = `
    ${pageHeader(content)}
    ${multilineText({ x: 88, y: 235, lines: content.title, fontSize: TYPOGRAPHY.titleCompact, lineHeight: 66, fontWeight: 900, fontFamily: "Montserrat" })}
    ${multilineText({ x: 88, y: 390, lines: content.summary, fontSize: TYPOGRAPHY.body, lineHeight: 43, fill: COLORS.muted })}

    <rect x="88" y="510" width="1024" height="560" rx="36" fill="${COLORS.technical}"/>
    ${singleText({ x: 122, y: 560, text: "COMPARACIÓN DE CONFIGURACIONES", size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.white, spacing: 1.7 })}
    ${svgImage({ href: images.tresOffsets, id: "comparacion-offsets", x: 88, y: 510, width: 1024, height: 560 })}
    ${content.configurations.map(renderOffsetLabel).join("")}

    <line x1="88" y1="1395" x2="1112" y2="1395" stroke="${COLORS.ink}" stroke-width="2"/>
    ${singleText({ x: 88, y: 1460, text: "OFFSET PROGRESIVO", size: TYPOGRAPHY.heading, weight: 800, family: "Montserrat" })}
    ${singleText({ x: 88, y: 1512, text: content.note, size: TYPOGRAPHY.bodySmall, fill: COLORS.muted })}
    ${pageFooter(content)}
  `;
  return svgDocument({
    pageNumber: 5,
    label: "Configuraciones de offset Masterloc",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderClosingHighlight(item, index) {
  const x = [88, 430, 772][index];
  return `
    <g>
      ${singleText({ x, y: 865, text: item.label, size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.7 })}
      ${multilineText({ x, y: 915, lines: item.detail, fontSize: TYPOGRAPHY.bodySmall, lineHeight: 36, fill: COLORS.muted })}
    </g>
  `;
}

function renderClosing({ content, images, css }) {
  const body = `
    ${svgImage({ href: images.implanteFinal, id: "cierre-producto-image", x: 240, y: 55, width: 720, height: 590, filter: "url(#product-shadow)" })}
    <line x1="88" y1="665" x2="1112" y2="665" stroke="${COLORS.ink}" stroke-width="2"/>
    ${multilineText({ x: 88, y: 735, lines: content.title, fontSize: 54, lineHeight: 61, fontWeight: 900, fontFamily: "Montserrat" })}
    ${content.highlights.map(renderClosingHighlight).join("")}

    <g data-layout="reference-cta">
      <rect x="88" y="1030" width="1024" height="300" rx="30" fill="url(#blue-panel)" filter="url(#soft-shadow)"/>
      ${singleText({ x: 136, y: 1102, text: content.cta, size: 34, weight: 800, family: "Montserrat", fill: COLORS.white })}
      ${singleText({ x: 136, y: 1150, text: content.ctaDetail, size: TYPOGRAPHY.bodySmall, fill: COLORS.white })}
      <line x1="136" y1="1200" x2="1064" y2="1200" stroke="#84b7e8" stroke-width="2"/>
      ${singleText({ x: 136, y: 1260, text: content.ctaAction, size: 27, weight: 700, family: "Montserrat", fill: COLORS.white })}
      <line x1="540" y1="1252" x2="1020" y2="1252" stroke="#84b7e8" stroke-width="2"/>
      <g id="download-arrow" transform="translate(1034 1236)" stroke="${COLORS.white}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M0 16h28M18 6l10 10-10 10"/>
      </g>
    </g>

    ${singleText({ x: 88, y: 1398, text: "DIRECCIÓN", size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
    ${multilineText({ x: 88, y: 1440, lines: brochure.contact.address, fontSize: TYPOGRAPHY.bodySmall, lineHeight: 34 })}
    ${singleText({ x: 700, y: 1398, text: "INSTAGRAM", size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
    ${singleText({ x: 700, y: 1440, text: brochure.contact.instagram, size: TYPOGRAPHY.bodySmall })}

    <line x1="88" y1="1500" x2="1112" y2="1500" stroke="${COLORS.rule}" stroke-width="2"/>
    ${svgImage({ href: images.logoChaco, x: 88, y: 1520, width: 88, height: 85, preserveAspectRatio: "xMinYMid meet" })}
    ${singleText({ x: 192, y: 1555, text: "CHACO IMPLANTES", size: 22, weight: 800, family: "Montserrat", fill: COLORS.accent, spacing: 1 })}
    ${singleText({ x: 192, y: 1587, text: "al servicio de la salud...", size: 18, family: "Kurale", fill: COLORS.muted })}
    ${singleText({ x: 830, y: 1558, text: "FABRICADO POR", size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.muted, anchor: "end", spacing: 1.8 })}
    ${svgImage({ href: images.logoMedacta, x: 860, y: 1518, width: 252, height: 90, preserveAspectRatio: "xMaxYMid meet" })}
    ${singleText({ x: 88, y: 1650, text: `${brochure.disclaimer} · ${brochure.contact.email}`, size: TYPOGRAPHY.finePrint, fill: COLORS.muted })}
  `;
  return svgDocument({
    pageNumber: 6,
    label: "Cierre y descarga del folleto Masterloc",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

export async function renderPages() {
  const { images, embeddedFonts } = await loadResources();
  const css = commonCss(embeddedFonts);
  return [
    renderCover({ content: brochure.pages[0], images, css }),
    renderPage2({ content: brochure.pages[1], images, css }),
    renderPage3({ content: brochure.pages[2], images, css }),
    renderPage4({ content: brochure.pages[3], images, css }),
    renderPage5({ content: brochure.pages[4], images, css }),
    renderClosing({ content: brochure.pages[5], images, css }),
  ];
}
