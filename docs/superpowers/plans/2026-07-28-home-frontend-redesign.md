# Home Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la home de Chaco Implantes con el ritmo cromático aprobado, tres bandas azules geométricamente idénticas, secciones claras flexibles y el comportamiento actual de la navbar intacto.

**Architecture:** Los estilos exclusivos de la home se aislarán en `src/styles/home.css`; `global.css` mantendrá tokens y componentes compartidos. La vista seguirá consumiendo datos estáticos de `site.ts`, incorporará únicamente el recorrido operativo aprobado y expondrá marcadores semánticos estables para pruebas de estructura y layout.

**Tech Stack:** Astro 6, TypeScript estricto, Tailwind CSS 4, CSS nativo, Node test runner y Playwright 1.61.

---

## Mapa de archivos

### Crear

- `src/styles/home.css`: estilos exclusivos del hero, bandas, secciones y grillas de la home.
- `scripts/home-redesign.test.mjs`: contratos rápidos de estructura, datos y separación de CSS.
- `scripts/verify-home-layout.mjs`: verificación computada de geometría, responsive, overflow y navbar.

### Modificar

- `src/pages/index.astro`: estructura, marcadores, recorrido operativo y clases de la home.
- `src/data/site.ts`: arreglo `serviceFlow` con las cuatro etapas aprobadas.
- `src/styles/global.css`: tokens compartidos, integración visual de header/footer y limpieza verificable.
- `src/components/Footer.astro`: marcador estable y clases semánticas del footer.
- `scripts/smoke.mjs`: contratos del HTML generado y actualización de aserciones visuales obsoletas.
- `scripts/header-shrink.test.mjs`: regresiones explícitas para páginas internas, `requestAnimationFrame` y scroll pasivo.
- `package.json`: scripts `test:home`, `test:header`, `verify:home-layout` y `verify:frontend`.
- `README.md`: comandos de verificación del frontend.

### No modificar

- `src/scripts/header-shrink.mjs`: su fórmula e interpolación son comportamiento aprobado.
- Páginas internas y componentes no mencionados en este mapa.
- Datos existentes de slides, categorías, proveedores, evento, multimedia, contacto o footer.

---

### Task 1: Aislar el CSS actual de la home sin cambiar su apariencia

**Files:**

- Create: `src/styles/home.css`
- Create: `scripts/home-redesign.test.mjs`
- Modify: `src/pages/index.astro:1-14`
- Modify: `src/styles/global.css:406-418,668-693,751-829,838-920,1001-1025`
- Modify: `scripts/smoke.mjs:1-12,573-576`
- Modify: `package.json:7-19`

- [ ] **Step 1: Escribir el test que exige aislamiento de estilos**

Crear `scripts/home-redesign.test.mjs` con este contenido:

```js
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
```

- [ ] **Step 2: Conectar el test a npm y comprobar que falla**

Agregar estos scripts a `package.json`:

```json
"test:home": "node --test scripts/home-redesign.test.mjs",
"test:header": "node --test scripts/header-shrink.test.mjs"
```

Ejecutar:

```powershell
npm run test:home
```

Expected: FAIL con `index.astro should import home.css` o `home.css should own .hero-shell`.

- [ ] **Step 3: Importar el nuevo stylesheet únicamente desde la home**

Añadir después de los imports de componentes en `src/pages/index.astro`:

```astro
import "../styles/home.css";
```

- [ ] **Step 4: Mover las reglas exclusivas sin alterar sus declaraciones**

Mover desde `global.css` a `home.css`, conservando el orden base → estado activo → media query → hover:

```text
.hero-bg-slide y [data-active]
.hero-shell y ::before
.hero-photo-glow y su media query desktop
.section-dark-gradient
.suppliers-section
.commercial-band
.media-band
.supplier-brand-card, muted, logos y variantes
.hero-slide y [data-active]
.hero-dot, [aria-pressed], controles y cursores
.value-pillars-band, card, icon y label
hovers exclusivos de supplier-brand-card y supplier-logo
ajuste responsive de hero-dot-controls
```

No mover `.catalog-image-card`, botones, header, menú, footer, formularios, lightbox, `page-hero-dark` ni `page-surface`, porque tienen consumidores en páginas internas.

- [ ] **Step 5: Hacer que smoke lea el stylesheet correcto**

En `scripts/smoke.mjs`, añadir:

```js
const homeCss = readFileSync(join(root, "src/styles/home.css"), "utf8");
```

Cambiar únicamente las aserciones de hero de las líneas actuales 573-576 para usar `homeCss`:

```js
assert(/\.hero-shell\s*{[\s\S]*min-height:\s*100vh/.test(homeCss), "Hero should occupy the full viewport height");
assert(/\.hero-shell\s*{[\s\S]*background:\s*linear-gradient\(150deg, #0f172a/.test(homeCss), "Hero should keep its current gradient during CSS extraction");
assert(/\.hero-bg-slide\s*{[\s\S]*opacity:\s*0/.test(homeCss), "Hero background slides should fade from hidden state");
assert(/\.hero-bg-slide\[data-active="true"\]\s*{[\s\S]*opacity:\s*1/.test(homeCss), "Active hero background slide should be visible");
```

- [ ] **Step 6: Verificar que la extracción no cambió el producto**

Run:

```powershell
npm run test:home
npm run test:header
npm run check
npm run build
npm run test:smoke
```

Expected: todos PASS; build termina con `Complete!`.

- [ ] **Step 7: Commit**

```powershell
git add src/styles/home.css src/styles/global.css src/pages/index.astro scripts/home-redesign.test.mjs scripts/smoke.mjs package.json
git diff --cached --check
git commit -m "refactor(styles): isolate home-specific CSS"
```

---

### Task 2: Introducir el orden palindrómico y las tres bandas compartidas

**Files:**

- Modify: `scripts/home-redesign.test.mjs`
- Modify: `src/data/site.ts:87-103`
- Modify: `src/pages/index.astro:8-317`
- Modify: `src/styles/global.css:3-36`
- Modify: `src/styles/home.css`
- Modify: `src/components/Footer.astro:8`
- Modify: `scripts/smoke.mjs:82-88,225-276`

- [ ] **Step 1: Añadir el contrato de orden, contenido y bandas**

Agregar a `scripts/home-redesign.test.mjs` la lectura de `site.ts` y `Footer.astro`:

```js
const [siteSource, footerSource] = await Promise.all([
  read("src/data/site.ts"),
  read("src/components/Footer.astro"),
]);
```

Agregar estos tests:

```js
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
```

- [ ] **Step 2: Ejecutar el test y confirmar el estado rojo**

Run:

```powershell
npm run test:home
```

Expected: FAIL por ausencia de `data-home-section="hero"` y `serviceFlow`.

- [ ] **Step 3: Añadir únicamente los datos aprobados**

Después de `valuePillars` en `src/data/site.ts`, agregar:

```ts
export const serviceFlow = [
  { step: "01", label: "Consulta técnica" },
  { step: "02", label: "Disponibilidad" },
  { step: "03", label: "Coordinación" },
  { step: "04", label: "Acompañamiento" },
] as const;
```

Importar `serviceFlow` desde `index.astro`.

- [ ] **Step 4: Marcar todas las etapas sin cambiar sus datos**

Abrir un wrapper inmediatamente dentro de `BaseLayout` y cerrarlo después del CTA:

```astro
<div data-home-page class="home-page">
```

Usar estos atributos y conservar todavía las clases visuales actuales de las secciones claras:

```astro
<section id="inicio" data-home-section="hero" data-home-tone="1" data-hero-carousel class="hero-shell relative flex overflow-hidden">

<section data-home-section="features" data-home-tone="2" class="home-accent-rail home-accent-rail--hero-overlap">

<section data-home-section="products" data-home-tone="0" class="section-dark-gradient">

<section data-home-section="suppliers" data-home-tone="0" data-suppliers-section class="suppliers-section">

<section data-home-section="congresses" data-home-tone="0" class="bg-surface">

<section data-home-section="multimedia" data-home-tone="0" class="media-band">

<section id="profesionales" data-home-section="cta" data-home-tone="2" class="home-accent-rail home-accent-rail--footer-overlap scroll-mt-20">
```

En `Footer.astro`, cambiar el tag inicial a:

```astro
<footer data-site-footer data-home-tone="1" class="site-footer relative overflow-hidden bg-ink text-[#D9E1F1]">
```

- [ ] **Step 5: Renderizar la banda central de proceso**

Insertar entre proveedores y congresos:

```astro
<section
  aria-labelledby="home-process-title"
  data-home-section="process"
  data-home-tone="2"
  class="home-accent-rail"
>
  <div data-home-accent-band class="home-accent-band">
    <h2 id="home-process-title" class="sr-only">Cómo coordinamos cada solicitud</h2>
    <ol class="home-accent-grid home-process-grid">
      {serviceFlow.map((item) => (
        <li class="home-accent-item home-process-item">
          <span class="home-process-step" aria-hidden="true">{item.step}</span>
          <span>{item.label}</span>
        </li>
      ))}
    </ol>
  </div>
</section>
```

Reemplazar la banda actual de features por:

```astro
<section
  data-home-section="features"
  data-home-tone="2"
  class="home-accent-rail home-accent-rail--hero-overlap"
>
  <div data-home-accent-band class="home-accent-band">
    <h2 class="sr-only">Diferenciales de Chaco Implantes</h2>
    <div class="home-accent-grid">
      {valuePillars.map((pillar) => (
        <article data-value-pillar class="home-accent-item">
          <span class="home-accent-icon">
            <Icon name={pillar.icon} class="h-5 w-5" />
          </span>
          <p class="home-accent-label">{pillar.label}</p>
        </article>
      ))}
    </div>
  </div>
</section>
```

Reemplazar la banda actual de CTA por:

```astro
<section
  id="profesionales"
  data-home-section="cta"
  data-home-tone="2"
  class="home-accent-rail home-accent-rail--footer-overlap scroll-mt-20"
>
  <div data-home-accent-band class="home-accent-band">
    <div class="home-accent-cta">
      <div class="home-accent-cta__copy">
        <p class="home-accent-cta__eyebrow">
          Calidad que se siente. Confianza que se nota.
        </p>
        <h2>Trabajamos con traumatólogos, cirujanos, clínicas y sanatorios</h2>
        <p>
          Consultas comerciales e institucionales: coordinamos pedidos,
          disponibilidad y suministro de prótesis, implantes e instrumental.
        </p>
      </div>
      <a
        href={wa.general}
        target="_blank"
        rel="noopener noreferrer"
        class="btn-light inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold"
      >
        <Icon name="message-circle" class="h-4 w-4" /> WhatsApp
      </a>
      <a
        href="/catalogos"
        class="btn-glass-outline inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold"
      >
        Ver catálogos <Icon name="arrow-right" class="h-4 w-4" />
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 6: Definir tokens de marca y geometría compartida**

Agregar a `:root` de `global.css` sin remapear los tokens de páginas internas:

```css
--brand-navy: #10294c;
--brand-blue: #1a6fd4;
--brand-blue-strong: #1552a3;
--brand-surface: #f6f9fd;
--brand-surface-cool: #eef5fc;
--brand-surface-inner: #f0f6fd;
--brand-border: #dce8f7;
--brand-ink: #10294c;
--brand-muted: #4a6485;
--brand-on-dark: #bfd6f4;
```

Reemplazar los estilos antiguos de `value-pillars-band` y `commercial-band` en `home.css` con:

```css
.home-page {
  --home-content-max: 80rem;
  --home-section-min-height: 36rem;
  --home-accent-min-height: 7.5rem;
  --home-accent-padding: 1.25rem 1.5rem;
  --home-accent-radius: 1rem;
  --home-accent-overlap: 2rem;
  background: var(--brand-surface);
  color: var(--brand-ink);
  isolation: isolate;
}

.home-accent-rail {
  position: relative;
  z-index: 2;
  background: var(--brand-surface);
  padding-inline: 1.5rem;
}

.home-accent-rail--hero-overlap {
  margin-block-start: calc(var(--home-accent-overlap) * -1);
}

.home-accent-rail--footer-overlap {
  margin-block-end: calc(var(--home-accent-overlap) * -1);
}

.home-accent-band {
  width: min(100%, var(--home-content-max));
  min-block-size: var(--home-accent-min-height);
  margin-inline: auto;
  padding: var(--home-accent-padding);
  border-radius: var(--home-accent-radius);
  background:
    radial-gradient(circle at 88% 10%, rgba(255, 255, 255, 0.04), transparent 24%),
    var(--brand-blue);
  box-shadow: 0 1rem 2.25rem rgba(21, 82, 163, 0.22);
  color: #fff;
}

.home-accent-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  min-block-size: calc(var(--home-accent-min-height) - 2.5rem);
}

.home-accent-item {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.75rem;
  padding-inline: 1rem;
}

.home-accent-item + .home-accent-item {
  border-inline-start: 1px solid rgba(255, 255, 255, 0.2);
}

.home-process-grid {
  list-style: none;
  margin: 0;
  padding: 0;
}

.home-process-item {
  position: relative;
  display: grid;
  gap: 0.25rem;
  text-align: center;
}

.home-process-item:not(:last-child)::after {
  content: "→";
  position: absolute;
  inset-inline-end: -0.35rem;
  top: 50%;
  color: var(--brand-on-dark);
  transform: translateY(-50%);
}

.home-process-step {
  color: #fff;
  font-variant-numeric: tabular-nums;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.home-accent-icon {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.625rem;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.home-accent-label {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;
}

.home-accent-cta {
  display: grid;
  grid-template-columns: minmax(0, 2fr) repeat(2, minmax(8.5rem, auto));
  align-items: center;
  min-block-size: calc(var(--home-accent-min-height) - 2.5rem);
  gap: 1rem;
}

.home-accent-cta__copy {
  min-width: 0;
}

.home-accent-cta__copy > * {
  margin: 0;
}

.home-accent-cta__copy h2 {
  margin-block: 0.25rem;
  font-size: clamp(1rem, 1.55vw, 1.25rem);
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.home-accent-cta__copy > p:last-child {
  color: #fff;
  font-size: 0.75rem;
  line-height: 1.45;
}

.home-accent-cta__eyebrow {
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

@media (max-width: 63.999rem) {
  .home-page {
    --home-section-min-height: 32rem;
    --home-accent-min-height: 11rem;
    --home-accent-padding: 1rem 1.25rem;
    --home-accent-radius: 0.875rem;
  }

  .home-accent-rail {
    padding-inline: 1rem;
  }

  .home-accent-grid,
  .home-accent-cta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-block-size: calc(var(--home-accent-min-height) - 2rem);
  }

  .home-accent-cta > :first-child {
    grid-column: 1 / -1;
  }

  .home-process-item:nth-child(2)::after {
    content: none;
  }

  .home-accent-item:nth-child(3) {
    border-inline-start: 0;
  }
}

@media (max-width: 39.999rem) {
  .home-page {
    --home-section-min-height: 30rem;
  }
}
```

- [ ] **Step 7: Actualizar smoke con contratos semánticos**

Añadir el helper:

```js
function assertInOrder(source, markers, label) {
  let previous = -1;
  for (const marker of markers) {
    const current = source.indexOf(marker);
    assert(current >= 0, `${label} missing marker: ${marker}`);
    assert(current > previous, `${label} marker out of order: ${marker}`);
    previous = current;
  }
}
```

Añadir después de cargar `home`:

```js
assertInOrder(home, [
  'data-home-section="hero"',
  'data-home-section="features"',
  'data-home-section="products"',
  'data-home-section="suppliers"',
  'data-home-section="process"',
  'data-home-section="congresses"',
  'data-home-section="multimedia"',
  'data-home-section="cta"',
  "data-site-footer",
], "Home section order");

assert(
  (home.match(/data-home-accent-band/g) ?? []).length === 3,
  "Home should render exactly three shared accent bands",
);

for (const label of [
  "Consulta técnica",
  "Disponibilidad",
  "Coordinación",
  "Acompañamiento",
]) {
  assert(home.includes(label), `Home should render service flow label: ${label}`);
}
```

Reemplazar la aserción antigua de `data-commercial-band="primary"` por:

```js
assert(
  home.includes('data-home-section="cta"') &&
    home.includes('data-home-tone="2"'),
  "Commercial CTA should use the shared accent rhythm",
);
```

- [ ] **Step 8: Verificar y commit**

Run:

```powershell
npm run test:home
npm run check
npm run build
npm run test:smoke
```

Expected: todos PASS; smoke conserva las rutas, datos, enlaces y contenido existentes.

```powershell
git add src/data/site.ts src/pages/index.astro src/styles/global.css src/styles/home.css src/components/Footer.astro scripts/home-redesign.test.mjs scripts/smoke.mjs
git diff --cached --check
git commit -m "feat(home): establish palindromic content flow"
```

---

### Task 3: Rediseñar hero y secciones claras con grillas según contenido

**Files:**

- Modify: `scripts/home-redesign.test.mjs`
- Modify: `src/pages/index.astro:19-317`
- Modify: `src/styles/home.css`
- Modify: `scripts/smoke.mjs:225-276,573-610`

- [ ] **Step 1: Añadir contratos de grilla, contenido y multimedia**

Agregar a `scripts/home-redesign.test.mjs`:

```js
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
```

- [ ] **Step 2: Confirmar que el nuevo contrato falla**

Run:

```powershell
npm run test:home
```

Expected: FAIL con `index.astro should use home-products-grid`.

- [ ] **Step 3: Reemplazar fondos contradictorios y aplicar contenedores comunes**

Cambiar los tags de apertura de productos por:

```astro
<section data-home-section="products" data-home-tone="0" class="home-content-section home-content-section--base">
<div class="home-content-section__inner">
```

Cambiar los tags de apertura de proveedores por:

```astro
<section data-home-section="suppliers" data-home-tone="0" data-suppliers-section class="home-content-section home-content-section--tint">
<div class="home-content-section__inner">
```

Cambiar los tags de apertura de congresos por:

```astro
<section data-home-section="congresses" data-home-tone="0" class="home-content-section home-content-section--base">
<div class="home-content-section__inner">
```

Cambiar los tags de apertura de multimedia por:

```astro
<section data-home-section="multimedia" data-home-tone="0" class="home-content-section home-content-section--tint">
<div class="home-content-section__inner">
```

Los tags de cierre existentes siguen cerrando el nuevo `div` interior y su `section`; no se cambia ningún nodo de contenido en este paso.

Eliminar de esas secciones las utilities o clases contradictorias:

```text
section-dark-gradient
suppliers-section
bg-surface
media-band
text-white en encabezados de secciones claras
text-brand en descripciones de secciones claras
```

Mantener imágenes, textos, enlaces y condiciones actuales.

Agregar `home-section-heading` al contenedor de eyebrow, `h2` y descripción de cada una de las cuatro secciones claras. En productos, conservar el wrapper flex exterior y aplicar la clase al `div` que contiene los textos.

- [ ] **Step 4: Aplicar las grillas aprobadas**

Cambiar las grillas de la home a:

```astro
<div class="home-products-grid">
  {featuredCategories.map((category) => <CatalogCard category={category} compact />)}
</div>

<div class="home-suppliers-grid">
  {supplierSystems.map((item) => (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      class="supplier-brand-card"
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
    </a>
  ))}
  <a
    href={wa.lineaFaltante}
    target="_blank"
    rel="noopener noreferrer"
    class="supplier-brand-card supplier-brand-card-muted group"
  >
    <span class="font-display text-sm font-semibold">Consultar otras líneas</span>
    <Icon name="arrow-right" class="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
  </a>
</div>
```

Cambiar únicamente el tag inicial del artículo existente de congreso por:

```astro
<article class="home-event-card">
```

Su imagen, badge, título, venue, descripción y enlaces permanecen byte por byte.

Cambiar el wrapper y los tags iniciales de multimedia por:

```astro
<div class:list={["home-media-grid", videos.length === 0 && "home-media-grid--single"]}>
<a data-home-media-card="gallery" href="/galeria" class="home-media-card catalog-image-card card-link group">
<a data-home-media-card="videos" href="/videos" class="home-media-card catalog-image-card card-link group">
```

El segundo anchor continúa dentro de `videos.length > 0`; sus imágenes, overlays, títulos, iconos y enlaces no cambian.

- [ ] **Step 5: Consolidar hero, tipografía, superficies y grillas en `home.css`**

Reemplazar los dos overlays inline actuales del hero por un único elemento:

```astro
<div aria-hidden="true" class="home-hero-overlay"></div>
```

Agregar `home-hero-eyebrow`, `home-hero-title` y `home-hero-copy` respectivamente al badge, `h2` y párrafo de cada slide, conservando sus demás utilities.

Reemplazar el fondo antiguo del hero y agregar:

```css
.hero-shell {
  min-block-size: 100dvh;
  background: var(--brand-navy);
  isolation: isolate;
}

.hero-shell::before {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background:
    radial-gradient(circle at 82% 46%, rgba(98, 154, 224, 0.3), transparent 24rem),
    linear-gradient(90deg, rgba(16, 41, 76, 0.18), transparent 65%);
}

.home-hero-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      90deg,
      rgba(16, 41, 76, 0.98) 0%,
      rgba(16, 41, 76, 0.9) 32%,
      rgba(16, 41, 76, 0.48) 60%,
      rgba(16, 41, 76, 0.08) 100%
    );
}

.home-hero-eyebrow {
  border-color: color-mix(in srgb, var(--brand-blue) 42%, transparent);
  background: color-mix(in srgb, var(--brand-blue) 18%, transparent);
}

.home-hero-title {
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.home-hero-copy {
  max-width: 62ch;
  color: var(--brand-on-dark);
  text-wrap: pretty;
}

.home-page .btn-primary,
.home-page .btn-primary-soft {
  background: var(--brand-blue);
}

.home-page .link-primary-soft {
  color: var(--brand-blue-strong);
}

.hero-bg-slide {
  backface-visibility: hidden;
  opacity: 0;
  transform: scale(1.015);
  transition:
    opacity 360ms var(--ease-out),
    transform 900ms var(--ease-out);
}

.hero-bg-slide[data-active="true"] {
  opacity: 1;
  transform: scale(1);
}

.hero-slide {
  opacity: 0;
  transform: translateY(0.5rem);
  visibility: hidden;
  transition:
    opacity 300ms var(--ease-out),
    transform 300ms var(--ease-out),
    visibility 0s linear 300ms;
}

.hero-slide[data-active="true"] {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
  transition-delay: 0s;
}

.hero-dot[aria-pressed="true"] {
  background: var(--brand-blue);
}

.home-content-section {
  min-block-size: var(--home-section-min-height);
  background: var(--brand-surface);
  color: var(--brand-ink);
}

.home-content-section--tint {
  background: linear-gradient(
    180deg,
    var(--brand-surface),
    var(--brand-surface-cool)
  );
}

.home-content-section__inner {
  width: min(calc(100% - 3rem), var(--home-content-max));
  min-block-size: inherit;
  margin-inline: auto;
  padding-block: clamp(3rem, 6vw, 4.5rem);
}

.home-section-heading {
  max-width: 42rem;
}

.home-section-heading h2 {
  color: var(--brand-ink);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.home-section-heading p {
  max-width: 62ch;
  color: var(--brand-muted);
  line-height: 1.7;
  text-wrap: pretty;
}

.home-products-grid,
.home-suppliers-grid,
.home-media-grid {
  display: grid;
  gap: 1.25rem;
  margin-block-start: 2rem;
}

.home-products-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.home-products-grid .catalog-image-card {
  min-block-size: 18rem;
}

.home-suppliers-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.supplier-brand-card {
  display: grid;
  min-block-size: 7rem;
  place-items: center;
  padding: 1rem;
  border: 1px solid var(--brand-border);
  border-radius: 0.875rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 1rem 2rem -1.75rem rgba(16, 41, 76, 0.72);
  transition:
    transform 200ms var(--ease-out),
    border-color 200ms var(--ease-out),
    box-shadow 200ms var(--ease-out);
}

.supplier-brand-card-muted {
  display: flex;
  grid-column: 1 / -1;
  min-block-size: 4.5rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--brand-surface-inner);
}

.supplier-logo {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  filter: none;
}

.home-event-card {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  overflow: hidden;
  margin-block-start: 2rem;
  border: 1px solid var(--brand-border);
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 1.5rem 3rem -2.5rem rgba(16, 41, 76, 0.58);
}

.home-media-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.home-media-grid--single {
  grid-template-columns: minmax(0, 1fr);
}

.home-media-card {
  position: relative;
  display: flex;
  overflow: hidden;
  min-block-size: 18rem;
  flex-direction: column;
  justify-content: flex-end;
  border-color: var(--brand-border);
  border-radius: 1rem;
  background: var(--brand-navy);
}

@media (max-width: 63.999rem) {
  .home-content-section__inner {
    width: min(calc(100% - 2rem), var(--home-content-max));
  }

  .home-products-grid,
  .home-suppliers-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-event-card {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 39.999rem) {
  .home-products-grid,
  .home-media-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 22.5rem) {
  .home-suppliers-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (hover: hover) and (pointer: fine) {
  .home-page .btn-primary:hover,
  .home-page .btn-primary-soft:hover {
    background: var(--brand-blue-strong);
    box-shadow: 0 0.75rem 1.75rem -1rem rgba(21, 82, 163, 0.72);
    transform: translateY(-0.125rem);
  }

  .home-page .link-primary-soft:hover {
    color: var(--brand-blue);
    opacity: 0.82;
  }

  .supplier-brand-card:hover,
  .home-media-card:hover {
    border-color: color-mix(in srgb, var(--brand-blue) 42%, var(--brand-border));
    box-shadow: 0 1.25rem 2.5rem -2rem rgba(16, 41, 76, 0.68);
    transform: translateY(-0.125rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-bg-slide,
  .hero-slide,
  .supplier-brand-card,
  .home-media-card {
    transition-duration: 0.01ms;
  }
}
```

- [ ] **Step 6: Reforzar smoke para multimedia y eliminar contratos decorativos viejos**

Agregar:

```js
const expectedHomeMediaCards = hasSyncedVideos ? 2 : 1;
assert(
  (home.match(/data-home-media-card(?=[\s=>])/g) ?? []).length ===
    expectedHomeMediaCards,
  "Home multimedia should render gallery plus videos only when available",
);
assert(
  home.includes('data-home-media-card="gallery"'),
  "Home should always render gallery media",
);
assert(
  home.includes('data-home-media-card="videos"') === hasSyncedVideos,
  "Home should render video media only with synchronized videos",
);
assert(
  /<article\b[^>]*data-hero-slide[^>]*data-active="true"[^>]*aria-hidden="false"/.test(home),
  "Home should expose a readable first hero slide without JavaScript",
);
```

Eliminar las aserciones que exigen `btn-primary-soft`, `link-primary-soft`, `btn-glass-outline`, el gradiente viejo exacto del hero y la prohibición global de tracking negativo. Sustituirlas por:

```js
assert(
  /\.hero-shell\s*{[\s\S]*min-block-size:\s*100dvh/.test(homeCss),
  "Home hero should use the dynamic viewport as its minimum height",
);
assert(
  /\.home-section-heading h2\s*{[\s\S]*letter-spacing:\s*-0\.025em/.test(homeCss),
  "Home display headings should use restrained negative tracking",
);
assert(
  !/letter-spacing:\s*-(?:0\.[3-9]|[1-9])/.test(homeCss),
  "Home should not use extreme negative tracking",
);
```

- [ ] **Step 7: Verificar y commit**

Run:

```powershell
npm run test:home
npm run test:header
npm run check
npm run build
npm run test:smoke
```

Expected: todos PASS; `index.html` conserva tres slides, seis categorías, cuatro proveedores, el evento y la condición de videos.

```powershell
git add src/pages/index.astro src/styles/home.css scripts/home-redesign.test.mjs scripts/smoke.mjs
git diff --cached --check
git commit -m "feat(home): redesign content surfaces and grids"
```

---

### Task 4: Integrar header/footer y eliminar CSS obsoleto de forma verificable

**Files:**

- Modify: `scripts/home-redesign.test.mjs`
- Modify: `scripts/header-shrink.test.mjs`
- Modify: `src/styles/global.css`
- Modify: `src/components/Footer.astro`
- Modify: `scripts/smoke.mjs:549-610`

- [ ] **Step 1: Añadir pruebas de preservación y limpieza**

Reemplazar `homeOnlySelectors` en `scripts/home-redesign.test.mjs` por la lista de selectores exclusivos que siguen vigentes:

```js
const homeOnlySelectors = [
  ".hero-bg-slide",
  ".hero-shell",
  ".supplier-brand-card",
  ".hero-slide",
  ".hero-dot",
];
```

Agregar a `scripts/home-redesign.test.mjs`:

```js
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
```

Agregar a `scripts/header-shrink.test.mjs`:

```js
test("keeps internal pages collapsed independently of scroll position", () => {
  const state = headerShrinkModule.computeHeaderVisualState({
    isHome: false,
    reducedMotion: false,
    rootFontSize: 16,
    scrollY: 0,
    viewportHeight: 1000,
    viewportWidth: 1440,
  });

  assert.deepEqual(
    {
      shrink: state.shrink,
      headerHeight: state.headerHeight,
      logoSize: state.logoSize,
    },
    {
      shrink: 1,
      headerHeight: 72,
      logoSize: 44,
    },
  );
});
```

Dentro del test existente de wiring, añadir:

```js
assert.match(
  headerSource,
  /window\.addEventListener\("scroll",\s*syncHeaderFrame,\s*{\s*passive:\s*true\s*}\)/,
);
assert.match(headerSource, /window\.requestAnimationFrame\(/);
assert.match(
  headerSource,
  /isHomeHeader\s*&&\s*visualState\.shrink\s*===\s*0\s*&&\s*!menuOpen/,
);
```

- [ ] **Step 2: Ejecutar el test de limpieza y confirmar el fallo esperado**

Run:

```powershell
npm run test:home
npm run test:header
```

Expected: `test:home` FAIL por `--ease-in-out` y selectores antiguos; `test:header` PASS sin modificar `header-shrink.mjs`.

- [ ] **Step 3: Limpiar únicamente reglas confirmadas**

En `global.css`:

- Eliminar `--ease-in-out`, que no tiene consumidores.
- Eliminar de `.btn-primary-soft:hover` el `background-color` que repite el estado base.
- Eliminar de `.link-primary-soft:hover` el `color` que repite el estado base y conservar `opacity: 1`.
- Reemplazar los literales del header y footer dentro del alcance por `--brand-navy`, `--brand-on-dark`, `--brand-blue` y `--brand-border`.
- Mantener todas las reglas compartidas enumeradas en Task 1.

En `.site-header`, sustituir únicamente color de fondo y borde por:

```css
background-color: rgb(16 41 76 / var(--header-background-alpha));
border-color: rgb(98 154 224 / var(--header-border-alpha));
```

En el estado de menú abierto usar:

```css
background-color: rgb(16 41 76 / 0.94);
border-color: rgb(98 154 224 / 0.18);
```

Agregar:

```css
.site-header .nav-link::after {
  background: var(--brand-blue);
}

.site-header .btn-primary {
  background: var(--brand-blue);
}
```

En `home.css`, eliminar completamente:

```text
.section-dark-gradient
.suppliers-section
.commercial-band
.media-band
.value-pillars-band
.value-pillar-card
.value-pillar-icon
.value-pillar-label
```

No eliminar sus reemplazos `.home-content-section`, `.home-accent-rail` y `.home-accent-band`.

- [ ] **Step 4: Integrar el footer sin alterar sus datos**

Cambiar únicamente estos tres tags de apertura en `Footer.astro`:

```astro
<footer data-site-footer data-home-tone="1" class="site-footer relative overflow-hidden">
```

```astro
<div class="site-footer__grid relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
```

```astro
<div class="site-footer__legal border-t">
```

Agregar a `global.css`:

```css
.site-footer {
  background: var(--brand-navy);
  color: var(--brand-on-dark);
}

main:has([data-home-section="cta"]) + .site-footer .site-footer__grid {
  padding-block-start: 5.5rem;
}

.site-footer__legal {
  border-color: rgba(191, 214, 244, 0.14);
}

.footer-link {
  color: var(--brand-on-dark);
}

@media (hover: hover) and (pointer: fine) {
  .footer-link:hover {
    color: #fff;
    opacity: 1;
    transform: translateX(0.125rem);
  }
}
```

El selector relacional agrega espacio únicamente cuando el footer sigue a una home con CTA; las páginas internas mantienen su padding actual.

- [ ] **Step 5: Actualizar smoke sin congelar colores decorativos**

Conservar las aserciones funcionales del header de las líneas actuales 566-572. Eliminar las que exigen:

```text
gradiente exacto de .btn-primary
hover idéntico de .btn-primary-soft
hover idéntico de .link-primary-soft
color viejo de .footer-link:hover
hex exactos --primary, --primary-glow, --background, --surface y --surface-2
```

Agregar:

```js
assert(
  /--brand-navy:\s*#10294c/i.test(globalCss),
  "Shared chrome should expose the approved navy token",
);
assert(
  /--brand-blue:\s*#1a6fd4/i.test(globalCss),
  "Home accents should expose one approved blue token",
);
assert(
  /\.site-footer\s*{[\s\S]*background:\s*var\(--brand-navy\)/.test(globalCss),
  "Footer should close the home with the approved navy",
);
assert(
  /\.footer-link:hover\s*{[\s\S]*color:\s*#fff/.test(globalCss),
  "Footer links should use a high-contrast hover",
);
assert(
  !/\.btn-primary-soft:hover\s*{[^}]*background-color:/s.test(globalCss),
  "Soft primary hover should not repeat its base background",
);
```

- [ ] **Step 6: Verificar y commit**

Run:

```powershell
npm run test:home
npm run test:header
npm run check
npm run build
npm run test:smoke
```

Expected: todos PASS; los tests del header mantienen 150→111→72 px en desktop y 88→72 px en mobile.

```powershell
git add src/styles/global.css src/styles/home.css src/components/Footer.astro scripts/home-redesign.test.mjs scripts/header-shrink.test.mjs scripts/smoke.mjs
git diff --cached --check
git commit -m "refactor(styles): remove superseded home rules"
```

---

### Task 5: Verificar geometría y responsive con navegador real

**Files:**

- Create: `scripts/verify-home-layout.mjs`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `src/styles/home.css`: reglas responsive ejercidas por el nuevo verificador

- [ ] **Step 1: Crear el verificador de layout**

Crear `scripts/verify-home-layout.mjs`:

```js
import assert from "node:assert/strict";
import { preview } from "astro";
import { chromium } from "playwright";

const root = new URL("../", import.meta.url);
const server = await preview({
  root,
  logLevel: "silent",
  server: {
    host: "127.0.0.1",
    port: 0,
  },
});

const browser = await chromium.launch();
const baseUrl = `http://127.0.0.1:${server.port}`;

const cases = [
  {
    name: "desktop",
    viewport: { width: 1440, height: 1000 },
    columns: { products: 3, suppliers: 4, media: 2 },
    equalRenderedHeight: true,
    sectionMinHeight: "576px",
  },
  {
    name: "tablet",
    viewport: { width: 768, height: 900 },
    columns: { products: 2, suppliers: 2, media: 2 },
    equalRenderedHeight: true,
    sectionMinHeight: "512px",
  },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
    columns: { products: 1, suppliers: 2, media: 1 },
    equalRenderedHeight: false,
    sectionMinHeight: "480px",
  },
  {
    name: "minimum",
    viewport: { width: 320, height: 720 },
    columns: { products: 1, suppliers: 1, media: 1 },
    equalRenderedHeight: false,
    sectionMinHeight: "480px",
  },
];

function assertSameBandGeometry(metrics, name, equalRenderedHeight) {
  assert.equal(metrics.length, 3, `${name}: expected three accent bands`);
  const [first, ...rest] = metrics;

  for (const metric of rest) {
    assert.deepEqual(
      {
        width: metric.width,
        minHeight: metric.minHeight,
        padding: metric.padding,
        radius: metric.radius,
        backgroundImage: metric.backgroundImage,
        backgroundColor: metric.backgroundColor,
      },
      {
        width: first.width,
        minHeight: first.minHeight,
        padding: first.padding,
        radius: first.radius,
        backgroundImage: first.backgroundImage,
        backgroundColor: first.backgroundColor,
      },
      `${name}: accent bands should share computed geometry`,
    );

    if (equalRenderedHeight) {
      assert.equal(
        metric.height,
        first.height,
        `${name}: accent bands should share rendered height`,
      );
    }
  }
}

try {
  for (const testCase of cases) {
    const context = await browser.newContext({
      viewport: testCase.viewport,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    assert.ok(
      overflow <= 0,
      `${testCase.name}: horizontal overflow is ${overflow}px`,
    );

    const metrics = await page
      .locator("[data-home-accent-band]")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
            minHeight: style.minHeight,
            padding: style.padding,
            radius: style.borderRadius,
            backgroundImage: style.backgroundImage,
            backgroundColor: style.backgroundColor,
          };
        }),
      );
    assertSameBandGeometry(
      metrics,
      testCase.name,
      testCase.equalRenderedHeight,
    );

    const sectionMinHeights = await page
      .locator(
        [
          '[data-home-section="products"]',
          '[data-home-section="suppliers"]',
          '[data-home-section="congresses"]',
          '[data-home-section="multimedia"]',
        ].join(","),
      )
      .evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).minHeight),
      );
    assert.deepEqual(
      sectionMinHeights,
      Array(4).fill(testCase.sectionMinHeight),
      `${testCase.name}: clear sections should share one minimum height`,
    );

    for (const [section, expected] of Object.entries(testCase.columns)) {
      const actual = await page
        .locator(`.home-${section}-grid`)
        .evaluate((element) => {
          const columns = getComputedStyle(element).gridTemplateColumns;
          return columns.split(" ").filter(Boolean).length;
        });
      assert.equal(
        actual,
        expected,
        `${testCase.name}: ${section} grid column count`,
      );
    }

    const header = page.locator("[data-site-header]");
    const expandedHeight = await header.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const collapsedHeight = await header.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    assert.ok(
      collapsedHeight < expandedHeight,
      `${testCase.name}: header should shrink after scrolling`,
    );

    await context.close();
  }

  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const transitionDuration = await reducedPage
    .locator("[data-hero-slide]")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  const transitionMilliseconds = transitionDuration
    .split(",")
    .map((value) => value.trim())
    .map((value) =>
      value.endsWith("ms")
        ? Number.parseFloat(value)
        : Number.parseFloat(value) * 1000,
    );
  assert.ok(
    transitionMilliseconds.every((value) => value <= 0.01),
    `reduced motion transition should be <= 0.01ms, got ${transitionDuration}`,
  );
  await reducedContext.close();

  console.log("Home layout verification passed.");
} finally {
  await browser.close();
  await server.stop();
}
```

- [ ] **Step 2: Conectar el verificador y el comando agregado**

Agregar a `package.json`:

```json
"verify:home-layout": "node scripts/verify-home-layout.mjs",
"verify:frontend": "npm run test:home && npm run test:header && npm run check && npm run build && npm run test:smoke && npm run verify:home-layout"
```

Añadir a la sección de verificación de `README.md`:

```markdown
npm run test:home
npm run test:header
npm run verify:home-layout
npm run verify:frontend
```

- [ ] **Step 3: Ejecutar la verificación computada**

Run:

```powershell
npm run build
npm run verify:home-layout
```

Expected:

```text
Home layout verification passed.
```

El test debe comprobar 1440, 768, 390 y 320 px, tokens geométricos iguales en las tres bandas, altura renderizada idéntica en desktop/tablet, grillas esperadas, ausencia de overflow, navbar expandida/compacta y reduced motion. En mobile se compara la misma altura mínima, padding, radio y ancho, pero el contenido puede ampliar una banda para evitar recortes.

- [ ] **Step 4: Commit**

```powershell
git add scripts/verify-home-layout.mjs package.json README.md src/styles/home.css
git diff --cached --check
git commit -m "test(home): verify responsive layout geometry"
```

---

### Task 6: Verificación integral y revisión visual final

**Files:**

- Verify only unless a regression requires a focused fix in a file already listed above.

- [ ] **Step 1: Ejecutar la suite rápida del frontend**

Run:

```powershell
npm run verify:frontend
```

Expected: `test:home`, `test:header`, `check`, `build`, `test:smoke` y `verify:home-layout` terminan con exit code 0.

- [ ] **Step 2: Ejecutar las regresiones existentes del repositorio**

Run:

```powershell
npm run test:cloudinary
npm run verify:cloudinary-video-audio
npm run test:video-player
npm audit --omit=dev
```

Expected: tests y verificadores PASS. Registrar el resultado exacto de audit; una vulnerabilidad preexistente se documenta y no autoriza cambios de dependencias dentro de este rediseño.

- [ ] **Step 3: Revisar visualmente la home en navegador**

Abrir el build local y comprobar:

```text
1440×1000: hero, 3/4/1/2 columnas y bandas de 7.5rem.
768×900: grillas 2/2/1/2 y bandas de 11rem.
390×844: grillas 1/2/1/1 sin overflow.
320×720: todas las secciones sin texto recortado.
Zoom del navegador al 200 % en 1440 px: lectura completa y sin controles superpuestos.
Scroll 0→200: navbar grande a compacta sin flash blanco.
Reduced motion: hero y navbar sin animación continua.
Teclado: foco visible en nav, controles del hero, cards y CTAs.
Contraste: texto secundario sobre superficies claras y texto de las bandas cumple WCAG AA.
```

También abrir `/catalogos`, `/galeria`, `/contacto` y `/eventos` en 1440 y 390 px para comprobar que header, footer y componentes compartidos mantienen legibilidad y funcionalidad.

- [ ] **Step 4: Confirmar preservación de datos y ausencia de código obsoleto**

Run:

```powershell
rg -n "12 años|40\\+ instituciones|24 h" src
rg -n "section-dark-gradient|suppliers-section|commercial-band|media-band|value-pillars-band" src
rg -n -- "--ease-in-out" src
git diff --check
git status --short
```

Expected:

```text
Los tres rg no encuentran coincidencias.
git diff --check no imprime errores.
git status --short no imprime cambios pendientes.
```

- [ ] **Step 5: Entregar el resultado**

Informar:

- Archivos modificados y responsabilidad de cada uno.
- Commit hashes de cada tarea.
- Resultado exacto de `verify:frontend` y suites existentes.
- Resoluciones verificadas.
- Cualquier limitación real encontrada, sin presentar una comprobación pendiente como aprobada.
