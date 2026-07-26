# Silent Premium Video Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar los 70 videos de Cloudinary sin pista de audio y reemplazar los controles nativos por un reproductor premium, accesible y cargado bajo demanda.

**Architecture:** La sincronización generará MP4 con `ac_none` y pósteres 16:9 sin recorte, preparará ambas variantes y examinará la estructura MP4 antes de la escritura atómica. Astro propagará la duración al nuevo `VideoPlayer.astro`, que mantendrá el MP4 en `data-src` hasta el primer play y ofrecerá controles propios sin volumen.

**Tech Stack:** Node.js 22 ESM, `node:test`, Cloudinary Search/Delivery URLs, Astro 6, TypeScript, Tailwind CSS 4 y Playwright 1.61.

---

## Mapa de archivos y responsabilidades

### Archivos nuevos

- `scripts/cloudinary-video-audio.mjs`: lectura acotada de cajas MP4 y validación concurrente de ausencia de tracks `soun`.
- `scripts/cloudinary-video-audio.test.mjs`: contenedores MP4 mínimos y dobles de HTTP Range para el inspector.
- `scripts/verify-cloudinary-video-audio.mjs`: auditoría repetible del manifiesto publicado.
- `src/components/VideoPlayer.astro`: marcado, estilos y controlador del reproductor personalizado.
- `scripts/verify-video-player.mjs`: comprobación Playwright de carga diferida, reproducción, pausa coordinada, filtros, controles y vista móvil.

### Archivos modificados

- `scripts/cloudinary-media.mjs`: transformaciones `ac_none` y póster `c_pad`.
- `scripts/cloudinary-media.test.mjs`: contrato exacto de las nuevas URLs.
- `scripts/cloudinary-video-readiness.mjs`: preparación acotada de `src` y `poster`.
- `scripts/cloudinary-video-readiness.test.mjs`: reintentos, errores, validación y concurrencia sobre 140 variantes.
- `scripts/sync-cloudinary.mjs`: inspección de audio inyectable antes de `writeManifestAtomic`.
- `scripts/sync-cloudinary.test.mjs`: orden de barreras y conservación byte por byte del manifiesto anterior.
- `src/data/cloudinary-media-adapter.mjs`: validación y propagación opcional de `duration`.
- `scripts/cloudinary-site-adapter.test.mjs`: contrato de duración presente, ausente e inválida.
- `src/data/site.ts`: `VideoItem.duration?: number`.
- `src/components/Icon.astro`: íconos de pantalla completa y repetición.
- `src/pages/videos.astro`: composición con `VideoPlayer` y ordinal accesible.
- `scripts/smoke.mjs`: estructura estática del player y ausencia de controles nativos/volumen.
- `package.json`: comandos de auditoría MP4 y verificación Playwright.
- `README.md`: comportamiento sin audio, readiness e inspección.
- `src/data/generated/cloudinary-media.json`: inventario regenerado; nunca se editará manualmente.

## Secuencia de commits

1. `feat(cloudinary): generate silent video variants`
2. `feat(cloudinary): prepare video posters before publish`
3. `feat(cloudinary): inspect mp4 audio tracks`
4. `feat(cloudinary): block unsafe videos before publish`
5. `chore(cloudinary): publish silent media manifest`
6. `feat(media): expose synchronized video durations`
7. `feat(videos): add accessible floating player`
8. `test(videos): verify lazy custom playback`
9. `docs(videos): document silent delivery pipeline`

### Task 1: Generar MP4 silenciosos y pósteres sin recorte

**Files:**
- Modify: `scripts/cloudinary-media.mjs:10-14`
- Test: `scripts/cloudinary-media.test.mjs:284-298`
- Test: `scripts/sync-cloudinary.test.mjs:309-323`

- [ ] **Step 1: Cambiar primero las expectativas de las URLs**

En `scripts/cloudinary-media.test.mjs`, reemplazar solamente las dos URLs esperadas del video normalizado:

```js
poster:
  "https://res.cloudinary.com/demo/video/upload/so_0,f_jpg,q_auto,b_rgb:0f172a,c_pad,ar_16:9,w_600/v1780000002/recorrido_caja_qwerty.jpg",
src:
  "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1780000002/recorrido_caja_qwerty.mp4",
```

En el test `runSync verifies built manifest videos before publishing`, cambiar el `src` esperado a:

```js
src:
  "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1/cajas-video.mp4",
```

- [ ] **Step 2: Ejecutar las pruebas para comprobar el fallo esperado**

Run:

```powershell
node --test scripts/cloudinary-media.test.mjs scripts/sync-cloudinary.test.mjs
```

Expected: FAIL en las expectativas de `poster` y `src`; las URLs reales todavía contienen `c_fill` y no contienen `ac_none`.

- [ ] **Step 3: Aplicar las transformaciones mínimas**

En `scripts/cloudinary-media.mjs`, dejar las constantes así:

```js
const VIDEO_SOURCE_TRANSFORM = "f_mp4,q_auto,ac_none";
const VIDEO_POSTER_TRANSFORM =
  "so_0,f_jpg,q_auto,b_rgb:0f172a,c_pad,ar_16:9,w_600";
```

No cambiar `deliveryVariant`, `schemaVersion` ni `cloudinary-sync-io.mjs`.

- [ ] **Step 4: Ejecutar las pruebas específicas**

Run:

```powershell
node --test scripts/cloudinary-media.test.mjs scripts/sync-cloudinary.test.mjs
```

Expected: PASS; el manifiesto de prueba conserva `duration: 12.5` y genera exactamente las dos transformaciones nuevas.

- [ ] **Step 5: Confirmar que no hubo cambios de alcance**

Run:

```powershell
git diff --check
git diff -- scripts/cloudinary-media.mjs scripts/cloudinary-media.test.mjs scripts/sync-cloudinary.test.mjs
```

Expected: sin errores de whitespace y sin cambios ajenos a las URLs de entrega.

- [ ] **Step 6: Crear el commit**

```powershell
git add -- scripts/cloudinary-media.mjs scripts/cloudinary-media.test.mjs scripts/sync-cloudinary.test.mjs
git diff --cached --check
git commit -m "feat(cloudinary): generate silent video variants"
```

### Task 2: Preparar el MP4 y el póster con una única cota de concurrencia

**Files:**
- Modify: `scripts/cloudinary-video-readiness.mjs`
- Test: `scripts/cloudinary-video-readiness.test.mjs`

- [ ] **Step 1: Ampliar el fixture y escribir las expectativas que deben fallar**

Agregar `poster` al fixture compartido:

```js
const video = {
  assetId: "video-asset",
  src: "https://res.cloudinary.com/demo/video/upload/video-asset.mp4",
  poster:
    "https://res.cloudinary.com/demo/video/upload/video-asset.jpg",
};
```

En cada test de estado `200`/`206`, esperar dos solicitudes y verificar ambas:

```js
assert.deepEqual(
  requests.map(({ url }) => url),
  [video.src, video.poster],
);
for (const request of requests) {
  assert.equal(request.options.method, "GET");
  assert.equal(
    new Headers(request.options.headers).get("Range"),
    "bytes=0-0",
  );
  assert.ok(request.options.signal instanceof AbortSignal);
}
assert.equal(cancellations, 2);
```

Agregar un caso de póster inválido que no permita iniciar red:

```js
test("ensureVideoSourcesReady validates poster before making requests", async () => {
  let requests = 0;

  await assert.rejects(
    () =>
      ensureVideoSourcesReady(
        [{ ...video, poster: "http://example.test/poster.jpg" }],
        {
          async fetchImpl() {
            requests += 1;
            return createResponse(206);
          },
        },
      ),
    /videos\[0\]\.poster debe usar HTTPS/,
  );

  assert.equal(requests, 0);
});
```

En los tests existentes que verifican un único error, timeout o señal sobre el
MP4, agregar explícitamente:

```js
concurrency: 1,
```

Aplicarlo a `reports unexpected HTTP status`, `reports network errors`,
`times out a video that remains locked`, `caps retry sleep`,
`does not accept a ready response after the video deadline`,
`caps a request at the remaining video deadline` y
`applies a timeout signal to each request`. De ese modo el póster no consume
los relojes o dobles diseñados para comprobar primero el MP4.

En la tabla de validaciones previas, sumar el campo ausente:

```js
[
  [{ assetId: "missing-poster", src: video.src }],
  /videos\[0\]\.poster debe usar HTTPS/,
],
```

- [ ] **Step 2: Ejecutar el test y verificar que falla antes de implementar**

Run:

```powershell
node --test scripts/cloudinary-video-readiness.test.mjs
```

Expected: FAIL porque readiness todavía solicita únicamente `video.src` y no valida `poster`.

- [ ] **Step 3: Convertir cada video en dos variantes validadas**

Agregar estos helpers a `scripts/cloudinary-video-readiness.mjs`:

```js
const VARIANT_LABELS = {
  src: "MP4",
  poster: "póster",
};

function requireHttpsVariant(video, index, field) {
  try {
    if (typeof video[field] !== "string") throw new Error();
    const url = new URL(video[field]);
    if (url.protocol !== "https:") throw new Error();
  } catch {
    throw new Error(`videos[${index}].${field} debe usar HTTPS.`);
  }

  return {
    assetId: video.assetId,
    field,
    label: VARIANT_LABELS[field],
    url: video[field],
  };
}

function buildVariants(videos) {
  return videos.flatMap((video, index) => {
    if (
      typeof video?.assetId !== "string" ||
      video.assetId.trim().length === 0
    ) {
      throw new Error(`videos[${index}].assetId es obligatorio.`);
    }

    return [
      requireHttpsVariant(video, index, "src"),
      requireHttpsVariant(video, index, "poster"),
    ];
  });
}
```

Renombrar el parámetro interno de `waitForVideoSource` a `variant`. Sustituir
sin excepción todas las referencias internas a `video.src` y `video.assetId`;
incluye timeout, cancelación del body, timeout de solicitud, error de red y
estado HTTP. Dejar esos bloques así:

```js
function timeoutError(variant, timeoutMs) {
  return new Error(
    `La variante ${variant.label} del video ${variant.assetId} no quedó lista dentro de ${timeoutMs} ms.`,
  );
}

async function cancelResponseBody(response, variant) {
  try {
    await response?.body?.cancel();
  } catch (error) {
    throw new Error(
      `No se pudo liberar la respuesta de la variante ${variant.label} del video ${variant.assetId}: ${describeError(error)}.`,
      { cause: error },
    );
  }
}

let response;
try {
  response = await options.fetchImpl(variant.url, {
    method: "GET",
    headers: { Range: "bytes=0-0" },
    signal,
  });
} catch (error) {
  if (signal.aborted) {
    if (videoDeadlineControlsRequest) {
      throw timeoutError(variant, options.timeoutMs);
    }
    throw new Error(
      `La solicitud de la variante ${variant.label} del video ${variant.assetId} superó ${options.requestTimeoutMs} ms.`,
      { cause: error },
    );
  }
  throw new Error(
    `No se pudo comprobar la variante ${variant.label} del video ${variant.assetId}: ${describeError(error)}.`,
    { cause: error },
  );
}

await cancelResponseBody(response, variant);

throw new Error(
  `La variante ${variant.label} del video ${variant.assetId} respondió HTTP ${response.status}${detail ? `: ${detail}` : ""}.`,
);
```

En `ensureVideoSourcesReady`, reemplazar `safeVideos` por:

```js
const variants = buildVariants(videos);
```

y hacer que los workers consuman `variants`:

```js
const worker = async () => {
  while (firstError === undefined) {
    const index = nextIndex;
    nextIndex += 1;
    if (index >= variants.length) return;

    try {
      await waitForVideoSource(variants[index], options);
    } catch (error) {
      firstError ??= error;
    }
  }
};

const workerCount = Math.min(options.concurrency, variants.length);
```

La lista se construye por completo antes de crear workers, por lo que una URL
inválida aborta sin ninguna solicitud.

- [ ] **Step 4: Mantener el reintento del MP4 y cubrir también el póster**

Actualizar el test existente
`ensureVideoSourcesReady retries HTTP 423 after the configured delay` para que
la tercera solicitud prepare también el póster:

```js
test("ensureVideoSourcesReady retries HTTP 423 after the configured delay", async () => {
  const statuses = [423, 206, 206];
  const urls = [];
  const waits = [];
  let cancellations = 0;

  await ensureVideoSourcesReady([video], {
    concurrency: 1,
    async fetchImpl(url) {
      urls.push(url);
      return createResponse(statuses.shift(), {
        onCancel() {
          cancellations += 1;
        },
      });
    },
    async sleep(milliseconds) {
      waits.push(milliseconds);
    },
    now: () => 0,
    retryDelayMs: 2_000,
  });

  assert.deepEqual(urls, [video.src, video.src, video.poster]);
  assert.deepEqual(statuses, []);
  assert.deepEqual(waits, [2_000]);
  assert.equal(cancellations, 3);
});
```

Agregar el caso simétrico para un póster bloqueado y el error con detalle:

```js
test("ensureVideoSourcesReady retries a locked poster", async () => {
  const statuses = [206, 423, 206];
  const urls = [];
  const waits = [];
  let cancellations = 0;

  await ensureVideoSourcesReady([video], {
    concurrency: 1,
    async fetchImpl(url) {
      urls.push(url);
      return createResponse(statuses.shift(), {
        onCancel() {
          cancellations += 1;
        },
      });
    },
    async sleep(milliseconds) {
      waits.push(milliseconds);
    },
    now: () => 0,
    retryDelayMs: 2_000,
  });

  assert.deepEqual(urls, [video.src, video.poster, video.poster]);
  assert.deepEqual(statuses, []);
  assert.deepEqual(waits, [2_000]);
  assert.equal(cancellations, 3);
});

test("ensureVideoSourcesReady identifies a failing poster", async () => {
  await assert.rejects(
    () =>
      ensureVideoSourcesReady([video], {
        concurrency: 1,
        async fetchImpl(url) {
          return url === video.src
            ? createResponse(206)
            : createResponse(500, { detail: "Poster failed" });
        },
      }),
    /póster.*video-asset.*HTTP 500.*Poster failed/,
  );
});
```

Actualizar el test de concurrencia para generar cinco videos con `src` y
`poster`, y afirmar:

```js
assert.equal(startedRequests, videos.length * 2);
assert.equal(maximumActiveRequests, 2);
```

- [ ] **Step 5: Ejecutar toda la unidad de readiness**

Run:

```powershell
node --test scripts/cloudinary-video-readiness.test.mjs
```

Expected: PASS; cinco videos producen diez solicitudes y nunca superan la concurrencia configurada.

- [ ] **Step 6: Crear el commit**

```powershell
git add -- scripts/cloudinary-video-readiness.mjs scripts/cloudinary-video-readiness.test.mjs
git diff --cached --check
git commit -m "feat(cloudinary): prepare video posters before publish"
```

### Task 3: Analizar localmente la estructura de tracks MP4

**Files:**
- Create: `scripts/cloudinary-video-audio.mjs`
- Create: `scripts/cloudinary-video-audio.test.mjs`

- [ ] **Step 1: Crear constructores MP4 mínimos y pruebas fallidas**

Crear `scripts/cloudinary-video-audio.test.mjs` con estos helpers y casos
iniciales:

```js
import assert from "node:assert/strict";
import test from "node:test";

import { inspectMp4Moov } from "./cloudinary-video-audio.mjs";

function concat(...buffers) {
  return Buffer.concat(buffers.map((value) => Buffer.from(value)));
}

function box(type, ...payloads) {
  const payload = concat(...payloads);
  const output = Buffer.alloc(8 + payload.length);
  output.writeUInt32BE(output.length, 0);
  output.write(type, 4, 4, "ascii");
  payload.copy(output, 8);
  return output;
}

function extendedBox(type, ...payloads) {
  const payload = concat(...payloads);
  const output = Buffer.alloc(16 + payload.length);
  output.writeUInt32BE(1, 0);
  output.write(type, 4, 4, "ascii");
  output.writeBigUInt64BE(BigInt(output.length), 8);
  payload.copy(output, 16);
  return output;
}

function zeroSizedBox(type, ...payloads) {
  const payload = concat(...payloads);
  const output = Buffer.alloc(8 + payload.length);
  output.writeUInt32BE(0, 0);
  output.write(type, 4, 4, "ascii");
  payload.copy(output, 8);
  return output;
}

function uuidBox(...payloads) {
  const payload = concat(...payloads);
  const output = Buffer.alloc(24 + payload.length);
  output.writeUInt32BE(output.length, 0);
  output.write("uuid", 4, 4, "ascii");
  Buffer.alloc(16).copy(output, 8);
  payload.copy(output, 24);
  return output;
}

function handler(handlerType) {
  return box(
    "hdlr",
    Buffer.alloc(8),
    Buffer.from(handlerType, "ascii"),
    Buffer.alloc(12),
  );
}

function track(handlerType) {
  return box("trak", box("mdia", handler(handlerType)));
}

function moov(...handlerTypes) {
  return box("moov", ...handlerTypes.map(track));
}

test("inspectMp4Moov accepts a video-only container", () => {
  assert.deepEqual(inspectMp4Moov(moov("vide")), {
    trackCount: 1,
    videoTrackCount: 1,
    handlerTypes: ["vide"],
  });
});

test("inspectMp4Moov rejects any audio track", () => {
  assert.throws(
    () => inspectMp4Moov(moov("vide", "soun")),
    /pista de audio \(soun\)/,
  );
});

test("inspectMp4Moov requires a video track", () => {
  assert.throws(
    () => inspectMp4Moov(moov("meta")),
    /pista de video \(vide\)/,
  );
});

test("inspectMp4Moov supports extended boxes", () => {
  const bytes = extendedBox(
    "moov",
    extendedBox("trak", extendedBox("mdia", handler("vide"))),
  );
  assert.deepEqual(inspectMp4Moov(bytes).handlerTypes, ["vide"]);
});

test("inspectMp4Moov supports a zero-sized root box", () => {
  assert.deepEqual(
    inspectMp4Moov(zeroSizedBox("moov", track("vide"))).handlerTypes,
    ["vide"],
  );
});

test("inspectMp4Moov accounts for uuid user-type bytes", () => {
  assert.deepEqual(
    inspectMp4Moov(box("moov", uuidBox(), track("vide"))).handlerTypes,
    ["vide"],
  );
});

test("inspectMp4Moov rejects malformed track structure", () => {
  assert.throws(
    () => inspectMp4Moov(box("moov", box("trak"))),
    /exactamente una caja mdia/,
  );
  assert.throws(
    () =>
      inspectMp4Moov(
        box("moov", box("trak", box("mdia", handler("vide"), handler("vide")))),
      ),
    /exactamente una caja hdlr/,
  );
});

test("inspectMp4Moov enforces the parsed-box limit", () => {
  assert.throws(
    () => inspectMp4Moov(moov("vide"), { maxParsedBoxes: 2 }),
    /límite de cajas MP4/,
  );
});

test("inspectMp4Moov rejects unsafe parser limits", () => {
  assert.throws(
    () =>
      inspectMp4Moov(moov("vide"), {
        maxParsedBoxes: Number.MAX_SAFE_INTEGER + 1,
      }),
    /entero positivo seguro/,
  );
});
```

- [ ] **Step 2: Ejecutar la prueba para confirmar el módulo ausente**

Run:

```powershell
node --test scripts/cloudinary-video-audio.test.mjs
```

Expected: FAIL con `ERR_MODULE_NOT_FOUND` para `cloudinary-video-audio.mjs`.

- [ ] **Step 3: Implementar encabezados y recorrido estructural acotado**

Crear `scripts/cloudinary-video-audio.mjs` con esta superficie y parser:

```js
export const DEFAULT_MP4_INSPECTION_OPTIONS = Object.freeze({
  concurrency: 4,
  initialProbeBytes: 64 * 1024,
  maxMoovBytes: 8 * 1024 * 1024,
  maxTopLevelBoxes: 128,
  maxParsedBoxes: 1024,
  maxRangeRequests: 32,
  requestTimeoutMs: 15_000,
  timeoutMs: 60_000,
});

function requirePositiveInteger(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo seguro.`);
  }
}

function fourCc(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.byteLength) {
    throw new Error("La estructura MP4 está truncada.");
  }
  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  );
}

function readBoxHeader(bytes, offset, parentEnd) {
  if (offset < 0 || parentEnd > bytes.byteLength || offset + 8 > parentEnd) {
    throw new Error("La estructura MP4 está truncada.");
  }

  const view = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  );
  const size32 = view.getUint32(offset);
  const type = fourCc(bytes, offset + 4);
  let headerSize = 8;
  let size;

  if (size32 === 1) {
    if (offset + 16 > parentEnd) {
      throw new Error("La caja MP4 extendida está truncada.");
    }
    const largeSize = view.getBigUint64(offset + 8);
    if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("La caja MP4 declara un tamaño inseguro.");
    }
    size = Number(largeSize);
    headerSize = 16;
  } else if (size32 === 0) {
    size = parentEnd - offset;
  } else {
    size = size32;
  }

  if (type === "uuid") headerSize += 16;
  if (size < headerSize || offset + size > parentEnd) {
    throw new Error(`La caja MP4 ${type} excede su contenedor.`);
  }

  return {
    type,
    start: offset,
    end: offset + size,
    size,
    headerSize,
    contentStart: offset + headerSize,
    contentEnd: offset + size,
    contentSize: size - headerSize,
  };
}

function directChildren(bytes, parent, state) {
  const children = [];
  let offset = parent.contentStart;

  while (offset < parent.contentEnd) {
    state.parsedBoxes += 1;
    if (state.parsedBoxes > state.maxParsedBoxes) {
      throw new Error("Se superó el límite de cajas MP4 analizadas.");
    }
    const child = readBoxHeader(bytes, offset, parent.contentEnd);
    children.push(child);
    offset = child.end;
  }

  if (offset !== parent.contentEnd) {
    throw new Error("Las cajas MP4 no completan su contenedor.");
  }
  return children;
}

function exactlyOne(boxes, type) {
  const matching = boxes.filter((box) => box.type === type);
  if (matching.length !== 1) {
    throw new Error(`Cada track debe contener exactamente una caja ${type}.`);
  }
  return matching[0];
}

export function inspectMp4Moov(
  input,
  {
    maxParsedBoxes = DEFAULT_MP4_INSPECTION_OPTIONS.maxParsedBoxes,
  } = {},
) {
  requirePositiveInteger(maxParsedBoxes, "maxParsedBoxes");
  const bytes =
    input instanceof Uint8Array ? input : new Uint8Array(input);
  const root = readBoxHeader(bytes, 0, bytes.byteLength);
  if (root.type !== "moov" || root.end !== bytes.byteLength) {
    throw new Error("La inspección requiere una única caja moov completa.");
  }

  const state = { parsedBoxes: 1, maxParsedBoxes };
  const handlers = [];
  for (const trak of directChildren(bytes, root, state).filter(
    (box) => box.type === "trak",
  )) {
    const mdia = exactlyOne(directChildren(bytes, trak, state), "mdia");
    const hdlr = exactlyOne(directChildren(bytes, mdia, state), "hdlr");
    if (hdlr.contentSize < 12) {
      throw new Error("La caja hdlr está truncada.");
    }
    handlers.push(fourCc(bytes, hdlr.contentStart + 8));
  }

  if (handlers.includes("soun")) {
    throw new Error("El MP4 contiene una pista de audio (soun).");
  }
  const videoTrackCount = handlers.filter(
    (handlerType) => handlerType === "vide",
  ).length;
  if (videoTrackCount === 0) {
    throw new Error("El MP4 no contiene una pista de video (vide).");
  }

  return {
    trackCount: handlers.length,
    videoTrackCount,
    handlerTypes: handlers,
  };
}
```

- [ ] **Step 4: Agregar los casos binarios límite**

Añadir pruebas para:

```js
test("inspectMp4Moov rejects a truncated hdlr", () => {
  assert.throws(
    () =>
      inspectMp4Moov(
        box("moov", box("trak", box("mdia", box("hdlr", Buffer.alloc(4))))),
      ),
    /hdlr está truncada/,
  );
});

test("inspectMp4Moov rejects a box outside its parent", () => {
  const bytes = moov("vide");
  bytes.writeUInt32BE(bytes.length + 1, 0);
  assert.throws(
    () => inspectMp4Moov(bytes),
    /excede su contenedor/,
  );
});

test("inspectMp4Moov rejects an unsafe extended size", () => {
  const bytes = Buffer.alloc(16);
  bytes.writeUInt32BE(1, 0);
  bytes.write("moov", 4, 4, "ascii");
  bytes.writeBigUInt64BE(BigInt(Number.MAX_SAFE_INTEGER) + 1n, 8);
  assert.throws(
    () => inspectMp4Moov(bytes),
    /tamaño inseguro/,
  );
});
```

- [ ] **Step 5: Ejecutar la unidad local**

Run:

```powershell
node --test scripts/cloudinary-video-audio.test.mjs
```

Expected: PASS en video-only, audio, ausencia de video, tamaños extendidos, límites y estructuras truncadas.

- [ ] **Step 6: Crear el commit del parser puro**

```powershell
git add -- scripts/cloudinary-video-audio.mjs scripts/cloudinary-video-audio.test.mjs
git diff --cached --check
git commit -m "feat(cloudinary): inspect mp4 audio tracks"
```

### Task 4: Inspeccionar remotamente y bloquear la escritura insegura

**Files:**
- Modify: `scripts/cloudinary-video-audio.mjs`
- Modify: `scripts/cloudinary-video-audio.test.mjs`
- Create: `scripts/verify-cloudinary-video-audio.mjs`
- Modify: `scripts/sync-cloudinary.mjs:18-170`
- Modify: `scripts/sync-cloudinary.test.mjs:267-390`
- Modify: `package.json`

- [ ] **Step 1: Escribir el contrato HTTP Range antes de la implementación**

Ampliar el import del test:

```js
import {
  ensureVideoSourcesHaveNoAudio,
  inspectMp4Moov,
} from "./cloudinary-video-audio.mjs";
```

Agregar un doble que respete rangos:

```js
function createRangeFetch(file, requests) {
  return async (url, options) => {
    assert.equal(options.method, "GET");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    const range = new Headers(options.headers).get("Range");
    const match = /^bytes=(\d+)-(\d+)$/.exec(range || "");
    assert.ok(match, `Rango inesperado: ${range}`);
    const start = Number(match[1]);
    const requestedEnd = Number(match[2]);
    const end = Math.min(requestedEnd, file.length - 1);
    requests.push({ url, start, end });

    return new Response(file.subarray(start, end + 1), {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${file.length}`,
        "Content-Type": "video/mp4",
      },
    });
  };
}
```

Agregar la prueba que obliga a saltar un `mdat` sin descargarlo:

```js
test("ensureVideoSourcesHaveNoAudio skips mdat and inspects moov", async () => {
  const file = concat(
    box("ftyp", Buffer.alloc(8)),
    box("mdat", Buffer.alloc(128 * 1024)),
    moov("vide"),
  );
  const requests = [];
  const videos = [
    {
      assetId: "video-only",
      src:
        "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1/video-only.mp4",
    },
  ];

  await ensureVideoSourcesHaveNoAudio(videos, {
    fetchImpl: createRangeFetch(file, requests),
  });

  assert.ok(requests.length >= 2);
  assert.ok(
    requests.every(({ start, end }) => end - start + 1 <= 64 * 1024),
  );
  assert.equal(
    requests.some(({ start, end }) =>
      start <= 16 && end >= 16 + 128 * 1024,
    ),
    false,
  );
});

test("ensureVideoSourcesHaveNoAudio rejects HTTP 200", async () => {
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [
          {
            assetId: "range-ignored",
            src:
              "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1/range-ignored.mp4",
          },
        ],
        {
          async fetchImpl() {
            return new Response(moov("vide"), { status: 200 });
          },
        },
      ),
    /HTTP 206/,
  );
});

test("ensureVideoSourcesHaveNoAudio validates every URL before fetching", async () => {
  let requests = 0;
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [
          {
            assetId: "valid",
            src:
              "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1/valid.mp4",
          },
          {
            assetId: "invalid",
            src: "http://example.test/invalid.mp4",
          },
        ],
        {
          async fetchImpl() {
            requests += 1;
            throw new Error("No debe ejecutarse");
          },
        },
      ),
    /videos\[1\]\.src debe usar HTTPS/,
  );
  assert.equal(requests, 0);
});

test("ensureVideoSourcesHaveNoAudio only accepts ac_none in the transformation", async () => {
  let requests = 0;
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [
          {
            assetId: "misleading-public-id",
            src:
              "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto/v1/folder-ac_none/video.mp4",
          },
        ],
        {
          async fetchImpl() {
            requests += 1;
            throw new Error("No debe ejecutarse");
          },
        },
      ),
    /debe incluir ac_none/,
  );
  assert.equal(requests, 0);
});

test("ensureVideoSourcesHaveNoAudio uses the first version as the boundary", async () => {
  let requests = 0;
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [
          {
            assetId: "misleading-second-version",
            src:
              "https://res.cloudinary.com/demo/video/upload/v1/ac_none/v2/video.mp4",
          },
        ],
        {
          async fetchImpl() {
            requests += 1;
            throw new Error("No debe ejecutarse");
          },
        },
      ),
    /debe incluir ac_none/,
  );
  assert.equal(requests, 0);
});

test("ensureVideoSourcesHaveNoAudio restricts delivery requests to Cloudinary", async () => {
  let requests = 0;
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio(
        [
          {
            assetId: "foreign-host",
            src:
              "https://example.test/video/upload/f_mp4,q_auto,ac_none/v1/video.mp4",
          },
        ],
        {
          async fetchImpl() {
            requests += 1;
            throw new Error("No debe ejecutarse");
          },
        },
      ),
    /debe pertenecer a res\.cloudinary\.com/,
  );
  assert.equal(requests, 0);
});
```

Agregar estos límites representativos:

```js
const inspectedVideo = {
  assetId: "bounded-video",
  src:
    "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1/bounded-video.mp4",
};

test("ensureVideoSourcesHaveNoAudio rejects invalid Content-Range", async () => {
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio([inspectedVideo], {
        async fetchImpl() {
          return new Response(Buffer.alloc(8), {
            status: 206,
            headers: { "Content-Range": "invalid" },
          });
        },
      }),
    /Content-Range inválido/,
  );
});

test("ensureVideoSourcesHaveNoAudio rejects unsafe Content-Range integers", async () => {
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio([inspectedVideo], {
        async fetchImpl() {
          return new Response(Buffer.alloc(8), {
            status: 206,
            headers: {
              "Content-Range":
                "bytes 0-7/9007199254740993",
            },
          });
        },
      }),
    /Content-Range inválido/,
  );
});

test("ensureVideoSourcesHaveNoAudio rejects prematurely short ranges", async () => {
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio([inspectedVideo], {
        async fetchImpl() {
          return new Response(Buffer.alloc(8), {
            status: 206,
            headers: { "Content-Range": "bytes 0-7/100" },
          });
        },
      }),
    /rango distinto del solicitado/,
  );
});

test("ensureVideoSourcesHaveNoAudio rejects truncated range bodies", async () => {
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio([inspectedVideo], {
        async fetchImpl() {
          return new Response(Buffer.alloc(99), {
            status: 206,
            headers: { "Content-Range": "bytes 0-99/100" },
          });
        },
      }),
    /rango truncado/,
  );
});

test("ensureVideoSourcesHaveNoAudio rejects oversized moov", async () => {
  const file = moov("vide");
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio([inspectedVideo], {
        fetchImpl: createRangeFetch(file, []),
        maxMoovBytes: 8,
      }),
    /moov supera el tamaño permitido/,
  );
});

test("ensureVideoSourcesHaveNoAudio enforces Range request limits", async () => {
  const file = concat(
    box("ftyp", Buffer.alloc(8)),
    box("mdat", Buffer.alloc(128 * 1024)),
    moov("vide"),
  );
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio([inspectedVideo], {
        fetchImpl: createRangeFetch(file, []),
        maxRangeRequests: 1,
      }),
    /límite de solicitudes Range/,
  );
});

test("ensureVideoSourcesHaveNoAudio bounds concurrency", async () => {
  const file = moov("vide");
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let active = 0;
  let maximum = 0;
  const videos = Array.from({ length: 5 }, (_, index) => ({
    assetId: `video-${index}`,
    src:
      `https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1/video-${index}.mp4`,
  }));

  const verification = ensureVideoSourcesHaveNoAudio(videos, {
    concurrency: 2,
    async fetchImpl(_url, options) {
      active += 1;
      maximum = Math.max(maximum, active);
      await gate;
      active -= 1;
      return createRangeFetch(file, [])(_url, options);
    },
  });

  assert.equal(maximum, 2);
  release();
  await verification;
  assert.equal(maximum, 2);
});
```

Completar con:

```js
test("ensureVideoSourcesHaveNoAudio rejects a changing remote total", async () => {
  const file = concat(
    box("ftyp", Buffer.alloc(8)),
    box("mdat", Buffer.alloc(128 * 1024)),
    moov("vide"),
  );
  let calls = 0;
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio([inspectedVideo], {
        initialProbeBytes: 64,
        async fetchImpl(_url, options) {
          const range = new Headers(options.headers).get("Range");
          const match = /^bytes=(\d+)-(\d+)$/.exec(range || "");
          assert.ok(match);
          const start = Number(match[1]);
          const end = Math.min(Number(match[2]), file.length - 1);
          calls += 1;
          const total = calls === 1 ? file.length : file.length + 1;
          return new Response(file.subarray(start, end + 1), {
            status: 206,
            headers: {
              "Content-Range": `bytes ${start}-${end}/${total}`,
            },
          });
        },
      }),
    /tamaño remoto cambió/,
  );
});

test("ensureVideoSourcesHaveNoAudio rejects excessive response bodies", async () => {
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio([inspectedVideo], {
        async fetchImpl() {
          return new Response(Buffer.alloc(101), {
            status: 206,
            headers: { "Content-Range": "bytes 0-99/100" },
          });
        },
      }),
    /más bytes que el rango solicitado/,
  );
});

test("ensureVideoSourcesHaveNoAudio enforces the video deadline", async () => {
  const file = concat(
    box("ftyp", Buffer.alloc(8)),
    box("mdat", Buffer.alloc(128 * 1024)),
    moov("vide"),
  );
  const timestamps = [0, 0, 60_001];
  await assert.rejects(
    () =>
      ensureVideoSourcesHaveNoAudio([inspectedVideo], {
        initialProbeBytes: 64,
        fetchImpl: createRangeFetch(file, []),
        now: () => timestamps.shift() ?? 60_001,
        timeoutMs: 60_000,
      }),
    /superó su tiempo máximo/,
  );
});
```

- [ ] **Step 2: Ejecutar el test y confirmar la exportación faltante**

Run:

```powershell
node --test scripts/cloudinary-video-audio.test.mjs
```

Expected: FAIL porque `ensureVideoSourcesHaveNoAudio` todavía no está exportada.

- [ ] **Step 3: Implementar la lectura exacta y acotada**

Agregar a `scripts/cloudinary-video-audio.mjs`:

```js
function describeError(error) {
  return error instanceof Error && error.message
    ? error.message
    : String(error);
}

function parseContentRange(value) {
  const match = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(value || "");
  if (!match) {
    throw new Error("Cloudinary devolvió Content-Range inválido.");
  }
  const range = {
    start: Number(match[1]),
    end: Number(match[2]),
    total: Number(match[3]),
  };
  if (
    !Number.isSafeInteger(range.start) ||
    !Number.isSafeInteger(range.end) ||
    !Number.isSafeInteger(range.total) ||
    range.start < 0 ||
    range.end < range.start ||
    range.total <= range.end
  ) {
    throw new Error("Cloudinary devolvió Content-Range inválido.");
  }
  return range;
}

async function readBodyExactly(response, expectedLength) {
  if (!response.body) {
    throw new Error("Cloudinary devolvió una respuesta sin body.");
  }

  const reader = response.body.getReader();
  const output = new Uint8Array(expectedLength);
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const nextReceived = received + value.byteLength;
    if (nextReceived > expectedLength) {
      await reader.cancel();
      throw new Error("Cloudinary devolvió más bytes que el rango solicitado.");
    }
    output.set(value, received);
    received = nextReceived;
  }
  if (received !== expectedLength) {
    throw new Error("Cloudinary devolvió un rango truncado.");
  }
  return output;
}

async function readExactRange(url, start, end, context) {
  context.rangeRequests += 1;
  if (context.rangeRequests > context.options.maxRangeRequests) {
    throw new Error("Se superó el límite de solicitudes Range.");
  }
  const now = context.options.now();
  if (now >= context.deadlineAt) {
    throw new Error("La inspección MP4 superó su tiempo máximo.");
  }

  const remainingMs = context.deadlineAt - now;
  const signal = AbortSignal.timeout(
    Math.min(context.options.requestTimeoutMs, remainingMs),
  );
  let response;
  try {
    response = await context.options.fetchImpl(url, {
      method: "GET",
      headers: { Range: `bytes=${start}-${end}` },
      redirect: "error",
      signal,
    });
  } catch (error) {
    throw new Error(`Falló la lectura MP4: ${describeError(error)}.`, {
      cause: error,
    });
  }
  if (response.status !== 206) {
    await response.body?.cancel();
    throw new Error(
      `La inspección MP4 requiere HTTP 206; recibió ${response.status}.`,
    );
  }

  const range = parseContentRange(response.headers.get("Content-Range"));
  const expectedEnd = Math.min(end, range.total - 1);
  if (
    range.start !== start ||
    range.end !== expectedEnd
  ) {
    await response.body?.cancel();
    throw new Error("Cloudinary devolvió un rango distinto del solicitado.");
  }
  if (
    context.remoteTotal !== undefined &&
    context.remoteTotal !== range.total
  ) {
    await response.body?.cancel();
    throw new Error("El tamaño remoto cambió durante la inspección.");
  }
  context.remoteTotal = range.total;

  return {
    bytes: await readBodyExactly(
      response,
      range.end - range.start + 1,
    ),
    start: range.start,
    end: range.end,
    total: range.total,
  };
}
```

```js
function readRemoteBoxHeader(bytes, start, total) {
  if (start < 0 || start >= total || bytes.byteLength < 8) {
    throw new Error("El encabezado MP4 remoto está truncado.");
  }
  const view = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  );
  const size32 = view.getUint32(0);
  const type = fourCc(bytes, 4);
  let headerSize = 8;
  let size;

  if (size32 === 1) {
    if (bytes.byteLength < 16) {
      throw new Error("El encabezado MP4 extendido está truncado.");
    }
    const largeSize = view.getBigUint64(8);
    if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("La caja MP4 remota declara un tamaño inseguro.");
    }
    size = Number(largeSize);
    headerSize = 16;
  } else if (size32 === 0) {
    size = total - start;
  } else {
    size = size32;
  }
  if (type === "uuid") headerSize += 16;
  if (size < headerSize || size > total - start) {
    throw new Error(`La caja MP4 remota ${type} excede el archivo.`);
  }
  return {
    type,
    start,
    end: start + size,
    size,
    headerSize,
  };
}
```

Implementar `findRemoteMoov` con este flujo exacto:

```js
async function findRemoteMoov(video, options) {
  const context = {
    options,
    deadlineAt: options.now() + options.timeoutMs,
    rangeRequests: 0,
    remoteTotal: undefined,
  };
  const probe = await readExactRange(
    video.src,
    0,
    options.initialProbeBytes - 1,
    context,
  );
  let offset = 0;
  let topLevelBoxes = 0;

  while (offset < probe.total) {
    topLevelBoxes += 1;
    if (topLevelBoxes > options.maxTopLevelBoxes) {
      throw new Error("Se superó el límite de cajas MP4 superiores.");
    }

    let headerBytes;
    if (
      offset >= probe.start &&
      offset + 32 <= probe.start + probe.bytes.byteLength
    ) {
      const relative = offset - probe.start;
      headerBytes = probe.bytes.subarray(relative, relative + 32);
    } else {
      headerBytes = (
        await readExactRange(video.src, offset, offset + 31, context)
      ).bytes;
    }
    const header = readRemoteBoxHeader(
      headerBytes,
      offset,
      probe.total,
    );

    if (header.type === "moov") {
      if (header.size > options.maxMoovBytes) {
        throw new Error("La caja moov supera el tamaño permitido.");
      }
      const probeEnd = probe.start + probe.bytes.byteLength;
      if (header.start >= probe.start && header.end <= probeEnd) {
        return probe.bytes.slice(
          header.start - probe.start,
          header.end - probe.start,
        );
      }
      return (
        await readExactRange(
          video.src,
          header.start,
          header.end - 1,
          context,
        )
      ).bytes;
    }

    offset = header.end;
  }

  throw new Error("El MP4 no contiene una caja moov.");
}
```

- [ ] **Step 4: Implementar validación previa y workers**

Agregar:

```js
export async function ensureVideoSourcesHaveNoAudio(
  videos,
  overrides = {},
) {
  if (!Array.isArray(videos)) {
    throw new Error("videos debe ser un arreglo.");
  }
  const options = {
    ...DEFAULT_MP4_INSPECTION_OPTIONS,
    fetchImpl: globalThis.fetch,
    now: Date.now,
    ...overrides,
  };
  for (const name of [
    "concurrency",
    "initialProbeBytes",
    "maxMoovBytes",
    "maxTopLevelBoxes",
    "maxParsedBoxes",
    "maxRangeRequests",
    "requestTimeoutMs",
    "timeoutMs",
  ]) {
    requirePositiveInteger(options[name], name);
  }
  for (const name of ["fetchImpl", "now"]) {
    if (typeof options[name] !== "function") {
      throw new Error(`${name} debe ser una función.`);
    }
  }

  function hasAudioRemovalTransformation(url) {
    const marker = "/video/upload/";
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return false;
    const segments = url.pathname
      .slice(markerIndex + marker.length)
      .split("/")
      .filter(Boolean);
    const versionIndex = segments.findIndex((segment) =>
      /^v\d+$/.test(segment),
    );
    if (versionIndex <= 0) return false;
    return segments
      .slice(0, versionIndex)
      .some((segment) => segment.split(",").includes("ac_none"));
  }

  const safeVideos = videos.map((video, index) => {
    if (
      typeof video?.assetId !== "string" ||
      video.assetId.trim().length === 0
    ) {
      throw new Error(`videos[${index}].assetId es obligatorio.`);
    }
    let url;
    try {
      url = new URL(video.src);
      if (url.protocol !== "https:") throw new Error();
    } catch {
      throw new Error(`videos[${index}].src debe usar HTTPS.`);
    }
    if (url.hostname !== "res.cloudinary.com") {
      throw new Error(
        `videos[${index}].src debe pertenecer a res.cloudinary.com.`,
      );
    }
    if (!hasAudioRemovalTransformation(url)) {
      throw new Error(`videos[${index}].src debe incluir ac_none.`);
    }
    return { assetId: video.assetId.trim(), src: url.toString() };
  });

  let nextIndex = 0;
  let firstError;
  const worker = async () => {
    while (firstError === undefined) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= safeVideos.length) return;
      const video = safeVideos[index];
      try {
        const moovBytes = await findRemoteMoov(video, options);
        inspectMp4Moov(moovBytes, {
          maxParsedBoxes: options.maxParsedBoxes,
        });
      } catch (error) {
        firstError ??= new Error(
          `El video ${video.assetId} no superó la inspección de audio: ${describeError(error)}`,
          { cause: error },
        );
      }
    }
  };

  const workerCount = Math.min(options.concurrency, safeVideos.length);
  await Promise.all(
    Array.from({ length: workerCount }, () => worker()),
  );
  if (firstError !== undefined) throw firstError;
}
```

- [ ] **Step 5: Integrar la barrera antes de la escritura atómica**

En `scripts/sync-cloudinary.mjs`:

```js
import { ensureVideoSourcesHaveNoAudio } from "./cloudinary-video-audio.mjs";
```

Agregar la dependencia:

```js
videoReadiness = ensureVideoSourcesReady,
videoAudioInspection = ensureVideoSourcesHaveNoAudio,
```

Validarla junto con las opciones:

```js
for (const [name, dependency] of [
  ["videoReadiness", videoReadiness],
  ["videoAudioInspection", videoAudioInspection],
]) {
  if (typeof dependency !== "function") {
    throw new Error(`${name} debe ser una función.`);
  }
}
```

Este bloque de validación debe ejecutarse antes de `getFolderMode()` y de la
primera llamada a `searchResources()`.

Reemplazar el bloque de videos por:

```js
if (manifest.videos.length > 0) {
  logger.log(
    `Preparando variantes de ${manifest.videos.length} videos...`,
  );
  await videoReadiness(manifest.videos);
  logger.log("Inspeccionando ausencia de audio...");
  await videoAudioInspection(manifest.videos);
  logger.log(`Videos verificados: ${manifest.videos.length}.`);
}
```

Este bloque debe permanecer antes de:

```js
const { changed } = await writeManifestAtomic(outputPath, manifest);
```

- [ ] **Step 6: Probar orden, cortocircuito y preservación byte por byte**

Actualizar el test exitoso de sync para partir de un manifiesto real, inyectar
ambas dependencias y comprobar que la inspección todavía ve el archivo anterior:

```js
const previous = { schemaVersion: 1, images: [], videos: [] };
const outputPath = await createTempOutput(t, previous);
const previousContent = await readFile(outputPath, "utf8");
const events = [];
let audioVideos;

const result = await runSync({
  credentials,
  folderMode: "dynamic",
  sources,
  client,
  outputPath,
  logger,
  async videoReadiness(videos) {
    events.push("readiness");
    receivedVideos = videos;
  },
  async videoAudioInspection(videos) {
    events.push("audio");
    audioVideos = videos;
    assert.equal(await readFile(outputPath, "utf8"), previousContent);
  },
});

assert.deepEqual(events, ["readiness", "audio"]);
assert.deepEqual(audioVideos, result.manifest.videos);
assert.notEqual(await readFile(outputPath, "utf8"), previousContent);
assert.match(
  logger.messages.join("\n"),
  /Preparando variantes de 1 videos/,
);
assert.match(
  logger.messages.join("\n"),
  /Inspeccionando ausencia de audio/,
);
assert.match(
  logger.messages.join("\n"),
  /Videos verificados: 1/,
);
```

Estas tres expectativas reemplazan las aserciones anteriores
`Comprobando reproducción...` y `Videos listos...`; no conservar los mensajes
viejos en el test.

Agregar un test con manifiesto anterior y tabla de fallos:

```js
for (const message of [
  "pista soun detectada",
  "MP4 inválido",
  "error de red",
]) {
  test(`runSync preserves the manifest when audio inspection fails: ${message}`, async (t) => {
    const previous = { schemaVersion: 1, images: [], videos: [] };
    const outputPath = await createTempOutput(t, previous);
    const previousContent = await readFile(outputPath, "utf8");

    await assert.rejects(
      () =>
        runSync({
          credentials,
          folderMode: "dynamic",
          sources,
          client: createClientWithOneCajasVideo(),
          outputPath,
          logger: createLogger(),
          async videoReadiness() {},
          async videoAudioInspection() {
            assert.equal(
              await readFile(outputPath, "utf8"),
              previousContent,
            );
            throw new Error(message);
          },
        }),
      new RegExp(message),
    );

    assert.equal(await readFile(outputPath, "utf8"), previousContent);
  });
}
```

Agregar este helper junto a `createLogger()`:

```js
function createClientWithOneCajasVideo() {
  return {
    async searchResources({ expression }) {
      if (expression.includes("/stand")) {
        return [
          imageResource({
            assetId: "stand-image",
            folder: "chaco-implantes/stand",
          }),
        ];
      }
      return [
        videoResource({
          assetId: "cajas-video",
          folder: "chaco-implantes/cajas",
        }),
      ];
    },
    async getFolderMode() {
      return "dynamic";
    },
  };
}
```

En el test de fallo de readiness, inyectar:

```js
let audioInspectionCalls = 0;

async function videoAudioInspection() {
  audioInspectionCalls += 1;
}
```

y después de `assert.rejects`:

```js
assert.equal(audioInspectionCalls, 0);
```

Agregar además un test que garantice que una dependencia inválida se rechaza
antes de consultar Search:

```js
test("runSync validates video gates before Search", async (t) => {
  const outputPath = await createTempOutput(t);
  let searches = 0;
  const client = {
    async searchResources() {
      searches += 1;
      return [];
    },
    async getFolderMode() {
      return "dynamic";
    },
  };

  await assert.rejects(
    () =>
      runSync({
        credentials,
        folderMode: "dynamic",
        sources,
        client,
        outputPath,
        logger: createLogger(),
        videoAudioInspection: null,
      }),
    /videoAudioInspection debe ser una función/,
  );
  assert.equal(searches, 0);
});
```

- [ ] **Step 7: Crear el comando de auditoría independiente**

Crear `scripts/verify-cloudinary-video-audio.mjs`:

```js
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { readManifest } from "./cloudinary-sync-io.mjs";
import { ensureVideoSourcesHaveNoAudio } from "./cloudinary-video-audio.mjs";

const DEFAULT_MANIFEST_PATH = fileURLToPath(
  new URL(
    "../src/data/generated/cloudinary-media.json",
    import.meta.url,
  ),
);

export async function runVideoAudioVerification({
  manifestPath = DEFAULT_MANIFEST_PATH,
  logger = console,
  videoAudioInspection = ensureVideoSourcesHaveNoAudio,
} = {}) {
  const manifest = await readManifest(manifestPath);
  logger.log(
    `Inspeccionando audio de ${manifest.videos.length} videos...`,
  );
  await videoAudioInspection(manifest.videos);
  logger.log(
    `Videos sin pista de audio: ${manifest.videos.length}.`,
  );
  return { count: manifest.videos.length };
}

const isMain =
  typeof process.argv[1] === "string" &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  runVideoAudioVerification().catch((error) => {
    console.error(
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  });
}
```

Agregar a `package.json`:

```json
"verify:cloudinary-video-audio": "node scripts/verify-cloudinary-video-audio.mjs"
```

- [ ] **Step 8: Probar el runner con manifiesto temporal**

Agregar al inicio de `scripts/cloudinary-video-audio.test.mjs`:

```js
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runVideoAudioVerification } from "./verify-cloudinary-video-audio.mjs";
```

Agregar:

```js
test("runVideoAudioVerification inspects the published manifest", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "video-audio-command-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const manifestPath = join(directory, "cloudinary-media.json");
  const publishedVideo = {
    assetId: "published-video",
    sourceFolder: "chaco-implantes/cajas",
    publicId: "published-video",
    category: "Instrumental",
    createdAt: "2026-07-26T12:00:00.000Z",
    title: "Producto instrumental",
    poster: "https://example.com/published-video.jpg",
    src:
      "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto,ac_none/v1/published-video.mp4",
    width: 1920,
    height: 1080,
    duration: 8,
  };
  await writeFile(
    manifestPath,
    `${JSON.stringify({
      schemaVersion: 1,
      images: [],
      videos: [publishedVideo],
    }, null, 2)}\n`,
    "utf8",
  );
  const messages = [];
  let receivedVideos;

  const result = await runVideoAudioVerification({
    manifestPath,
    logger: { log: (message) => messages.push(String(message)) },
    async videoAudioInspection(videos) {
      receivedVideos = videos;
    },
  });

  assert.deepEqual(receivedVideos, [publishedVideo]);
  assert.deepEqual(result, { count: 1 });
  assert.match(messages.join("\n"), /Videos sin pista de audio: 1/);

  await assert.rejects(
    () =>
      runVideoAudioVerification({
        manifestPath,
        logger: { log() {} },
        async videoAudioInspection() {
          throw new Error("inspección fallida");
        },
      }),
    /inspección fallida/,
  );
});
```

- [ ] **Step 9: Ejecutar las unidades de datos**

Run:

```powershell
node --test scripts/cloudinary-video-audio.test.mjs
node --test scripts/sync-cloudinary.test.mjs
npm run test:cloudinary
```

Expected: PASS; ninguna prueba usa la red real y la inspección siempre precede a la escritura.

- [ ] **Step 10: Crear el commit**

```powershell
git add -- scripts/cloudinary-video-audio.mjs scripts/cloudinary-video-audio.test.mjs scripts/verify-cloudinary-video-audio.mjs scripts/sync-cloudinary.mjs scripts/sync-cloudinary.test.mjs package.json
git diff --cached --check
git commit -m "feat(cloudinary): block unsafe videos before publish"
```

### Task 5: Regenerar y auditar el manifiesto real

**Files:**
- Modify through command: `src/data/generated/cloudinary-media.json`

- [ ] **Step 1: Confirmar precondiciones sin imprimir credenciales**

Run:

```powershell
git status --short
if (-not (Test-Path -LiteralPath '.env.local')) { throw '.env.local no existe' }
```

Expected: árbol limpio y `.env.local` presente. No mostrar su contenido.

- [ ] **Step 2: Ejecutar la sincronización sin aceptar eliminaciones**

Run:

```powershell
npm run sync:cloudinary
```

Expected:

```text
Preparando variantes de 70 videos...
Inspeccionando ausencia de audio...
Videos verificados: 70.
```

Si el comando exige `--accept-removals`, detenerse y revisar los `assetId`
informados; no aceptar bajas automáticamente.

Los valores `70` videos y `4` verticales son la fotografía aprobada al redactar
este plan. Si Search devuelve incorporaciones o bajas reales, detenerse,
comparar los `assetId` y actualizar conscientemente la auditoría; no tratar el
cambio de inventario como un defecto de código ni aceptar eliminaciones por
inercia.

- [ ] **Step 3: Auditar los 70 contenedores publicados**

Run:

```powershell
npm run verify:cloudinary-video-audio
```

Expected:

```text
Videos sin pista de audio: 70.
```

- [ ] **Step 4: Comparar inventario y transformaciones**

Run:

```powershell
$before = (git show HEAD:src/data/generated/cloudinary-media.json | Out-String) | ConvertFrom-Json
$after = Get-Content -LiteralPath 'src\data\generated\cloudinary-media.json' -Encoding utf8 -Raw | ConvertFrom-Json
if ($after.videos.Count -ne 70) { throw "Se esperaban 70 videos" }
if (@($after.videos | Where-Object { $_.duration -eq $null }).Count -ne 0) { throw "Hay videos sin duración" }
if (@($after.videos | Where-Object { $_.src -notmatch '/f_mp4,q_auto,ac_none/' }).Count -ne 0) { throw "Hay videos sin ac_none" }
if (@($after.videos | Where-Object { $_.poster -notmatch 'c_pad,ar_16:9,w_600' }).Count -ne 0) { throw "Hay pósteres sin c_pad" }
$beforeIds = @($before.videos.assetId | Sort-Object)
$afterIds = @($after.videos.assetId | Sort-Object)
if (Compare-Object $beforeIds $afterIds) { throw "Cambió el inventario de assetId" }
"videos=$($after.videos.Count) verticales=$(@($after.videos | Where-Object { $_.height -gt $_.width }).Count)"
```

Expected:

```text
videos=70 verticales=4
```

- [ ] **Step 5: Revisar y confirmar únicamente el manifiesto**

Run:

```powershell
git status --short
git diff --stat
git diff --check
```

Expected: solamente `src/data/generated/cloudinary-media.json` modificado, sin
errores de whitespace.

- [ ] **Step 6: Crear el commit de inventario**

```powershell
git add -- src/data/generated/cloudinary-media.json
git diff --cached --check
git commit -m "chore(cloudinary): publish silent media manifest"
```

### Task 6: Propagar duración sin cambiar el esquema

**Files:**
- Modify: `src/data/cloudinary-media-adapter.mjs:86-107`
- Modify: `src/data/site.ts:931-937`
- Test: `scripts/cloudinary-site-adapter.test.mjs`

- [ ] **Step 1: Escribir primero el contrato de duración**

Agregar `duration: 8.25` al fixture `standVideo`:

```js
const standVideo = {
  assetId: "stand-video",
  sourceFolder: "chaco-implantes/stand",
  category: "Eventos",
  poster: "https://example.com/poster.jpg",
  src: "https://example.com/video.mp4",
  title: "Recorrido por el stand",
  duration: 8.25,
};
```

Agregar `duration: 8.25` a la salida esperada del test de mapeo:

```js
{
  id: "stand-video",
  category: "Eventos",
  poster: standVideo.poster,
  src: standVideo.src,
  title: standVideo.title,
  duration: 8.25,
},
```

Agregar estos casos:

```js
test("buildSiteMediaCollections omits an unknown video duration", () => {
  const videoWithoutDuration = { ...standVideo };
  delete videoWithoutDuration.duration;
  const result = buildSiteMediaCollections({
    manifest: {
      schemaVersion: 1,
      images: [],
      videos: [videoWithoutDuration],
    },
    baseGallery,
    fallbackEvents,
  });

  assert.equal(
    Object.hasOwn(result.videos[0], "duration"),
    false,
  );
});

test("buildSiteMediaCollections preserves a zero duration", () => {
  const result = buildSiteMediaCollections({
    manifest: {
      schemaVersion: 1,
      images: [],
      videos: [{ ...standVideo, duration: 0 }],
    },
    baseGallery,
    fallbackEvents,
  });

  assert.equal(result.videos[0].duration, 0);
});

for (const duration of [-1, Number.NaN, Number.POSITIVE_INFINITY, "8"]) {
  test(`buildSiteMediaCollections rejects invalid duration ${String(duration)}`, () => {
    assert.throws(
      () =>
        buildSiteMediaCollections({
          manifest: {
            schemaVersion: 1,
            images: [],
            videos: [{ ...standVideo, duration }],
          },
          baseGallery,
          fallbackEvents,
        }),
      /duration no es válida/,
    );
  });
}
```

- [ ] **Step 2: Ejecutar la prueba y confirmar el fallo**

Run:

```powershell
node --test scripts/cloudinary-site-adapter.test.mjs
```

Expected: FAIL porque el adaptador todavía descarta `duration` y no la valida.

- [ ] **Step 3: Validar y propagar únicamente valores presentes**

En el mapeo de videos de `src/data/cloudinary-media-adapter.mjs`, después de
validar URLs y categoría:

```js
if (
  video.duration !== undefined &&
  (!Number.isFinite(video.duration) || video.duration < 0)
) {
  throw new Error(
    `Manifiesto inválido: ${location}.duration no es válida.`,
  );
}
```

Dejar el objeto de salida así:

```js
return {
  id: video.assetId,
  category: video.category,
  poster: video.poster,
  src: video.src,
  title: video.title,
  ...(video.duration === undefined
    ? {}
    : { duration: video.duration }),
};
```

En `src/data/site.ts`, extender el tipo:

```ts
export type VideoItem = {
  id: string;
  category: GalleryCategory;
  poster: string;
  src: string;
  title: string;
  duration?: number;
};
```

- [ ] **Step 4: Ejecutar adaptador y typecheck**

Run:

```powershell
node --test scripts/cloudinary-site-adapter.test.mjs
npm run check
```

Expected: PASS y Astro reporta cero errores.

- [ ] **Step 5: Crear el commit**

```powershell
git add -- src/data/cloudinary-media-adapter.mjs src/data/site.ts scripts/cloudinary-site-adapter.test.mjs
git diff --cached --check
git commit -m "feat(media): expose synchronized video durations"
```

### Task 7: Reemplazar controles nativos por el player B accesible

**Files:**
- Create: `src/components/VideoPlayer.astro`
- Modify: `src/components/Icon.astro`
- Modify: `src/pages/videos.astro:1-225`
- Modify: `scripts/smoke.mjs:365-405`

- [ ] **Step 1: Escribir primero las aserciones de estructura**

Después de comprobar la cantidad de `data-video-item` en `scripts/smoke.mjs`,
agregar:

```js
const renderedVideoTags = videos.match(/<video\b[^>]*>/g) ?? [];
assert(
  (videos.match(/data-video-player(?=[\s>])/g) ?? []).length ===
    cloudinaryManifest.videos.length,
  "Videos page should render one custom player per synchronized video",
);
assert(
  renderedVideoTags.length === cloudinaryManifest.videos.length,
  "Videos page should render one media element per synchronized video",
);
for (const tag of renderedVideoTags) {
  assert(tag.includes("data-video-media"), "Video should expose the custom media marker");
  assert(tag.includes("data-src="), "Video should defer its source in data-src");
  assert(!/\ssrc=/.test(tag), "Video should not receive src before interaction");
  assert(!/\sposter=/.test(tag), "Video should use a lazy image instead of native poster");
  assert(!/\scontrols(?:[=\s>])/.test(tag), "Video should not expose native controls");
  assert(tag.includes('preload="none"'), "Video should disable preload");
  assert(tag.includes("playsinline"), "Video should preserve inline playback");
  assert(tag.includes("muted"), "Video should remain muted as a defense");
}
assert(
  (videos.match(/data-video-poster(?=[\s>])/g) ?? []).length ===
    cloudinaryManifest.videos.length,
  "Videos page should render one lazy poster per player",
);
const renderedPosterTags =
  videos.match(/<img\b(?=[^>]*data-video-poster)[^>]*>/g) ?? [];
for (const tag of renderedPosterTags) {
  assert(tag.includes('loading="lazy"'), "Video poster should load lazily");
  assert(tag.includes('decoding="async"'), "Video poster should decode asynchronously");
}
assert(videos.includes("data-video-progress"), "Player should expose seek controls");
assert(videos.includes("data-video-fullscreen"), "Player should expose fullscreen controls");
assert(videos.includes("data-video-fallback"), "Player should keep a resilient fallback");
assert(videos.includes("SIN AUDIO"), "Player should communicate that videos have no audio");
assert(!videos.includes("data-video-volume"), "Player should not render volume controls");
```

En el mismo archivo, mantener la prueba negativa de mojibake pero expresar sus
dos caracteres corruptos mediante escapes. Así la comprobación sigue siendo
equivalente en runtime y el código fuente permanece UTF-8 limpio:

```js
assert(
  !home.includes("Tecnolog\u00c3\u00ada Medacta"),
  "NextAR hero copy should not mention Medacta",
);
```

Dentro del loop existente del manifiesto, conservar las comprobaciones de URL
y sumar:

```js
assert(
  video.src.includes("ac_none"),
  `Video source should remove audio: ${video.assetId}`,
);
assert(
  video.poster.includes("c_pad"),
  `Video poster should preserve the full frame: ${video.assetId}`,
);
```

- [ ] **Step 2: Ejecutar build y smoke para ver el fallo**

Run:

```powershell
npm run build
npm run test:smoke
```

Expected: build PASS y smoke FAIL porque la página todavía usa controles nativos y no tiene `data-video-player`.

- [ ] **Step 3: Agregar los íconos necesarios**

En el mapa `icons` de `src/components/Icon.astro`, agregar:

```js
maximize:
  '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
minimize:
  '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M16 3v3a2 2 0 0 0 2 2h3"/><path d="M8 21v-3a2 2 0 0 0-2-2H3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
"rotate-ccw":
  '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
```

- [ ] **Step 4: Crear el componente con marcado diferido**

Crear `src/components/VideoPlayer.astro` con este frontmatter y marcado:

```astro
---
import Icon from "./Icon.astro";

interface Props {
  assetId: string;
  src: string;
  poster: string;
  title: string;
  duration?: number;
  position: number;
}

const {
  assetId,
  src,
  poster,
  title,
  duration,
  position,
} = Astro.props;

const formatTime = (value: number | undefined) => {
  if (!Number.isFinite(value)) return "--:--";
  const seconds = Math.max(0, Math.floor(value as number));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

const safeId = assetId.replace(/[^A-Za-z0-9_-]/g, "-");
const progressId = `video-progress-${safeId}`;
const accessibleName = `video ${position}: ${title}`;
const durationLabel = formatTime(duration);
---

<div
  data-video-player
  data-video-id={assetId}
  data-state="idle"
  data-controls-visible="true"
  data-duration={duration}
  class="video-player"
  role="group"
  aria-label={`Reproductor del ${accessibleName}`}
  aria-busy="false"
>
  <img
    data-video-poster
    src={poster}
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
    width="600"
    height="338"
    class="video-player__poster"
  />

  <video
    data-video-media
    data-src={src}
    preload="none"
    playsinline
    muted
    aria-hidden="true"
    class="video-player__media"
  ></video>

  <div class="video-player__shade" aria-hidden="true"></div>
  <span class="video-player__badge">SIN AUDIO</span>

  <button
    type="button"
    data-video-primary
    class="video-player__primary"
    aria-label={`Reproducir ${accessibleName}`}
  >
    <span data-video-primary-play><Icon name="play" class="h-6 w-6" /></span>
    <span data-video-primary-replay hidden><Icon name="rotate-ccw" class="h-6 w-6" /></span>
  </button>

  <p
    data-video-status
    class="video-player__status"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  ></p>

  <div
    data-video-error
    class="video-player__error"
    role="alert"
    hidden
  >
    <p>No pudimos reproducir el video.</p>
    <button
      type="button"
      data-video-retry
      aria-label={`Reintentar ${accessibleName}`}
    >
      Reintentar
    </button>
  </div>

  <div data-video-controls class="video-player__controls">
    <button
      type="button"
      data-video-toggle
      class="video-player__button"
      aria-label={`Reproducir ${accessibleName}`}
    >
      <span data-video-toggle-play><Icon name="play" class="h-4 w-4" /></span>
      <span data-video-toggle-pause hidden><Icon name="pause" class="h-4 w-4" /></span>
      <span data-video-toggle-replay hidden><Icon name="rotate-ccw" class="h-4 w-4" /></span>
    </button>

    <input
      id={progressId}
      data-video-progress
      class="video-player__progress"
      type="range"
      min="0"
      max={duration ?? 0}
      value="0"
      step="0.1"
      disabled
      aria-label={`Progreso del ${accessibleName}`}
      aria-valuetext={`00:00 de ${durationLabel}`}
    />

    <output
      data-video-time
      class="video-player__time"
      for={progressId}
      aria-hidden="true"
    >
      00:00 / {durationLabel}
    </output>

    <button
      type="button"
      data-video-fullscreen
      class="video-player__button"
      aria-label={`Ver ${accessibleName} en pantalla completa`}
    >
      <span data-video-maximize><Icon name="maximize" class="h-4 w-4" /></span>
      <span data-video-minimize hidden><Icon name="minimize" class="h-4 w-4" /></span>
    </button>
  </div>

  <a
    data-video-fallback
    class="video-player__fallback"
    href={src}
    target="_blank"
    rel="noopener noreferrer"
  >
    Abrir video {position} en una pestaña nueva
  </a>
</div>
```

- [ ] **Step 5: Implementar el controlador sin cargar MP4 al inicializar**

Agregar al mismo componente:

```astro
<script>
  let activeVideo: HTMLVideoElement | null = null;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  );

  const formatVideoTime = (value: number) => {
    if (!Number.isFinite(value)) return "--:--";
    const seconds = Math.max(0, Math.floor(value));
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };

  document.querySelectorAll<HTMLElement>("[data-video-player]").forEach(
    (root) => {
      if (root.dataset.enhanced === "true") return;

      const video = root.querySelector<HTMLVideoElement>("[data-video-media]");
      const poster = root.querySelector<HTMLElement>("[data-video-poster]");
      const primary = root.querySelector<HTMLButtonElement>("[data-video-primary]");
      const toggle = root.querySelector<HTMLButtonElement>("[data-video-toggle]");
      const progress = root.querySelector<HTMLInputElement>("[data-video-progress]");
      const time = root.querySelector<HTMLOutputElement>("[data-video-time]");
      const fullscreen = root.querySelector<HTMLButtonElement>("[data-video-fullscreen]");
      const status = root.querySelector<HTMLElement>("[data-video-status]");
      const errorPanel = root.querySelector<HTMLElement>("[data-video-error]");
      const retry = root.querySelector<HTMLButtonElement>("[data-video-retry]");
      const fallback = root.querySelector<HTMLAnchorElement>("[data-video-fallback]");
      const controls = root.querySelector<HTMLElement>("[data-video-controls]");

      if (
        !video ||
        !poster ||
        !primary ||
        !toggle ||
        !progress ||
        !time ||
        !fullscreen ||
        !status ||
        !errorPanel ||
        !retry ||
        !fallback ||
        !controls ||
        !video.dataset.src
      ) {
        return;
      }

      const title = root.getAttribute("aria-label")?.replace(
        /^Reproductor del /,
        "",
      ) || "video";
      const primaryPlay = root.querySelector<HTMLElement>("[data-video-primary-play]");
      const primaryReplay = root.querySelector<HTMLElement>("[data-video-primary-replay]");
      const togglePlay = root.querySelector<HTMLElement>("[data-video-toggle-play]");
      const togglePause = root.querySelector<HTMLElement>("[data-video-toggle-pause]");
      const toggleReplay = root.querySelector<HTMLElement>("[data-video-toggle-replay]");
      const maximize = root.querySelector<HTMLElement>("[data-video-maximize]");
      const minimize = root.querySelector<HTMLElement>("[data-video-minimize]");
      let controlsTimer = 0;
      let hasStarted = false;

      const setStatus = (message = "") => {
        status.textContent = message;
      };

      const setState = (state: string) => {
        root.dataset.state = state;
        root.setAttribute("aria-busy", String(state === "loading"));
        errorPanel.hidden = state !== "error";
        fallback.hidden = state !== "error";
      };

      const containsFocus = (element: HTMLElement) =>
        document.activeElement !== null &&
        element.contains(document.activeElement);

      const updateTime = () => {
        const duration = Number.isFinite(video.duration)
          ? video.duration
          : Number(root.dataset.duration);
        const current = Number.isFinite(video.currentTime)
          ? video.currentTime
          : 0;
        const durationText = formatVideoTime(duration);
        const currentText = formatVideoTime(current);
        if (Number.isFinite(duration) && duration > 0) {
          progress.max = String(duration);
          progress.value = String(Math.min(current, duration));
        }
        progress.disabled =
          video.readyState < HTMLMediaElement.HAVE_METADATA;
        progress.setAttribute(
          "aria-valuetext",
          `${currentText} de ${durationText}`,
        );
        time.textContent = `${currentText} / ${durationText}`;
      };

      const syncButtons = () => {
        const state = root.dataset.state || "idle";
        const playing = !video.paused && !video.ended;
        const ended = state === "ended";
        const action = playing
          ? `Pausar ${title}`
          : ended
            ? `Reproducir nuevamente ${title}`
            : `Reproducir ${title}`;
        primary.setAttribute("aria-label", action);
        toggle.setAttribute("aria-label", action);
        if (primaryPlay) primaryPlay.hidden = ended;
        if (primaryReplay) primaryReplay.hidden = !ended;
        if (togglePlay) togglePlay.hidden = playing || ended;
        if (togglePause) togglePause.hidden = !playing;
        if (toggleReplay) toggleReplay.hidden = !ended;
      };

      const revealControls = () => {
        window.clearTimeout(controlsTimer);
        root.dataset.controlsVisible = "true";
        if (
          finePointer.matches &&
          root.dataset.state === "playing" &&
          !root.matches(":focus-within")
        ) {
          controlsTimer = window.setTimeout(() => {
            root.dataset.controlsVisible = "false";
          }, 2_200);
        }
      };

      const ensureSource = () => {
        if (video.hasAttribute("src")) return;
        video.src = video.dataset.src || "";
        video.load();
      };

      const showError = () => {
        const playerHadFocus = containsFocus(root);
        if (activeVideo === video) activeVideo = null;
        setState("error");
        setStatus("");
        revealControls();
        syncButtons();
        if (playerHadFocus) retry.focus();
      };

      const startPlayback = async () => {
        if (root.dataset.state === "ended") video.currentTime = 0;
        ensureSource();
        if (video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
          const primaryHadFocus = containsFocus(primary);
          setState("loading");
          setStatus("Cargando video…");
          if (primaryHadFocus) toggle.focus();
        }
        try {
          await video.play();
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          showError();
        }
      };

      const togglePlayback = () => {
        if (!video.paused && !video.ended) {
          video.pause();
        } else {
          void startPlayback();
        }
      };

      primary.addEventListener("click", togglePlayback);
      toggle.addEventListener("click", togglePlayback);
      video.addEventListener("click", togglePlayback);
      retry.addEventListener("click", () => {
        const retryHadFocus = containsFocus(retry);
        video.pause();
        video.removeAttribute("src");
        video.load();
        delete root.dataset.mediaReady;
        hasStarted = false;
        progress.value = "0";
        progress.disabled = true;
        poster.hidden = false;
        setState("idle");
        setStatus("");
        void startPlayback();
        if (retryHadFocus) toggle.focus();
      });

      video.addEventListener("play", () => {
        if (activeVideo && activeVideo !== video) activeVideo.pause();
        activeVideo = video;
      });
      video.addEventListener("loadstart", () => {
        const primaryHadFocus = containsFocus(primary);
        setState("loading");
        setStatus("Cargando video…");
        syncButtons();
        if (primaryHadFocus) toggle.focus();
      });
      video.addEventListener("waiting", () => {
        if (!video.paused) {
          setState("loading");
          setStatus("Cargando video…");
        }
      });
      video.addEventListener("loadedmetadata", updateTime);
      video.addEventListener("loadeddata", () => {
        root.dataset.mediaReady = "true";
        poster.hidden = true;
      });
      video.addEventListener("playing", () => {
        const primaryHadFocus = containsFocus(primary);
        hasStarted = true;
        setState("playing");
        setStatus("");
        syncButtons();
        revealControls();
        if (primaryHadFocus) toggle.focus();
      });
      video.addEventListener("pause", () => {
        if (video.ended || root.dataset.state === "error") return;
        const controlsHadFocus = containsFocus(controls);
        if (activeVideo === video) activeVideo = null;
        setState(hasStarted ? "paused" : "idle");
        setStatus("");
        syncButtons();
        revealControls();
        if (!hasStarted && controlsHadFocus) primary.focus();
      });
      video.addEventListener("ended", () => {
        const controlsHadFocus = containsFocus(controls);
        if (activeVideo === video) activeVideo = null;
        setState("ended");
        syncButtons();
        revealControls();
        if (controlsHadFocus) primary.focus();
      });
      video.addEventListener("error", () => {
        if (video.hasAttribute("src")) showError();
      });
      video.addEventListener("timeupdate", updateTime);

      progress.addEventListener("input", () => {
        const nextTime = Number(progress.value);
        if (Number.isFinite(nextTime)) {
          video.currentTime = nextTime;
          updateTime();
        }
      });

      const canFullscreen =
        document.fullscreenEnabled &&
        typeof root.requestFullscreen === "function";
      fullscreen.hidden = !canFullscreen;
      fullscreen.addEventListener("click", async () => {
        try {
          if (document.fullscreenElement === root) {
            await document.exitFullscreen();
          } else {
            await root.requestFullscreen();
          }
        } catch {
          setStatus("No se pudo abrir la pantalla completa.");
        }
      });
      document.addEventListener("fullscreenchange", () => {
        const expanded = document.fullscreenElement === root;
        if (maximize) maximize.hidden = expanded;
        if (minimize) minimize.hidden = !expanded;
        fullscreen.setAttribute(
          "aria-label",
          expanded
            ? `Salir de pantalla completa para ${title}`
            : `Ver ${title} en pantalla completa`,
        );
      });

      for (const eventName of ["pointermove", "pointerdown", "focusin"]) {
        root.addEventListener(eventName, revealControls);
      }
      root.addEventListener("focusout", () => {
        window.requestAnimationFrame(revealControls);
      });

      fallback.hidden = true;
      root.dataset.enhanced = "true";
      updateTime();
      syncButtons();
    },
  );
</script>
```

- [ ] **Step 6: Aplicar el estilo B dentro del componente**

Agregar estilos acotados que establezcan exactamente estas bases:

```astro
<style>
  .video-player {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: #0f172a;
    color: #fff;
    isolation: isolate;
  }

  .video-player [hidden] {
    display: none !important;
  }

  .video-player__poster,
  .video-player__media {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #0f172a;
  }

  .video-player__media {
    opacity: 0;
  }

  .video-player[data-media-ready="true"] .video-player__media {
    opacity: 1;
  }

  .video-player__shade {
    position: absolute;
    inset: 35% 0 0;
    background: linear-gradient(180deg, transparent, rgba(4, 12, 27, 0.88));
    pointer-events: none;
  }

  .video-player__badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.35rem 0.55rem;
    border: 1px solid rgba(143, 179, 226, 0.42);
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.8);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .video-player__primary {
    position: absolute;
    inset: 50% auto auto 50%;
    display: grid;
    width: 3.5rem;
    height: 3.5rem;
    border: 1px solid rgba(255, 255, 255, 0.36);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: rgba(15, 23, 42, 0.8);
    color: #fff;
    place-items: center;
  }

  .video-player[data-state="playing"] .video-player__primary,
  .video-player[data-state="loading"] .video-player__primary,
  .video-player[data-state="paused"] .video-player__primary,
  .video-player[data-state="error"] .video-player__primary {
    display: none;
  }

  .video-player__controls {
    position: absolute;
    right: 0.6rem;
    bottom: 0.55rem;
    left: 0.6rem;
    display: grid;
    grid-template-columns: 2.75rem minmax(0, 1fr) auto 2.75rem;
    gap: 0.55rem;
    align-items: center;
    opacity: 1;
    transition: opacity 180ms ease;
  }

  .video-player[data-state="idle"] .video-player__controls,
  .video-player[data-state="ended"] .video-player__controls {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .video-player[data-controls-visible="false"] .video-player__controls {
    opacity: 0;
    pointer-events: none;
  }

  .video-player__button,
  .video-player__primary {
    display: grid;
    min-width: 2.75rem;
    min-height: 2.75rem;
    border: 0;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.82);
    color: #fff;
    place-items: center;
  }

  .video-player__error button {
    min-height: 2.75rem;
    padding: 0.65rem 1rem;
    border: 0;
    border-radius: 0.5rem;
    background: #2b6cb8;
    color: #fff;
    font-weight: 700;
  }

  .video-player__progress {
    width: 100%;
    min-height: 2.75rem;
    accent-color: #60a5fa;
    cursor: pointer;
  }

  .video-player__time {
    min-width: 6.8rem;
    color: #fff;
    font-size: 0.7rem;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .video-player__status,
  .video-player__error,
  .video-player__fallback {
    position: absolute;
    left: 50%;
    z-index: 2;
    transform: translateX(-50%);
    border-radius: 0.5rem;
    background: rgba(15, 23, 42, 0.9);
    color: #fff;
    font-size: 0.75rem;
    text-align: center;
  }

  .video-player__status {
    top: 1rem;
    margin: 0;
  }

  .video-player[data-state="loading"] .video-player__status {
    padding: 0.45rem 0.65rem;
  }

  .video-player[data-state="loading"] .video-player__status::before {
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    margin-right: 0.4rem;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: video-player-spin 700ms linear infinite;
    content: "";
  }

  .video-player__error {
    top: 50%;
    width: min(18rem, calc(100% - 2rem));
    padding: 0.9rem;
    transform: translate(-50%, -50%);
  }

  .video-player__error p {
    margin: 0 0 0.65rem;
  }

  .video-player__fallback {
    bottom: 0.75rem;
    padding: 0.7rem 0.9rem;
    text-decoration: underline;
  }

  .video-player[data-state="error"] .video-player__controls {
    display: none;
  }

  .video-player:not([data-enhanced="true"]) .video-player__primary,
  .video-player:not([data-enhanced="true"]) .video-player__controls,
  .video-player:not([data-enhanced="true"]) .video-player__status,
  .video-player:not([data-enhanced="true"]) .video-player__error {
    display: none;
  }

  .video-player:fullscreen {
    width: 100vw;
    height: 100vh;
    aspect-ratio: auto;
  }

  .video-player button:focus-visible,
  .video-player input:focus-visible,
  .video-player a:focus-visible {
    outline: 3px solid #60a5fa;
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    .video-player button:hover {
      background: rgba(43, 108, 184, 0.94);
    }
  }

  @media (max-width: 32rem) {
    .video-player__controls {
      grid-template-columns: 2.75rem minmax(0, 1fr) 2.75rem;
    }

    .video-player__time {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .video-player__controls,
    .video-player__media {
      transition: none;
    }

    .video-player[data-state="loading"] .video-player__status::before {
      animation: none;
    }
  }

  @keyframes video-player-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
```

- [ ] **Step 7: Integrar el componente sin cambiar filtros ni textos**

En `src/pages/videos.astro`, importar:

```astro
import VideoPlayer from "../components/VideoPlayer.astro";
```

Cambiar el map a:

```astro
{videos.map((video, index) => (
  <article
    data-video-item
    data-category={video.category}
    class="premium-card overflow-hidden rounded-xl border"
  >
    <VideoPlayer
      assetId={video.id}
      src={video.src}
      poster={video.poster}
      title={video.title}
      duration={video.duration}
      position={index + 1}
    />
    <div class="px-4 py-3">
      <h2 class="font-display text-sm font-semibold text-deep">
        {video.title}
      </h2>
      <p class="mt-0.5 text-xs text-muted-foreground">
        {video.category}
      </p>
    </div>
  </article>
))}
```

No tocar el bloque que pausa `item.querySelector("video")` al ocultar una
categoría.

- [ ] **Step 8: Ejecutar check, build y smoke**

Run:

```powershell
npm run check
npm run build
npm run test:smoke
```

Expected: cero diagnósticos, build completo y smoke PASS con un player por cada video.

- [ ] **Step 9: Crear el commit**

```powershell
git add -- src/components/VideoPlayer.astro src/components/Icon.astro src/pages/videos.astro scripts/smoke.mjs
git diff --cached --check
git commit -m "feat(videos): add accessible floating player"
```

### Task 8: Automatizar la reproducción real en Chromium

**Files:**
- Create: `scripts/verify-video-player.mjs`
- Modify: `package.json`

- [ ] **Step 1: Restaurar la dependencia bloqueada y Chromium**

Playwright ya figura en `package.json` y `package-lock.json`, pero puede faltar
en un `node_modules` parcial. Restaurar exactamente el lockfile e instalar el
navegador de esa versión:

```powershell
npm ci
npx playwright install chromium
node -e "import('playwright').then(() => console.log('Playwright disponible'))"
```

Expected: `npm ci` no modifica `package.json` ni `package-lock.json`, Chromium
queda disponible y el último comando imprime `Playwright disponible`.

- [ ] **Step 2: Crear el verificador autocontenido**

Crear `scripts/verify-video-player.mjs`:

```js
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const manifest = JSON.parse(
  await readFile(
    path.join(
      root,
      "src",
      "data",
      "generated",
      "cloudinary-media.json",
    ),
    "utf8",
  ),
);
const host = "127.0.0.1";
const port = 4332;
const baseUrl = `http://${host}:${port}`;
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function assertPortAvailable() {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.once("listening", () => server.close(resolve));
    server.listen(port, host);
  });
}

function startPreview() {
  const child = spawn(
    `npm run preview -- --host ${host} --port ${port}`,
    {
      cwd: root,
      env: process.env,
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
  child.stdout.on("data", (data) =>
    process.stdout.write(`[astro] ${data}`),
  );
  child.stderr.on("data", (data) =>
    process.stderr.write(`[astro] ${data}`),
  );
  return child;
}

async function waitForPreview(child) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error("Astro preview terminó antes de responder.");
    }
    try {
      const response = await fetch(baseUrl, {
        signal: AbortSignal.timeout(1_500),
      });
      if (response.ok) return;
    } catch {
      await delay(300);
    }
  }
  throw new Error("Astro preview no respondió dentro de 45 segundos.");
}

async function stopPreview(child) {
  if (!child || child.exitCode !== null || child.pid === undefined) return;
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn(
        "taskkill",
        ["/pid", String(child.pid), "/T", "/F"],
        { stdio: "ignore", windowsHide: true },
      );
      killer.once("close", resolve);
      killer.once("error", resolve);
    });
    return;
  }
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("close", resolve)),
    delay(3_000).then(() => child.kill("SIGKILL")),
  ]);
}

function isMp4(url) {
  try {
    return new URL(url).pathname.endsWith(".mp4");
  } catch {
    return false;
  }
}

async function verifyDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__videoTestFullscreenElement = null;
    Object.defineProperty(document, "fullscreenEnabled", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      get: () => window.__videoTestFullscreenElement,
    });
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      value: async function requestFullscreen() {
        window.__videoTestFullscreenElement = this;
        document.dispatchEvent(new Event("fullscreenchange"));
      },
    });
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: async () => {
        window.__videoTestFullscreenElement = null;
        document.dispatchEvent(new Event("fullscreenchange"));
      },
    });
  });
  const mp4Requests = [];
  page.on("request", (request) => {
    if (isMp4(request.url())) mp4Requests.push(request.url());
  });

  try {
    await page.goto(`${baseUrl}/videos`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      (expected) => {
        const roots = [...document.querySelectorAll("[data-video-player]")];
        return (
          roots.length === expected &&
          roots.every((root) => root.getAttribute("data-enhanced") === "true")
        );
      },
      manifest.videos.length,
    );

    const players = page.locator("[data-video-player]");
    assert.equal(await players.count(), manifest.videos.length);
    assert.equal(mp4Requests.length, 0);
    assert.equal(
      await page.locator("[data-video-volume]").count(),
      0,
    );

    const first = players.nth(0);
    const second = players.nth(1);
    await first.locator("video").evaluate((video) => {
      video.loop = true;
    });
    const firstPrimary = first.locator("[data-video-primary]");
    await firstPrimary.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      () =>
        document.querySelector("[data-video-player]")?.getAttribute(
          "data-state",
        ) === "playing",
    );
    assert.equal(
      await first.locator("[data-video-toggle]").evaluate(
        (button) => document.activeElement === button,
      ),
      true,
    );
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-media]")[0]?.currentTime >
        0.1,
    );
    assert.equal(
      await first.locator("video").evaluate((video) => video.muted),
      true,
    );
    assert.match(
      await first.locator("video").evaluate((video) => video.currentSrc),
      /ac_none/,
    );
    assert.equal(new Set(mp4Requests).size, 1);

    await second.locator("video").evaluate((video) => {
      video.loop = true;
    });
    await second.locator("[data-video-primary]").click();
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-player]")[1]?.getAttribute(
          "data-state",
        ) === "playing",
    );
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-media]")[1]?.currentTime >
        0.1,
    );
    assert.equal(
      await first.locator("video").evaluate((video) => video.paused),
      true,
    );

    const secondToggle = second.locator("[data-video-toggle]");
    await secondToggle.focus();
    await page.keyboard.press("Space");
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-player]")[1]?.getAttribute(
          "data-state",
        ) === "paused",
    );

    const progress = second.locator("[data-video-progress]");
    await page.waitForFunction(
      () =>
        !document.querySelectorAll("[data-video-progress]")[1]?.hasAttribute(
          "disabled",
        ),
    );
    const seekTarget = await progress.evaluate((input) =>
      Math.min(1, Number(input.max) / 2),
    );
    await progress.evaluate((input, value) => {
      input.value = String(value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, seekTarget);
    assert.ok(
      Math.abs(
        (await second.locator("video").evaluate(
          (video) => video.currentTime,
        )) - seekTarget,
      ) < 0.35,
    );
    const rangeBeforeArrow = Number(await progress.inputValue());
    await progress.focus();
    await page.keyboard.press("ArrowRight");
    assert.ok(Number(await progress.inputValue()) > rangeBeforeArrow);
    await secondToggle.focus();
    await page.keyboard.press("Space");
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-player]")[1]?.getAttribute(
          "data-state",
        ) === "playing",
    );

    const fullscreen = second.locator("[data-video-fullscreen]");
    await fullscreen.focus();
    assert.equal(await fullscreen.isVisible(), true);
    await fullscreen.click();
    await page.waitForFunction(
      () =>
        document.fullscreenElement?.hasAttribute(
          "data-video-player",
        ) === true,
    );
    assert.match(
      (await fullscreen.getAttribute("aria-label")) || "",
      /Salir de pantalla completa/,
    );
    assert.equal(
      await second.locator("[data-video-minimize]").isVisible(),
      true,
    );
    await fullscreen.click();
    await page.waitForFunction(
      () => document.fullscreenElement === null,
    );
    assert.match(
      (await fullscreen.getAttribute("aria-label")) || "",
      /en pantalla completa/,
    );

    await page.locator('[data-video-filter="Eventos"]').click();
    assert.equal(
      await second.locator("video").evaluate((video) => video.paused),
      true,
    );
    assert.equal(
      await second.locator("xpath=..").evaluate((article) =>
        article.classList.contains("hidden"),
      ),
      true,
    );
    await page.locator('[data-video-filter="Todos"]').click();

    const fourth = players.nth(3);
    const fourthUrl = await fourth.locator("video").getAttribute("data-src");
    assert.ok(fourthUrl);
    let stalledRoute;
    await page.route(fourthUrl, (route) => {
      stalledRoute = route;
    });
    const fourthPrimary = fourth.locator("[data-video-primary]");
    await fourthPrimary.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-player]")[3]?.getAttribute(
          "data-state",
        ) === "loading",
    );
    assert.equal(
      await fourth.locator("[data-video-toggle]").evaluate(
        (button) => document.activeElement === button,
      ),
      true,
    );
    await page.keyboard.press("Space");
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-player]")[3]?.getAttribute(
          "data-state",
        ) === "idle",
    );
    assert.equal(
      await fourthPrimary.evaluate(
        (button) => document.activeElement === button,
      ),
      true,
    );
    await stalledRoute?.abort().catch(() => {});
    await page.unroute(fourthUrl);

    const third = players.nth(2);
    const thirdUrl = await third.locator("video").getAttribute("data-src");
    assert.ok(thirdUrl);
    await page.route(thirdUrl, (route) => route.abort());
    await third.locator("[data-video-primary]").click();
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-player]")[2]?.getAttribute(
          "data-state",
        ) === "error",
    );
    assert.equal(
      await third.locator("[data-video-fallback]").isVisible(),
      true,
    );
    assert.equal(
      await third.locator("[data-video-retry]").evaluate(
        (button) => document.activeElement === button,
      ),
      true,
    );
    await page.unroute(thirdUrl);
    await third.locator("[data-video-retry]").click();
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-player]")[2]?.getAttribute(
          "data-state",
        ) === "playing",
    );
    assert.equal(
      await third.locator("[data-video-toggle]").evaluate(
        (button) => document.activeElement === button,
      ),
      true,
    );
    await third.locator("video").evaluate((video) => {
      video.currentTime = Math.max(0, video.duration - 0.1);
    });
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-player]")[2]?.getAttribute(
          "data-state",
        ) === "ended",
    );
    assert.equal(
      await third.locator("[data-video-primary]").evaluate(
        (button) => document.activeElement === button,
      ),
      true,
    );
    await third.locator("[data-video-primary]").click();
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[data-video-player]")[2]?.getAttribute(
          "data-state",
        ) === "playing",
    );
    assert.equal(
      await third.locator("[data-video-toggle]").evaluate(
        (button) => document.activeElement === button,
      ),
      true,
    );

    const vertical = manifest.videos.find(
      ({ height, width }) => height > width,
    );
    assert.ok(vertical);
    const verticalPlayer = page.locator(
      `[data-video-id="${vertical.assetId}"]`,
    );
    const verticalState = await verticalPlayer.getAttribute("data-state");
    if (verticalState === "idle" || verticalState === "ended") {
      await verticalPlayer.locator("[data-video-primary]").click();
    } else if (verticalState === "paused") {
      await verticalPlayer.locator("[data-video-toggle]").click();
    } else if (verticalState === "error") {
      await verticalPlayer.locator("[data-video-retry]").click();
    }
    await page.waitForFunction(
      (assetId) => {
        const root = [...document.querySelectorAll("[data-video-player]")]
          .find((candidate) => candidate.getAttribute("data-video-id") === assetId);
        const video = root?.querySelector("[data-video-media]");
        return (
          video instanceof HTMLVideoElement &&
          video.readyState >= HTMLMediaElement.HAVE_METADATA
        );
      },
      vertical.assetId,
      { timeout: 30_000 },
    );
    assert.equal(
      await verticalPlayer.locator("video").evaluate(
        (video) => video.videoHeight > video.videoWidth,
      ),
      true,
    );
    assert.equal(
      await verticalPlayer.locator("video").evaluate(
        (video) => getComputedStyle(video).objectFit,
      ),
      "contain",
    );
  } finally {
    await context.close();
  }
}

async function verifyNoJavaScript(browser) {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 900, height: 700 },
  });
  const page = await context.newPage();
  const mp4Requests = [];
  page.on("request", (request) => {
    if (isMp4(request.url())) mp4Requests.push(request.url());
  });
  try {
    await page.goto(`${baseUrl}/videos`, {
      waitUntil: "load",
    });
    assert.equal(
      await page.locator("[data-video-fallback]").first().isVisible(),
      true,
    );
    assert.equal(mp4Requests.length, 0);
  } finally {
    await context.close();
  }
}

async function verifyTouch(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}/videos`, {
      waitUntil: "domcontentloaded",
    });
    const first = page.locator("[data-video-player]").first();
    await page.waitForFunction(
      () =>
        document.querySelector("[data-video-player]")?.getAttribute(
          "data-enhanced",
        ) === "true",
    );
    assert.equal(
      await first.getAttribute("data-controls-visible"),
      "true",
    );
    const primaryBox = await first
      .locator("[data-video-primary]")
      .boundingBox();
    assert.ok(
      primaryBox &&
        primaryBox.width >= 44 &&
        primaryBox.height >= 44,
    );
    await first.locator("video").evaluate((video) => {
      video.loop = true;
    });
    await first.locator("[data-video-primary]").click();
    await page.waitForFunction(
      () =>
        document.querySelector("[data-video-player]")?.getAttribute(
          "data-state",
        ) === "playing",
    );
    await page.waitForTimeout(2_750);
    assert.equal(
      await first.getAttribute("data-controls-visible"),
      "true",
    );
    const boxes = await first
      .locator("[data-video-toggle], [data-video-progress]")
      .evaluateAll((controls) =>
        controls.map((control) => {
          const rect = control.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        }),
      );
    assert.equal(boxes.length, 2);
    assert.ok(
      boxes.every(({ width, height }) => width >= 44 && height >= 44),
    );
    const fullscreen = first.locator("[data-video-fullscreen]");
    if (await fullscreen.isVisible()) {
      const box = await fullscreen.boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44);
    }
  } finally {
    await context.close();
  }
}

async function main() {
  let preview;
  let browser;
  try {
    await assertPortAvailable();
    preview = startPreview();
    await waitForPreview(preview);
    browser = await chromium.launch({ headless: true });
    await verifyDesktop(browser);
    await verifyNoJavaScript(browser);
    await verifyTouch(browser);
    console.log(
      `Player verificado con ${manifest.videos.length} videos.`,
    );
  } finally {
    await browser?.close();
    await stopPreview(preview);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

- [ ] **Step 3: Agregar el comando**

En `package.json`:

```json
"test:video-player": "node scripts/verify-video-player.mjs"
```

- [ ] **Step 4: Ejecutar la verificación sobre el build**

Run:

```powershell
npm run build
npm run test:video-player
```

Expected:

```text
Player verificado con 70 videos.
```

La prueba debe cerrar Chromium y el proceso de Astro incluso si una aserción
falla. Confirmar que el puerto queda libre:

```powershell
if (Get-NetTCPConnection -LocalPort 4332 -State Listen -ErrorAction SilentlyContinue) { throw "El puerto 4332 sigue ocupado" }
```

- [ ] **Step 5: Crear el commit**

```powershell
git add -- scripts/verify-video-player.mjs package.json
git diff --cached --check
git commit -m "test(videos): verify lazy custom playback"
```

### Task 9: Documentar y ejecutar la verificación final

**Files:**
- Modify: `README.md:12-22`
- Modify: `README.md:55-66`
- Modify: `README.md:115-124`

- [ ] **Step 1: Actualizar el contrato operativo**

Agregar los comandos nuevos a la lista superior de scripts:

```bash
npm run test:cloudinary
npm run verify:cloudinary-video-audio
npm run sync:cloudinary
npm run test:smoke
npm run test:video-player
```

En la sección `Verificacion`, mantener el orden de dependencias e insertar las
dos comprobaciones nuevas:

```bash
npm run test:cloudinary
npm run verify:cloudinary-video-audio
npm run check
npm run build
npm run test:smoke
npm run test:video-player
npm audit --omit=dev
```

Reemplazar los párrafos actuales sobre readiness por:

```markdown
Los videos con una duración conocida menor a dos segundos se registran como
`short_video` y no se publican. El archivo original permanece en Cloudinary.
Los videos publicados se entregan como variantes MP4 con `ac_none`, por lo que
el archivo recibido por el navegador no contiene una pista de audio. Los
pósteres usan un lienzo 16:9 con `c_pad` para conservar completo el material
horizontal y vertical.

Antes de escribir el manifiesto, la sincronización prepara mediante solicitudes
`GET` públicas tanto el MP4 como el póster de cada video. Si Cloudinary responde
`423`, reintenta dentro del límite configurado. Después inspecciona la caja
`moov` de cada MP4, exige al menos un track `vide` y rechaza cualquier track
`soun`. Si falla una de estas barreras, el comando termina con error y conserva
byte por byte el manifiesto anterior.

`npm run verify:cloudinary-video-audio` permite repetir la inspección sobre el
manifiesto publicado sin credenciales administrativas.

Estas solicitudes públicas de entrega pueden generar y almacenar en caché
copias derivadas, y por lo tanto consumir transformaciones de Cloudinary.
Nunca modifican los archivos originales.
```

- [ ] **Step 2: Ejecutar todas las pruebas de datos**

Run:

```powershell
npm run test:cloudinary
npm run verify:cloudinary-video-audio
```

Expected: todas las pruebas Node PASS y `Videos sin pista de audio: 70.`

- [ ] **Step 3: Ejecutar todas las verificaciones del sitio**

Run:

```powershell
npm run check
npm run build
npm run test:smoke
npm run test:video-player
```

Expected: cero diagnósticos, build completo, smoke PASS y
`Player verificado con 70 videos.`

- [ ] **Step 4: Ejecutar y registrar la auditoría de dependencias**

Run:

```powershell
npm audit --omit=dev
```

Expected baseline al redactar el plan: exit code `1` con cinco vulnerabilidades
`high` ya presentes en Astro, `js-yaml`, PostCSS, Sharp y SVGO; varias requieren
un salto mayor a Astro 7. Registrar el resultado exacto del día de ejecución,
pero no ejecutar `npm audit fix`, no actualizar dependencias y no tratar este
hallazgo preexistente como un fallo del reproductor. La actualización de
dependencias queda fuera del alcance aprobado.

- [ ] **Step 5: Auditar UTF-8, whitespace y alcance**

Run:

```powershell
rg -n 'Ã|Â|â€”|â€|�' README.md scripts src PRODUCT.md
git diff --check
git status --short
git diff --stat
```

Expected: `rg` sin coincidencias, `git diff --check` sin errores y solamente
`README.md` pendiente en esta tarea.

- [ ] **Step 6: Crear el commit documental**

```powershell
git add -- README.md
git diff --cached --check
git commit -m "docs(videos): document silent delivery pipeline"
```

- [ ] **Step 7: Confirmar el estado final local**

Run:

```powershell
git status --short
git log -9 --oneline
```

Expected: árbol limpio y los nueve commits de la secuencia presentes sobre
`main`. No hacer push ni abrir PR.
