import assert from "node:assert/strict";
import { test } from "node:test";

let brochure;
let COLORS;
let renderPages;
try {
  ({ brochure } = await import("../src/content.mjs"));
} catch {
  brochure = null;
}
try {
  ({ COLORS } = await import("../src/constants.mjs"));
  ({ renderPages } = await import("../src/pages.mjs"));
} catch {
  COLORS = null;
  renderPages = null;
}

test("SISTEMA DE HOMBRO: sintetiza las configuraciones en seis páginas", () => {
  assert.ok(brochure, "falta definir el contenido del folleto");
  assert.equal(brochure.product, "SISTEMA DE HOMBRO");
  assert.deepEqual(brochure.document, { reference: "99.81MSS.11", revision: "00" });
  assert.deepEqual(
    brochure.pages.map((page) => page.type),
    ["cover", "humeral", "anatomic", "reverse", "glenoid-comparison", "closing"],
  );
  assert.deepEqual(
    brochure.pages.slice(1, -1).map((page) => page.number),
    ["02 / 06", "03 / 06", "04 / 06", "05 / 06"],
  );
  assert.deepEqual(
    Object.keys(brochure.assets).sort(),
    [
      "anatomicDetail",
      "anatomicExploded",
      "anatomicGlenoid",
      "anatomicHead",
      "anatomicStemless",
      "logoChaco",
      "logoMedacta",
      "reverseAssembled",
      "reverseBaseplate",
      "reverseExploded",
      "reverseStemless",
    ].sort(),
  );
});

test("SISTEMA DE HOMBRO: conserva la paleta clara y lectura sin zoom", async () => {
  assert.ok(COLORS, "falta definir la paleta del folleto");
  assert.equal(typeof renderPages, "function", "falta implementar el render de páginas");
  assert.deepEqual(COLORS, {
    background: "#eef2f9",
    ink: "#192338",
    accent: "#2b6cb8",
    muted: "#53627e",
    rule: "#cbd9ea",
    softBlue: "#e2ebf7",
    white: "#ffffff",
  });

  const pages = await renderPages();
  const complete = pages.join("\n");
  assert.equal(pages.length, 6);
  pages.forEach((svg, index) => {
    assert.match(svg, /width="1200" height="1698" viewBox="0 0 1200 1698"/);
    assert.match(svg, new RegExp(`data-page="${index + 1}"`));
    assert.match(svg, /data-theme="light"/);
    assert.match(svg, /<rect width="1200" height="1698" fill="#eef2f9"\/>/);
    assert.match(svg, /@font-face/);
    assert.match(svg, /data:font\/woff2;base64,/);
    assert.doesNotMatch(svg, /<image[^>]+href="(?:https?:|file:)/i);
    assert.doesNotMatch(svg, /[ÃÂ]|â€¦|â€”|â€“|�/);
  });

  const informativeContent = complete
    .replace(/<text[^>]*data-role="legal-disclaimer"[^>]*>[\s\S]*?<\/text>/g, "")
    .replace(/<g[^>]*data-role="secondary-contact"[^>]*>[\s\S]*?<\/g>/g, "");
  const fontSizes = [...informativeContent.matchAll(/font-size(?:=|:)\s*["']?([0-9.]+)/g)].map(
    (match) => Number(match[1]),
  );
  assert.ok(fontSizes.length > 0);
  assert.ok(
    fontSizes.every((size) => size >= 24),
    `se encontraron textos informativos menores a 24 px: ${fontSizes.filter((size) => size < 24)}`,
  );
  assert.match(complete, /\.body\{[^}]*font-size:30px/);
  assert.match(complete, /\.body-small\{[^}]*font-size:26px/);
});

test("SISTEMA DE HOMBRO: mantiene los datos técnicos de ambas configuraciones", async () => {
  const pages = await renderPages();

  assert.match(pages[0], /data-asset="anatomicExploded"[\s\S]*data-asset="reverseExploded"/);
  assert.match(pages[1], /4 longitudes[\s\S]*6-16 mm[\s\S]*6 tamaños[\s\S]*MectaGrip[\s\S]*3D Metal/);
  assert.match(pages[2], /10 tamaños[\s\S]*128° \/ 135° \/ 142°[\s\S]*Hasta 5 mm[\s\S]*CONVERTIBILIDAD/);
  assert.match(pages[3], /Ø32 \/ Ø36 \/ Ø39 \/ Ø42[\s\S]*\+4 \/ \+9 mm[\s\S]*145° \/ 155°[\s\S]*SEMI-INLAY/);
  assert.match(pages[4], /UHMWPE[\s\S]*10 tamaños[\s\S]*Ø22 \/ Ø24,5 \/ Ø27[\s\S]*15 \/ 25 \/ 35 mm/);
});

test("SISTEMA DE HOMBRO: usa cada imagen de producto una sola vez", async () => {
  const pages = await renderPages();
  const complete = pages.join("\n");
  const productAssets = [...complete.matchAll(/data-role="editorial-image" data-asset="([^"]+)"/g)]
    .map((match) => match[1]);
  assert.deepEqual(productAssets, [
    "anatomicExploded",
    "reverseExploded",
    "anatomicStemless",
    "reverseStemless",
    "anatomicDetail",
    "anatomicHead",
    "reverseAssembled",
    "anatomicGlenoid",
    "reverseBaseplate",
  ]);
  assert.equal(new Set(productAssets).size, productAssets.length);
  assert.doesNotMatch(pages.at(-1), /data-role="editorial-image"/);
});

test("SISTEMA DE HOMBRO: cierra con documentación y contacto inequívocos", async () => {
  const closing = brochure.pages.at(-1);
  assert.equal(closing.eyebrow, "DOCUMENTACIÓN Y CONTACTO");
  assert.deepEqual(closing.title, ["Documentación técnica.", "Contacto profesional."]);
  assert.equal("benefits" in closing, false);

  const pages = await renderPages();
  const final = pages.at(-1);
  assert.match(final, /DOCUMENTO DE REFERENCIA/);
  assert.match(final, /Consultá la ficha técnica completa/);
  assert.match(final, /99\.81MSS\.11[\s\S]*REV\. 00/);
  assert.match(final, /Descargá la ficha completa/);
  assert.match(final, /CONTACTO TÉCNICO/);
  assert.match(final, /CHACO IMPLANTES[\s\S]*CANALES/);
  assert.match(final, /chacoimplantes@gmail\.com/);
  assert.doesNotMatch(final, /id="beneficios-cierre"/);
});

test("SISTEMA DE HOMBRO: reserva las marcas para portada y cierre", async () => {
  const pages = await renderPages();
  const complete = pages.join("\n");
  assert.equal((complete.match(/id="marca"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="marcas-cierre"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="pie"/g) ?? []).length, 4);
  pages.slice(1, -1).forEach((svg) => assert.match(svg, /id="pie"/));
  assert.doesNotMatch(complete, /WhatsApp/i);
  assert.equal((complete.match(/data-role="card(?:-|\")/g) ?? []).length, 0);
  assert.equal((complete.match(/data-role="badge(?:-|\")/g) ?? []).length, 0);
});

test("SISTEMA DE HOMBRO: mantiene la copia de configuraciones dentro de la columna", async () => {
  assert.deepEqual(
    brochure.pages[1].facts[3].copy,
    ["Componentes coordinados", "sobre la plataforma."],
  );

  const pages = await renderPages();
  assert.match(
    pages[1],
    /<text x="622" y="1390"[^>]*>[\s\S]*Componentes coordinados[\s\S]*sobre la plataforma\./,
  );
});
