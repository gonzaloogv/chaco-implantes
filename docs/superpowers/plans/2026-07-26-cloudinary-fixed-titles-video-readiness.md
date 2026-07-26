# Cloudinary Fixed Titles and Video Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar títulos fijos para eventos y videos instrumentales, y comprobar que cada MP4 de Cloudinary esté listo antes de reemplazar el manifiesto.

**Architecture:** `cloudinary-media.mjs` seguirá construyendo el manifiesto y aplicará dos opciones de configuración explícitas: `fixedImageTitle` y `fixedVideoTitle`. Un módulo nuevo y aislado comprobará las URLs de video mediante solicitudes de rango, reintentará respuestas `423` y permitirá que `runSync` conserve el manifiesto anterior ante cualquier fallo.

**Tech Stack:** Node.js 22, `node:test`, Fetch API nativa, Astro 6, manifiesto JSON estático.

---

### Task 1: Aplicar títulos fijos desde la configuración

**Files:**
- Modify: `scripts/cloudinary-folders.config.mjs`
- Modify: `scripts/cloudinary-media.mjs`
- Test: `scripts/cloudinary-media.test.mjs`
- Test: `scripts/sync-cloudinary.test.mjs`

- [ ] **Step 1: Escribir pruebas fallidas para las opciones nuevas**

Agregar a las fuentes de prueba:

```js
{
  path: "chaco-implantes/stand",
  imageCategory: "Eventos",
  videoCategory: "Eventos",
  fixedImageTitle: "61° Congreso Traumatología",
}

{
  path: "chaco-implantes/cajas",
  imageCategory: "Instrumental",
  videoCategory: "Instrumental",
  unnamedImageLabel: "Producto instrumental",
  fixedVideoTitle: "Producto instrumental",
}
```

Agregar una prueba que confirme que un título fijo vacío o de tipo incorrecto
se rechaza, y que `fixedImageTitle` no puede convivir con
`unnamedImageLabel` en la misma fuente.

Agregar una prueba de `buildManifest` con texto editorial para la imagen de
`stand` y `display_name` técnico para un video de `cajas`:

```js
assert.deepEqual(
  {
    title: manifest.images[0].title,
    alt: manifest.images[0].alt,
  },
  {
    title: "61° Congreso Traumatología",
    alt: "61° Congreso Traumatología",
  },
);
assert.equal(manifest.videos[0].title, "Producto instrumental");
```

- [ ] **Step 2: Ejecutar las pruebas y comprobar el fallo esperado**

Run:

```text
node --test scripts/cloudinary-media.test.mjs scripts/sync-cloudinary.test.mjs
```

Expected: FAIL porque `validateCloudinaryConfig` todavía elimina
`fixedImageTitle` y `fixedVideoTitle`, y `buildManifest` conserva los títulos
técnicos o editoriales.

- [ ] **Step 3: Implementar validación y aplicación mínima**

En `validateCloudinaryConfig`, normalizar ambos campos como texto opcional no
vacío:

```js
function normalizeOptionalTextOption(source, fieldName) {
  if (source[fieldName] === undefined) return undefined;
  if (
    typeof source[fieldName] !== "string" ||
    source[fieldName].trim().length === 0
  ) {
    throw new Error(
      `${fieldName} debe ser texto no vacío para ${source.path}.`,
    );
  }
  return source[fieldName].trim();
}
```

Rechazar la configuración ambigua:

```js
if (fixedImageTitle && unnamedImageLabel) {
  throw new Error(
    `fixedImageTitle y unnamedImageLabel no pueden coexistir para ${source.path}.`,
  );
}
```

Incluir los campos normalizados en la fuente devuelta. Calcular los textos de
la imagen antes de crear el objeto:

```js
const fixedImageTitle = source.fixedImageTitle;
const imageTitle =
  fixedImageTitle ??
  (usesEditorialText ? texts.editorialTitle : texts.title);
const imageAlt =
  fixedImageTitle ??
  (usesEditorialText ? texts.editorialAlt : texts.alt);

const image = {
  assetId: base.assetId,
  sourceFolder: base.sourceFolder,
  publicId: base.publicId,
  category: source.imageCategory,
  createdAt: base.createdAt,
  title: imageTitle,
  alt: imageAlt,
  width,
  height,
  thumb: deliveryVariant(
    base.secureUrl,
    "image",
    IMAGE_THUMB_TRANSFORM,
  ),
  full: deliveryVariant(
    base.secureUrl,
    "image",
    IMAGE_FULL_TRANSFORM,
  ),
};

const videoTitle = source.fixedVideoTitle ?? texts.title;
```

Usar `videoTitle` en la propiedad `title` del objeto de video. Configurar:

```js
fixedImageTitle: "61° Congreso Traumatología"
```

en `stand`, y:

```js
fixedVideoTitle: "Producto instrumental"
```

en `cajas`.

- [ ] **Step 4: Ejecutar las pruebas focalizadas**

Run:

```text
node --test scripts/cloudinary-media.test.mjs scripts/sync-cloudinary.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```text
git add scripts/cloudinary-folders.config.mjs scripts/cloudinary-media.mjs scripts/cloudinary-media.test.mjs scripts/sync-cloudinary.test.mjs
git commit -m "feat(cloudinary): apply fixed event and video titles"
```

### Task 2: Preparar las transformaciones MP4 antes de publicar

**Files:**
- Create: `scripts/cloudinary-video-readiness.mjs`
- Create: `scripts/cloudinary-video-readiness.test.mjs`
- Modify: `scripts/sync-cloudinary.mjs`
- Test: `scripts/sync-cloudinary.test.mjs`

- [ ] **Step 1: Escribir pruebas fallidas del comprobador HTTP**

Importar una API deseada:

```js
import { ensureVideoSourcesReady } from "./cloudinary-video-readiness.mjs";
```

Cubrir:

```js
await ensureVideoSourcesReady([video], {
  fetchImpl: async () => ({ status: 206, body: null, headers: new Headers() }),
});
```

```js
const statuses = [423, 206];
const waits = [];
await ensureVideoSourcesReady([video], {
  fetchImpl: async () => ({
    status: statuses.shift(),
    body: null,
    headers: new Headers(),
  }),
  sleep: async (milliseconds) => waits.push(milliseconds),
  now: () => 0,
  retryDelayMs: 2_000,
});
assert.deepEqual(waits, [2_000]);
```

Agregar casos para `200`, `500`, error de red y tiempo agotado. Confirmar que
cada solicitud envía `Range: bytes=0-0`.

- [ ] **Step 2: Ejecutar la prueba nueva y comprobar el fallo esperado**

Run:

```text
node --test scripts/cloudinary-video-readiness.test.mjs
```

Expected: FAIL con `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implementar el comprobador con concurrencia acotada**

Crear:

```js
const READY_STATUSES = new Set([200, 206]);

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForVideoSource(video, options) {
  const startedAt = options.now();

  while (true) {
    let response;
    try {
      response = await options.fetchImpl(video.src, {
        headers: { Range: "bytes=0-0" },
        signal: AbortSignal.timeout(options.requestTimeoutMs),
      });
    } catch (error) {
      throw new Error(
        `No se pudo comprobar el video ${video.assetId}: ${error.message}.`,
      );
    }

    await response.body?.cancel();
    if (READY_STATUSES.has(response.status)) return;

    if (response.status !== 423) {
      const detail = response.headers?.get?.("x-cld-error");
      throw new Error(
        `El video ${video.assetId} respondió HTTP ${response.status}${detail ? `: ${detail}` : ""}.`,
      );
    }

    if (options.now() - startedAt >= options.timeoutMs) {
      throw new Error(
        `El video ${video.assetId} no quedó listo dentro de ${options.timeoutMs} ms.`,
      );
    }

    await options.sleep(options.retryDelayMs);
  }
}
```

Exportar `ensureVideoSourcesReady(videos, overrides)` con valores por defecto
y workers acotados:

```js
function requirePositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }
}

export async function ensureVideoSourcesReady(videos, overrides = {}) {
  if (!Array.isArray(videos)) {
    throw new Error("videos debe ser un arreglo.");
  }

  const options = {
    fetchImpl: globalThis.fetch,
    sleep: delay,
    now: Date.now,
    concurrency: 6,
    retryDelayMs: 2_000,
    timeoutMs: 120_000,
    requestTimeoutMs: 15_000,
    ...overrides,
  };

  for (const field of [
    "concurrency",
    "retryDelayMs",
    "timeoutMs",
    "requestTimeoutMs",
  ]) {
    requirePositiveInteger(options[field], field);
  }
  for (const field of ["fetchImpl", "sleep", "now"]) {
    if (typeof options[field] !== "function") {
      throw new Error(`${field} debe ser una función.`);
    }
  }

  const safeVideos = videos.map((video, index) => {
    if (
      typeof video?.assetId !== "string" ||
      video.assetId.trim().length === 0
    ) {
      throw new Error(`videos[${index}].assetId es obligatorio.`);
    }
    try {
      const url = new URL(video.src);
      if (url.protocol !== "https:") throw new Error();
    } catch {
      throw new Error(`videos[${index}].src debe usar HTTPS.`);
    }
    return video;
  });

  let nextIndex = 0;
  let firstError;
  const worker = async () => {
    while (!firstError) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= safeVideos.length) return;

      try {
        await waitForVideoSource(safeVideos[index], options);
      } catch (error) {
        firstError ??= error;
      }
    }
  };

  const workerCount = Math.min(options.concurrency, safeVideos.length);
  await Promise.all(
    Array.from({ length: workerCount }, () => worker()),
  );
  if (firstError) throw firstError;
}
```

- [ ] **Step 4: Integrar el comprobador antes de la escritura atómica**

Agregar a `runSync` una dependencia inyectable:

```js
videoReadiness = ensureVideoSourcesReady
```

Después de `assertRemovalsAccepted` y antes de `writeManifestAtomic`:

```js
if (manifest.videos.length > 0) {
  logger.log(
    `Comprobando reproducción de ${manifest.videos.length} videos...`,
  );
  await videoReadiness(manifest.videos);
  logger.log(`Videos listos: ${manifest.videos.length}.`);
}
```

Agregar una prueba de integración que inyecte:

```js
async () => {
  throw new Error("video todavía en proceso");
}
```

y comprobar que el contenido anterior del manifiesto no cambia.

- [ ] **Step 5: Ejecutar las pruebas focalizadas**

Run:

```text
node --test scripts/cloudinary-video-readiness.test.mjs scripts/sync-cloudinary.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```text
git add scripts/cloudinary-video-readiness.mjs scripts/cloudinary-video-readiness.test.mjs scripts/sync-cloudinary.mjs scripts/sync-cloudinary.test.mjs
git commit -m "feat(cloudinary): verify transformed videos before publish"
```

### Task 3: Actualizar contrato, manifiesto y smoke checks

**Files:**
- Modify: `README.md`
- Modify: `scripts/smoke.mjs`
- Modify: `src/data/generated/cloudinary-media.json`

- [ ] **Step 1: Escribir smoke checks para los títulos aprobados**

Separar los recursos por carpeta y comprobar:

```js
for (const image of syncedStandImages) {
  assert(
    image.title === "61° Congreso Traumatología",
    `Event image should use the approved title: ${image.assetId}`,
  );
  assert(
    image.alt === "61° Congreso Traumatología",
    `Event image should use the approved alt: ${image.assetId}`,
  );
}

for (const video of cloudinaryManifest.videos) {
  assert(
    video.title === "Producto instrumental",
    `Video should use the approved title: ${video.assetId}`,
  );
}
```

Mantener la comprobación `Producto instrumental N` limitada a imágenes de
`chaco-implantes/cajas` con `generatedLabelNumber`.

- [ ] **Step 2: Ejecutar build y smoke para observar el fallo previo**

Run:

```text
npm run build
npm run test:smoke
```

Expected: FAIL porque el manifiesto real conserva títulos técnicos de eventos
y videos.

- [ ] **Step 3: Documentar los títulos y la preparación de MP4**

Actualizar `README.md` para indicar:

```text
Las imágenes de stand usan el título fijo 61° Congreso Traumatología.
Los videos de cajas usan el título fijo Producto instrumental.
Antes de escribir el manifiesto, la sincronización prepara las variantes MP4,
reintenta HTTP 423 y conserva el manifiesto anterior si alguna no queda lista.
```

Mencionar que las solicitudes de entrega generan versiones derivadas y pueden
consumir transformaciones, pero no modifican los originales.

- [ ] **Step 4: Sincronizar los datos reales**

Run:

```text
npm run sync:cloudinary
```

Expected:

```text
chaco-implantes/stand: 80 imágenes, 0 videos, 0 omitidos.
chaco-implantes/cajas: 21 imágenes, 70 videos, 1 omitidos.
Comprobando reproducción de 70 videos...
Videos listos: 70.
Manifiesto actualizado: ...
```

Confirmar mediante un script de solo lectura que las 80 imágenes de eventos y
los 70 videos usan los textos aprobados, y que no existe ningún video con
duración conocida menor a dos segundos.

- [ ] **Step 5: Ejecutar build y smoke**

Run:

```text
npm run build
npm run test:smoke
```

Expected: PASS.

- [ ] **Step 6: Commit**

```text
git add README.md scripts/smoke.mjs src/data/generated/cloudinary-media.json
git commit -m "feat(cloudinary): publish approved media titles"
```

### Task 4: Verificación completa y reproducción real

**Files:**
- Verify only.

- [ ] **Step 1: Ejecutar la suite completa**

Run:

```text
npm run test:cloudinary
npm run check
npm run build
npm run test:smoke
git diff --check
```

Expected: todos los comandos terminan con código `0`.

- [ ] **Step 2: Comprobar respuestas HTTP de los 70 videos**

Solicitar `Range: bytes=0-0` para cada `src` del manifiesto.

Expected: 70 respuestas `206 Partial Content`, `Content-Type: video/mp4` y
ninguna respuesta `423` o `4xx`.

- [ ] **Step 3: Probar reproducción en Chromium**

Levantar el sitio con `scripts/with_server.py`, abrir `/videos` y reproducir los
índices `0`, `35` y `69`.

Expected para las tres muestras:

```text
currentTime > 0
readyState >= 2
error === null
```

- [ ] **Step 4: Revisar el árbol final**

Run:

```text
git status --short
git log -5 --oneline
```

Expected: árbol limpio y tres commits funcionales después del commit de la
especificación.
