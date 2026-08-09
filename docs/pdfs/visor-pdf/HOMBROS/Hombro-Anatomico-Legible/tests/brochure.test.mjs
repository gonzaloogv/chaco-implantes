import assert from "node:assert/strict";
import { test } from "node:test";

import { brochure } from "../src/content.mjs";
import { COLORS } from "../src/constants.mjs";
import { renderPages } from "../src/pages.mjs";

test("HOMBRO ANATÓMICO: sintetiza la técnica en siete páginas editoriales", () => {
  assert.equal(brochure.product, "HOMBRO ANATÓMICO");
  assert.deepEqual(brochure.document, { reference: "99.81A.12", revision: "02" });
  assert.deepEqual(
    brochure.pages.map((page) => page.type),
    ["cover", "architecture", "humeral", "metaphysis", "articulation", "glenoid", "closing"],
  );
  assert.equal(brochure.pages.length, 7);
  assert.deepEqual(
    Object.keys(brochure.assets).sort(),
    [
      "architecture",
      "cover",
      "eccentric",
      "glenoid",
      "head",
      "logoChaco",
      "logoMedacta",
      "metaphysis",
      "microstructure",
      "sensitin",
      "stem",
      "stemless",
    ].sort(),
  );
  assert.doesNotMatch(JSON.stringify(brochure), /03_diafisis_humeral_corta|05_diafisis_humeral_larga|06_diafisis_humeral_extra_larga|14_diafisis_humeral_detalle_proximal/i);
});

test("HOMBRO ANATÓMICO: usa la paleta clara y tipografía legible sin zoom", async () => {
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
  assert.equal(pages.length, 7);
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

test("HOMBRO ANATÓMICO: conserva los datos técnicos y la jerarquía del cierre", async () => {
  const pages = await renderPages();
  const complete = pages.join("\n");

  assert.match(pages[0], /data-asset="cover"/);
  assert.match(pages[1], /data-asset="architecture"/);
  assert.match(pages[2], /data-asset="stem"[\s\S]*data-asset="stemless"/);
  assert.match(pages[3], /128°[\s\S]*135°[\s\S]*142°/);
  assert.match(pages[4], /Ø40-58 mm[\s\S]*DOBLE EXCÉNTRICO[\s\S]*SensiTiN/);
  assert.match(pages[5], /CEMENTADO[\s\S]*Ø40-58 mm[\s\S]*2-10 mm/);
  assert.match(pages[6], /data-layout="reference-cta"/);
  assert.match(pages[6], /Consultá la ficha técnica completa/);
  assert.match(pages[6], /99\.81A\.12[\s\S]*REV\. 02/);
  assert.match(pages[6], /Descargá la ficha completa/);
  assert.match(pages[6], /id="download-arrow"/);
  assert.match(pages[6], /data-role="legal-disclaimer"[^>]*font-size="18"/);

  assert.equal((complete.match(/id="marca"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="marcas-cierre"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="pie"/g) ?? []).length, 5);
  pages.slice(1, -1).forEach((svg) => assert.match(svg, /id="pie"/));
  assert.doesNotMatch(complete, /WhatsApp/i);
  assert.equal((complete.match(/data-role="card(?:-|\")/g) ?? []).length, 0);
  assert.equal((complete.match(/data-role="badge(?:-|\")/g) ?? []).length, 0);
});

test("HOMBRO ANATÓMICO: controla los bloques editoriales para evitar desbordes", async () => {
  const pages = await renderPages();

  assert.match(pages[0], /x="88" y="515"[^>]*><tspan[^>]*>Plataforma modular/);
  assert.match(pages[0], /<rect x="88" y="570" width="1024" height="690"/);
  assert.deepEqual(brochure.pages[1].features[2].copy, ["Alternativas humerales", "cementadas", "y no cementadas."]);
  assert.deepEqual(brochure.pages[2].items.map(({ copy }) => copy), [
    ["Cementada", "y no cementada."],
    ["Configuración", "metafisaria compacta."],
    ["Interfaz proximal", "para montaje modular."],
  ]);
  assert.match(pages[3], /<rect x="88" y="500" width="520" height="540"/);
  assert.deepEqual(brochure.pages[4].note, [
    "Referencias alfabéticas y horarias",
    "facilitan el registro de la posición.",
  ]);
  assert.deepEqual(brochure.pages[6].title, ["Sistema anatómico.", "Ajuste coordinado."]);
});
