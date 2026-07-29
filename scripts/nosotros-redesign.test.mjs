import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const nosotrosSource = await readFile(
  new URL("../src/pages/nosotros.astro", import.meta.url),
  "utf8",
);

test("Nosotros usa una composición editorial propia", () => {
  assert.match(nosotrosSource, /import "\.\.\/styles\/nosotros\.css";/);
  assert.match(nosotrosSource, /class="nosotros-page"/);
  assert.match(nosotrosSource, /data-nosotros-story/);
  assert.match(nosotrosSource, /data-nosotros-feature-list/);
  assert.match(nosotrosSource, /data-nosotros-cta/);
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
