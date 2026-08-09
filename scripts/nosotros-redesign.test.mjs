import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const nosotrosSource = await readFile(
  new URL("../src/pages/nosotros.astro", import.meta.url),
  "utf8",
);
const nosotrosStyles = await readFile(
  new URL("../src/styles/nosotros.css", import.meta.url),
  "utf8",
);

test("Nosotros usa una composición editorial propia", () => {
  assert.match(nosotrosSource, /import "\.\.\/styles\/nosotros\.css";/);
  assert.match(nosotrosSource, /class="nosotros-page"/);
  assert.match(nosotrosSource, /data-nosotros-story/);
  assert.match(nosotrosSource, /data-nosotros-feature-list/);
  assert.doesNotMatch(nosotrosSource, /data-nosotros-cta/);
});

test("Nosotros conserva el contenido institucional", () => {
  for (const content of [
    "Distribución traumatológica",
    "Base en Resistencia",
    "Acompañamiento profesional",
    "Catálogos por línea",
    "Calidad que se siente. Confianza que se nota.",
  ]) {
    assert.match(nosotrosSource, new RegExp(content));
  }
});

test("Nosotros elimina la cuadrícula de cards genéricas", () => {
  assert.doesNotMatch(nosotrosSource, /\bpremium-card\b/);
  assert.doesNotMatch(nosotrosSource, /\bdark-card\b/);
});

test("La imagen secundaria reemplaza la placa azul y usa Cloudinary optimizado", () => {
  assert.match(nosotrosSource, /class="nosotros-story__backdrop"/);
  assert.match(
    nosotrosSource,
    /f_auto,q_auto,c_fill,g_auto,w_900,h_1100\/v1785277685\/chaco-34_pof7i8\.jpg/,
  );
});

test("La imagen secundaria tiene tinte azul y una sombra reforzada", () => {
  assert.match(nosotrosStyles, /\.nosotros-story__media::before\s*{/);
  assert.match(nosotrosStyles, /rgba\(26,\s*111,\s*212,\s*0\.42\)/);
  assert.match(nosotrosStyles, /rgba\(16,\s*41,\s*76,\s*0\.76\)/);
});

test("La marca de agua del hero queda centrada detrás del título", () => {
  assert.match(nosotrosStyles, /\.nosotros-hero::before\s*{/);
  assert.match(nosotrosStyles, /left:\s*clamp\(4rem,\s*10vw,\s*10rem\)/);
});
