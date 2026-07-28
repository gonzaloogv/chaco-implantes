# Home Editorial Medical Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Chaco Implantes home as a clear, asymmetric medical editorial page while preserving all real content, routes, hero behavior, and header shrink behavior.

**Architecture:** Keep `src/data/site.ts` as the single data source and `src/pages/index.astro` as the home composer. Replace the current palindromic layout in `src/styles/home.css`, make only scoped footer adjustments in shared files, and update structural and browser checks to verify the new hierarchy instead of equal bands.

**Tech Stack:** Astro 6, TypeScript, Tailwind CSS 4 utilities, plain CSS, Node test runner, Playwright.

---

## File map

- Modify `src/pages/index.astro`: recompose the home sections; preserve hero markup, carousel script, content, routes, and data mappings.
- Rewrite `src/styles/home.css`: own every home-only layout and responsive rule.
- Modify `src/components/Footer.astro`: add layout classes without changing content or links.
- Modify `src/styles/global.css`: compact footer and soften shared header/button effects only where required.
- Modify `scripts/home-redesign.test.mjs`: replace the obsolete equal-band contract with the editorial structure contract.
- Modify `scripts/verify-home-layout.mjs`: verify hierarchy, responsive geometry, no overlap, no overflow, header shrink, and reduced motion.

Do not modify `src/data/site.ts`, `src/scripts/header-shrink.mjs`, routes, Cloudinary integration, or dependencies.

### Task 1: Establish the editorial structure

**Files:**
- Modify: `scripts/home-redesign.test.mjs`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace obsolete structure assertions with the new contract**

Keep the file loader and CSS ownership test. Replace the equal-band, equal-height, and old grid tests with:

```js
const homeOnlySelectors = [
  ".hero-bg-slide",
  ".hero-shell",
  ".hero-slide",
  ".hero-dot",
];

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

  assert.match(indexSource, /const \[featuredCategory, \.\.\.secondaryCategories\]/);
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
  assert.doesNotMatch(siteSource, /12 años|40\+ instituciones|24 h/);
});
```

- [ ] **Step 2: Run the structural test and confirm the old markup fails**

Run:

```powershell
npm run test:home
```

Expected: FAIL because the new editorial hooks do not exist and the old accent bands still exist.

- [ ] **Step 3: Prepare the category hierarchy**

Add this after the imports in the frontmatter of `src/pages/index.astro`:

```ts
const [featuredCategory, ...secondaryCategories] = featuredCategories;
```

Do not reorder or change `featuredCategories` in `site.ts`; the first existing category is only a visual feature.

- [ ] **Step 4: Replace the sections after the hero**

Keep the current hero section and carousel script. Replace the current `features` through `process` markup with the following structure:

```astro
<section data-home-section="features" class="home-trust-section">
  <div data-home-trust-strip class="home-trust-strip">
    <h2 class="sr-only">Diferenciales de Chaco Implantes</h2>
    <div class="home-trust-grid">
      {valuePillars.map((pillar) => (
        <article class="home-trust-item">
          <Icon name={pillar.icon} class="h-5 w-5" />
          <p>{pillar.label}</p>
        </article>
      ))}
    </div>
  </div>
</section>

<div data-home-products-layout class="home-products-layout">
  <div data-home-product-featured class="home-product-featured">
    <CatalogCard category={featuredCategory} />
  </div>
  <div class="home-product-secondary-grid">
    {secondaryCategories.map((category) => (
      <div data-home-product-secondary class="home-product-secondary">
        <CatalogCard category={category} compact />
      </div>
    ))}
  </div>
</div>

<div class="home-supplier-marks">
  {supplierSystems.map((item) => (
    <a
      data-home-supplier-mark
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      class="home-supplier-mark"
      aria-label={`Visitar sitio de ${item.name}`}
    >
      <img
        src={item.logo}
        alt={item.logoAlt}
        width={item.logoWidth}
        height={item.logoHeight}
        loading="lazy"
        decoding="async"
        class:list={["supplier-logo", item.logoClass]}
      />
      <span>{item.name}</span>
    </a>
  ))}
  <a
    href={wa.lineaFaltante}
    target="_blank"
    rel="noopener noreferrer"
    class="home-supplier-more"
  >
    Consultar otras líneas <Icon name="arrow-right" class="h-4 w-4" />
  </a>
</div>

<section data-home-section="process" class="home-editorial-section home-support-section">
  <div data-home-support-layout class="home-editorial-inner home-support-layout">
    <figure class="home-support-media">
      <img src={images.quirofano} alt="Instrumental y actividad en quirófano" loading="lazy" decoding="async" />
    </figure>
    <div class="home-support-copy">
      <header class="home-section-header">
        <span class="home-eyebrow">Acompañamiento profesional</span>
        <h2>Cómo coordinamos cada solicitud</h2>
      </header>
      <ol class="home-support-steps">
        {serviceFlow.map((item) => (
          <li data-home-support-step class="home-support-step">
            <span aria-hidden="true">{item.step}</span>
            <p>{item.label}</p>
          </li>
        ))}
      </ol>
    </div>
  </div>
</section>

```

Apply these exact wrapper and class changes around the retained content:

- Products section: `home-editorial-section home-products-section`; inner wrapper: `home-editorial-inner`; heading: `home-section-header home-section-header--split`.
- Supplier section: `home-editorial-section home-suppliers-section`; inner wrapper: `home-editorial-inner home-supplier-ecosystem` plus `data-home-supplier-ecosystem`; heading: `home-section-header`.
- Event section: `home-editorial-section home-event-section`; inner wrapper: `home-editorial-inner`; article: `home-event-story` plus `data-home-event-story`; image wrapper: `home-event-story__media`; content wrapper: `home-event-story__content`.
- Multimedia section: `home-editorial-section home-media-section`; inner wrapper: `home-editorial-inner`; heading: `home-section-header`; layout: `home-media-layout` plus `data-home-media-layout`, retaining the `home-media-layout--single` conditional.
- CTA section: `home-final-cta-section scroll-mt-20`; inner wrapper: `home-final-cta` plus `data-home-final-cta`; copy wrapper: `home-final-cta__copy`.

Do not change hero timing, event data, product routes, image sources, external supplier destinations, or conditional video behavior.

- [ ] **Step 5: Run the structural test**

Run:

```powershell
npm run test:home
```

Expected: the structure and content tests PASS. CSS ownership assertions may remain red until Task 2 only if they reference selectors being replaced.

- [ ] **Step 6: Commit the structural change**

```powershell
git add src/pages/index.astro scripts/home-redesign.test.mjs
git diff --cached
git commit -m "refactor(home): establish editorial page structure"
```

### Task 2: Replace the home visual system

**Files:**
- Modify: `scripts/home-redesign.test.mjs`
- Rewrite: `src/styles/home.css`

- [ ] **Step 1: Add CSS contract assertions**

Add:

```js
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

  assert.match(homeCss, /\.home-products-layout\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(homeCss, /\.home-support-layout\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(homeCss, /\.home-media-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*7fr\)\s+minmax\(0,\s*5fr\)/s);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```powershell
npm run test:home
```

Expected: FAIL on missing editorial selectors and remaining legacy symmetry rules.

- [ ] **Step 3: Rewrite `home.css` around the approved layout**

Remove the previous accent-band and equal-height systems. Keep only the existing hero behavior selectors and rebuild the rest with this foundation:

```css
.home-page {
  --home-gutter: clamp(1.25rem, 4vw, 4rem);
  --home-section-space: clamp(4.5rem, 8vw, 8.5rem);
  --home-radius: 1rem;
  background: #f8fafc;
  color: var(--brand-ink);
  overflow: clip;
}

.home-editorial-section {
  padding-block: var(--home-section-space);
}

.home-editorial-inner,
.home-final-cta,
.home-trust-strip {
  margin-inline: auto;
  width: min(calc(100% - (2 * var(--home-gutter))), 80rem);
}

.home-trust-section {
  background: #f8fafc;
  position: relative;
  z-index: 2;
}

.home-trust-strip {
  background: #fff;
  border: 1px solid var(--brand-border);
  border-radius: var(--home-radius);
  box-shadow: 0 24px 60px -48px rgb(16 41 76 / 0.45);
  padding: 1.5rem 2rem;
  transform: translateY(-2rem);
}

.home-trust-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.home-products-layout,
.home-support-layout {
  display: grid;
  gap: clamp(1rem, 2vw, 1.75rem);
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

.home-product-featured {
  grid-column: span 6;
}

.home-product-featured .catalog-image-card {
  height: 100%;
  min-height: 38rem;
}

.home-product-secondary-grid {
  display: grid;
  gap: clamp(1rem, 2vw, 1.5rem);
  grid-column: span 6;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.home-product-secondary:last-child {
  grid-column: span 2;
}

.home-product-secondary .catalog-image-card {
  height: 18.25rem;
}

.home-supplier-ecosystem {
  align-items: start;
  display: grid;
  gap: clamp(2.5rem, 6vw, 6rem);
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

.home-supplier-ecosystem > .home-section-header {
  grid-column: span 4;
}

.home-supplier-marks {
  display: grid;
  grid-column: span 8;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.home-supplier-mark {
  align-items: center;
  border-bottom: 1px solid var(--brand-border);
  display: flex;
  gap: 1rem;
  min-height: 8rem;
  padding: 1.5rem;
}

.home-support-media {
  grid-column: span 5;
  margin: 0;
  min-height: 34rem;
  overflow: hidden;
}

.home-support-copy {
  grid-column: 7 / -1;
}

.home-media-layout {
  display: grid;
  gap: clamp(1rem, 2vw, 1.75rem);
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
}

.home-media-layout--single {
  grid-template-columns: 1fr;
}

.home-final-cta {
  background: var(--brand-navy);
  border-radius: var(--home-radius);
  color: #fff;
  padding: clamp(2rem, 5vw, 4rem);
}
```

Complete the section-specific styling with:

```css
.home-hero-overlay {
  background: linear-gradient(90deg, rgb(10 28 52 / 0.88) 0%, rgb(10 28 52 / 0.56) 48%, rgb(10 28 52 / 0.18) 100%);
}

.hero-photo-glow {
  filter: saturate(0.92) contrast(1.02);
}

.home-hero-eyebrow,
.home-hero-title,
.home-hero-copy {
  text-shadow: none;
}

.home-section-header {
  max-width: 42rem;
}

.home-section-header h2 {
  text-wrap: balance;
}

.home-section-header p {
  text-wrap: pretty;
}

.home-trust-item {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  min-height: 3.5rem;
  padding-inline: 1.25rem;
}

.home-trust-item + .home-trust-item {
  border-left: 1px solid var(--brand-border);
}

.home-supplier-mark,
.home-supplier-more {
  background: transparent;
  box-shadow: none;
}

.home-supplier-more {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  min-height: 5rem;
  padding: 1.5rem;
}

.home-support-media,
.home-event-story__media,
.home-event-story__content,
.home-media-card {
  border-radius: var(--home-radius);
}

.home-support-media img,
.home-event-story__media img,
.home-media-card img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.home-support-steps {
  list-style: none;
  margin: 2.5rem 0 0;
  padding: 0;
}

.home-support-step {
  border-left: 1px solid var(--brand-border);
  display: grid;
  gap: 1rem;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  padding: 0 0 2rem 1.5rem;
}

.home-event-story {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

.home-event-story__media {
  grid-column: 1 / span 8;
  grid-row: 1;
  min-height: 34rem;
  overflow: hidden;
}

.home-event-story__content {
  align-self: center;
  background: #fff;
  border: 1px solid var(--brand-border);
  grid-column: 8 / -1;
  grid-row: 1;
  padding: clamp(2rem, 4vw, 3.5rem);
  position: relative;
  z-index: 1;
}

.home-media-card {
  min-height: 30rem;
  overflow: hidden;
}

.home-final-cta-section {
  background: #f8fafc;
  padding-block: 0 clamp(4rem, 8vw, 7rem);
}

.home-final-cta {
  align-items: center;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr) auto auto;
}

@media (hover: hover) and (pointer: fine) {
  .home-page .catalog-image-card:hover,
  .home-media-card:hover {
    transform: translateY(-2px);
  }

  .home-page .catalog-image-card:hover img,
  .home-media-card:hover img {
    transform: scale(1.02);
  }
}
```

Add responsive rules:

```css
@media (max-width: 63.999rem) {
  .home-product-featured,
  .home-product-secondary-grid,
  .home-supplier-ecosystem > .home-section-header,
  .home-supplier-marks,
  .home-support-media,
  .home-support-copy {
    grid-column: 1 / -1;
  }

  .home-product-featured .catalog-image-card {
    min-height: 30rem;
  }
}

@media (max-width: 39.999rem) {
  .home-page {
    --home-gutter: 1rem;
    --home-section-space: clamp(3.5rem, 14vw, 4.5rem);
  }

  .home-trust-strip {
    padding: 1rem;
    transform: translateY(-1rem);
  }

  .home-product-secondary-grid,
  .home-media-layout {
    grid-template-columns: 1fr;
  }

  .home-product-secondary:last-child {
    grid-column: auto;
  }

  .home-product-featured .catalog-image-card,
  .home-product-secondary .catalog-image-card {
    height: auto;
    min-height: 22rem;
  }

  .home-trust-item {
    border-left: 0;
  }

  .home-trust-item:nth-child(even) {
    border-left: 1px solid var(--brand-border);
  }

  .home-trust-item:nth-child(n + 3) {
    border-top: 1px solid var(--brand-border);
  }

  .home-event-story__media,
  .home-event-story__content {
    grid-column: 1 / -1;
    grid-row: auto;
  }

  .home-event-story__media {
    min-height: 22rem;
  }

  .home-final-cta {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 22rem) {
  .home-supplier-marks {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-page .catalog-image-card,
  .home-page .catalog-image-card img,
  .home-supplier-mark {
    transform: none !important;
    transition-duration: 1ms !important;
  }
}
```

- [ ] **Step 4: Remove confirmed dead home CSS**

Before deleting each old selector, verify it is home-only:

```powershell
rg -n "home-accent|home-content-section|home-products-grid|home-suppliers-grid|home-process-grid|home-event-card" src
```

Expected: matches exist only in the old home markup or `home.css`. Remove all superseded declarations after Task 1 has removed their consumers.

- [ ] **Step 5: Run focused checks**

```powershell
npm run test:home
npm run check
```

Expected: both commands PASS.

- [ ] **Step 6: Commit the home visual system**

```powershell
git add src/styles/home.css scripts/home-redesign.test.mjs
git diff --cached
git commit -m "feat(home): apply editorial medical layout"
```

### Task 3: Integrate the footer without changing shared behavior

**Files:**
- Modify: `src/components/Footer.astro`
- Modify: `src/styles/global.css`
- Test: `scripts/home-redesign.test.mjs`
- Test: `scripts/header-shrink.test.mjs`

- [ ] **Step 1: Add footer scope assertions**

Add:

```js
test("keeps the footer content while exposing the compact layout", () => {
  for (const className of [
    "site-footer__identity",
    "site-footer__categories",
    "site-footer__sections",
    "site-footer__contact",
  ]) {
    assert.ok(footerSource.includes(className), `missing footer group: ${className}`);
  }

  assert.doesNotMatch(
    globalCss,
    /main:has\(\[data-home-section="cta"\]\)\s*\+\s*\.site-footer/,
  );
});
```

- [ ] **Step 2: Run the tests and confirm the footer contract fails**

```powershell
npm run test:home
npm run test:header
```

Expected: home test FAILS on the new footer classes; header tests PASS.

- [ ] **Step 3: Add layout classes to the existing footer groups**

Do not change text, arrays, slice count, routes, contact data, or legal copy. Add these classes, in order, to the four existing direct children of `.site-footer__grid`:

1. `site-footer__identity`
2. `site-footer__categories`
3. `site-footer__sections`
4. `site-footer__contact`

Remove the existing `lg:grid-cols-4` utility from `.site-footer__grid`; the explicit CSS below becomes its only column definition.

- [ ] **Step 4: Replace the home-specific footer overlap rule**

Delete:

```css
main:has([data-home-section="cta"]) + .site-footer .site-footer__grid {
  padding-block-start: 5.5rem;
}
```

Use:

```css
.site-footer__grid {
  grid-template-columns: repeat(12, minmax(0, 1fr));
  padding-block: clamp(3rem, 6vw, 5rem);
}

.site-footer__identity {
  grid-column: span 5;
}

.site-footer__categories,
.site-footer__sections {
  grid-column: span 2;
}

.site-footer__contact {
  grid-column: span 3;
}

@media (max-width: 63.999rem) {
  .site-footer__identity,
  .site-footer__categories,
  .site-footer__sections,
  .site-footer__contact {
    grid-column: span 6;
  }
}

@media (max-width: 39.999rem) {
  .site-footer__identity,
  .site-footer__contact {
    grid-column: 1 / -1;
  }

  .site-footer__categories,
  .site-footer__sections {
    grid-column: span 6;
  }
}
```

Do not change `Header.astro`, `header-shrink.mjs`, header dimensions, or header timing.

- [ ] **Step 5: Run focused checks**

```powershell
npm run test:home
npm run test:header
npm run check
```

Expected: all commands PASS.

- [ ] **Step 6: Commit footer integration**

```powershell
git add src/components/Footer.astro src/styles/global.css scripts/home-redesign.test.mjs
git diff --cached
git commit -m "refactor(footer): compact the shared content layout"
```

### Task 4: Replace geometry checks and verify the complete redesign

**Files:**
- Modify: `scripts/verify-home-layout.mjs`
- Modify only if verification exposes a defect: `src/pages/index.astro`
- Modify only if verification exposes a defect: `src/styles/home.css`
- Modify only if verification exposes a defect: `src/styles/global.css`

- [ ] **Step 1: Remove obsolete equal-band and equal-height checks**

Delete:

- `equalRenderedHeight`
- `sectionMinHeight`
- `assertSameBandGeometry`
- `[data-home-accent-band]` measurements
- equal clear-section `minHeight` assertions
- fixed old product, supplier, and media column counts

- [ ] **Step 2: Add editorial geometry assertions**

Keep the existing server setup, overflow diagnostic, header shrink check, and reduced-motion check. Add these assertions inside each viewport case:

```js
const productCount = await page.locator("[data-catalog-card]").count();
assert.equal(productCount, 6, `${testCase.name}: six product categories`);

const supplierCount = await page.locator("[data-home-supplier-mark]").count();
assert.equal(supplierCount, 4, `${testCase.name}: four supplier marks`);

const supportStepCount = await page.locator("[data-home-support-step]").count();
assert.equal(supportStepCount, 4, `${testCase.name}: four support steps`);

const ctaBox = await page.locator("[data-home-final-cta]").boundingBox();
const footerBox = await page.locator("[data-site-footer]").boundingBox();
assert.ok(ctaBox && footerBox, `${testCase.name}: CTA and footer must render`);
assert.ok(
  ctaBox.y + ctaBox.height <= footerBox.y,
  `${testCase.name}: CTA must not overlap footer`,
);

const featuredBox = await page.locator("[data-home-product-featured]").boundingBox();
const secondaryBox = await page.locator("[data-home-product-secondary]").first().boundingBox();
assert.ok(featuredBox && secondaryBox, `${testCase.name}: product hierarchy must render`);

if (testCase.viewport.width >= 1024) {
  assert.ok(
    featuredBox.width > secondaryBox.width,
    `${testCase.name}: featured product must be wider`,
  );
}

if (testCase.viewport.width <= 390) {
  assert.ok(
    Math.abs(featuredBox.width - secondaryBox.width) <= 1,
    `${testCase.name}: product cards must share mobile width`,
  );
}
```

When videos exist, also assert:

```js
const mediaCards = page.locator("[data-home-media-layout] > a");
assert.equal(await mediaCards.count(), 2, `${testCase.name}: gallery and video`);

if (testCase.viewport.width >= 1024) {
  const galleryBox = await mediaCards.nth(0).boundingBox();
  const videoBox = await mediaCards.nth(1).boundingBox();
  assert.ok(galleryBox && videoBox && galleryBox.width > videoBox.width);
}
```

- [ ] **Step 3: Run the full automated verification**

```powershell
npm run verify:frontend
npm run test:video-player
```

Expected: all tests, Astro check, build, smoke checks, and layout verification PASS.

- [ ] **Step 4: Perform visual verification**

Run:

```powershell
npm run dev
```

Inspect `/` at `1440x1000`, `1280x800`, `768x900`, `390x844`, and `320x720`. Confirm:

- Header is large at the top and shrinks continuously.
- Hero controls work on all three slides.
- Trust strip bridges hero and body without clipping.
- Featured product reads first without hiding the other five categories.
- Supplier logos are optically balanced and links are visible.
- Process reads as one sequence.
- Event panel does not cover its image focal point.
- Gallery is wider than video on desktop and both stack on mobile.
- CTA and footer have visible separation.
- No four-line mobile headings, horizontal overflow, or covered controls.
- Natural image color is visible and glow is restrained.
- Keyboard focus is visible on hero controls, cards, supplier links, CTA actions, and footer links.
- At `200%` zoom, content reflows without clipping or horizontal scrolling.
- With reduced motion enabled, the hero remains usable and hover movement is removed.

Stop the development server after inspection.

- [ ] **Step 5: Review the final diff and commit verification updates**

```powershell
git status --short
git diff --check
git diff
git add scripts/verify-home-layout.mjs src/pages/index.astro src/styles/home.css src/styles/global.css
git diff --cached
git commit -m "test(home): verify editorial responsive geometry"
```

Only stage implementation files in this final commit if visual verification required a correction. Finish with:

```powershell
git status --short
```

Expected: clean working tree.
