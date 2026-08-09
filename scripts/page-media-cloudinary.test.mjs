import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const siteSource = await readFile(
  new URL("../src/data/site.ts", import.meta.url),
  "utf8",
);
const eventosSource = await readFile(
  new URL("../src/pages/eventos.astro", import.meta.url),
  "utf8",
);
const galeriaSource = await readFile(
  new URL("../src/pages/galeria.astro", import.meta.url),
  "utf8",
);
const nosotrosSource = await readFile(
  new URL("../src/pages/nosotros.astro", import.meta.url),
  "utf8",
);

test("La imagen nueva de Congreso usa una URL Cloudinary optimizada", () => {
  assert.match(
    siteSource,
    /eventMain:\s*`\$\{CLOUDINARY_BASE}\/f_auto,q_auto,c_fill,g_auto,w_1600,h_1000\/v1783105553\/Congreso_Traumato-100_jvbmaf\.jpg`/,
  );
  assert.match(siteSource, /image:\s*images\.eventMain/);
  assert.match(eventosSource, /featuredEvent\.image/);
  assert.match(galeriaSource, /src={images\.eventMain}/);
});

test("Las páginas ya no dependen de las fotos de ejemplo eliminadas", () => {
  assert.doesNotMatch(siteSource, /\/assets\/images\//);
  assert.doesNotMatch(siteSource, /\bheroBg:/);
  assert.match(nosotrosSource, /src={images\.professionalWork}/);
  assert.match(siteSource, /image:\s*images\.instrumental/);
  assert.match(siteSource, /image:\s*images\.productOverview/);
  assert.match(siteSource, /image:\s*images\.professionalWork/);
});
