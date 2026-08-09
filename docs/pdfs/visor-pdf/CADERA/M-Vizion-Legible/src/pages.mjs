import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brochure } from "./content.mjs";
import { COLORS, PAGE, TYPOGRAPHY } from "./constants.mjs";
import {
  dataUri,
  escapeXml,
  fontFaceCss,
  multilineText,
  svgDocument,
  svgImage,
} from "./svg-helpers.mjs";

const sourceDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(sourceDir, "..");
const assetDir = resolve(projectDir, "assets", "source");
const fontDir = resolve(projectDir, "assets", "fonts");

const imageFiles = Object.freeze({
  assembled: "m-vizion-armado.png",
  perspectives: "m-vizion-perspectivas.png",
  proximal: "m-vizion-proximal.png",
  distal: "m-vizion-distal.png",
  tableDevice: "m-vizion-dispositivo-mesa.png",
  trialProximal: "m-vizion-proximal-prueba.png",
  xray: "m-vizion-radiografia.png",
  chaco: "logo-chaco.png",
  medacta: "logo-medacta.png",
});

const fontFiles = Object.freeze([
  { family: "Poppins", weight: 400, path: resolve(fontDir, "poppins-400.woff2") },
  { family: "Poppins", weight: 600, path: resolve(fontDir, "poppins-600.woff2") },
  { family: "Montserrat", weight: 700, path: resolve(fontDir, "montserrat-700.woff2") },
  { family: "Montserrat", weight: 800, path: resolve(fontDir, "montserrat-800.woff2") },
  { family: "Montserrat", weight: 900, path: resolve(fontDir, "montserrat-900.woff2") },
  { family: "Kurale", weight: 400, path: resolve(fontDir, "kurale-400.woff2") },
]);

async function loadResources() {
  const imageEntries = await Promise.all(
    Object.entries(imageFiles).map(async ([key, file]) => [key, await dataUri(resolve(assetDir, file))]),
  );
  return {
    images: Object.fromEntries(imageEntries),
    css: `${await fontFaceCss(fontFiles)}
      text { text-rendering: geometricPrecision; }
      .display { font-family: "Montserrat"; font-weight: 900; }
      .title { font-family: "Montserrat"; font-weight: 800; }
      .heading { font-family: "Montserrat"; font-weight: 700; }
      .body { font-family: "Poppins"; font-weight: 400; }
      .semibold { font-family: "Poppins"; font-weight: 600; }
    `,
  };
}

function line(
  x1,
  y1,
  x2,
  y2,
  { color = COLORS.rule, width = 2, dash = "", role = "" } = {},
) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""}${role ? ` data-role="${escapeXml(role)}"` : ""}/>`;
}

function sectionLabel(text, x = PAGE.margin, y = 112) {
  return multilineText({
    x,
    y,
    lines: [text],
    fontSize: TYPOGRAPHY.label,
    lineHeight: 26,
    fontFamily: "Montserrat",
    fontWeight: 800,
    fill: COLORS.accent,
    letterSpacing: 1.6,
  });
}

function title(lines, { x = PAGE.margin, y = 188, size = TYPOGRAPHY.title, lineHeight = 68 } = {}) {
  return multilineText({
    x,
    y,
    lines,
    fontSize: size,
    lineHeight,
    fontFamily: "Montserrat",
    fontWeight: 800,
    fill: COLORS.ink,
  });
}

function paragraph(lines, { x = PAGE.margin, y = 350, size = TYPOGRAPHY.body, lineHeight = 43, fill = COLORS.muted } = {}) {
  return multilineText({
    x,
    y,
    lines,
    fontSize: size,
    lineHeight,
    fontFamily: "Poppins",
    fontWeight: 400,
    fill,
  });
}

function pageFooter(number, resources) {
  return (
    line(PAGE.margin, 1576, PAGE.width - PAGE.margin, 1576, { color: COLORS.rule, width: 2 }) +
    svgImage({ href: resources.images.chaco, x: PAGE.margin, y: 1588, width: 170, height: 46 }) +
    svgImage({ href: resources.images.medacta, x: 900, y: 1585, width: 210, height: 52 }) +
    multilineText({
      x: 600,
      y: 1625,
      lines: [number],
      fontSize: TYPOGRAPHY.finePrint,
      lineHeight: 24,
      fontFamily: "Montserrat",
      fontWeight: 700,
      fill: COLORS.muted,
      textAnchor: "middle",
      letterSpacing: 1.2,
    })
  );
}

function cover(page, resources) {
  const body = [
    svgImage({ href: resources.images.chaco, x: PAGE.margin, y: 66, width: 214, height: 64 }),
    svgImage({ href: resources.images.medacta, x: 894, y: 62, width: 218, height: 70 }),
    sectionLabel(page.eyebrow, PAGE.margin, 210),
    multilineText({
      x: PAGE.margin,
      y: 318,
      lines: [page.title],
      fontSize: TYPOGRAPHY.display,
      lineHeight: 112,
      fontFamily: "Montserrat",
      fontWeight: 900,
      fill: COLORS.ink,
      letterSpacing: -2.5,
    }),
    multilineText({
      x: PAGE.margin,
      y: 388,
      lines: [page.subtitle.toUpperCase()],
      fontSize: TYPOGRAPHY.subtitle,
      lineHeight: 44,
      fontFamily: "Montserrat",
      fontWeight: 700,
      fill: COLORS.accent,
    }),
    line(PAGE.margin, 430, PAGE.width - PAGE.margin, 430, { color: COLORS.ink, width: 2 }),
    `<circle cx="1010" cy="700" r="190" fill="${COLORS.softBlue}" opacity="0.75"/>`,
    `<circle cx="235" cy="1070" r="130" fill="${COLORS.softBlue}" opacity="0.72"/>`,
    svgImage({
      href: resources.images.perspectives,
      x: 90,
      y: 470,
      width: 1020,
      height: 820,
      id: "producto-principal",
    }),
    line(PAGE.margin, 1327, PAGE.width - PAGE.margin, 1327, { color: COLORS.ink, width: 2 }),
    multilineText({
      x: PAGE.margin,
      y: 1402,
      lines: page.statement,
      fontSize: 47,
      lineHeight: 57,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.ink,
    }),
    multilineText({
      x: 1112,
      y: 1510,
      lines: [page.number],
      fontSize: TYPOGRAPHY.label,
      lineHeight: 26,
      fontFamily: "Montserrat",
      fontWeight: 700,
      fill: COLORS.muted,
      textAnchor: "end",
    }),
    multilineText({
      x: PAGE.margin,
      y: 1630,
      lines: ["MATERIAL DESTINADO EXCLUSIVAMENTE A PROFESIONALES DE LA SALUD"],
      fontSize: TYPOGRAPHY.finePrint,
      lineHeight: 24,
      fontFamily: "Poppins",
      fontWeight: 400,
      fill: COLORS.muted,
      letterSpacing: 0.4,
    }),
  ].join("");
  return svgDocument({
    pageNumber: 1,
    label: "Portada M-Vizion",
    body,
    embeddedCss: resources.css,
  });
}

function architecture(page, resources) {
  const moduleY = [560, 965, 1304];
  const modules = page.modules
    .map(
      (module, index) => `<g data-role="system-module">
        <circle cx="470" cy="${moduleY[index] - 12}" r="28" fill="${COLORS.accent}"/>
        <text x="470" y="${moduleY[index] - 3}" font-family="Montserrat" font-size="${TYPOGRAPHY.label}" font-weight="800" fill="${COLORS.white}" text-anchor="middle">0${index + 1}</text>
        ${multilineText({
          x: 518,
          y: moduleY[index] - 12,
          lines: [module.name],
          fontSize: 24,
          lineHeight: 30,
          fontFamily: "Montserrat",
          fontWeight: 800,
          fill: COLORS.ink,
        })}
        ${multilineText({
          x: 518,
          y: moduleY[index] + 28,
          lines: module.copy,
          fontSize: TYPOGRAPHY.bodySmall,
          lineHeight: 35,
          fontFamily: "Poppins",
          fontWeight: 400,
          fill: COLORS.muted,
        })}
      </g>`,
    )
    .join("");

  const body = [
    sectionLabel(page.eyebrow),
    title(page.title),
    paragraph(page.intro, { y: 354, size: 27, lineHeight: 39 }),
    `<g data-layout="modular-architecture">`,
    svgImage({ href: resources.images.assembled, x: 92, y: 470, width: 300, height: 1080, id: "sistema-armado" }),
    svgImage({ href: resources.images.proximal, x: 716, y: 470, width: 390, height: 425, id: "componente-proximal" }),
    svgImage({ href: resources.images.distal, x: 918, y: 862, width: 120, height: 610, id: "componente-distal" }),
    ...moduleY.map((y) =>
      line(402, y - 12, 442, y - 12, {
        color: COLORS.accent,
        width: 3,
        role: "module-connector",
      }),
    ),
    modules,
    `</g>`,
    multilineText({
      x: 438,
      y: 1504,
      lines: ["CON ORIFICIOS", "O SIN ORIFICIOS"],
      fontSize: TYPOGRAPHY.label,
      lineHeight: 27,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.accent,
    }),
    multilineText({
      x: 650,
      y: 1493,
      lines: page.note,
      fontSize: 20,
      lineHeight: 29,
      fontFamily: "Poppins",
      fontWeight: 400,
      fill: COLORS.muted,
    }),
    pageFooter(page.number, resources),
  ].join("");
  return svgDocument({ pageNumber: 2, label: "Arquitectura modular M-Vizion", body, embeddedCss: resources.css });
}

function proximal(page, resources) {
  const diameterXs = [142, 398, 654, 910];
  const diameters = page.diameters
    .map(
      (diameter, index) => `<g data-role="proximal-diameter">
        <rect x="${diameterXs[index] - 54}" y="1178" width="220" height="112" rx="22" fill="${COLORS.softBlue}"/>
        <text x="${diameterXs[index] + 56}" y="1230" font-family="Montserrat" font-size="${TYPOGRAPHY.heading}" font-weight="800" fill="${COLORS.ink}" text-anchor="middle">${escapeXml(diameter)}</text>
        <text x="${diameterXs[index] + 56}" y="1265" font-family="Poppins" font-size="${TYPOGRAPHY.label}" font-weight="600" fill="${COLORS.muted}" text-anchor="middle">DIÁMETRO</text>
      </g>`,
    )
    .join("");

  const body = [
    sectionLabel(page.eyebrow),
    title(page.title),
    paragraph(page.intro, { y: 346, size: 27, lineHeight: 39 }),
    `<rect x="88" y="500" width="256" height="188" rx="26" fill="${COLORS.accent}"/>`,
    `<text x="216" y="566" font-family="Montserrat" font-size="62" font-weight="900" fill="${COLORS.white}" text-anchor="middle">${escapeXml(page.angle)}</text>`,
    multilineText({
      x: 216,
      y: 626,
      lines: [page.angleLabel],
      fontSize: TYPOGRAPHY.label,
      lineHeight: 27,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.white,
      textAnchor: "middle",
      letterSpacing: 1.1,
    }),
    line(345, 593, 515, 593, { color: COLORS.accent, width: 3 }),
    svgImage({ href: resources.images.proximal, x: 420, y: 410, width: 700, height: 730, id: "proximal-principal" }),
    diameters,
    `<rect x="88" y="1320" width="480" height="188" rx="24" fill="${COLORS.technical}"/>`,
    multilineText({
      x: 124,
      y: 1372,
      lines: ["ALTURAS PROXIMALES"],
      fontSize: TYPOGRAPHY.label,
      lineHeight: 28,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: "#9fc9f2",
      letterSpacing: 1,
    }),
    multilineText({
      x: 124,
      y: 1436,
      lines: [page.lengthRange],
      fontSize: 42,
      lineHeight: 48,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.white,
    }),
    multilineText({
      x: 124,
      y: 1480,
      lines: [page.lengthStep],
      fontSize: TYPOGRAPHY.bodySmall,
      lineHeight: 32,
      fontFamily: "Poppins",
      fontWeight: 400,
      fill: COLORS.white,
    }),
    `<g data-layout="variant-grid">`,
    ...page.variants.map((variant, index) => {
      const x = index === 0 ? 610 : 872;
      return `<g data-role="proximal-variant">
        <text x="${x}" y="1384" font-family="Montserrat" font-size="40" font-weight="900" fill="${COLORS.accent}">${escapeXml(variant.label)}</text>
        <text x="${x}" y="1434" font-family="Poppins" font-size="${TYPOGRAPHY.bodySmall}" font-weight="600" fill="${COLORS.ink}">${escapeXml(variant.value)}</text>
      </g>`;
    }),
    line(850, 1350, 850, 1455, { color: COLORS.rule, width: 2 }),
    multilineText({
      x: 850,
      y: 1490,
      lines: ["MISMA FAMILIA DE ALTURAS"],
      fontSize: TYPOGRAPHY.label,
      lineHeight: 28,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.muted,
      textAnchor: "middle",
      letterSpacing: 0.6,
    }),
    `</g>`,
    pageFooter(page.number, resources),
  ].join("");
  return svgDocument({ pageNumber: 3, label: "Configuraciones proximales M-Vizion", body, embeddedCss: resources.css });
}

function distal(page, resources) {
  const lengthXs = [472, 700, 928];
  const lengths = page.lengths
    .map(
      (lengthValue, index) => `<g data-role="distal-length">
        <rect x="${lengthXs[index] - 72}" y="596" width="194" height="124" rx="22" fill="${index === 1 ? COLORS.accent : COLORS.softBlue}"/>
        <text x="${lengthXs[index] + 25}" y="650" font-family="Montserrat" font-size="34" font-weight="800" fill="${index === 1 ? COLORS.white : COLORS.ink}" text-anchor="middle">${escapeXml(lengthValue)}</text>
        <text x="${lengthXs[index] + 25}" y="691" font-family="Poppins" font-size="${TYPOGRAPHY.label}" font-weight="600" fill="${index === 1 ? COLORS.white : COLORS.muted}" text-anchor="middle">LONGITUD</text>
      </g>`,
    )
    .join("");
  const facts = page.facts
    .map((fact, index) => {
      const y = 1115 + index * 118;
      return `<g>
        ${line(426, y, 1090, y, { color: COLORS.rule, width: 2 })}
        <text x="426" y="${y + 46}" font-family="Montserrat" font-size="${TYPOGRAPHY.label}" font-weight="800" fill="${COLORS.accent}" letter-spacing="1">${escapeXml(fact.label)}</text>
        <text x="1068" y="${y + 47}" font-family="Poppins" font-size="${TYPOGRAPHY.body}" font-weight="600" fill="${COLORS.ink}" text-anchor="end">${escapeXml(fact.value)}</text>
      </g>`;
    })
    .join("");
  const body = [
    sectionLabel(page.eyebrow),
    title(page.title),
    paragraph(page.intro, { y: 350, size: 27, lineHeight: 39 }),
    svgImage({ href: resources.images.distal, x: 140, y: 430, width: 150, height: 1120, id: "distal-principal" }),
    line(338, 470, 338, 1490, { color: COLORS.accent, width: 3 }),
    multilineText({
      x: 426,
      y: 520,
      lines: ["RANGO DISTAL"],
      fontSize: TYPOGRAPHY.heading,
      lineHeight: 42,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.ink,
    }),
    lengths,
    `<g data-layout="diameter-range">`,
    `<rect x="400" y="785" width="690" height="248" rx="28" fill="${COLORS.technical}"/>`,
    multilineText({
      x: 448,
      y: 850,
      lines: ["DIÁMETROS"],
      fontSize: TYPOGRAPHY.label,
      lineHeight: 28,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: "#9fc9f2",
      letterSpacing: 1.2,
    }),
    multilineText({
      x: 448,
      y: 940,
      lines: [page.diameterRange],
      fontSize: 60,
      lineHeight: 66,
      fontFamily: "Montserrat",
      fontWeight: 900,
      fill: COLORS.white,
    }),
    line(790, 835, 790, 986, { color: COLORS.technicalLight, width: 2 }),
    multilineText({
      x: 838,
      y: 875,
      lines: ["INCREMENTOS"],
      fontSize: TYPOGRAPHY.label,
      lineHeight: 28,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: "#9fc9f2",
      letterSpacing: 1,
    }),
    multilineText({
      x: 838,
      y: 943,
      lines: [page.diameterStep],
      fontSize: 46,
      lineHeight: 52,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.white,
    }),
    `</g>`,
    facts,
    multilineText({
      x: 426,
      y: 1485,
      lines: ["SELECCIÓN INTRAOPERATORIA"],
      fontSize: TYPOGRAPHY.label,
      lineHeight: 28,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.accent,
      letterSpacing: 1,
    }),
    multilineText({
      x: 426,
      y: 1522,
      lines: page.caution,
      fontSize: 20,
      lineHeight: 29,
      fontFamily: "Poppins",
      fontWeight: 400,
      fill: COLORS.muted,
    }),
    pageFooter(page.number, resources),
  ].join("");
  return svgDocument({ pageNumber: 4, label: "Fijación distal M-Vizion", body, embeddedCss: resources.css });
}

function trial(page, resources) {
  const checkXs = [88, 430, 772];
  const checks = page.checks
    .map(
      (check, index) => `<g data-role="trial-check">
        <rect x="${checkXs[index]}" y="1190" width="310" height="230" rx="26" fill="${index === 1 ? COLORS.technical : COLORS.softBlue}"/>
        <circle cx="${checkXs[index] + 48}" cy="1242" r="24" fill="${index === 1 ? COLORS.accentBright : COLORS.accent}"/>
        <text x="${checkXs[index] + 48}" y="1250" font-family="Montserrat" font-size="${TYPOGRAPHY.label}" font-weight="800" fill="${COLORS.white}" text-anchor="middle">0${index + 1}</text>
        <text x="${checkXs[index] + 32}" y="1311" font-family="Montserrat" font-size="24" font-weight="800" fill="${index === 1 ? COLORS.white : COLORS.ink}">${escapeXml(check.name)}</text>
        ${multilineText({
          x: checkXs[index] + 32,
          y: 1353,
          lines: check.copy,
          fontSize: TYPOGRAPHY.bodySmall,
          lineHeight: 35,
          fontFamily: "Poppins",
          fontWeight: 400,
          fill: index === 1 ? COLORS.white : COLORS.muted,
        })}
      </g>`,
    )
    .join("");
  const body = [
    sectionLabel(page.eyebrow),
    title(page.title),
    paragraph(page.intro, { y: 350, size: 27, lineHeight: 39 }),
    `<circle cx="865" cy="770" r="286" fill="${COLORS.softBlue}"/>`,
    svgImage({ href: resources.images.trialProximal, x: 430, y: 410, width: 690, height: 720, id: "proximal-prueba" }),
    multilineText({
      x: 88,
      y: 502,
      lines: ["CUERPO PROXIMAL", "DE PRUEBA"],
      fontSize: TYPOGRAPHY.heading,
      lineHeight: 42,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.ink,
    }),
    line(88, 570, 360, 570, {
      color: COLORS.accent,
      width: 3,
      role: "trial-label-rule",
    }),
    multilineText({
      x: 88,
      y: 607,
      lines: ["La camisa plástica permite", "probar sobre el cono distal", "sin dañar la unión."],
      fontSize: TYPOGRAPHY.bodySmall,
      lineHeight: 36,
      fontFamily: "Poppins",
      fontWeight: 400,
      fill: COLORS.muted,
    }),
    checks,
    line(88, 1467, 1112, 1467, { color: COLORS.ink, width: 2 }),
    multilineText({
      x: 88,
      y: 1521,
      lines: page.summary,
      fontSize: 28,
      lineHeight: 38,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.accent,
      letterSpacing: 0.5,
    }),
    pageFooter(page.number, resources),
  ].join("");
  return svgDocument({ pageNumber: 5, label: "Prueba y ajuste M-Vizion", body, embeddedCss: resources.css });
}

function assembly(page, resources) {
  const steps = page.steps
    .map((step, index) => {
      const y = 482 + index * 228;
      return `<g data-role="assembly-step">
        <circle cx="684" cy="${y}" r="34" fill="${COLORS.accent}"/>
        <text x="684" y="${y + 10}" font-family="Montserrat" font-size="24" font-weight="800" fill="${COLORS.white}" text-anchor="middle">${escapeXml(step.number)}</text>
        <text x="744" y="${y - 3}" font-family="Montserrat" font-size="26" font-weight="800" fill="${COLORS.ink}">${escapeXml(step.title)}</text>
        ${multilineText({
          x: 744,
          y: y + 38,
          lines: step.copy,
          fontSize: TYPOGRAPHY.bodySmall,
          lineHeight: 35,
          fontFamily: "Poppins",
          fontWeight: 400,
          fill: COLORS.muted,
        })}
        ${index < page.steps.length - 1 ? line(684, y + 42, 684, y + 194, { color: COLORS.rule, width: 3 }) : ""}
      </g>`;
    })
    .join("");
  const body = [
    sectionLabel(page.eyebrow),
    title(page.title),
    paragraph(page.intro, { y: 350, size: 27, lineHeight: 39 }),
    `<rect x="62" y="444" width="552" height="1080" rx="36" fill="${COLORS.softBlue}"/>`,
    svgImage({ href: resources.images.tableDevice, x: 76, y: 460, width: 520, height: 1030, id: "dispositivo-mesa" }),
    line(626, 446, 626, 1485, { color: COLORS.accent, width: 3 }),
    steps,
    `<g data-layout="warning-card">`,
    `<rect x="664" y="1384" width="448" height="150" rx="24" fill="${COLORS.technical}"/>`,
    multilineText({
      x: 888,
      y: 1432,
      lines: ["TORNILLO DEFINITIVO"],
      fontSize: TYPOGRAPHY.label,
      lineHeight: 28,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: "#9fc9f2",
      textAnchor: "middle",
      letterSpacing: 1,
    }),
    multilineText({
      x: 888,
      y: 1476,
      lines: page.warning,
      fontSize: 20,
      lineHeight: 28,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.white,
      textAnchor: "middle",
    }),
    `</g>`,
    pageFooter(page.number, resources),
  ].join("");
  return svgDocument({ pageNumber: 6, label: "Ensamblaje y bloqueo M-Vizion", body, embeddedCss: resources.css });
}

function closing(page, resources) {
  const benefits = page.benefits
    .map((benefit, index) => {
      const y = 440 + index * 192;
      return `<g>
        <circle cx="678" cy="${y}" r="24" fill="${COLORS.accent}"/>
        <text x="678" y="${y + 8}" font-family="Montserrat" font-size="${TYPOGRAPHY.label}" font-weight="800" fill="${COLORS.white}" text-anchor="middle">0${index + 1}</text>
        <text x="724" y="${y - 2}" font-family="Montserrat" font-size="24" font-weight="800" fill="${COLORS.ink}">${escapeXml(benefit.title)}</text>
        ${multilineText({
          x: 724,
          y: y + 40,
          lines: benefit.copy,
          fontSize: TYPOGRAPHY.bodySmall,
          lineHeight: 35,
          fontFamily: "Poppins",
          fontWeight: 400,
          fill: COLORS.muted,
        })}
      </g>`;
    })
    .join("");
  const body = [
    `<defs><clipPath id="xray-clip"><rect x="62" y="62" width="540" height="970" rx="34"/></clipPath></defs>`,
    `<rect x="62" y="62" width="540" height="970" rx="34" fill="${COLORS.technical}"/>`,
    svgImage({
      href: resources.images.xray,
      x: 62,
      y: 62,
      width: 540,
      height: 970,
      id: "radiografia-cierre",
      preserveAspectRatio: "xMidYMid slice",
      clipPath: "url(#xray-clip)",
    }),
    `<g data-layout="closing-eyebrow">`,
    multilineText({
      x: 650,
      y: 112,
      lines: ["SISTEMA FEMORAL MODULAR", "DE REVISIÓN"],
      fontSize: TYPOGRAPHY.label,
      lineHeight: 28,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.accent,
      letterSpacing: 1.4,
    }),
    `</g>`,
    title(page.title, { x: 650, y: 212, size: 42, lineHeight: 50 }),
    line(650, 355, 1112, 355, { color: COLORS.ink, width: 2 }),
    benefits,
    `<g data-layout="reference-cta">`,
    `<rect x="88" y="1080" width="1024" height="286" rx="30" fill="${COLORS.accent}"/>`,
    multilineText({
      x: 136,
      y: 1153,
      lines: [page.ctaTitle],
      fontSize: 39,
      lineHeight: 48,
      fontFamily: "Montserrat",
      fontWeight: 800,
      fill: COLORS.white,
    }),
    multilineText({
      x: 136,
      y: 1208,
      lines: [page.ctaSubtitle],
      fontSize: TYPOGRAPHY.bodySmall,
      lineHeight: 34,
      fontFamily: "Poppins",
      fontWeight: 400,
      fill: COLORS.white,
    }),
    line(136, 1250, 1064, 1250, { color: "#70a7dc", width: 2 }),
    `<text x="136" y="1312" font-family="Montserrat" font-size="29" font-weight="800" fill="${COLORS.white}">${escapeXml(page.ctaAction)}</text>`,
    `<g id="download-arrow" transform="translate(1012 1281)">
      <path d="M0 0 H34 M20 -14 L34 0 L20 14" fill="none" stroke="${COLORS.white}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,
    `</g>`,
    line(88, 1412, 1112, 1412, { color: COLORS.rule, width: 2 }),
    `<text x="88" y="1460" font-family="Montserrat" font-size="${TYPOGRAPHY.label}" font-weight="800" fill="${COLORS.accent}" letter-spacing="1">DIRECCIÓN</text>`,
    multilineText({
      x: 88,
      y: 1500,
      lines: brochure.contact.address,
      fontSize: TYPOGRAPHY.bodySmall,
      lineHeight: 34,
      fontFamily: "Poppins",
      fontWeight: 400,
      fill: COLORS.ink,
    }),
    `<text x="600" y="1460" font-family="Montserrat" font-size="${TYPOGRAPHY.label}" font-weight="800" fill="${COLORS.accent}" letter-spacing="1">INSTAGRAM</text>`,
    multilineText({
      x: 600,
      y: 1500,
      lines: [brochure.contact.instagram],
      fontSize: TYPOGRAPHY.bodySmall,
      lineHeight: 34,
      fontFamily: "Poppins",
      fontWeight: 400,
      fill: COLORS.ink,
    }),
    line(88, 1566, 1112, 1566, { color: COLORS.rule, width: 2 }),
    svgImage({ href: resources.images.chaco, x: 88, y: 1580, width: 186, height: 52 }),
    svgImage({ href: resources.images.medacta, x: 886, y: 1578, width: 224, height: 56 }),
    multilineText({
      x: 600,
      y: 1620,
      lines: [page.number],
      fontSize: TYPOGRAPHY.finePrint,
      lineHeight: 24,
      fontFamily: "Montserrat",
      fontWeight: 700,
      fill: COLORS.muted,
      textAnchor: "middle",
    }),
  ].join("");
  return svgDocument({ pageNumber: 7, label: "Cierre y ficha completa M-Vizion", body, embeddedCss: resources.css });
}

export async function renderPages() {
  const resources = await loadResources();
  const [page1, page2, page3, page4, page5, page6, page7] = brochure.pages;
  return [
    cover(page1, resources),
    architecture(page2, resources),
    proximal(page3, resources),
    distal(page4, resources),
    trial(page5, resources),
    assembly(page6, resources),
    closing(page7, resources),
  ];
}
