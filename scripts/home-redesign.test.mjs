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

test("declares the approved editorial order and retained data mappings", () => {
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

  for (const hook of [
    "data-home-trust-strip",
    "data-home-products-layout",
    "data-home-supplier-ecosystem",
    "data-home-support-layout",
    "data-home-event-story",
    "data-home-media-layout",
    "data-home-final-cta",
  ]) {
    assert.ok(indexSource.includes(hook), `missing editorial hook: ${hook}`);
  }

  assert.match(
    indexSource,
    /const \[featuredCategory, \.\.\.secondaryCategories\]/,
  );
  assert.match(indexSource, /secondaryCategories\.map/);
  assert.match(indexSource, /supplierSystems\.map/);
  assert.match(indexSource, /serviceFlow\.map/);
  assert.match(indexSource, /videos\.length > 0/);
  assert.doesNotMatch(indexSource, /data-home-accent-band/);
  assert.doesNotMatch(indexSource, /home-accent-rail/);
});

test("preserves the verified content and shared behavior boundaries", () => {
  for (const label of [
    "Consulta técnica",
    "Disponibilidad",
    "Coordinación",
    "Acompañamiento",
  ]) {
    assert.ok(siteSource.includes(label), `missing service flow label: ${label}`);
  }

  assert.match(indexSource, /data-hero-carousel/);
  assert.match(indexSource, /data-hero-autoplay/);
  assert.match(footerSource, /data-site-footer/);
  assert.doesNotMatch(
    siteSource,
    /12 años|40\+ instituciones|24 h/,
  );
});

test("defines the editorial layout without legacy symmetry rules", () => {
  for (const selector of [
    ".home-trust-strip",
    ".home-products-layout",
    ".home-product-featured",
    ".home-supplier-ecosystem",
    ".home-support-layout",
    ".home-event-story",
    ".home-media-layout",
    ".home-final-cta",
  ]) {
    assert.ok(homeCss.includes(selector), `home.css should own ${selector}`);
  }

  for (const obsolete of [
    "--home-accent-min-height",
    "--home-section-min-height",
    ".home-accent-band",
    ".home-accent-rail",
    ".home-products-grid",
    ".home-suppliers-grid",
    ".home-process-grid",
  ]) {
    assert.ok(!homeCss.includes(obsolete), `remove obsolete CSS: ${obsolete}`);
  }

  assert.match(
    homeCss,
    /\.home-products-layout\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s,
  );
  assert.match(
    homeCss,
    /\.home-support-layout\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s,
  );
  assert.match(
    homeCss,
    /\.home-media-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*7fr\)\s+minmax\(0,\s*5fr\)/s,
  );
});

test("keeps the footer content while exposing the compact layout", () => {
  for (const className of [
    "site-footer__identity",
    "site-footer__categories",
    "site-footer__sections",
    "site-footer__contact",
  ]) {
    assert.ok(
      footerSource.includes(className),
      `missing footer group: ${className}`,
    );
  }

  assert.doesNotMatch(
    globalCss,
    /main:has\(\[data-home-section="cta"\]\)\s*\+\s*\.site-footer/,
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
