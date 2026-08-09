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
  vastago: "x-acta-vastago-completo.png",
  centralizador: "x-acta-centralizador-pmma.png",
  detalles: "x-acta-detalles-tecnicos.png",
  radiografia: "x-acta-radiografia.png",
  offsets: "x-acta-offsets.png",
  longitudes: "x-acta-standard-short.png",
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
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#26344a" flood-opacity="0.18"/>
    </filter>
    <filter id="soft-shadow" x="-20%" y="-20%" width="150%" height="160%">
      <feDropShadow dx="0" dy="11" stdDeviation="14" flood-color="#26344a" flood-opacity="0.13"/>
    </filter>
    <clipPath id="radiograph-clip"><rect x="220" y="30" width="760" height="610" rx="34"/></clipPath>
    <clipPath id="offset-clip-1"><rect x="88" y="480" width="400" height="390"/></clipPath>
    <clipPath id="offset-clip-2"><rect x="620" y="480" width="400" height="390"/></clipPath>
    <clipPath id="offset-clip-3"><rect x="88" y="930" width="400" height="450"/></clipPath>
    <clipPath id="offset-clip-4"><rect x="620" y="930" width="400" height="450"/></clipPath>
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
      spacing: 1.8,
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

    ${svgImage({ href: images.vastago, id: "producto-principal", x: 520, y: 315, width: 580, height: 1160, filter: "url(#product-shadow)" })}

    <line x1="88" y1="870" x2="430" y2="870" stroke="${COLORS.rule}" stroke-width="2"/>
    ${singleText({ x: 88, y: 920, text: "DOBLE CONICIDAD · SIN COLLAR", size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
    ${multilineText({ x: 88, y: 974, lines: ["Diseño cementado con cuatro", "opciones de offset."], fontSize: TYPOGRAPHY.bodySmall, lineHeight: 38, fill: COLORS.muted })}

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
    label: "Portada del folleto X-acta",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderDesignFeature(feature, index) {
  const columns = [88, 430, 772];
  const x = columns[index % 3];
  const y = index < 3 ? 1335 : 1430;
  return `
    <g data-role="design-feature">
      <line x1="${x}" y1="${y - 36}" x2="${x + 300}" y2="${y - 36}" stroke="${index < 3 ? COLORS.accent : COLORS.rule}" stroke-width="3"/>
      ${singleText({ x, y, text: feature.number, size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
      ${singleText({ x: x + 50, y, text: feature.title, size: 23, weight: 800, family: "Montserrat" })}
    </g>
  `;
}

function renderPage2({ content, images, css }) {
  const body = `
    ${pageHeader(content)}
    ${multilineText({ x: 88, y: 235, lines: content.title, fontSize: TYPOGRAPHY.titleCompact, lineHeight: 66, fontWeight: 900, fontFamily: "Montserrat" })}
    ${multilineText({ x: 88, y: 390, lines: content.summary, fontSize: TYPOGRAPHY.body, lineHeight: 43, fill: COLORS.muted })}

    ${svgImage({ href: images.detalles, id: "detalles-tecnicos-principal", x: 300, y: 445, width: 600, height: 850, filter: "url(#product-shadow)" })}
    <g data-layout="design-key">
      ${content.features.map(renderDesignFeature).join("")}
    </g>

    <rect x="88" y="1490" width="1024" height="100" rx="22" fill="${COLORS.softBlue}"/>
    <line x1="88" y1="1490" x2="88" y2="1590" stroke="${COLORS.accent}" stroke-width="7" stroke-linecap="round"/>
    ${content.technical.map((value, index) => {
      const x = [125, 470, 815][index];
      const labels = ["MATERIAL", "ÁNGULO CCD", "FIJACIÓN"];
      return singleText({ x, y: 1525, text: labels[index], size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.6 }) +
        singleText({ x, y: 1570, text: value, size: index === 0 ? 20 : 25, weight: 800, family: "Montserrat" });
    }).join("")}
    ${pageFooter(content)}
  `;
  return svgDocument({
    pageNumber: 2,
    label: "Decisiones de diseño del tallo X-acta",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderCentralizerOption(option, index) {
  const y = 650 + index * 246;
  return `
    <g data-role="centralizer-option">
      <line x1="650" y1="${y - 62}" x2="1112" y2="${y - 62}" stroke="${index === 0 ? COLORS.accent : COLORS.rule}" stroke-width="3"/>
      ${singleText({ x: 650, y, text: option.name, size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
      ${singleText({ x: 1112, y, text: option.range, size: 33, weight: 900, family: "Montserrat", anchor: "end" })}
      ${multilineText({ x: 650, y: y + 52, lines: option.description, fontSize: TYPOGRAPHY.bodySmall, lineHeight: 37, fill: COLORS.muted })}
    </g>
  `;
}

function renderPage3({ content, images, css }) {
  const body = `
    ${pageHeader(content)}
    ${multilineText({ x: 88, y: 235, lines: content.title, fontSize: TYPOGRAPHY.titleCompact, lineHeight: 66, fontWeight: 900, fontFamily: "Montserrat" })}
    ${multilineText({ x: 88, y: 390, lines: content.summary, fontSize: TYPOGRAPHY.body, lineHeight: 43, fill: COLORS.muted })}

    ${svgImage({ href: images.centralizador, id: "centralizador-principal", x: 88, y: 475, width: 520, height: 930, filter: "url(#product-shadow)" })}
    ${content.centralizers.map(renderCentralizerOption).join("")}

    <rect x="88" y="1410" width="1024" height="112" rx="22" fill="${COLORS.technical}"/>
    ${singleText({ x: 125, y: 1481, text: content.process[0], size: 24, weight: 800, family: "Montserrat", fill: COLORS.white, spacing: 1.2 })}
    <line x1="560" y1="1438" x2="560" y2="1494" stroke="${COLORS.technicalLight}" stroke-width="2"/>
    ${singleText({ x: 610, y: 1481, text: content.process[1], size: 24, weight: 800, family: "Montserrat", fill: COLORS.white, spacing: 1.2 })}
    ${pageFooter(content)}
  `;
  return svgDocument({
    pageNumber: 3,
    label: "Centralizador distal del tallo X-acta",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderOffsetLabel(configuration, index) {
  const positions = [
    { x: 88, y: 920 },
    { x: 620, y: 920 },
    { x: 88, y: 1430 },
    { x: 620, y: 1430 },
  ];
  const { x, y } = positions[index];
  return `
    <g data-role="offset-label">
      <line x1="${x}" y1="${y - 28}" x2="${x + 400}" y2="${y - 28}" stroke="${COLORS.accent}" stroke-width="4"/>
      ${singleText({ x, y, text: configuration.offset, size: 34, weight: 900, family: "Montserrat" })}
      ${singleText({ x, y: y + 39, text: configuration.length, size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.1 })}
      ${singleText({ x, y: y + 76, text: configuration.sizes, size: 23, fill: COLORS.muted })}
    </g>
  `;
}

function renderPage4({ content, images, css }) {
  const body = `
    ${pageHeader(content)}
    ${multilineText({ x: 88, y: 235, lines: content.title, fontSize: TYPOGRAPHY.titleCompact, lineHeight: 66, fontWeight: 900, fontFamily: "Montserrat" })}
    ${multilineText({ x: 88, y: 390, lines: content.summary, fontSize: TYPOGRAPHY.body, lineHeight: 43, fill: COLORS.muted })}

    ${svgImage({ href: images.offsets, id: "offset-product-01", x: 88, y: 440, width: 800, height: 995, preserveAspectRatio: "none", clipPath: "url(#offset-clip-1)" })}
    ${svgImage({ href: images.offsets, id: "offset-product-02", x: 220, y: 440, width: 800, height: 995, preserveAspectRatio: "none", clipPath: "url(#offset-clip-2)" })}
    ${svgImage({ href: images.offsets, id: "offset-product-03", x: 88, y: 360, width: 800, height: 995, preserveAspectRatio: "none", clipPath: "url(#offset-clip-3)" })}
    ${svgImage({ href: images.offsets, id: "offset-product-04", x: 220, y: 360, width: 800, height: 995, preserveAspectRatio: "none", clipPath: "url(#offset-clip-4)" })}
    ${content.configurations.map(renderOffsetLabel).join("")}
    ${pageFooter(content)}
  `;
  return svgDocument({
    pageNumber: 4,
    label: "Configuraciones de offset del tallo X-acta",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderLengthOption(option, index) {
  const y = 845 + index * 300;
  return `
    <g data-role="length-option">
      <line x1="88" y1="${y - 65}" x2="430" y2="${y - 65}" stroke="${index === 0 ? COLORS.accent : COLORS.rule}" stroke-width="3"/>
      ${singleText({ x: 88, y, text: option.name, size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
      ${singleText({ x: 88, y: y + 66, text: option.metric, size: 42, weight: 900, family: "Montserrat" })}
      ${multilineText({ x: 88, y: y + 120, lines: option.description, fontSize: TYPOGRAPHY.bodySmall, lineHeight: 37, fill: COLORS.muted })}
    </g>
  `;
}

function renderPage5({ content, images, css }) {
  const body = `
    ${pageHeader(content)}
    ${multilineText({ x: 88, y: 235, lines: content.title, fontSize: TYPOGRAPHY.titleCompact, lineHeight: 66, fontWeight: 900, fontFamily: "Montserrat" })}
    ${multilineText({ x: 88, y: 390, lines: content.summary, fontSize: TYPOGRAPHY.body, lineHeight: 43, fill: COLORS.muted })}

    ${singleText({ x: 88, y: 615, text: "ÁNGULO CCD", size: TYPOGRAPHY.label, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.8 })}
    ${singleText({ x: 88, y: 720, text: content.angle, size: 82, weight: 900, family: "Montserrat" })}
    ${content.lengths.map(renderLengthOption).join("")}

    ${svgImage({ href: images.longitudes, id: "comparacion-longitudes", x: 500, y: 470, width: 650, height: 1000, filter: "url(#soft-shadow)" })}

    <line x1="88" y1="1505" x2="1112" y2="1505" stroke="${COLORS.rule}" stroke-width="2"/>
    ${singleText({ x: 88, y: 1560, text: content.note, size: TYPOGRAPHY.bodySmall, fill: COLORS.muted })}
    ${pageFooter(content)}
  `;
  return svgDocument({
    pageNumber: 5,
    label: "Diseños estándar y corto del tallo X-acta",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderWorkflowStep(step, index) {
  const y = [590, 815, 1040, 1265][index];
  return `
    <g data-role="workflow-step">
      <circle cx="128" cy="${y}" r="33" fill="${COLORS.background}" stroke="${COLORS.accent}" stroke-width="4"/>
      ${singleText({ x: 128, y: y + 8, text: step.number, size: TYPOGRAPHY.label, weight: 800, family: "Montserrat", fill: COLORS.accent, anchor: "middle" })}
      ${singleText({ x: 200, y: y - 4, text: step.title, size: 30, weight: 800, family: "Montserrat" })}
      ${multilineText({ x: 200, y: y + 42, lines: step.detail, fontSize: 24, lineHeight: 35, fill: COLORS.muted })}
      ${index < 3 ? `<line x1="200" y1="${y + 132}" x2="625" y2="${y + 132}" stroke="${COLORS.rule}" stroke-width="3"/>` : ""}
    </g>
  `;
}

function renderPage6({ content, images, css }) {
  const body = `
    ${pageHeader(content)}
    ${multilineText({ x: 88, y: 235, lines: content.title, fontSize: TYPOGRAPHY.titleCompact, lineHeight: 66, fontWeight: 900, fontFamily: "Montserrat" })}
    ${multilineText({ x: 88, y: 390, lines: content.summary, fontSize: TYPOGRAPHY.body, lineHeight: 43, fill: COLORS.muted })}

    <g data-layout="implantation-sequence">
      <line x1="128" y1="557" x2="128" y2="1298" stroke="${COLORS.rule}" stroke-width="4"/>
      ${content.steps.map(renderWorkflowStep).join("")}
      <rect x="680" y="475" width="432" height="960" rx="38" fill="${COLORS.softBlue}"/>
      ${svgImage({ href: images.vastago, id: "implantacion-principal", x: 700, y: 490, width: 390, height: 930, filter: "url(#product-shadow)" })}
    </g>

    <g data-layout="implantation-summary">
      <rect x="88" y="1460" width="1024" height="112" rx="22" fill="${COLORS.technical}"/>
      ${singleText({ x: 126, y: 1498, text: content.closingBand[0].label, size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: "#84b7e8", spacing: 1.6 })}
      ${singleText({ x: 126, y: 1545, text: content.closingBand[0].value[0], size: 25, weight: 800, family: "Montserrat", fill: COLORS.white })}
      <line x1="575" y1="1485" x2="575" y2="1547" stroke="${COLORS.technicalLight}" stroke-width="2"/>
      ${singleText({ x: 625, y: 1498, text: content.closingBand[1].label, size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: "#84b7e8", spacing: 1.6 })}
      ${multilineText({ x: 625, y: 1530, lines: content.closingBand[1].value, fontSize: 21, lineHeight: 27, fontWeight: 800, fontFamily: "Montserrat", fill: COLORS.white })}
    </g>
    ${pageFooter(content)}
  `;
  return svgDocument({
    pageNumber: 6,
    label: "Secuencia resumida de implantación X-acta",
    body,
    embeddedCss: css,
    defs: commonDefs(),
  });
}

function renderClosingHighlight(item, index) {
  const x = [88, 430, 772][index];
  return `
    <g>
      ${singleText({ x, y: 865, text: item.label, size: TYPOGRAPHY.finePrint, weight: 700, family: "Montserrat", fill: COLORS.accent, spacing: 1.5 })}
      ${multilineText({ x, y: 915, lines: item.detail, fontSize: TYPOGRAPHY.bodySmall, lineHeight: 36, fill: COLORS.muted })}
    </g>
  `;
}

function renderClosing({ content, images, css }) {
  const body = `
    <rect x="220" y="30" width="760" height="610" rx="34" fill="${COLORS.technical}"/>
    ${svgImage({ href: images.radiografia, id: "radiografia-cierre", x: 220, y: 30, width: 760, height: 610, preserveAspectRatio: "xMidYMin slice", clipPath: "url(#radiograph-clip)", filter: "url(#soft-shadow)" })}
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
    pageNumber: 7,
    label: "Cierre y descarga del folleto X-acta",
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
    renderPage6({ content: brochure.pages[5], images, css }),
    renderClosing({ content: brochure.pages[6], images, css }),
  ];
}
