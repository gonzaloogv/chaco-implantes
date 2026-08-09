import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brochure } from "./content.mjs";
import { COLORS } from "./constants.mjs";
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
  interior: "versafitcup-interior.png",
  cotilo: "versafitcup-cotilo.png",
  despiece: "versafitcup-despiece.png",
  conjunto: "versafitcup-conjunto.png",
  adaptadores: "versafitcup-adaptadores.png",
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

function sharedCss(embeddedFonts) {
  return (
    embeddedFonts +
    `
      .label{font-family:"Poppins";font-size:17px;font-weight:600;letter-spacing:2px}
      .label-small{font-family:"Poppins";font-size:15px;font-weight:600;letter-spacing:1.8px}
      .body{font-family:"Poppins";font-size:24px;font-weight:400}
      .body-small{font-family:"Poppins";font-size:20px;font-weight:400}
      .title{font-family:"Montserrat";font-weight:800;letter-spacing:-2px}
      .title-small{font-family:"Montserrat";font-weight:700;letter-spacing:-.5px}
      .brand{font-family:"Montserrat";font-weight:900;letter-spacing:2px}
      .muted{fill:${COLORS.muted}}
      .accent{fill:${COLORS.accent}}
      .ink{fill:${COLORS.ink}}
    `
  );
}

function defs(prefix) {
  return `
    <filter id="${prefix}-shadow" x="-35%" y="-35%" width="170%" height="170%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#192338" flood-opacity=".16"/>
    </filter>
    <filter id="${prefix}-soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#192338" flood-opacity=".13"/>
    </filter>
    <filter id="${prefix}-cta-shadow" x="-20%" y="-30%" width="140%" height="170%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#193a67" flood-opacity=".18"/>
    </filter>
    <radialGradient id="${prefix}-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2b6cb8" stop-opacity=".17"/>
      <stop offset="72%" stop-color="#2b6cb8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${prefix}-cta" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2f78c8"/>
      <stop offset="100%" stop-color="#2865aa"/>
    </linearGradient>
    <linearGradient id="${prefix}-system-stage" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#dce9f8"/>
      <stop offset="100%" stop-color="#edf3fa"/>
    </linearGradient>
  `;
}

function line(x1, y1, x2, y2, color = COLORS.rule, width = 1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
}

function wrapWords(text, maxCharacters) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharacters && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function brandHeader(images) {
  return `
    <g id="marca">
      ${svgImage({
        href: images.logoChaco,
        x: 88,
        y: 74,
        width: 88,
        height: 88,
        preserveAspectRatio: "xMidYMid meet",
      })}
      <text x="198" y="112" class="brand accent" font-size="25">CHACO IMPLANTES</text>
      <text x="198" y="143" font-family="Kurale" font-size="21" fill="${COLORS.muted}">al servicio de la salud…</text>
      <text x="1112" y="104" text-anchor="end" class="label-small muted">FOLLETO DE PRODUCTO</text>
      <text x="1112" y="132" text-anchor="end" class="label-small muted">LÍNEA CADERA</text>
    </g>
  `;
}

function sectionHeader(section, kicker) {
  return `
    <g id="encabezado">
      <text x="88" y="112" class="label accent">${escapeXml(section.toUpperCase())}</text>
      <text x="1112" y="112" text-anchor="end" class="label muted">${escapeXml(kicker.toUpperCase())}</text>
      ${line(88, 154, 1112, 154, COLORS.ink, 2)}
    </g>
  `;
}

function pageFooter(number) {
  return `
    <g id="pie">
      <text x="88" y="1628" class="label-small muted">CHACO IMPLANTES</text>
      <text x="1112" y="1628" text-anchor="end" class="label-small muted">${escapeXml(number)}</text>
    </g>
  `;
}

function coverFooter(images) {
  return `
    <g id="pie-portada">
      ${line(88, 1440, 1112, 1440)}
      <text x="88" y="1482" class="label-small muted">FABRICADO POR</text>
      ${svgImage({
        href: images.logoMedacta,
        x: 88,
        y: 1500,
        width: 250,
        height: 86,
        preserveAspectRatio: "xMinYMid meet",
      })}
      <text x="1112" y="1482" text-anchor="end" class="label-small muted">DISTRIBUIDO POR</text>
      <text x="1112" y="1531" text-anchor="end" class="brand ink" font-size="23">CHACO IMPLANTES</text>
      <text x="1112" y="1567" text-anchor="end" class="body-small muted" font-size="16">Resistencia, Chaco · Argentina</text>
      <text x="88" y="1632" class="body-small muted" font-size="15">${escapeXml(brochure.disclaimer)}</text>
    </g>
  `;
}

function benefitBlock([title, description], index) {
  const column = index % 2;
  const row = Math.floor(index / 2);
  const x = column === 0 ? 88 : 625;
  const y = 576 + row * 226;
  return `
    <g data-role="benefit">
      ${line(x, y - 42, x + 487, y - 42, index < 2 ? COLORS.ink : COLORS.rule, index < 2 ? 2 : 1)}
      <text x="${x}" y="${y}" class="label accent">${String(index + 1).padStart(2, "0")}</text>
      <text x="${x + 58}" y="${y}" class="title-small ink" font-size="25">${escapeXml(title)}</text>
      ${multilineText({
        x: x + 58,
        y: y + 41,
        lines: wrapWords(description, 40),
        fontSize: 18,
        lineHeight: 28,
        fill: COLORS.muted,
      })}
    </g>
  `;
}

function renderPage1({ content, images, css }) {
  const body = `
    ${brandHeader(images)}
    <ellipse cx="790" cy="920" rx="390" ry="500" fill="url(#p1-glow)"/>
    <ellipse cx="800" cy="1385" rx="215" ry="24" fill="#192338" opacity=".10"/>
    <text x="88" y="296" class="label accent">CADERA DE DOBLE MOVILIDAD</text>
    <text x="88" y="430" class="title ink" font-size="112">${escapeXml(content.title)}</text>
    <rect x="88" y="472" width="104" height="4" fill="${COLORS.accent}"/>
    ${multilineText({
      x: 88,
      y: 558,
      lines: [
        "Cotilo acetabular",
        "press-fit con inserto",
        "de doble movilidad",
      ],
      fontSize: 34,
      lineHeight: 45,
      fill: COLORS.muted,
    })}
    <g id="cover-keyline">
      ${line(88, 772, 402, 772, COLORS.rule, 2)}
      <text x="88" y="817" class="label-small accent">ESTABILIDAD · DOBLE MOVILIDAD</text>
      <text x="88" y="857" class="body-small muted" font-size="18">Sistema para cirugía primaria y de revisión.</text>
    </g>
    ${svgImage({
      href: images.conjunto,
      x: 405,
      y: 465,
      width: 735,
      height: 945,
      id: "producto-principal",
      filter: "url(#p1-shadow)",
    })}
    ${coverFooter(images)}
  `;
  return svgDocument({
    pageNumber: 1,
    label: "Versafitcup - Portada",
    body,
    embeddedCss: css,
    defs: defs("p1"),
  });
}

function renderPage2({ content, images, css }) {
  const benefits = content.items.map(benefitBlock).join("");
  const body = `
    ${sectionHeader(content.section, content.kicker)}
    ${multilineText({
      x: 88,
      y: 250,
      lines: ["Estabilidad articular con", "menor riesgo de luxación"],
      fontSize: 60,
      lineHeight: 66,
      fontFamily: "Montserrat",
      fontWeight: 800,
      letterSpacing: -1.8,
    })}
    ${multilineText({
      x: 88,
      y: 415,
      lines: wrapWords(content.summary, 78),
      fontSize: 23,
      lineHeight: 37,
      fill: COLORS.muted,
    })}
    ${benefits}
    <g id="detalle-funcional">
      <rect x="88" y="1012" width="1024" height="510" rx="28" fill="${COLORS.softBlue}"/>
      <rect x="88" y="1012" width="7" height="510" rx="3.5" fill="${COLORS.accent}"/>
      <text x="122" y="1070" class="label accent">${escapeXml(content.detailLabel)}</text>
      ${multilineText({
        x: 122,
        y: 1134,
        lines: wrapWords(content.detailTitle, 25),
        fontSize: 31,
        lineHeight: 38,
        fontFamily: "Montserrat",
        fontWeight: 700,
        letterSpacing: -0.6,
      })}
      ${multilineText({
        x: 122,
        y: 1261,
        lines: wrapWords(content.detail, 35),
        fontSize: 19,
        lineHeight: 30,
        fill: COLORS.muted,
      })}
      ${line(122, 1380, 464, 1380, COLORS.accent, 2)}
      <text x="122" y="1426" class="label-small accent">FUNCIÓN</text>
      <text x="122" y="1468" class="body-small ink" font-size="19">Articulación inserto–cotilo</text>
      <ellipse cx="820" cy="1260" rx="280" ry="225" fill="url(#p2-glow)"/>
      ${svgImage({
        href: images.interior,
        x: 535,
        y: 1040,
        width: 565,
        height: 445,
        id: "detalle-interior",
        filter: "url(#p2-soft-shadow)",
      })}
    </g>
    ${pageFooter(content.number)}
  `;
  return svgDocument({
    pageNumber: 2,
    label: "Versafitcup - Estabilidad y doble movilidad",
    body,
    embeddedCss: css,
    defs: defs("p2"),
  });
}

function componentBlock(component, index) {
  const x = 88 + index * 256;
  return `
    <g data-role="component">
      ${line(x, 1198, x + 230, 1198, COLORS.accent, 3)}
      <text x="${x}" y="1242" class="label accent">${escapeXml(component.number)}</text>
      ${multilineText({
        x,
        y: 1284,
        lines: wrapWords(component.title, 18),
        fontSize: 21,
        lineHeight: 29,
        fontFamily: "Montserrat",
        fontWeight: 700,
        letterSpacing: -0.3,
      })}
      ${multilineText({
        x,
        y: 1358,
        lines: wrapWords(component.detail, 18),
        fontSize: 17,
        lineHeight: 25,
        fill: COLORS.muted,
      })}
    </g>
  `;
}

function renderPage3({ content, images, css }) {
  const components = content.components.map(componentBlock).join("");
  const body = `
    ${sectionHeader(content.section, content.kicker)}
    ${multilineText({
      x: 88,
      y: 250,
      lines: ["Cuatro componentes,", "una articulación estable"],
      fontSize: 60,
      lineHeight: 66,
      fontFamily: "Montserrat",
      fontWeight: 800,
      letterSpacing: -1.8,
    })}
    ${multilineText({
      x: 88,
      y: 418,
      lines: wrapWords(content.summary, 78),
      fontSize: 23,
      lineHeight: 37,
      fill: COLORS.muted,
    })}
    <g id="sistema-coordinado">
      <rect x="88" y="520" width="1024" height="630" rx="30" fill="url(#p3-system-stage)"/>
      <ellipse cx="600" cy="825" rx="430" ry="260" fill="url(#p3-glow)"/>
      ${svgImage({
        href: images.despiece,
        x: 92,
        y: 540,
        width: 1016,
        height: 600,
        id: "sistema-despiece",
        filter: "url(#p3-soft-shadow)",
      })}
      <g id="movement-label">
        <rect x="408" y="1069" width="384" height="52" rx="26" fill="${COLORS.technical}"/>
        <text x="600" y="1102" text-anchor="middle" class="label-small" fill="#ffffff">${escapeXml(content.movementLabel)}</text>
      </g>
      ${line(145, 1149, 1055, 1149, COLORS.accent, 2)}
    </g>
    ${components}
    <g id="componentes-tecnicos">
      ${line(88, 1506, 1112, 1506)}
      <text x="88" y="1549" class="title-small ink" font-size="18">INTERIOR PULIDO</text>
      <text x="429" y="1549" class="title-small ink" font-size="18">COLAS DE MILANO</text>
      <text x="829" y="1549" class="title-small ink" font-size="18">REALCE DE 5°</text>
    </g>
    ${pageFooter(content.number)}
  `;
  return svgDocument({
    pageNumber: 3,
    label: "Versafitcup - Componentes del sistema",
    body,
    embeddedCss: css,
    defs: defs("p3"),
  });
}

function diameterRow(diameter, index) {
  const y = 562 + index * 49;
  const hasHead28 = diameter !== 46;
  return `
    <g data-role="diameter-row">
      <text x="88" y="${y}" class="title-small ink" font-size="21">${diameter} mm</text>
      <circle cx="382" cy="${y - 7}" r="6" fill="${COLORS.accent}"/>
      ${
        hasHead28
          ? `<circle cx="548" cy="${y - 7}" r="6" fill="${COLORS.accent}"/>`
          : `<text x="548" y="${y}" text-anchor="middle" class="body-small muted" font-size="17">—</text>`
      }
      ${line(88, y + 20, 612, y + 20)}
    </g>
  `;
}

function specificationBlock([label, detail], index) {
  const y = 510 + index * 178;
  return `
    <g data-role="specification">
      <text x="686" y="${y}" class="label accent">${escapeXml(label.toUpperCase())}</text>
      ${multilineText({
        x: 686,
        y: y + 50,
        lines: wrapWords(detail, 34),
        fontSize: 21,
        lineHeight: 32,
        fill: COLORS.ink,
      })}
      ${line(686, y + 142, 1112, y + 142)}
    </g>
  `;
}

function adapterTag(label, index) {
  const x = 120 + index * 78;
  return `
    <g data-role="adapter-size">
      <rect x="${x}" y="1382" width="64" height="58" rx="10" fill="none" stroke="${COLORS.rule}" stroke-width="2"/>
      <text x="${x + 32}" y="1419" text-anchor="middle" class="body-small muted" font-size="18">${escapeXml(label)}</text>
    </g>
  `;
}

function renderPage4({ content, images, css }) {
  const rows = content.cupDiameters.map(diameterRow).join("");
  const specifications = content.specifications.map(specificationBlock).join("");
  const adapters = content.adapters.map(adapterTag).join("");
  const body = `
    ${sectionHeader(content.section, content.kicker)}
    <text x="88" y="270" class="title ink" font-size="62">Diez diámetros, dos cabezas</text>
    ${multilineText({
      x: 88,
      y: 354,
      lines: wrapWords(content.summary, 76),
      fontSize: 23,
      lineHeight: 37,
      fill: COLORS.muted,
    })}
    <g id="compatibilidad-dimensional">
      <text x="88" y="476" class="label-small muted">COTILO Ø</text>
      <text x="382" y="476" text-anchor="middle" class="label-small muted">CABEZA 22,2</text>
      <text x="548" y="476" text-anchor="middle" class="label-small muted">CABEZA 28</text>
      ${line(88, 500, 612, 500, COLORS.ink, 2)}
      ${rows}
    </g>
    <g id="especificaciones">
      ${specifications}
    </g>
    <g id="adaptadores-contexto">
      <rect x="88" y="1124" width="1024" height="388" rx="28" fill="${COLORS.softBlue}"/>
      <rect x="88" y="1124" width="7" height="388" rx="3.5" fill="${COLORS.accent}"/>
      <text x="120" y="1180" class="label accent">ADAPTADORES DE PRUEBA</text>
      ${multilineText({
        x: 120,
        y: 1245,
        lines: ["Cinco tamaños de cabeza", "para verificar movilidad", "y estabilidad"],
        fontSize: 30,
        lineHeight: 38,
        fontFamily: "Montserrat",
        fontWeight: 700,
        letterSpacing: -0.5,
      })}
      ${adapters}
      <ellipse cx="825" cy="1315" rx="275" ry="150" fill="url(#p4-glow)"/>
      ${svgImage({
        href: images.adaptadores,
        x: 540,
        y: 1160,
        width: 560,
        height: 320,
        id: "adaptadores-prueba",
        filter: "url(#p4-soft-shadow)",
      })}
    </g>
    ${multilineText({
      x: 88,
      y: 1570,
      lines: wrapWords(content.note, 105),
      fontSize: 15,
      lineHeight: 22,
      fill: COLORS.muted,
    })}
    ${pageFooter(content.number)}
  `;
  return svgDocument({
    pageNumber: 4,
    label: "Versafitcup - Medidas y variantes",
    body,
    embeddedCss: css,
    defs: defs("p4"),
  });
}

function closingPillar([title, description], index) {
  const x = 88 + index * 342;
  return `
    <g>
      <text x="${x}" y="920" class="label accent">${escapeXml(title.toUpperCase())}</text>
      ${multilineText({
        x,
        y: 961,
        lines: wrapWords(description, 26),
        fontSize: 18,
        lineHeight: 27,
        fill: COLORS.muted,
      })}
    </g>
  `;
}

function renderPage5({ content, images, css }) {
  const pillars = content.items.map(closingPillar).join("");
  const body = `
    <circle cx="600" cy="342" r="320" fill="url(#p5-glow)"/>
    ${svgImage({
      href: images.cotilo,
      x: 220,
      y: 60,
      width: 760,
      height: 590,
      id: "cierre-producto-image",
      filter: "url(#p5-shadow)",
    })}
    ${line(88, 680, 1112, 680, COLORS.ink, 2)}
    ${multilineText({
      x: 88,
      y: 758,
      lines: ["Un solo sistema para cirugía", "primaria y de revisión"],
      fontSize: 51,
      lineHeight: 58,
      fontFamily: "Montserrat",
      fontWeight: 800,
      letterSpacing: -1.5,
    })}
    ${pillars}
    <g data-layout="reference-cta">
      <rect x="88" y="1035" width="1024" height="285" rx="18" fill="url(#p5-cta)" filter="url(#p5-cta-shadow)"/>
      <text x="136" y="1103" class="title-small" font-size="34" fill="#ffffff">${escapeXml(content.cta)}</text>
      <text x="136" y="1148" class="body-small" font-size="17" fill="#e9f2ff">${escapeXml(content.ctaDetail)}</text>
      ${line(136, 1190, 1064, 1190, "#75a8de", 1)}
      <text x="136" y="1251" class="title-small" font-size="22" fill="#ffffff">${escapeXml(content.ctaAction)}</text>
      ${line(480, 1239, 1018, 1239, "#75a8de", 1)}
      <g id="download-arrow" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1038 1239 H1062"/>
        <path d="M1053 1230 L1062 1239 L1053 1248"/>
      </g>
    </g>
    <g id="contacto">
      <text x="88" y="1367" class="label-small accent">DIRECCIÓN</text>
      <text x="88" y="1405" class="body-small ink" font-size="19">Corrientes 781</text>
      <text x="88" y="1434" class="body-small ink" font-size="19">Resistencia, Chaco (3500)</text>
      <text x="650" y="1367" class="label-small accent">INSTAGRAM</text>
      <text x="650" y="1405" class="body-small ink" font-size="19">${escapeXml(brochure.contact.instagram)}</text>
    </g>
    ${line(88, 1470, 1112, 1470)}
    <g id="marcas-cierre">
      ${svgImage({
        href: images.logoChaco,
        x: 88,
        y: 1490,
        width: 78,
        height: 78,
        preserveAspectRatio: "xMidYMid meet",
      })}
      <text x="184" y="1521" class="brand accent" font-size="22">CHACO IMPLANTES</text>
      <text x="184" y="1554" font-family="Kurale" font-size="18" fill="${COLORS.muted}">al servicio de la salud…</text>
      <text x="820" y="1510" text-anchor="end" class="label-small muted">FABRICADO POR</text>
      ${svgImage({
        href: images.logoMedacta,
        x: 842,
        y: 1488,
        width: 270,
        height: 86,
        preserveAspectRatio: "xMaxYMid meet",
      })}
    </g>
    <text x="88" y="1630" class="body-small muted" font-size="14">${escapeXml(
      `${brochure.disclaimer} · ${brochure.contact.email}`,
    )}</text>
  `;
  return svgDocument({
    pageNumber: 5,
    label: "Versafitcup - Cierre y documentación",
    body,
    embeddedCss: css,
    defs: defs("p5"),
  });
}

export async function renderPages() {
  const { images, embeddedFonts } = await loadResources();
  const css = sharedCss(embeddedFonts);
  return [
    renderPage1({ content: brochure.pages[0], images, css }),
    renderPage2({ content: brochure.pages[1], images, css }),
    renderPage3({ content: brochure.pages[2], images, css }),
    renderPage4({ content: brochure.pages[3], images, css }),
    renderPage5({ content: brochure.pages[4], images, css }),
  ];
}
