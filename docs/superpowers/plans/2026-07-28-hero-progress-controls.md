# Hero Progress Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar los indicadores actuales del hero por navegación anterior/siguiente, progreso circular sincronizado y play/pause separado.

**Architecture:** El carrusel seguirá contenido en `index.astro`, sin modificar sus datos ni la navbar. Un único estado temporal conservará los milisegundos restantes y alimentará tanto el cambio automático como el `stroke-dashoffset` del aro, evitando dos relojes independientes.

**Tech Stack:** Astro 6, TypeScript del cliente, CSS nativo, Node test runner y Playwright 1.61.

---

## Mapa de archivos

- Modify: `scripts/home-redesign.test.mjs` — contrato estático del control.
- Modify: `scripts/verify-home-layout.mjs` — interacción real, progreso y reduced motion.
- Modify: `src/pages/index.astro` — markup y estado temporal del carrusel.
- Modify: `src/styles/home.css` — cápsula, indicadores, aro y responsive.

No se crearán componentes, dependencias ni nuevos datos.

### Task 1: Fijar estructura y comportamiento con pruebas

**Files:**

- Modify: `scripts/home-redesign.test.mjs`
- Modify: `scripts/verify-home-layout.mjs`

- [x] **Step 1: Añadir el contrato estático**

Agregar a `scripts/home-redesign.test.mjs`:

```js
test("defines accessible hero navigation with synchronized progress", () => {
  for (const hook of [
    "data-hero-previous",
    "data-hero-next",
    "data-hero-progress-ring",
    "data-hero-autoplay",
  ]) {
    assert.ok(indexSource.includes(hook), `missing hero control: ${hook}`);
  }

  assert.match(indexSource, /aria-label="Slide anterior"/);
  assert.match(indexSource, /aria-label="Slide siguiente"/);
  assert.match(indexSource, /pathLength="100"/);
  assert.match(homeCss, /\.hero-carousel-nav\s*\{[^}]*background:/s);
  assert.match(
    homeCss,
    /\.hero-dot__progress-circle\s*\{[^}]*stroke-dashoffset:\s*var\(--hero-progress-offset,\s*100\)/s,
  );
});
```

- [x] **Step 2: Añadir la verificación de navegador**

Antes del contexto de reduced motion en `scripts/verify-home-layout.mjs`, crear
un contexto `heroControlContext` de `1440 × 1000` y verificar:

```js
const heroControlContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
});
const heroControlPage = await heroControlContext.newPage();
await heroControlPage.goto(baseUrl, { waitUntil: "domcontentloaded" });

const heroDots = heroControlPage.locator("[data-hero-dot]");
const activeDotIndex = async () =>
  heroDots.evaluateAll((elements) =>
    elements.findIndex(
      (element) => element.getAttribute("aria-pressed") === "true",
    ),
  );

await heroControlPage.locator("[data-hero-next]").click();
assert.equal(await activeDotIndex(), 1, "next selects the following slide");
await heroControlPage.locator("[data-hero-previous]").click();
assert.equal(await activeDotIndex(), 0, "previous returns to the first slide");
await heroControlPage.locator("[data-hero-previous]").click();
assert.equal(await activeDotIndex(), 2, "previous wraps to the last slide");
await heroDots.nth(0).click();

const autoplay = heroControlPage.locator("[data-hero-autoplay]");
if ((await autoplay.getAttribute("aria-label")) === "Reanudar rotación automática") {
  await autoplay.click();
}
await heroControlPage.waitForTimeout(250);
const offsetWhilePlaying = Number.parseFloat(
  await heroDots.nth(0).evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--hero-progress-offset"),
  ),
);
await autoplay.click();
const offsetAtPause = Number.parseFloat(
  await heroDots.nth(0).evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--hero-progress-offset"),
  ),
);
await heroControlPage.waitForTimeout(250);
const offsetAfterPause = Number.parseFloat(
  await heroDots.nth(0).evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--hero-progress-offset"),
  ),
);
assert.ok(offsetWhilePlaying < 100, "progress advances while playing");
assert.ok(
  Math.abs(offsetAfterPause - offsetAtPause) < 0.5,
  "progress freezes while paused",
);
await autoplay.click();
await heroControlPage.waitForTimeout(250);
const offsetAfterResume = Number.parseFloat(
  await heroDots.nth(0).evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--hero-progress-offset"),
  ),
);
assert.ok(offsetAfterResume < offsetAfterPause, "progress resumes without reset");
await heroControlContext.close();
```

En el contexto `reducedContext` existente, comprobar además:

```js
const reducedDots = reducedPage.locator("[data-hero-dot]");
const reducedOffsetBefore = Number.parseFloat(
  await reducedDots.nth(0).evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--hero-progress-offset"),
  ),
);
await reducedPage.waitForTimeout(250);
const reducedOffsetAfter = Number.parseFloat(
  await reducedDots.nth(0).evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--hero-progress-offset"),
  ),
);
assert.equal(
  reducedOffsetAfter,
  reducedOffsetBefore,
  "reduced motion keeps progress static",
);
await reducedPage.locator("[data-hero-next]").click();
assert.equal(
  await reducedDots.nth(1).getAttribute("aria-pressed"),
  "true",
  "reduced motion keeps manual navigation available",
);
```

- [x] **Step 3: Verificar RED**

Run:

```powershell
npm run test:home
```

Expected: FAIL con `missing hero control: data-hero-previous`.

### Task 2: Construir el control visual

**Files:**

- Modify: `src/pages/index.astro:79-102`
- Modify: `src/styles/home.css:97-117,718-720`

- [x] **Step 1: Reemplazar el markup de controles**

Dentro de `.hero-dot-controls`, renderizar esta estructura:

```astro
<div class="hero-carousel-controls">
  <div class="hero-carousel-nav" role="group" aria-label="Navegación del hero">
    <button type="button" data-hero-previous class="hero-carousel-arrow" aria-label="Slide anterior">
      <Icon name="chevron-left" class="h-4 w-4" />
    </button>
    <div class="hero-carousel-dots">
      {heroSlides.map((slide, index) => (
        <button
          type="button"
          data-hero-dot
          data-index={index}
          aria-label={`Ver ${slide.title}`}
          aria-pressed={index === 0 ? "true" : "false"}
          class="hero-dot"
        >
          <span class="hero-dot__visual" aria-hidden="true">
            <svg class="hero-dot__progress" viewBox="0 0 24 24">
              <circle
                data-hero-progress-ring
                class="hero-dot__progress-circle"
                cx="12"
                cy="12"
                r="9"
                pathLength="100"
              />
            </svg>
            <span class="hero-dot__core"></span>
          </span>
        </button>
      ))}
    </div>
    <button type="button" data-hero-next class="hero-carousel-arrow" aria-label="Slide siguiente">
      <Icon name="chevron-right" class="h-4 w-4" />
    </button>
  </div>
  <button
    type="button"
    data-hero-autoplay
    aria-pressed="false"
    aria-label="Pausar rotación automática"
    class="hero-autoplay-toggle"
  >
    <span data-hero-pause-icon><Icon name="pause" class="h-3.5 w-3.5" /></span>
    <span data-hero-play-icon class="hidden"><Icon name="play" class="h-3.5 w-3.5" /></span>
  </button>
</div>
```

- [x] **Step 2: Aplicar la cápsula y el aro**

Sustituir las reglas anteriores de `.hero-dot` por:

```css
.hero-carousel-controls,
.hero-carousel-nav,
.hero-carousel-dots {
  display: flex;
  align-items: center;
}

.hero-carousel-controls {
  gap: 0.5rem;
}

.hero-carousel-nav {
  gap: 0.125rem;
  padding: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(7, 22, 42, 0.72);
  box-shadow: 0 1rem 2.5rem -1.75rem rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
}

.hero-carousel-arrow,
.hero-autoplay-toggle,
.hero-dot {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  flex: 0 0 auto;
  color: #fff;
}

.hero-carousel-arrow,
.hero-dot {
  padding: 0;
  border: 0;
  background: transparent;
}

.hero-carousel-arrow,
.hero-autoplay-toggle {
  border-radius: 50%;
  transition:
    background-color 180ms var(--ease-out),
    transform 180ms var(--ease-out);
}

.hero-autoplay-toggle {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(7, 22, 42, 0.72);
  backdrop-filter: blur(12px);
}

.hero-dot__visual {
  position: relative;
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
}

.hero-dot__progress {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform: rotate(-90deg);
}

.hero-dot__progress-circle {
  fill: none;
  stroke: #fff;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 100;
  stroke-dashoffset: var(--hero-progress-offset, 100);
  opacity: 0;
}

.hero-dot__core {
  width: 0.625rem;
  height: 0.625rem;
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.hero-dot[aria-pressed="true"] .hero-dot__core {
  border-color: #fff;
  background: #fff;
}

.hero-dot[aria-pressed="true"] .hero-dot__progress-circle {
  opacity: 1;
}
```

En hover de puntero fino, dar fondo `rgba(255,255,255,0.12)` a flechas y
play/pause. En `max-width: 39.999rem`, reducir `.hero-carousel-controls` a
`gap: 0.375rem` y los tres botones a `2.5rem`, manteniendo el objetivo mínimo.
Agregar `.hero-carousel-arrow` y `.hero-autoplay-toggle` al bloque existente de
`prefers-reduced-motion` para reducir sus transiciones a `0.01ms`.

- [x] **Step 3: Verificar GREEN estructural**

Run:

```powershell
npm run test:home
```

Expected: 9 tests PASS.

### Task 3: Sincronizar temporizador y progreso

**Files:**

- Modify: `src/pages/index.astro:389-486`

- [x] **Step 1: Incorporar controles y estado temporal**

Consultar:

```ts
const previousButton = carousel.querySelector("[data-hero-previous]");
const nextButton = carousel.querySelector("[data-hero-next]");
```

Añadir:

```ts
let remainingMs = AUTO_ADVANCE_MS;
let startedAt = 0;
let progressFrame: number | undefined;

const currentRemaining = (now = performance.now()) =>
  timer === undefined
    ? remainingMs
    : Math.max(0, remainingMs - (now - startedAt));

const paintProgress = (now = performance.now()) => {
  const progress = 1 - currentRemaining(now) / AUTO_ADVANCE_MS;
  dots.forEach((dot, dotIndex) => {
    if (dot instanceof HTMLElement) {
      const offset = dotIndex === active ? 100 - progress * 100 : 100;
      dot.style.setProperty("--hero-progress-offset", offset.toFixed(3));
    }
  });
};

const tickProgress = (now: number) => {
  paintProgress(now);
  if (timer !== undefined) {
    progressFrame = window.requestAnimationFrame(tickProgress);
  } else {
    progressFrame = undefined;
  }
};
```

- [x] **Step 2: Reemplazar el intervalo por pausa reanudable**

Reemplazar `stopAuto` y la programación de `syncAuto` por:

```ts
const stopAuto = (preserveProgress = true) => {
  if (timer !== undefined) {
    if (preserveProgress) remainingMs = currentRemaining();
    window.clearTimeout(timer);
    timer = undefined;
  }
  if (progressFrame !== undefined) {
    window.cancelAnimationFrame(progressFrame);
    progressFrame = undefined;
  }
  paintProgress();
};

const startAuto = () => {
  startedAt = performance.now();
  timer = window.setTimeout(() => {
    timer = undefined;
    remainingMs = AUTO_ADVANCE_MS;
    setActive(active + 1);
    syncAuto();
  }, remainingMs);
  if (progressFrame === undefined) {
    progressFrame = window.requestAnimationFrame(tickProgress);
  }
};

function syncAuto() {
  const playing = isPlaying();
  if (playing && timer === undefined) startAuto();
  if (!playing) {
    if (timer !== undefined) stopAuto(true);
    else paintProgress();
  }
  syncButton(playing);
}

const selectSlide = (index: number) => {
  stopAuto(false);
  remainingMs = AUTO_ADVANCE_MS;
  setActive(index);
  paintProgress();
  syncAuto();
};
```

Definir `syncAuto` como `function syncAuto() { ... }` o declararlo antes de
`startAuto` para evitar una referencia antes de inicialización.

- [x] **Step 3: Conectar flechas e indicadores**

```ts
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => selectSlide(index));
});
previousButton?.addEventListener("click", () => selectSlide(active - 1));
nextButton?.addEventListener("click", () => selectSlide(active + 1));
```

Mantener intactas las reglas de prioridad manual, hover, viewport y
`prefers-reduced-motion`, haciendo que todas llamen a `syncAuto`. Antes del
`syncAuto()` inicial, ejecutar `paintProgress()` para que el estado estático
también quede expuesto desde el primer frame.

- [x] **Step 4: Verificar comportamiento**

Run:

```powershell
npm run build
npm run verify:home-layout
```

Expected: build completo y `Home editorial layout verification passed.`

### Task 4: Pulido y cierre

**Files:**

- Modify: `src/styles/home.css`
- Verify: `src/pages/index.astro`
- Verify: `scripts/home-redesign.test.mjs`
- Verify: `scripts/verify-home-layout.mjs`

- [x] **Step 1: Revisar visualmente**

Capturar el control a `1440 × 1000`, `390 × 844` y con hover. Confirmar que:

- no tapa el contenido;
- no produce overflow;
- los tres aros y ambas flechas se distinguen;
- play/pause permanece separado;
- el progreso avanza, se congela y continúa.

- [x] **Step 2: Ejecutar verificación focalizada**

```powershell
git diff --check
npm run test:home
npm run check
npm run build
npm run verify:home-layout
```

Expected: todos los comandos finalizan con código `0`, Astro informa cero
diagnósticos y Playwright no detecta overflow.

- [x] **Step 3: Commit**

```powershell
git add scripts/home-redesign.test.mjs scripts/verify-home-layout.mjs src/pages/index.astro src/styles/home.css docs/superpowers/plans/2026-07-28-hero-progress-controls.md
git diff --cached --check
git commit -m "feat(home): add timed hero navigation"
```
