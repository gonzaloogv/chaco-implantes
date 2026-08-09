import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const eventosSource = await readFile(
  new URL("../src/pages/eventos.astro", import.meta.url),
  "utf8",
);
const eventosStyles = await readFile(
  new URL("../src/styles/eventos.css", import.meta.url),
  "utf8",
);

test("Eventos usa una composición editorial propia", () => {
  assert.match(eventosSource, /import "\.\.\/styles\/eventos\.css";/);
  assert.match(eventosSource, /class="eventos-page"/);
  assert.match(eventosSource, /data-eventos-featured-layout/);
  assert.match(eventosSource, /data-eventos-agenda/);
});

test("Eventos conserva el contenido y las acciones reales", () => {
  for (const content of [
    "Capacitaciones y novedades",
    "Próximas actividades",
    "Consultas sobre capacitaciones",
    "data-featured-event",
    'href="/galeria?categoria=Eventos"',
    "wa.congreso",
    "wa.capacitaciones",
  ]) {
    assert.ok(eventosSource.includes(content), `Falta el contenido: ${content}`);
  }
});

test("El hero explica la participación profesional con mayor contexto", () => {
  assert.ok(
    eventosSource.includes(
      "Participamos activamente en congresos, capacitaciones y espacios de intercambio para acercar novedades, fortalecer el vínculo con profesionales y acompañar la actualización de equipos médicos e instituciones de salud.",
    ),
  );
});

test("Eventos elimina las cards genéricas y mantiene visible la imagen del hero", () => {
  assert.doesNotMatch(eventosSource, /\bpremium-card\b/);
  assert.doesNotMatch(eventosSource, /\bdark-card\b/);
  assert.match(eventosSource, /data-eventos-hero-media/);
  assert.doesNotMatch(eventosSource, /data-eventos-hero-media[^>]*\bhidden\b/);
});

test("La placa azul de la fotografía destacada tiene mayor presencia", () => {
  const backdropRule = eventosStyles.match(
    /\.eventos-featured__media::before\s*{([\s\S]*?)}/,
  )?.[1];

  assert.ok(backdropRule);
  assert.match(backdropRule, /width:\s*80%/);
  assert.match(backdropRule, /height:\s*80%/);
});
