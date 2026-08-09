import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { PROJECTS } from "../../shared-preview/projects.mjs";
import { registerPreviewTests } from "../../shared-preview/register-preview-tests.mjs";
import { COLORS } from "../src/constants.mjs";

async function renderNextarPages() {
  const { renderPages } = await import(new URL("../src/pages.mjs", import.meta.url).href);
  return renderPages();
}

registerPreviewTests({
  projectKey: "NEXTAR",
  expectedPages: 6,
  slug: "nextar",
  renderPages: renderNextarPages,
});

test("NEXTAR: define seis páginas y usa solo el banco editorial aprobado", () => {
  const config = PROJECTS.NEXTAR;

  assert.ok(config, "falta la configuración NEXTAR");
  assert.equal(config.pages.length, 6);
  assert.deepEqual(
    Object.keys(config.assets).sort(),
    [
      "hero",
      "logoChaco",
      "logoChacoWhite",
      "logoMedacta",
      "logoNextar",
      "planning",
      "reality",
      "tracking",
    ].sort(),
  );
  assert.deepEqual(
    config.pages.map((page) => page.type),
    ["cover", "planning", "reality", "tracking", "flow", "closing"],
  );
  assert.equal(config.pages[4].asset, undefined, "la página de flujo no debe usar fotografía");
  assert.equal(config.pages[5].asset, "logoNextar");
  assert.doesNotMatch(JSON.stringify(config), /ChatGPT Image|plataforma_nextar_general/i);
});

test("NEXTAR: renderiza seis páginas legibles con la identidad aprobada", async () => {
  const moduleUrl = new URL("../src/pages.mjs", import.meta.url);
  assert.ok(existsSync(fileURLToPath(moduleUrl)), "falta el renderizador de NEXTAR");

  const pages = await renderNextarPages();
  const complete = pages.join("\n");

  assert.equal(pages.length, 6);
  assert.deepEqual(
    COLORS,
    {
      background: "#eef2f9",
      ink: "#192338",
      accent: "#2b6cb8",
      muted: "#53627e",
      rule: "#cbd9ea",
      softBlue: "#e2ebf7",
      white: "#ffffff",
    },
    "la paleta debe coincidir exactamente con la familia visual de referencia",
  );
  pages.forEach((svg, index) => {
    assert.match(svg, /width="1200" height="1698" viewBox="0 0 1200 1698"/);
    assert.match(svg, new RegExp(`data-page="${index + 1}"`));
    assert.match(svg, /@font-face/);
    assert.match(svg, /data:font\/woff2;base64,/);
    assert.doesNotMatch(svg, /<image[^>]+href="(?:https?:|file:)/i);
    assert.doesNotMatch(svg, /[ÃÂ]|â€¦|â€”|â€“|�/);
    assert.match(svg, /data-theme="light"/);
    assert.match(svg, /<rect width="1200" height="1698" fill="#eef2f9"\/>/);
  });
  assert.doesNotMatch(complete, /#071b35|#0d2b50|#55b6e7/i);

  assert.match(pages[0], /data-asset="hero"/);
  assert.match(pages[0], /data-asset="logoChaco"/);
  assert.match(pages[1], /data-asset="planning"/);
  assert.match(pages[2], /data-asset="reality"/);
  assert.match(pages[3], /data-asset="tracking"/);
  assert.doesNotMatch(pages[4], /data-role="editorial-image"/);
  assert.doesNotMatch(pages[5], /data-role="editorial-image"/);
  assert.equal((complete.match(/data-role="editorial-image"/g) ?? []).length, 4);

  assert.equal((complete.match(/id="marca"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="pie-portada"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="marcas-cierre"/g) ?? []).length, 1);
  assert.equal((complete.match(/id="pie"/g) ?? []).length, 4);
  pages.slice(1, -1).forEach((svg) => assert.match(svg, /id="pie"/));

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

  assert.match(pages[4], /REGISTRO[\s\S]*EQUILIBRIO[\s\S]*PLANIFICACIÓN[\s\S]*RESECCIONES[\s\S]*INFORME/);
  const flowCopies = [
    ...pages[4].matchAll(/<text[^>]*data-role="flow-copy"[^>]*>([\s\S]*?)<\/text>/g),
  ];
  assert.equal(flowCopies.length, 5, "cada etapa debe tener una descripción editorial controlada");
  flowCopies.forEach(([, copy]) => {
    assert.ok((copy.match(/<tspan/g) ?? []).length >= 2, "las descripciones del flujo deben respetar el ancho seguro");
  });
  assert.match(pages[3], /<text x="440"[^>]*data-role="system-connection-copy"/);
  assert.doesNotMatch(pages[5], /data-role="brand-panel"/);
  assert.doesNotMatch(pages[5], />Preparación preoperatoria</);
  assert.match(pages[5], />Preparación<[\s\S]*>preoperatoria del caso\.</);
  assert.match(pages[5], /data-layout="reference-cta"/);
  assert.match(pages[5], /<rect x="88" y="1035" width="1024" height="250" rx="18" fill="#2b6cb8"/);
  assert.match(pages[5], /Consultá la ficha técnica completa/);
  assert.match(pages[5], /Descargá la ficha completa/);
  assert.match(pages[5], /id="download-arrow"/);
  assert.match(pages[5], /data-role="legal-disclaimer"[^>]*font-size="18"/);
  assert.doesNotMatch(complete, /WhatsApp/i);
  assert.equal((complete.match(/data-role="card(?:-|\")/g) ?? []).length, 0);
  assert.equal((complete.match(/data-role="badge(?:-|\")/g) ?? []).length, 0);
});
