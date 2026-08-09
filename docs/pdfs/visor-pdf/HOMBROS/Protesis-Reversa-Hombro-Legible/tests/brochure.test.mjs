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

test("PRÓTESIS REVERSA: sintetiza la técnica en cinco páginas sin repetir secciones", () => {
  assert.ok(brochure, "falta definir el contenido del folleto");
  assert.equal(brochure.product, "PRÓTESIS REVERSA DE HOMBRO");
  assert.deepEqual(brochure.document, { reference: "99.81S.12", revision: "06" });
  assert.deepEqual(
    brochure.pages.map((page) => page.type),
    ["cover", "configurations", "glenoid", "articulation", "closing"],
  );
  assert.equal(brochure.pages.length, 5);
  assert.deepEqual(
    brochure.pages.slice(1, -1).map((page) => page.number),
    ["02 / 05", "03 / 05", "04 / 05"],
  );
  assert.deepEqual(
    Object.keys(brochure.assets).sort(),
    [
      "assembled",
      "baseplate",
      "compact",
      "cover",
      "logoChaco",
      "logoMedacta",
      "sensitin",
      "stemless",
    ].sort(),
  );
  assert.doesNotMatch(
    JSON.stringify(brochure),
    /05_protesis|08_glenosfera|09_liner|10_metafisis|11_diafisis|12_configuracion/i,
  );
});

test("PRÓTESIS REVERSA: usa la paleta clara y tipografía legible sin zoom", async () => {
  assert.ok(COLORS, "falta definir la paleta del folleto");
  assert.equal(typeof renderPages, "function", "falta el render de páginas");
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
  assert.equal(pages.length, 5);
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

test("PRÓTESIS REVERSA: conserva datos técnicos y jerarquía de cierre", async () => {
  assert.equal(typeof renderPages, "function", "falta el render de páginas");
  const pages = await renderPages();
  const complete = pages.join("\n");

  assert.match(pages[0], /data-asset="cover"/);
  assert.match(pages[1], /Tamaños 6-16[\s\S]*\+0 o \+9 mm[\s\S]*0° o \+20°/);
  assert.match(pages[2], /Ø22 \/ Ø24,5 \/ Ø27[\s\S]*15 \/ 25 \/ 35 mm[\s\S]*L14-L50/);
  assert.match(pages[3], /Ø32 \/ Ø36 \/ Ø39 \/ Ø42[\s\S]*\+0 \/ \+3 \/ \+6 mm[\s\S]*Matriz por diámetro/);
  assert.match(pages[4], /data-layout="reference-cta"/);
  assert.match(pages[4], /Consultá la ficha técnica completa/);
  assert.match(pages[4], /99\.81S\.12[\s\S]*REV\. 06/);
  assert.match(pages[4], /Descargá la ficha completa/);
  assert.match(pages[4], /id="download-arrow"/);
  assert.match(pages[4], /data-role="legal-disclaimer"[^>]*font-size="18"/);
  assert.doesNotMatch(pages[4], /data-role="editorial-image"/);

  const productAssets = [...complete.matchAll(/data-role="editorial-image" data-asset="([^"]+)"/g)]
    .map((match) => match[1]);
  assert.deepEqual(productAssets, ["cover", "assembled", "compact", "stemless", "baseplate", "sensitin"]);
  assert.equal(new Set(productAssets).size, productAssets.length);

  assert.equal((complete.match(/id="marca"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="marcas-cierre"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="pie"/g) ?? []).length, 3);
  pages.slice(1, -1).forEach((svg) => assert.match(svg, /id="pie"/));
  assert.doesNotMatch(complete, /WhatsApp/i);
  assert.equal((complete.match(/data-role="card(?:-|\")/g) ?? []).length, 0);
  assert.equal((complete.match(/data-role="badge(?:-|\")/g) ?? []).length, 0);
});

test("PRÓTESIS REVERSA: mantiene los rótulos largos dentro de sus columnas", async () => {
  assert.deepEqual(brochure.pages[1].items[1].title, ["CONFIGURACIÓN", "COMPACTA"]);

  const pages = await renderPages();
  assert.match(pages[1], /<text x="444" y="1240"[^>]*>[\s\S]*Implante ensamblado/);
});

test("PRÓTESIS REVERSA: evita rótulos superpuestos en la imagen de la página 4", async () => {
  assert.equal("imageCaption" in brochure.pages[3], false);

  const pages = await renderPages();
  const articulation = pages[3];
  assert.match(articulation, /<rect x="640" y="500" width="472" height="820" rx="28" fill="#e2ebf7"\/>/);
  assert.doesNotMatch(articulation, /CONFIGURACIÓN CON|ACABADO SensiTiN/);
});

test("PRÓTESIS REVERSA: el cierre explica documentación y contacto", async () => {
  const closing = brochure.pages.at(-1);
  assert.equal(closing.eyebrow, "DOCUMENTACIÓN Y CONTACTO");
  assert.deepEqual(closing.title, ["Documentación técnica.", "Contacto profesional."]);
  assert.deepEqual(closing.summary, [
    "Accedé a la técnica quirúrgica completa y encontrá",
    "la referencia del documento junto a los canales de contacto.",
  ]);
  assert.equal("benefits" in closing, false);

  const pages = await renderPages();
  const final = pages.at(-1);
  assert.match(final, /DOCUMENTACIÓN Y CONTACTO/);
  assert.match(final, /DOCUMENTO DE REFERENCIA/);
  assert.match(final, /CONTACTO TÉCNICO/);
  assert.match(final, /CHACO IMPLANTES/);
  assert.match(final, /CANALES/);
  assert.match(final, /chacoimplantes@gmail\.com/);
  assert.doesNotMatch(final, /id="beneficios-cierre"/);
});
