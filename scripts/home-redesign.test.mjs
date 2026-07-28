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
  ".supplier-brand-card",
  ".hero-slide",
  ".hero-dot",
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

test("assigns each clear section the approved responsive grid", () => {
  for (const className of [
    "home-products-grid",
    "home-suppliers-grid",
    "home-event-card",
    "home-media-grid",
  ]) {
    assert.ok(
      indexSource.includes(className),
      `index.astro should use ${className}`,
    );
  }

  assert.match(
    homeCss,
    /\.home-products-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s,
  );
  assert.match(
    homeCss,
    /\.home-suppliers-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,/s,
  );
  assert.match(
    homeCss,
    /\.home-media-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s,
  );
  assert.match(
    homeCss,
    /\.home-content-section\s*\{[^}]*min-block-size:\s*var\(--home-section-min-height\)/s,
  );
});

test("removes superseded declarations without touching shared components", () => {
  assert.doesNotMatch(globalCss, /--ease-in-out:/);
  assert.doesNotMatch(homeCss, /\.section-dark-gradient/);
  assert.doesNotMatch(homeCss, /\.suppliers-section/);
  assert.doesNotMatch(homeCss, /\.commercial-band/);
  assert.doesNotMatch(homeCss, /\.media-band/);
  assert.doesNotMatch(homeCss, /\.value-pillar(?:s-band|-card|-icon|-label)/);
  assert.match(globalCss, /\.site-header\s*\{/);
  assert.match(globalCss, /\.footer-link\s*\{/);
  assert.match(globalCss, /\.catalog-image-card\s*\{/);
  assert.match(globalCss, /\.contact-field\s*\{/);
});
