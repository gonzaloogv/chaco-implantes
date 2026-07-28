import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(relativePath) {
  try {
    return await readFile(new URL(relativePath, root), "utf8");
  } catch {
    return "";
  }
}

const [indexSource, homeCss, globalCss] = await Promise.all([
  read("src/pages/index.astro"),
  read("src/styles/home.css"),
  read("src/styles/global.css"),
]);

const [siteSource, footerSource] = await Promise.all([
  read("src/data/site.ts"),
  read("src/components/Footer.astro"),
]);

const homeOnlySelectors = [
  ".hero-bg-slide",
  ".hero-shell",
  ".section-dark-gradient",
  ".suppliers-section",
  ".commercial-band",
  ".media-band",
  ".supplier-brand-card",
  ".hero-slide",
  ".hero-dot",
  ".value-pillars-band",
  ".value-pillar-card",
];

test("isolates home-only CSS from the global stylesheet", () => {
  assert.match(indexSource, /import\s+"\.\.\/styles\/home\.css";/);

  for (const selector of homeOnlySelectors) {
    assert.ok(
      homeCss.includes(selector),
      `home.css should own ${selector}`,
    );
    assert.ok(
      !globalCss.includes(selector),
      `global.css should not keep ${selector}`,
    );
  }

  assert.doesNotMatch(homeCss, /@import\s+"tailwindcss"/);
});

test("declares the approved home order and operational flow", () => {
  const stages = [
    "hero",
    "features",
    "products",
    "suppliers",
    "process",
    "congresses",
    "multimedia",
    "cta",
  ];

  let previous = -1;
  for (const stage of stages) {
    const current = indexSource.indexOf(`data-home-section="${stage}"`);
    assert.ok(current >= 0, `missing home stage: ${stage}`);
    assert.ok(current > previous, `home stage out of order: ${stage}`);
    previous = current;
  }

  assert.equal(
    (indexSource.match(/data-home-accent-band/g) ?? []).length,
    3,
  );
  assert.match(indexSource, /<div data-home-page class="home-page">/);
  assert.match(footerSource, /data-site-footer/);
  assert.match(indexSource, /serviceFlow\.map/);

  for (const label of [
    "Consulta técnica",
    "Disponibilidad",
    "Coordinación",
    "Acompañamiento",
  ]) {
    assert.ok(siteSource.includes(label), `missing service flow label: ${label}`);
  }

  assert.doesNotMatch(
    siteSource,
    /12 años|40\+ instituciones|24 h/,
  );
});

test("defines accent geometry once for all three bands", () => {
  for (const token of [
    "--home-accent-min-height: 7.5rem",
    "--home-accent-padding: 1.25rem 1.5rem",
    "--home-accent-radius: 1rem",
  ]) {
    assert.ok(homeCss.includes(token), `missing shared token: ${token}`);
  }

  assert.equal(
    (homeCss.match(/\.home-accent-band\s*\{/g) ?? []).length,
    1,
  );
  assert.doesNotMatch(
    homeCss,
    /\.home-accent-band(?:--[\w-]+)?\s*\{[^}]*\bheight\s*:/,
  );
});
