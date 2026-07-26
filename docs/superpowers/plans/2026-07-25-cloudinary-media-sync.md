# Cloudinary Media Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sincronizar imágenes y videos de carpetas seleccionadas de Cloudinary hacia manifiestos estáticos que alimenten Galería y Videos sin exponer credenciales ni modificar recursos remotos.

**Architecture:** Un cliente pequeño de la Admin API hará exclusivamente solicitudes `GET`, recorrerá las carpetas dinámicas configuradas y normalizará sus recursos. Un comando manual escribirá `src/data/generated/cloudinary-media.json` de forma atómica; Astro consumirá ese archivo durante el build sin conectarse a Cloudinary.

**Tech Stack:** Astro 6, TypeScript estricto, Node.js 22 ESM, `fetch`, `node:test`, Cloudinary Admin API.

---

## Mapa de archivos

- Crear `scripts/cloudinary-folders.config.mjs`: mapa versionado entre carpetas y categorías.
- Crear `scripts/cloudinary-media.mjs`: validación, normalización, transformaciones y armado del manifiesto.
- Crear `scripts/cloudinary-media.test.mjs`: pruebas de las funciones puras.
- Crear `scripts/cloudinary-admin.mjs`: cliente GET, paginación y recorrido de subcarpetas.
- Crear `scripts/cloudinary-admin.test.mjs`: pruebas del cliente con `fetch` simulado.
- Crear `scripts/cloudinary-sync-io.mjs`: carga local de variables y escritura atómica.
- Crear `scripts/cloudinary-sync-io.test.mjs`: pruebas de variables y archivos.
- Crear `scripts/sync-cloudinary.mjs`: comando y coordinación de la sincronización.
- Crear `scripts/sync-cloudinary.test.mjs`: pruebas del flujo sin acceder a Internet.
- Crear `.env.example`: nombres de variables sin secretos.
- Crear `src/data/generated/cloudinary-media.json`: manifiesto público generado.
- Modificar `.gitignore`: excluir variantes locales de `.env`.
- Modificar `package.json`: agregar `sync:cloudinary` y `test:cloudinary`.
- Modificar `README.md`: documentar permisos, configuración y ejecución.
- Modificar `src/data/site.ts`: consumir el manifiesto y retirar la lista manual de eventos.
- Modificar `src/pages/videos.astro`: cambiar textos que hoy anuncian contenido futuro.
- Modificar `scripts/smoke.mjs`: verificar cantidades y medios a partir del manifiesto.

La especificación aprobada está en `docs/superpowers/specs/2026-07-25-cloudinary-media-sync-design.md`.

### Task 1: Configurar el mapa de carpetas

**Files:**
- Create: `scripts/cloudinary-folders.config.mjs`
- Create: `scripts/cloudinary-media.mjs`
- Create: `scripts/cloudinary-media.test.mjs`

- [ ] **Step 1: Escribir las pruebas fallidas de validación y resolución**

Crear `scripts/cloudinary-media.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";

import {
  findFolderMapping,
  selectQueryRoots,
  validateFolderMappings,
} from "./cloudinary-media.mjs";

const mappings = [
  {
    path: "chaco-implantes/stand",
    imageCategory: "Eventos",
    videoCategory: "Eventos",
  },
  {
    path: "chaco-implantes/cajas",
    imageCategory: "Instrumental",
    videoCategory: "Instrumental",
  },
  {
    path: "chaco-implantes/cajas/cadera",
    imageCategory: "Productos",
    videoCategory: "Productos",
  },
];

test("validateFolderMappings normaliza rutas y conserva allowEmpty", () => {
  const [mapping] = validateFolderMappings([
    {
      path: "/chaco-implantes/stand/",
      imageCategory: "Eventos",
      videoCategory: "Eventos",
      allowEmpty: true,
    },
  ]);

  assert.deepEqual(mapping, {
    path: "chaco-implantes/stand",
    imageCategory: "Eventos",
    videoCategory: "Eventos",
    allowEmpty: true,
  });
});

test("validateFolderMappings rechaza rutas duplicadas", () => {
  assert.throws(
    () => validateFolderMappings([mappings[0], { ...mappings[0] }]),
    /Carpeta duplicada: chaco-implantes\/stand/,
  );
});

test("validateFolderMappings rechaza categorías desconocidas", () => {
  assert.throws(
    () =>
      validateFolderMappings([
        {
          path: "chaco-implantes/stand",
          imageCategory: "Prensa",
          videoCategory: "Eventos",
        },
      ]),
    /Categoría de imagen no admitida: Prensa/,
  );
});

test("findFolderMapping hereda la carpeta padre y prioriza la ruta específica", () => {
  const validated = validateFolderMappings(mappings);

  assert.equal(
    findFolderMapping("chaco-implantes/stand/2026", validated)?.imageCategory,
    "Eventos",
  );
  assert.equal(
    findFolderMapping("chaco-implantes/cajas/cadera/set-1", validated)?.imageCategory,
    "Productos",
  );
  assert.equal(findFolderMapping("chaco-implantes/brands", validated), undefined);
});

test("selectQueryRoots evita volver a consultar una raíz anidada", () => {
  const validated = validateFolderMappings(mappings);
  assert.deepEqual(selectQueryRoots(validated), [
    "chaco-implantes/cajas",
    "chaco-implantes/stand",
  ]);
});
```

- [ ] **Step 2: Ejecutar la prueba y comprobar el fallo**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs
```

Expected: FAIL con `ERR_MODULE_NOT_FOUND` para `scripts/cloudinary-media.mjs`.

- [ ] **Step 3: Implementar las funciones mínimas del mapa**

Crear `scripts/cloudinary-media.mjs`:

```js
const GALLERY_CATEGORIES = new Set([
  "Productos",
  "Instrumental",
  "Eventos",
  "Quirófano",
]);

export function normalizeFolderPath(value) {
  if (typeof value !== "string") {
    throw new TypeError("La ruta de Cloudinary debe ser texto.");
  }

  const normalized = value.trim().replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
  if (!normalized || normalized.includes("//")) {
    throw new Error(`Ruta de Cloudinary inválida: ${value}`);
  }

  return normalized;
}

export function validateFolderMappings(mappings) {
  if (!Array.isArray(mappings) || mappings.length === 0) {
    throw new Error("Debe existir al menos una carpeta de Cloudinary configurada.");
  }

  const seen = new Set();

  return mappings.map((mapping) => {
    const path = normalizeFolderPath(mapping.path);
    if (seen.has(path)) {
      throw new Error(`Carpeta duplicada: ${path}`);
    }
    seen.add(path);

    if (!GALLERY_CATEGORIES.has(mapping.imageCategory)) {
      throw new Error(`Categoría de imagen no admitida: ${mapping.imageCategory}`);
    }
    if (!GALLERY_CATEGORIES.has(mapping.videoCategory)) {
      throw new Error(`Categoría de video no admitida: ${mapping.videoCategory}`);
    }

    return {
      path,
      imageCategory: mapping.imageCategory,
      videoCategory: mapping.videoCategory,
      allowEmpty: mapping.allowEmpty === true,
    };
  });
}

export function findFolderMapping(folderPath, mappings) {
  const normalized = normalizeFolderPath(folderPath);

  return mappings
    .filter(
      (mapping) =>
        normalized === mapping.path || normalized.startsWith(`${mapping.path}/`),
    )
    .sort((left, right) => right.path.length - left.path.length)[0];
}

export function selectQueryRoots(mappings) {
  return mappings
    .map((mapping) => mapping.path)
    .filter(
      (path, _index, paths) =>
        !paths.some(
          (candidate) =>
            candidate !== path && path.startsWith(`${candidate}/`),
        ),
    )
    .sort((left, right) => left.localeCompare(right));
}
```

Crear `scripts/cloudinary-folders.config.mjs`:

```js
export const cloudinaryFolders = [
  {
    path: "chaco-implantes/stand",
    imageCategory: "Eventos",
    videoCategory: "Eventos",
  },
  {
    path: "chaco-implantes/cajas",
    imageCategory: "Instrumental",
    videoCategory: "Instrumental",
  },
];
```

- [ ] **Step 4: Ejecutar las pruebas**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs
```

Expected: 5 tests PASS.

- [ ] **Step 5: Crear el primer commit de implementación**

```bash
git add scripts/cloudinary-folders.config.mjs scripts/cloudinary-media.mjs scripts/cloudinary-media.test.mjs
git diff --cached --check
git commit -m "feat(cloudinary): add folder mapping rules"
```

### Task 2: Normalizar recursos y URLs de entrega

**Files:**
- Modify: `scripts/cloudinary-media.mjs`
- Modify: `scripts/cloudinary-media.test.mjs`

- [ ] **Step 1: Agregar pruebas fallidas para textos, imágenes y videos**

Agregar al final de `scripts/cloudinary-media.test.mjs`:

```js
import {
  buildDeliveryUrl,
  humanizePublicId,
  normalizeResource,
  resolveResourceText,
} from "./cloudinary-media.mjs";

const imageResource = {
  asset_id: "image-1",
  asset_folder: "chaco-implantes/stand/2026",
  public_id: "Congreso_Traumato-99_ocnsrl",
  resource_type: "image",
  type: "upload",
  secure_url:
    "https://res.cloudinary.com/demo/image/upload/v1780000000/Congreso_Traumato-99_ocnsrl.jpg",
  created_at: "2026-07-20T12:00:00Z",
  width: 2400,
  height: 1600,
  display_name: "Congreso de traumatología",
  context: {
    custom: {
      title: "Stand Chaco Implantes",
      alt: "Equipo de Chaco Implantes en el congreso",
    },
  },
};

const videoResource = {
  asset_id: "video-1",
  asset_folder: "chaco-implantes/cajas",
  public_id: "Caja_femur-proximal_ab12cd",
  resource_type: "video",
  type: "upload",
  secure_url:
    "https://res.cloudinary.com/demo/video/upload/v1780000100/Caja_femur-proximal_ab12cd.mp4",
  created_at: "2026-07-21T12:00:00Z",
  width: 1920,
  height: 1080,
  duration: 42.5,
};

test("resolveResourceText prioriza context y usa display_name como respaldo", () => {
  assert.deepEqual(resolveResourceText(imageResource), {
    title: "Stand Chaco Implantes",
    alt: "Equipo de Chaco Implantes en el congreso",
  });

  assert.deepEqual(
    resolveResourceText({
      ...imageResource,
      context: undefined,
    }),
    {
      title: "Congreso de traumatología",
      alt: "Congreso de traumatología",
    },
  );

  assert.deepEqual(
    resolveResourceText({
      ...imageResource,
      context: { custom: { caption: "Congreso regional" } },
      display_name: undefined,
    }),
    {
      title: "Congreso regional",
      alt: "Congreso regional",
    },
  );
});

test("humanizePublicId conserva UTF-8 y elimina el sufijo técnico", () => {
  assert.equal(
    humanizePublicId("carpeta/Caja_fémur-proximal_ab12cd"),
    "Caja fémur proximal",
  );
});

test("buildDeliveryUrl inserta transformaciones y permite cambiar la extensión", () => {
  assert.equal(
    buildDeliveryUrl(imageResource.secure_url, "f_auto,q_auto,w_600"),
    "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/v1780000000/Congreso_Traumato-99_ocnsrl.jpg",
  );
  assert.equal(
    buildDeliveryUrl(videoResource.secure_url, "so_0,f_auto,q_auto,w_600", "jpg"),
    "https://res.cloudinary.com/demo/video/upload/so_0,f_auto,q_auto,w_600/v1780000100/Caja_femur-proximal_ab12cd.jpg",
  );
});

test("normalizeResource genera variantes de imagen", () => {
  const mapping = validateFolderMappings(mappings)[0];
  const result = normalizeResource(imageResource, mapping);

  assert.equal(result.kind, "image");
  assert.equal(result.item.assetId, "image-1");
  assert.equal(result.item.category, "Eventos");
  assert.match(result.item.thumb, /c_fill,g_auto,w_600,h_400/);
  assert.match(result.item.full, /c_limit,w_1920/);
});

test("normalizeResource genera reproducción y póster para videos", () => {
  const mapping = validateFolderMappings(mappings)[1];
  const result = normalizeResource(videoResource, mapping);

  assert.equal(result.kind, "video");
  assert.equal(result.item.category, "Instrumental");
  assert.equal(result.item.duration, 42.5);
  assert.match(result.item.src, /video\/upload\/f_auto,q_auto/);
  assert.match(result.item.poster, /so_0,f_auto,q_auto,c_fill,g_auto,w_600,h_400/);
  assert.match(result.item.poster, /\.jpg$/);
});

test("normalizeResource omite tipos de entrega no públicos y recursos raw", () => {
  const mapping = validateFolderMappings(mappings)[0];

  assert.deepEqual(
    normalizeResource({ ...imageResource, type: "authenticated" }, mapping),
    { kind: "skipped", assetId: "image-1", reason: "delivery_type" },
  );
  assert.deepEqual(
    normalizeResource({ ...imageResource, resource_type: "raw" }, mapping),
    { kind: "skipped", assetId: "image-1", reason: "resource_type" },
  );
});

test("normalizeResource omite recursos sin texto útil", () => {
  const mapping = validateFolderMappings(mappings)[0];
  const withoutText = {
    ...imageResource,
    public_id: "_ab12cd",
    display_name: undefined,
    context: undefined,
  };

  assert.deepEqual(normalizeResource(withoutText, mapping), {
    kind: "skipped",
    assetId: "image-1",
    reason: "missing_text",
  });
});
```

Consolidar los imports del archivo en un único bloque desde `./cloudinary-media.mjs`; no dejar dos declaraciones `import` para el mismo módulo.

- [ ] **Step 2: Ejecutar las pruebas y comprobar que fallan**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs
```

Expected: FAIL porque las cuatro funciones nuevas no están exportadas.

- [ ] **Step 3: Implementar normalización y transformaciones**

Agregar después de `GALLERY_CATEGORIES` en `scripts/cloudinary-media.mjs`:

```js
const IMAGE_THUMB_TRANSFORM = "f_auto,q_auto,c_fill,g_auto,w_600,h_400";
const IMAGE_FULL_TRANSFORM = "f_auto,q_auto,c_limit,w_1920";
const VIDEO_TRANSFORM = "f_auto,q_auto";
const VIDEO_POSTER_TRANSFORM =
  "so_0,f_auto,q_auto,c_fill,g_auto,w_600,h_400";

function cleanText(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function humanizePublicId(publicId) {
  const lastSegment = String(publicId ?? "").split("/").at(-1) ?? "";
  const withoutSuffix = lastSegment.replace(/_[a-z0-9]{6}$/i, "");
  return cleanText(withoutSuffix.replace(/[_-]+/g, " "));
}

export function resolveResourceText(resource) {
  const context = resource.context?.custom ?? resource.context ?? {};
  const fallback = humanizePublicId(resource.public_id);
  const title =
    cleanText(context.title) ||
    cleanText(context.caption) ||
    cleanText(resource.display_name) ||
    fallback;
  const alt = cleanText(context.alt) || cleanText(context.caption) || title;

  if (!title || !alt) {
    throw new Error(`El recurso ${resource.asset_id ?? "sin asset_id"} no tiene texto útil.`);
  }

  return { title, alt };
}

export function buildDeliveryUrl(secureUrl, transformation, extension) {
  if (typeof secureUrl !== "string" || !secureUrl.startsWith("https://")) {
    throw new Error("Cloudinary devolvió una secure_url inválida.");
  }

  const marker = "/upload/";
  const markerIndex = secureUrl.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error("La URL no contiene el segmento /upload/.");
  }

  const prefix = secureUrl.slice(0, markerIndex + marker.length);
  let assetPath = secureUrl.slice(markerIndex + marker.length);
  if (extension) {
    assetPath = assetPath.replace(/\.[^./?#]+(?=([?#]|$))/, `.${extension}`);
  }

  return `${prefix}${transformation}/${assetPath}`;
}

function requireResourceFields(resource) {
  for (const field of [
    "asset_id",
    "asset_folder",
    "public_id",
    "resource_type",
    "type",
    "secure_url",
    "created_at",
  ]) {
    if (typeof resource[field] !== "string" || resource[field].length === 0) {
      throw new Error(`Recurso inválido: falta ${field}.`);
    }
  }

  if (Number.isNaN(Date.parse(resource.created_at))) {
    throw new Error(`Fecha inválida para ${resource.asset_id}.`);
  }
}

export function normalizeResource(resource, mapping) {
  requireResourceFields(resource);

  if (resource.type !== "upload") {
    return {
      kind: "skipped",
      assetId: resource.asset_id,
      reason: "delivery_type",
    };
  }
  if (!["image", "video"].includes(resource.resource_type)) {
    return {
      kind: "skipped",
      assetId: resource.asset_id,
      reason: "resource_type",
    };
  }

  let text;
  try {
    text = resolveResourceText(resource);
  } catch (error) {
    if (error?.message?.includes("no tiene texto útil")) {
      return {
        kind: "skipped",
        assetId: resource.asset_id,
        reason: "missing_text",
      };
    }
    throw error;
  }
  const { title, alt } = text;
  const common = {
    assetId: resource.asset_id,
    sourceFolder: normalizeFolderPath(resource.asset_folder),
    publicId: resource.public_id,
    createdAt: resource.created_at,
    title,
    width: Number(resource.width) || 0,
    height: Number(resource.height) || 0,
  };

  if (resource.resource_type === "image") {
    return {
      kind: "image",
      item: {
        ...common,
        category: mapping.imageCategory,
        alt,
        thumb: buildDeliveryUrl(resource.secure_url, IMAGE_THUMB_TRANSFORM),
        full: buildDeliveryUrl(resource.secure_url, IMAGE_FULL_TRANSFORM),
      },
    };
  }

  return {
    kind: "video",
    item: {
      ...common,
      category: mapping.videoCategory,
      poster: buildDeliveryUrl(
        resource.secure_url,
        VIDEO_POSTER_TRANSFORM,
        "jpg",
      ),
      src: buildDeliveryUrl(resource.secure_url, VIDEO_TRANSFORM),
      ...(Number.isFinite(resource.duration)
        ? { duration: Number(resource.duration) }
        : {}),
    },
  };
}
```

- [ ] **Step 4: Ejecutar las pruebas**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs
```

Expected: todos los tests PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/cloudinary-media.mjs scripts/cloudinary-media.test.mjs
git diff --cached --check
git commit -m "feat(cloudinary): normalize media assets"
```

### Task 3: Construir un manifiesto determinista

**Files:**
- Modify: `scripts/cloudinary-media.mjs`
- Modify: `scripts/cloudinary-media.test.mjs`

- [ ] **Step 1: Agregar pruebas fallidas para orden, duplicados y carpetas vacías**

Agregar al import existente `buildManifest`. Agregar al final del test:

```js
test("buildManifest ordena, separa y elimina duplicados por assetId", () => {
  const duplicate = { ...imageResource };
  const { manifest, skipped } = buildManifest(
    [imageResource, videoResource, duplicate],
    validateFolderMappings(mappings.slice(0, 2)),
  );

  assert.equal(manifest.schemaVersion, 1);
  assert.deepEqual(
    manifest.images.map((item) => item.assetId),
    ["image-1"],
  );
  assert.deepEqual(
    manifest.videos.map((item) => item.assetId),
    ["video-1"],
  );
  assert.deepEqual(skipped, []);
});

test("buildManifest rechaza duplicados incompatibles", () => {
  const conflicting = {
    ...imageResource,
    secure_url:
      "https://res.cloudinary.com/demo/image/upload/v2/otro-archivo.jpg",
  };

  assert.throws(
    () =>
      buildManifest(
        [imageResource, conflicting],
        validateFolderMappings([mappings[0]]),
      ),
    /El assetId image-1 tiene datos incompatibles/,
  );
});

test("buildManifest ordena de más reciente a más antiguo", () => {
  const older = {
    ...imageResource,
    asset_id: "image-older",
    created_at: "2026-06-01T00:00:00Z",
  };
  const newer = {
    ...imageResource,
    asset_id: "image-newer",
    created_at: "2026-07-25T00:00:00Z",
  };

  const { manifest } = buildManifest(
    [older, newer],
    validateFolderMappings([mappings[0]]),
  );

  assert.deepEqual(
    manifest.images.map((item) => item.assetId),
    ["image-newer", "image-older"],
  );
});

test("buildManifest informa recursos fuera del mapa", () => {
  const outside = {
    ...imageResource,
    asset_id: "outside",
    asset_folder: "chaco-implantes/brands",
  };
  const { skipped } = buildManifest(
    [imageResource, outside],
    validateFolderMappings([mappings[0]]),
  );

  assert.deepEqual(skipped, [
    { assetId: "outside", reason: "unmapped_folder" },
  ]);
});

test("buildManifest rechaza recursos sin asset_folder", () => {
  assert.throws(
    () =>
      buildManifest(
        [{ ...imageResource, asset_folder: undefined }],
        validateFolderMappings([mappings[0]]),
      ),
    /Recurso inválido: falta asset_folder/,
  );
});

test("buildManifest rechaza una fuente obligatoria sin recursos publicables", () => {
  assert.throws(
    () =>
      buildManifest(
        [{ ...imageResource, type: "authenticated" }],
        validateFolderMappings([mappings[0]]),
      ),
    /La carpeta chaco-implantes\/stand no produjo recursos públicos/,
  );
});

test("buildManifest permite una fuente vacía declarada", () => {
  const [mapping] = validateFolderMappings([
    { ...mappings[0], allowEmpty: true },
  ]);
  const { manifest } = buildManifest([], [mapping]);
  assert.deepEqual(manifest, {
    schemaVersion: 1,
    images: [],
    videos: [],
  });
});
```

- [ ] **Step 2: Ejecutar la prueba y comprobar el fallo**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs
```

Expected: FAIL porque `buildManifest` no está exportada.

- [ ] **Step 3: Implementar el armado del manifiesto**

Agregar al final de `scripts/cloudinary-media.mjs`:

```js
function sortNewestFirst(left, right) {
  return (
    right.createdAt.localeCompare(left.createdAt) ||
    left.assetId.localeCompare(right.assetId)
  );
}

export function buildManifest(resources, mappings) {
  const validatedMappings = validateFolderMappings(mappings);
  const seen = new Map();
  const images = [];
  const videos = [];
  const skipped = [];

  for (const resource of resources) {
    if (
      typeof resource?.asset_folder !== "string" ||
      resource.asset_folder.length === 0
    ) {
      throw new Error("Recurso inválido: falta asset_folder.");
    }
    const assetId =
      typeof resource?.asset_id === "string" ? resource.asset_id : "sin asset_id";
    const mapping = findFolderMapping(resource.asset_folder, validatedMappings);

    if (!mapping) {
      skipped.push({ assetId, reason: "unmapped_folder" });
      continue;
    }

    const normalized = normalizeResource(resource, mapping);
    if (normalized.kind === "skipped") {
      skipped.push(normalized);
      continue;
    }

    const previous = seen.get(normalized.item.assetId);
    if (previous) {
      if (JSON.stringify(previous) !== JSON.stringify(normalized.item)) {
        throw new Error(
          `El assetId ${normalized.item.assetId} tiene datos incompatibles.`,
        );
      }
      continue;
    }

    seen.set(normalized.item.assetId, normalized.item);
    if (normalized.kind === "image") images.push(normalized.item);
    if (normalized.kind === "video") videos.push(normalized.item);
  }

  for (const mapping of validatedMappings) {
    const count = [...images, ...videos].filter(
      (item) =>
        item.sourceFolder === mapping.path ||
        item.sourceFolder.startsWith(`${mapping.path}/`),
    ).length;

    if (count === 0 && !mapping.allowEmpty) {
      throw new Error(
        `La carpeta ${mapping.path} no produjo recursos públicos.`,
      );
    }
  }

  images.sort(sortNewestFirst);
  videos.sort(sortNewestFirst);

  return {
    manifest: {
      schemaVersion: 1,
      images,
      videos,
    },
    skipped,
  };
}
```

- [ ] **Step 4: Ejecutar todas las pruebas puras**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs
```

Expected: todos los tests PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/cloudinary-media.mjs scripts/cloudinary-media.test.mjs
git diff --cached --check
git commit -m "feat(cloudinary): build deterministic media manifest"
```

### Task 4: Implementar el cliente GET de Cloudinary

**Files:**
- Create: `scripts/cloudinary-admin.mjs`
- Create: `scripts/cloudinary-admin.test.mjs`

- [ ] **Step 1: Escribir las pruebas fallidas del cliente y la paginación**

Crear `scripts/cloudinary-admin.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";

import {
  createCloudinaryAdminClient,
  listFolderTree,
  listResourcesForFolders,
  paginateCloudinary,
} from "./cloudinary-admin.mjs";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("createCloudinaryAdminClient usa GET y no pone secretos en la URL", async () => {
  const calls = [];
  const client = createCloudinaryAdminClient({
    cloudName: "demo",
    apiKey: "123",
    apiSecret: "secret-value",
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init });
      return jsonResponse({ folders: [] });
    },
  });

  await client.get("/folders/chaco-implantes", { max_results: 500 });

  assert.equal(calls[0].init.method, "GET");
  assert.match(calls[0].init.headers.Authorization, /^Basic /);
  assert.ok(!calls[0].url.includes("secret-value"));
  assert.equal(
    calls[0].url,
    "https://api.cloudinary.com/v1_1/demo/folders/chaco-implantes?max_results=500",
  );
});

test("el cliente informa errores sin incluir credenciales", async () => {
  const client = createCloudinaryAdminClient({
    cloudName: "demo",
    apiKey: "123",
    apiSecret: "secret-value",
    fetchImpl: async () => jsonResponse({ error: { message: "Forbidden" } }, 403),
  });

  await assert.rejects(
    () => client.get("/folders/chaco-implantes"),
    (error) => {
      assert.match(error.message, /Cloudinary respondió 403: Forbidden/);
      assert.ok(!error.message.includes("secret-value"));
      assert.equal(error.status, 403);
      return true;
    },
  );
});

test("paginateCloudinary sigue next_cursor", async () => {
  const pages = [
    { resources: [{ asset_id: "1" }], next_cursor: "next" },
    { resources: [{ asset_id: "2" }] },
  ];
  let index = 0;

  const items = await paginateCloudinary(
    async (cursor) => {
      assert.equal(cursor, index === 0 ? undefined : "next");
      return pages[index++];
    },
    "resources",
  );

  assert.deepEqual(
    items.map((item) => item.asset_id),
    ["1", "2"],
  );
});

test("paginateCloudinary rechaza cursores repetidos", async () => {
  await assert.rejects(
    () =>
      paginateCloudinary(
        async () => ({ resources: [], next_cursor: "repeat" }),
        "resources",
      ),
    /Cloudinary repitió el cursor repeat/,
  );
});

test("listFolderTree recorre subcarpetas y codifica cada segmento", async () => {
  const paths = [];
  const client = {
    async get(path) {
      paths.push(path);
      if (path.endsWith("/stand")) {
        return { folders: [{ path: "chaco-implantes/stand/2026 fotos" }] };
      }
      return { folders: [] };
    },
  };

  const folders = await listFolderTree(client, "chaco-implantes/stand");

  assert.deepEqual(folders, [
    "chaco-implantes/stand",
    "chaco-implantes/stand/2026 fotos",
  ]);
  assert.ok(
    paths.includes("/folders/chaco-implantes/stand/2026%20fotos"),
  );
});

test("listResourcesForFolders incluye context y pagina por carpeta", async () => {
  const calls = [];
  const client = {
    async get(path, params) {
      calls.push({ path, params });
      return {
        resources: [{ asset_id: params.asset_folder }],
      };
    },
  };

  const resources = await listResourcesForFolders(client, [
    "chaco-implantes/stand",
    "chaco-implantes/stand/2026",
  ]);

  assert.deepEqual(
    resources.map((item) => item.asset_id),
    ["chaco-implantes/stand", "chaco-implantes/stand/2026"],
  );
  assert.equal(calls[0].path, "/resources/by_asset_folder");
  assert.equal(calls[0].params.context, "true");
  assert.equal(calls[0].params.max_results, 500);
});

test("listResourcesForFolders explica el requisito de carpetas dinámicas", async () => {
  const client = {
    async get() {
      throw Object.assign(new Error("Cloudinary respondió 400: unsupported"), {
        status: 400,
      });
    },
  };

  await assert.rejects(
    () => listResourcesForFolders(client, ["chaco-implantes/stand"]),
    /resources\/by_asset_folder requiere el modo de carpetas dinámicas/,
  );
});
```

- [ ] **Step 2: Ejecutar las pruebas y comprobar el fallo**

Run:

```bash
node --test scripts/cloudinary-admin.test.mjs
```

Expected: FAIL con `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implementar el cliente y el recorrido**

Crear `scripts/cloudinary-admin.mjs`:

```js
const MAX_PAGES = 1_000;

function requireCredential(name, value) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Falta ${name}.`);
  }
}

export function createCloudinaryAdminClient({
  cloudName,
  apiKey,
  apiSecret,
  fetchImpl = fetch,
}) {
  requireCredential("CLOUDINARY_CLOUD_NAME", cloudName);
  requireCredential("CLOUDINARY_API_KEY", apiKey);
  requireCredential("CLOUDINARY_API_SECRET", apiSecret);
  const authorization = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;

  return {
    async get(path, params = {}) {
      const url = new URL(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}${path}`,
      );
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }

      const response = await fetchImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authorization,
        },
      });

      let body;
      try {
        body = await response.json();
      } catch {
        throw new Error(`Cloudinary respondió ${response.status} sin JSON válido.`);
      }

      if (!response.ok) {
        const message =
          typeof body?.error?.message === "string"
            ? body.error.message
            : "Error de la Admin API";
        const error = new Error(
          `Cloudinary respondió ${response.status}: ${message}`,
        );
        error.status = response.status;
        throw error;
      }

      return body;
    },
  };
}

export async function paginateCloudinary(getPage, itemKey) {
  const items = [];
  const seenCursors = new Set();
  let cursor;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const body = await getPage(cursor);
    if (!Array.isArray(body?.[itemKey])) {
      throw new Error(`Respuesta inválida: falta ${itemKey}.`);
    }
    items.push(...body[itemKey]);

    const nextCursor = body.next_cursor;
    if (!nextCursor) return items;
    if (seenCursors.has(nextCursor)) {
      throw new Error(`Cloudinary repitió el cursor ${nextCursor}.`);
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }

  throw new Error(`La paginación superó ${MAX_PAGES} páginas.`);
}

function encodeFolderPath(folder) {
  return folder.split("/").map(encodeURIComponent).join("/");
}

export async function listFolderTree(client, rootFolder) {
  const queue = [rootFolder];
  const folders = [];
  const seen = new Set();

  while (queue.length > 0) {
    const folder = queue.shift();
    if (seen.has(folder)) continue;
    seen.add(folder);
    folders.push(folder);

    const children = await paginateCloudinary(
      (cursor) =>
        client.get(`/folders/${encodeFolderPath(folder)}`, {
          max_results: 500,
          next_cursor: cursor,
        }),
      "folders",
    );

    for (const child of children) {
      if (typeof child?.path !== "string") {
        throw new Error(`Subcarpeta inválida dentro de ${folder}.`);
      }
      queue.push(child.path);
    }
  }

  return folders;
}

export async function listResourcesForFolders(client, folders) {
  const resources = [];

  for (const folder of folders) {
    let folderResources;
    try {
      folderResources = await paginateCloudinary(
        (cursor) =>
          client.get("/resources/by_asset_folder", {
            asset_folder: folder,
            max_results: 500,
            next_cursor: cursor,
            context: "true",
          }),
        "resources",
      );
    } catch (error) {
      if (error?.status === 400) {
        throw new Error(
          `resources/by_asset_folder requiere el modo de carpetas dinámicas. Detalle: ${error.message}`,
        );
      }
      throw error;
    }
    resources.push(...folderResources);
  }

  return resources;
}
```

- [ ] **Step 4: Ejecutar las pruebas del cliente**

Run:

```bash
node --test scripts/cloudinary-admin.test.mjs
```

Expected: todos los tests PASS.

- [ ] **Step 5: Ejecutar todas las pruebas disponibles**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs scripts/cloudinary-admin.test.mjs
```

Expected: todos los tests PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/cloudinary-admin.mjs scripts/cloudinary-admin.test.mjs
git diff --cached --check
git commit -m "feat(cloudinary): add read-only admin client"
```

### Task 5: Agregar variables locales y escritura atómica

**Files:**
- Create: `scripts/cloudinary-sync-io.mjs`
- Create: `scripts/cloudinary-sync-io.test.mjs`

- [ ] **Step 1: Escribir las pruebas fallidas de entorno y archivos**

Crear `scripts/cloudinary-sync-io.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  loadLocalEnvironment,
  parseEnvFile,
  requireCloudinaryCredentials,
  serializeManifest,
  writeManifestIfChanged,
} from "./cloudinary-sync-io.mjs";

test("parseEnvFile admite comentarios, espacios y comillas", () => {
  assert.deepEqual(
    parseEnvFile(`
# Cloudinary
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY = "123"
CLOUDINARY_API_SECRET='secreto'
`),
    {
      CLOUDINARY_CLOUD_NAME: "demo",
      CLOUDINARY_API_KEY: "123",
      CLOUDINARY_API_SECRET: "secreto",
    },
  );
});

test("loadLocalEnvironment no pisa variables ya definidas", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "cloudinary-env-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(
    join(directory, ".env.local"),
    "CLOUDINARY_CLOUD_NAME=archivo\nCLOUDINARY_API_KEY=123\nCLOUDINARY_API_SECRET=secret\n",
    "utf8",
  );
  const environment = { CLOUDINARY_CLOUD_NAME: "entorno" };

  await loadLocalEnvironment(directory, environment);

  assert.equal(environment.CLOUDINARY_CLOUD_NAME, "entorno");
  assert.equal(environment.CLOUDINARY_API_KEY, "123");
});

test("requireCloudinaryCredentials devuelve solo las tres credenciales", () => {
  assert.deepEqual(
    requireCloudinaryCredentials({
      CLOUDINARY_CLOUD_NAME: "demo",
      CLOUDINARY_API_KEY: "123",
      CLOUDINARY_API_SECRET: "secret",
      OTHER: "ignored",
    }),
    {
      cloudName: "demo",
      apiKey: "123",
      apiSecret: "secret",
    },
  );
});

test("requireCloudinaryCredentials enumera variables faltantes", () => {
  assert.throws(
    () => requireCloudinaryCredentials({ CLOUDINARY_CLOUD_NAME: "demo" }),
    /Faltan CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET/,
  );
});

test("writeManifestIfChanged no reescribe contenido idéntico", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "cloudinary-manifest-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const target = join(directory, "cloudinary-media.json");
  const manifest = { schemaVersion: 1, images: [], videos: [] };

  assert.deepEqual(await writeManifestIfChanged(target, manifest), {
    changed: true,
  });
  assert.deepEqual(await writeManifestIfChanged(target, manifest), {
    changed: false,
  });
  assert.equal(await readFile(target, "utf8"), serializeManifest(manifest));
  assert.deepEqual(await readdir(directory), ["cloudinary-media.json"]);
});
```

- [ ] **Step 2: Ejecutar las pruebas y comprobar el fallo**

Run:

```bash
node --test scripts/cloudinary-sync-io.test.mjs
```

Expected: FAIL con `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implementar el módulo de I/O**

Crear `scripts/cloudinary-sync-io.mjs`:

```js
import {
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";

const CREDENTIAL_KEYS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

export function parseEnvFile(text) {
  const values = {};

  for (const [index, rawLine] of String(text).split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      throw new Error(`Línea inválida en .env.local: ${index + 1}.`);
    }

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }

  return values;
}

export async function loadLocalEnvironment(cwd, environment) {
  const path = join(cwd, ".env.local");
  let text;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }

  for (const [key, value] of Object.entries(parseEnvFile(text))) {
    if (!environment[key]) environment[key] = value;
  }
}

export function requireCloudinaryCredentials(environment) {
  const missing = CREDENTIAL_KEYS.filter(
    (key) => typeof environment[key] !== "string" || !environment[key].trim(),
  );
  if (missing.length > 0) {
    throw new Error(`Faltan ${missing.join(", ")}.`);
  }

  return {
    cloudName: environment.CLOUDINARY_CLOUD_NAME.trim(),
    apiKey: environment.CLOUDINARY_API_KEY.trim(),
    apiSecret: environment.CLOUDINARY_API_SECRET.trim(),
  };
}

export function serializeManifest(manifest) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export async function writeManifestIfChanged(target, manifest) {
  const next = serializeManifest(manifest);
  let current;
  try {
    current = await readFile(target, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  if (current === next) return { changed: false };

  await mkdir(dirname(target), { recursive: true });
  const temporary = `${target}.tmp-${process.pid}`;
  try {
    await writeFile(temporary, next, "utf8");
    await rename(temporary, target);
  } catch (error) {
    await unlink(temporary).catch(() => undefined);
    throw error;
  }

  return { changed: true };
}
```

- [ ] **Step 4: Ejecutar las pruebas**

Run:

```bash
node --test scripts/cloudinary-sync-io.test.mjs
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/cloudinary-sync-io.mjs scripts/cloudinary-sync-io.test.mjs
git diff --cached --check
git commit -m "feat(cloudinary): add safe manifest persistence"
```

### Task 6: Implementar el comando de sincronización

**Files:**
- Create: `scripts/sync-cloudinary.mjs`
- Create: `scripts/sync-cloudinary.test.mjs`
- Create: `src/data/generated/cloudinary-media.json`
- Modify: `package.json`

- [ ] **Step 1: Escribir la prueba fallida del flujo completo**

Crear `scripts/sync-cloudinary.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";

import { runSync } from "./sync-cloudinary.mjs";

const mappings = [
  {
    path: "chaco-implantes/stand",
    imageCategory: "Eventos",
    videoCategory: "Eventos",
  },
];

const resource = {
  asset_id: "image-1",
  asset_folder: "chaco-implantes/stand",
  public_id: "stand-2026_ab12cd",
  resource_type: "image",
  type: "upload",
  secure_url:
    "https://res.cloudinary.com/demo/image/upload/v1/stand-2026_ab12cd.jpg",
  created_at: "2026-07-25T00:00:00Z",
  width: 1200,
  height: 800,
};

test("runSync consulta raíces, arma el manifiesto y escribe una vez", async () => {
  const writes = [];
  const logs = [];
  const warnings = [];
  const privateResource = {
    ...resource,
    asset_id: "private-1",
    type: "authenticated",
  };
  const result = await runSync({
    cwd: "C:/project",
    environment: {
      CLOUDINARY_CLOUD_NAME: "demo",
      CLOUDINARY_API_KEY: "123",
      CLOUDINARY_API_SECRET: "secret",
    },
    mappings,
    loadEnvironment: async () => undefined,
    createClient: () => ({ get: async () => ({}) }),
    listFolders: async (_client, root) => [root],
    listResources: async () => [resource, privateResource],
    writeManifest: async (target, manifest) => {
      writes.push({ target, manifest });
      return { changed: true };
    },
    logger: {
      log: (message) => logs.push(message),
      warn: (message) => warnings.push(message),
    },
  });

  assert.equal(writes.length, 1);
  assert.equal(writes[0].manifest.images[0].assetId, "image-1");
  assert.match(
    writes[0].target.replaceAll("\\", "/"),
    /src\/data\/generated\/cloudinary-media\.json$/,
  );
  assert.equal(result.imageCount, 1);
  assert.equal(result.videoCount, 0);
  assert.equal(result.skippedCount, 1);
  assert.ok(
    logs.some((message) =>
      message.includes("1 imágenes, 0 videos, 1 omitidos"),
    ),
  );
  assert.ok(
    logs.some((message) =>
      message.includes("chaco-implantes/stand: 1 imágenes, 0 videos"),
    ),
  );
  assert.ok(
    logs.some((message) => message.includes("Eventos: 1 imágenes, 0 videos")),
  );
  assert.ok(warnings.some((message) => message.includes("private-1")));
});

test("runSync no escribe cuando Cloudinary falla", async () => {
  let wrote = false;

  await assert.rejects(
    () =>
      runSync({
        cwd: "C:/project",
        environment: {
          CLOUDINARY_CLOUD_NAME: "demo",
          CLOUDINARY_API_KEY: "123",
          CLOUDINARY_API_SECRET: "secret",
        },
        mappings,
        loadEnvironment: async () => undefined,
        createClient: () => ({ get: async () => ({}) }),
        listFolders: async () => {
          throw new Error("Cloudinary no disponible");
        },
        listResources: async () => [],
        writeManifest: async () => {
          wrote = true;
          return { changed: true };
        },
        logger: { log: () => undefined },
      }),
    /Cloudinary no disponible/,
  );

  assert.equal(wrote, false);
});
```

- [ ] **Step 2: Crear el manifiesto vacío para que el repositorio tenga un esquema válido**

Crear `src/data/generated/cloudinary-media.json`:

```json
{
  "schemaVersion": 1,
  "images": [],
  "videos": []
}
```

- [ ] **Step 3: Ejecutar la prueba y comprobar el fallo**

Run:

```bash
node --test scripts/sync-cloudinary.test.mjs
```

Expected: FAIL con `ERR_MODULE_NOT_FOUND` para `scripts/sync-cloudinary.mjs`.

- [ ] **Step 4: Implementar el comando inyectable**

Crear `scripts/sync-cloudinary.mjs`:

```js
import { pathToFileURL } from "node:url";
import { join } from "node:path";

import { cloudinaryFolders } from "./cloudinary-folders.config.mjs";
import {
  createCloudinaryAdminClient,
  listFolderTree,
  listResourcesForFolders,
} from "./cloudinary-admin.mjs";
import {
  buildManifest,
  selectQueryRoots,
  validateFolderMappings,
} from "./cloudinary-media.mjs";
import {
  loadLocalEnvironment,
  requireCloudinaryCredentials,
  writeManifestIfChanged,
} from "./cloudinary-sync-io.mjs";

export async function runSync({
  cwd = process.cwd(),
  environment = process.env,
  mappings = cloudinaryFolders,
  loadEnvironment = loadLocalEnvironment,
  createClient = createCloudinaryAdminClient,
  listFolders = listFolderTree,
  listResources = listResourcesForFolders,
  writeManifest = writeManifestIfChanged,
  logger = console,
} = {}) {
  await loadEnvironment(cwd, environment);
  const credentials = requireCloudinaryCredentials(environment);
  const validatedMappings = validateFolderMappings(mappings);
  const client = createClient(credentials);
  const resources = [];

  for (const root of selectQueryRoots(validatedMappings)) {
    const folders = await listFolders(client, root);
    resources.push(...(await listResources(client, folders)));
  }

  const { manifest, skipped } = buildManifest(resources, validatedMappings);
  const target = join(
    cwd,
    "src",
    "data",
    "generated",
    "cloudinary-media.json",
  );
  const { changed } = await writeManifest(target, manifest);
  const summary = `${manifest.images.length} imágenes, ${manifest.videos.length} videos, ${skipped.length} omitidos`;
  logger.log(`Cloudinary: ${summary}. Manifiesto ${changed ? "actualizado" : "sin cambios"}.`);

  const allItems = [...manifest.images, ...manifest.videos];
  for (const mapping of validatedMappings) {
    const belongsToFolder = (item) =>
      item.sourceFolder === mapping.path ||
      item.sourceFolder.startsWith(`${mapping.path}/`);
    const imageCount = manifest.images.filter(belongsToFolder).length;
    const videoCount = manifest.videos.filter(belongsToFolder).length;
    logger.log(`${mapping.path}: ${imageCount} imágenes, ${videoCount} videos.`);
  }

  const categories = [...new Set(allItems.map((item) => item.category))].sort();
  for (const category of categories) {
    const imageCount = manifest.images.filter(
      (item) => item.category === category,
    ).length;
    const videoCount = manifest.videos.filter(
      (item) => item.category === category,
    ).length;
    logger.log(`${category}: ${imageCount} imágenes, ${videoCount} videos.`);
  }

  for (const item of skipped) {
    logger.warn?.(`Cloudinary omitió ${item.assetId}: ${item.reason}.`);
  }

  return {
    imageCount: manifest.images.length,
    videoCount: manifest.videos.length,
    skippedCount: skipped.length,
    changed,
  };
}

const invokedPath = process.argv[1]
  ? pathToFileURL(process.argv[1]).href
  : undefined;

if (invokedPath === import.meta.url) {
  runSync().catch((error) => {
    console.error(`No se pudo sincronizar Cloudinary: ${error.message}`);
    process.exitCode = 1;
  });
}
```

- [ ] **Step 5: Agregar scripts de npm**

Modificar `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "demo:video": "node scripts/grabar-demo.js",
    "sync:cloudinary": "node scripts/sync-cloudinary.mjs",
    "test:cloudinary": "node --test scripts/cloudinary-media.test.mjs scripts/cloudinary-admin.test.mjs scripts/cloudinary-sync-io.test.mjs scripts/sync-cloudinary.test.mjs",
    "check": "astro check",
    "build": "astro build",
    "test:smoke": "node scripts/smoke.mjs",
    "preview": "astro preview",
    "astro": "astro"
  }
}
```

Conservar sin cambios `name`, `type`, `version`, `engines`, `dependencies`, `devDependencies` y `overrides`.

- [ ] **Step 6: Ejecutar la suite de Cloudinary**

Run:

```bash
npm run test:cloudinary
```

Expected: todos los tests PASS.

- [ ] **Step 7: Verificar que el comando falla de forma segura sin credenciales**

Ejecutar en un entorno donde no exista `.env.local` ni estén definidas las tres variables:

```bash
npm run sync:cloudinary
```

Expected: exit code distinto de cero y mensaje que enumera las variables faltantes. `src/data/generated/cloudinary-media.json` debe permanecer vacío e intacto.

- [ ] **Step 8: Commit**

```bash
git add package.json scripts/sync-cloudinary.mjs scripts/sync-cloudinary.test.mjs src/data/generated/cloudinary-media.json
git diff --cached --check
git commit -m "feat(cloudinary): add manual media sync command"
```

### Task 7: Documentar la configuración segura

**Files:**
- Create: `.env.example`
- Modify: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Crear el ejemplo sin secretos**

Crear `.env.example`:

```dotenv
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

- [ ] **Step 2: Ignorar entornos locales**

Reemplazar el bloque `# environment variables` de `.gitignore` por:

```gitignore
# environment variables
.env
.env.local
.env.*.local
.env.production
!.env.example
```

- [ ] **Step 3: Documentar la operación**

Agregar después de `## Scripts` en `README.md`:

```markdown
## Medios de Cloudinary

El comando `npm run sync:cloudinary` lee las carpetas configuradas en
`scripts/cloudinary-folders.config.mjs` y actualiza
`src/data/generated/cloudinary-media.json`. El sitio usa ese manifiesto durante
el build y no consulta la Admin API desde el navegador.

1. Creá una API key exclusiva para el proyecto.
2. Si tu cuenta ofrece Roles and Permissions, asignale Viewer sobre
   `chaco-implantes/stand` y `chaco-implantes/cajas`.
3. Copiá `.env.example` como `.env.local` y completá las tres variables con los
   valores de Cloudinary.
4. Ejecutá `npm run sync:cloudinary`.
5. Revisá y versioná el manifiesto generado.

Una key estándar acompañada por su secret puede autorizar operaciones de
escritura. El script solo envía solicitudes GET, pero la restricción efectiva
depende de los permisos que tenga la key en Cloudinary. `.env.local` no debe
subirse a Git.

Las cuentas con el modo legado de carpetas fijas no admiten el endpoint
`resources/by_asset_folder` usado por este comando.
```

Agregar `npm run sync:cloudinary` y `npm run test:cloudinary` al bloque de comandos del README.

- [ ] **Step 4: Verificar ignore y ausencia de valores secretos**

Run:

```bash
git check-ignore .env.local
git diff --check
```

Expected: `.env.local` aparece como ignorado y `git diff --check` no informa errores.

- [ ] **Step 5: Ejecutar pruebas**

Run:

```bash
npm run test:cloudinary
```

Expected: todos los tests PASS.

- [ ] **Step 6: Commit**

```bash
git add .env.example .gitignore README.md
git diff --cached --check
git commit -m "docs(cloudinary): document local media sync"
```

### Task 8: Configurar la key y generar el primer manifiesto real

**Files:**
- Local only: `.env.local`
- Modify through command: `src/data/generated/cloudinary-media.json`

- [ ] **Step 1: Crear una key dedicada en Cloudinary**

En Cloudinary Console, abrir Settings > API Keys y generar una key para este proyecto. Si la cuenta usa Roles and Permissions, asignar a esa key el rol Viewer en `chaco-implantes/stand` y `chaco-implantes/cajas`. No reutilizar una Account Management Key.

- [ ] **Step 2: Guardar las credenciales localmente**

Copiar `.env.example` a `.env.local` y completar `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` con los valores de la nueva key. No pegar el secret en la terminal, la documentación ni un archivo versionado.

- [ ] **Step 3: Confirmar que Git ignora el secreto**

Run:

```bash
git check-ignore -v .env.local
git status --short --untracked-files=all
```

Expected: la primera orden identifica la regla `.env.local`; la segunda no muestra `.env.local`.

- [ ] **Step 4: Ejecutar la sincronización real**

Run:

```bash
npm run sync:cloudinary
```

Expected: exit code 0, al menos un recurso público sincronizado desde cada fuente obligatoria y un resumen separado de imágenes, videos y omitidos. Un error que mencione `resources/by_asset_folder` indica que la cuenta usa carpetas fijas y bloquea esta implementación según la especificación.

- [ ] **Step 5: Revisar el manifiesto**

Run:

```bash
git diff -- src/data/generated/cloudinary-media.json
node -e "const m=require('./src/data/generated/cloudinary-media.json'); if(!m.images.length) process.exit(1); console.log({images:m.images.length,videos:m.videos.length})"
```

Expected: el JSON contiene `schemaVersion`, `images` y `videos`; no contiene encabezados de autorización, API keys ni API secrets.

- [ ] **Step 6: Commit del snapshot público**

```bash
git add src/data/generated/cloudinary-media.json
git diff --cached --check
git commit -m "chore(cloudinary): sync media manifest"
```

### Task 9: Integrar el manifiesto en Galería y Videos

**Files:**
- Modify: `scripts/smoke.mjs`
- Modify: `src/data/site.ts:744-893`
- Modify: `src/pages/videos.astro:15-35`

- [ ] **Step 1: Hacer que el smoke test espere los medios generados**

Agregar después de `eventHeroImage` en `scripts/smoke.mjs`:

```js
const cloudinaryManifest = JSON.parse(
  readFileSync(
    join(root, "src/data/generated/cloudinary-media.json"),
    "utf8",
  ),
);
const syncedEventImages = cloudinaryManifest.images.filter(
  (item) => item.category === "Eventos",
);
const syncedVideos = cloudinaryManifest.videos;
```

Reemplazar la aserción actual de Inicio de la línea 236 por:

```js
assert(
  home.includes('href="/videos"') === (syncedVideos.length > 0),
  "Home should promote videos exactly when the generated manifest has videos",
);
```

Reemplazar las aserciones actuales de Galería en las líneas 253 y 260-267 por:

```js
assert(
  galeria.includes("Ver videos") === (syncedVideos.length > 0),
  "Gallery should promote videos exactly when the generated manifest has videos",
);
assert(galeria.includes("page-hero-dark"), "Gallery page should use the dark premium page hero");
assert(galeria.includes("<dialog") && galeria.includes('aria-modal="true"'), "Gallery lightbox should use an accessible modal dialog");
assert(galeria.includes("data-lightbox-caption-title"), "Gallery lightbox should expose a useful caption title");
assert(source.includes("showModal"), "Gallery lightbox should open with the native modal API");
assert(!galeria.includes("Material visual"), "Gallery hero should not duplicate its title with a generic eyebrow");
assert(galeria.includes('data-gallery-page-size="12"'), "Gallery should expose the first-page size");
const renderedGalleryItems =
  (galeria.match(/<button type="button" data-gallery-item/g) ?? []).length;
assert(
  renderedGalleryItems >= 11 &&
    renderedGalleryItems <= 11 + cloudinaryManifest.images.length,
  "Gallery should render curated items and deduplicated generated images",
);
assert(
  (galeria.match(/data-category="Eventos"/g) ?? []).length ===
    syncedEventImages.length,
  "Gallery should render every generated event image in Eventos",
);
assert(!galeria.includes("/assets/images/evento.jpg"), "Gallery should not render the old local event image");
assert(
  cloudinaryManifest.images.every(
    (item) => galeria.includes(item.thumb) && galeria.includes(item.full),
  ),
  "Gallery should use every generated Cloudinary variant",
);
assert(galeria.includes("f_auto,q_auto,c_fill,g_auto,w_600,h_400"), "Gallery thumbnails should use bounded Cloudinary 600x400 variants");
assert(galeria.includes("f_auto,q_auto,c_limit,w_1920"), "Gallery lightbox images should use Cloudinary 1920px capped variants");
```

Reemplazar las aserciones actuales de Videos de las líneas 286-292 por:

```js
assert(videos.includes("data-videos-page"), "Videos page should expose the redesigned page marker");
assert(videos.includes("page-hero-dark"), "Videos page should use the dark premium page hero");
assert(videos.includes("page-surface"), "Videos page should use the shared light content surface");
assert(videos.includes("premium-card"), "Videos page should use premium card treatment");

if (syncedVideos.length === 0) {
  assert(videos.includes("Pronto publicaremos nuestros videos"), "Videos page should provide an empty state without generated videos");
  assert(!videos.includes('data-video-filter="'), "Videos page should hide category filters without videos");
} else {
  assert(
    (videos.match(/<video/g) ?? []).length === syncedVideos.length,
    "Videos page should render every generated video",
  );
  assert(videos.includes('data-video-filter="Todos"'), "Videos page should show category filters");
  assert(
    videos.includes(syncedVideos[0].src) &&
      videos.includes(syncedVideos[0].poster) &&
      videos.includes(syncedVideos[0].title),
    "Videos page should render generated source, poster and title",
  );
}
assert(source.includes("item.dataset.category === activeFilter"), "Videos page should filter cards by their category");
```

Reemplazar la aserción de la línea 319 por:

```js
assert(!source.includes("const eventGalleryImages ="), "Source should not keep the manual stand image list");
```

- [ ] **Step 2: Ejecutar build y smoke para comprobar el fallo**

Run:

```bash
npm run build
npm run test:smoke
```

Expected: build PASS y smoke FAIL porque `site.ts` todavía no consume el manifiesto.

- [ ] **Step 3: Importar y adaptar el manifiesto en `site.ts`**

Agregar al principio de `src/data/site.ts`:

```ts
import cloudinaryMedia from "./generated/cloudinary-media.json";
```

Reemplazar desde `export type GalleryCategory` hasta `export const videos` por:

```ts
export type GalleryCategory = "Productos" | "Instrumental" | "Eventos" | "Quirófano";

export type GalleryItem = {
  category: GalleryCategory;
  thumb: string;
  full: string;
  alt: string;
};

export type VideoItem = {
  id: string;
  category: GalleryCategory;
  poster: string;
  src: string;
  title: string;
};

type GeneratedImage = {
  assetId: string;
  category: GalleryCategory;
  thumb: string;
  full: string;
  alt: string;
};

type GeneratedVideo = {
  assetId: string;
  category: GalleryCategory;
  poster: string;
  src: string;
  title: string;
};

type CloudinaryManifest = {
  schemaVersion: 1;
  images: GeneratedImage[];
  videos: GeneratedVideo[];
};

const syncedMedia = cloudinaryMedia as CloudinaryManifest;

export const galleryFilters = ["Productos", "Instrumental", "Quirófano", "Eventos"] as const;

export const GALLERY_PAGE_SIZE = 12;
const CLOUDINARY_UPLOAD_SEGMENT = "/image/upload/";
const GALLERY_THUMB_TRANSFORM = "f_auto,q_auto,c_fill,g_auto,w_600,h_400";
const GALLERY_FULL_TRANSFORM = "f_auto,q_auto,c_limit,w_1920";

const isCloudinaryTransformSegment = (segment: string) =>
  segment.startsWith("t_") || segment.split(",").every((part) => /^[a-z]{1,3}_/.test(part));

const cloudinaryVariant = (url: string, transformation: string) => {
  const [base, rest] = url.split(CLOUDINARY_UPLOAD_SEGMENT);
  if (!rest) return url;

  const parts = rest.split("/");
  const assetPath = isCloudinaryTransformSegment(parts[0] || "") ? parts.slice(1).join("/") : rest;
  return `${base}${CLOUDINARY_UPLOAD_SEGMENT}${transformation}/${assetPath}`;
};

const cloudinaryIdentity = (url: string) => {
  const [base, rest] = url.split(CLOUDINARY_UPLOAD_SEGMENT);
  if (!rest) return url;
  const parts = rest.split("/");
  const assetPath = isCloudinaryTransformSegment(parts[0] || "") ? parts.slice(1).join("/") : rest;
  return `${base}${CLOUDINARY_UPLOAD_SEGMENT}${assetPath}`;
};

const galleryPool: { category: GalleryCategory; image: string; alt: string }[] = [
  { category: "Productos", image: images.productos, alt: "Placas y tornillos de osteosíntesis" },
  { category: "Productos", image: categoryImages.cadera, alt: "Prótesis de cadera" },
  { category: "Productos", image: categoryImages.rodilla, alt: "Prótesis de rodilla" },
  { category: "Productos", image: categoryImages.columna, alt: "Sistema de fijación de columna" },
  { category: "Productos", image: categoryImages.maxilofacial, alt: "Placas maxilofaciales" },
  { category: "Productos", image: categoryImages["osteosintesis-placas"], alt: "Placas de osteosíntesis" },
  { category: "Productos", image: categoryImages["osteosintesis-tornillos"], alt: "Tornillos de osteosíntesis" },
  { category: "Instrumental", image: categoryImages["instrumental-quirurgico"], alt: "Caja de instrumental quirúrgico" },
  { category: "Instrumental", image: images.hero, alt: "Instrumental traumatológico" },
  { category: "Instrumental", image: categoryImages["otros-productos"], alt: "Insumos y descartables" },
  { category: "Quirófano", image: images.quirofano, alt: "Quirófano equipado para cirugía" },
];

const localGalleryCandidates = galleryPool.map((item) => ({
  category: item.category,
  thumb: cloudinaryVariant(item.image, GALLERY_THUMB_TRANSFORM),
  full: cloudinaryVariant(item.image, GALLERY_FULL_TRANSFORM),
  alt: item.alt,
}));

const generatedGalleryCandidates = syncedMedia.images.map((item) => ({
  assetId: item.assetId,
  category: item.category,
  thumb: item.thumb,
  full: item.full,
  alt: item.alt,
}));

const seenAssetIds = new Set<string>();
const seenGalleryUrls = new Set<string>();

export const gallery: GalleryItem[] = [
  ...localGalleryCandidates,
  ...generatedGalleryCandidates,
]
  .filter((item) => {
    const assetId = "assetId" in item ? item.assetId : undefined;
    const identity = cloudinaryIdentity(item.full);
    if ((assetId && seenAssetIds.has(assetId)) || seenGalleryUrls.has(identity)) return false;
    if (assetId) seenAssetIds.add(assetId);
    seenGalleryUrls.add(identity);
    return true;
  })
  .map(({ category, thumb, full, alt }) => ({ category, thumb, full, alt }));

export const videos: VideoItem[] = syncedMedia.videos.map((video) => ({
  id: video.assetId,
  category: video.category,
  poster: video.poster,
  src: video.src,
  title: video.title,
}));
```

Este reemplazo elimina `EVENT_GALLERY_TITLE`, `eventGalleryImages` y `eventGalleryPool`. No modificar `supplierSystems`.

- [ ] **Step 4: Actualizar el texto de la página de videos**

En `src/pages/videos.astro`, reemplazar:

```astro
Un espacio para videos institucionales, productos e instrumental. El contenido audiovisual se publicará bajo demanda para profesionales e instituciones.
```

por:

```astro
Videos institucionales, productos e instrumental con reproducción bajo demanda para profesionales e instituciones.
```

Reemplazar:

```astro
Próximamente: recorridos de producto, material institucional y novedades de líneas destacadas.
```

por:

```astro
Recorridos de producto, material institucional y novedades de líneas destacadas.
```

- [ ] **Step 5: Ejecutar las verificaciones enfocadas**

Run:

```bash
npm run check
npm run build
npm run test:smoke
```

Expected: los tres comandos PASS. Galería contiene las imágenes generadas y Videos contiene una tarjeta por video generado.

- [ ] **Step 6: Commit**

```bash
git add src/data/site.ts src/pages/videos.astro scripts/smoke.mjs
git diff --cached --check
git commit -m "feat(media): consume synced Cloudinary assets"
```

### Task 10: Verificación final y control de secretos

**Files:**
- Verify only: todo el repositorio

- [ ] **Step 1: Ejecutar la suite de Cloudinary**

Run:

```bash
npm run test:cloudinary
```

Expected: todos los tests PASS.

- [ ] **Step 2: Ejecutar typecheck**

Run:

```bash
npm run check
```

Expected: 0 errors.

- [ ] **Step 3: Ejecutar build y smoke**

Run:

```bash
npm run build
npm run test:smoke
```

Expected: build PASS y mensaje `Smoke checks passed for 13 pages.`

- [ ] **Step 4: Revisar dependencias**

Run:

```bash
npm audit --omit=dev
```

Expected: no vulnerabilidades de producción sin resolver.

- [ ] **Step 5: Revisar el árbol y el contenido versionado**

Run:

```bash
git status --short
git log --oneline -8
git grep -n "CLOUDINARY_API_SECRET="
```

Expected: `.env.local` no aparece en status; el grep solo puede coincidir con `.env.example`, donde el valor está vacío. No deben quedar cambios de implementación sin commit.

- [ ] **Step 6: Comprobar UTF-8**

Run:

```powershell
$paths = @(
  "README.md",
  ".env.example",
  "scripts/cloudinary-folders.config.mjs",
  "scripts/cloudinary-media.mjs",
  "scripts/cloudinary-media.test.mjs",
  "scripts/cloudinary-admin.mjs",
  "scripts/cloudinary-admin.test.mjs",
  "scripts/cloudinary-sync-io.mjs",
  "scripts/cloudinary-sync-io.test.mjs",
  "scripts/sync-cloudinary.mjs",
  "scripts/sync-cloudinary.test.mjs",
  "src/data/generated/cloudinary-media.json",
  "src/data/site.ts",
  "src/pages/videos.astro",
  "scripts/smoke.mjs"
)
foreach ($path in $paths) {
  $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $path
  if ($text.Contains([char]0xFFFD)) { throw "Mojibake detectado en $path" }
}
```

Expected: la orden finaliza sin errores.

## Resultado esperado

Después de completar el plan:

- `npm run sync:cloudinary` actualizará un snapshot público y determinista.
- El comando solo enviará solicitudes GET.
- Galería consumirá imágenes de `stand` y `cajas`.
- Videos consumirá todos los videos públicos de las carpetas configuradas.
- `brands` conservará sus cuatro URLs manuales.
- El build funcionará sin credenciales.
- Un fallo de Cloudinary conservará el último manifiesto válido.
