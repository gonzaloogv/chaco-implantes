import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contactoSource = await readFile(
  new URL("../src/pages/contacto.astro", import.meta.url),
  "utf8",
);
const contactoStyles = await readFile(
  new URL("../src/styles/contacto.css", import.meta.url),
  "utf8",
);

test("Contacto usa una composición editorial propia", () => {
  assert.match(contactoSource, /import "\.\.\/styles\/contacto\.css";/);
  assert.match(contactoSource, /class="contacto-page"/);
  assert.match(contactoSource, /data-contacto-layout/);
  assert.match(contactoSource, /data-contacto-location/);
});

test("Contacto conserva el formulario y sus datos reales", () => {
  for (const content of [
    "data-contact-form",
    'name="nombre"',
    'name="institucion"',
    'name="mensaje"',
    "site.phoneDisplay",
    "site.address",
    "site.instagramHandle",
    "site.email",
    "Horario comercial",
  ]) {
    assert.ok(contactoSource.includes(content), `Falta el contenido: ${content}`);
  }
});

test("Contacto mantiene el envío por WhatsApp y el mapa", () => {
  assert.match(contactoSource, /define:vars={{ whatsappBase: whatsappLink\(\) }}/);
  assert.match(contactoSource, /window\.open/);
  assert.match(contactoSource, /google\.com\/maps\?q=/);
  assert.match(contactoSource, /Cómo llegar/);
});

test("Contacto elimina las cards genéricas y prioriza una banda informativa", () => {
  assert.doesNotMatch(contactoSource, /\bpremium-card\b/);
  assert.match(contactoSource, /contacto-details/);
  assert.match(contactoSource, /contacto-form/);
});

test("El hero no repite el número de contacto", () => {
  const directBlock = contactoSource.match(
    /<div class="contacto-hero__direct">([\s\S]*?)<\/div>/,
  )?.[1];

  assert.ok(directBlock);
  assert.doesNotMatch(directBlock, /site\.phoneDisplay/);
});

test("El formulario y los canales usan una proporción 60 40 en escritorio", () => {
  assert.match(
    contactoStyles,
    /grid-template-columns:\s*minmax\(0,\s*3fr\)\s+minmax\(0,\s*2fr\)/,
  );
});
