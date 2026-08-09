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

test("M.U.S.T.: sintetiza la plataforma en seis páginas", () => {
  assert.ok(brochure, "falta definir el contenido del folleto");
  assert.equal(brochure.product, "COLUMNA M.U.S.T.");
  assert.deepEqual(brochure.document, {
    reference: "99.46.12",
    revision: "12",
    updated: "Agosto de 2020",
    manufacturer: "Medacta International SA",
    ce: "0476",
  });
  assert.deepEqual(
    brochure.pages.map((page) => page.type),
    ["cover", "platform", "screws", "specialized", "connections", "closing"],
  );
  assert.deepEqual(
    brochure.pages.slice(1, -1).map((page) => page.number),
    ["02 / 06", "03 / 06", "04 / 06", "05 / 06"],
  );
});

test("M.U.S.T.: conserva la paleta clara y lectura sin zoom", async () => {
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
  const sizes = [...informativeContent.matchAll(/font-size(?:=|:)\s*["']?([0-9.]+)/g)].map(
    (match) => Number(match[1]),
  );
  assert.ok(sizes.length > 0);
  assert.ok(
    sizes.every((size) => size >= 24),
    `se encontraron textos informativos menores a 24 px: ${sizes.filter((size) => size < 24)}`,
  );
  assert.match(complete, /\.body\{[^}]*font-size:30px/);
  assert.match(complete, /\.body-small\{[^}]*font-size:26px/);
});

test("M.U.S.T.: mantiene los datos técnicos esenciales", async () => {
  const pages = await renderPages();
  assert.match(pages[1], /T1-S2\/ilion[\s\S]*T8-L5[\s\S]*ABIERTO \+ MIS[\s\S]*Ø5,5 mm/);
  assert.match(pages[2], /POLIAXIAL[\s\S]*MONOAXIAL[\s\S]*SÓLIDOS \+ CANULADOS[\s\S]*DOBLE ROSCA/);
  assert.match(pages[3], /REVISIÓN[\s\S]*REDUCCIÓN[\s\S]*AUMENTABLE/);
  assert.match(pages[4], /TRANSVERSAL[\s\S]*LATERAL[\s\S]*GANCHO PEDICULAR[\s\S]*BARRA A BARRA/);
});

test("M.U.S.T.: usa cada imagen de producto una sola vez", async () => {
  const pages = await renderPages();
  const assets = pages
    .join("\n")
    .matchAll(/data-role="editorial-image" data-asset="([^"]+)"/g);
  const productAssets = [...assets].map((match) => match[1]);
  assert.deepEqual(productAssets, [
    "constructPosterior",
    "constructLateral",
    "polyaxial",
    "monoaxial",
    "revision",
    "reduction",
    "augmentable",
    "crossConnector",
    "lateralConnector",
    "pedicleHook",
    "dominoConnector",
  ]);
  assert.equal(new Set(productAssets).size, productAssets.length);
  assert.doesNotMatch(pages.at(-1), /data-role="editorial-image"/);
});

test("M.U.S.T.: incorpora una imagen de producto en la página de cierre", async () => {
  const final = (await renderPages()).at(-1);
  const image = final.match(
    /<image data-role="closing-product-image" data-asset="constructLateral"[^>]*x="([0-9.]+)" y="([0-9.]+)" width="([0-9.]+)" height="([0-9.]+)"/,
  );

  assert.ok(image, "falta la imagen del sistema en la última página");
  const [, x, y, width, height] = image.map(Number);
  assert.ok(x >= 800 && x + width <= 1112, "la imagen no está alineada en el encabezado superior");
  assert.ok(y >= 126 && y + height <= 480, "la imagen invade el bloque de referencia");
  assert.equal((final.match(/data-role="closing-product-image"/g) ?? []).length, 1);

  const cta = final.match(/<g data-layout="reference-cta">([\s\S]*?)<\/g>/)?.[1] ?? "";
  assert.doesNotMatch(cta, /<image\b/, "el bloque Documento de referencia no debe contener imágenes");
});

test("M.U.S.T.: conserva el bloque Documento de referencia igual al resto de los folletos", async () => {
  const final = (await renderPages()).at(-1);

  assert.match(final, /<rect x="88" y="540" width="1024" height="356" rx="20"/);
  assert.match(final, /<text x="136" y="606"[^>]*>[\s\S]*?DOCUMENTO DE REFERENCIA/);
  assert.match(final, /<text x="136" y="666"[^>]*>[\s\S]*?Consultá la técnica quirúrgica completa/);
  assert.match(final, /<line x1="136" y1="804" x2="1064" y2="804"/);
  assert.match(final, /<text x="136" y="858"[^>]*>[\s\S]*?Descargá la ficha completa/);
  assert.match(final, /<g id="download-arrow"><path d="M1016 848h38m-14-14 14 14-14 14"/);
});

test("M.U.S.T.: reserva las marcas para portada y cierre", async () => {
  const pages = await renderPages();
  const complete = pages.join("\n");
  assert.equal((complete.match(/id="marca"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="marcas-cierre"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="pie"/g) ?? []).length, 4);
  assert.doesNotMatch(complete, /WhatsApp/i);
  assert.equal((complete.match(/data-role="card(?:-|\")/g) ?? []).length, 0);
  assert.equal((complete.match(/data-role="badge(?:-|\")/g) ?? []).length, 0);
});

test("M.U.S.T.: cierra con documentación y contacto claros", async () => {
  const closing = brochure.pages.at(-1);
  assert.equal(closing.eyebrow, "DOCUMENTACIÓN Y CONTACTO");
  assert.equal("benefits" in closing, false);

  const final = (await renderPages()).at(-1);
  assert.match(final, /Consultá la técnica quirúrgica completa/);
  assert.match(final, /99\.46\.12[\s\S]*REV\. 12/);
  assert.match(final, /Agosto de 2020/);
  assert.match(final, /CHACO IMPLANTES[\s\S]*CANALES/);
  assert.match(final, /chacoimplantes@gmail\.com/);
});

test("M.U.S.T.: mantiene la explicación de reducción dentro de su columna", () => {
  assert.deepEqual(
    brochure.pages[3].items[1].copy,
    ["Tulipa extendida", "para asistir el descenso", "de la barra."],
  );
});
