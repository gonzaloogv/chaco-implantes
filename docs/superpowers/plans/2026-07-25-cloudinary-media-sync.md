# Cloudinary Search Media Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sincronizar imágenes y videos públicos de `stand` y `cajas` mediante
Cloudinary Search API hacia un manifiesto estático consumido por Galería y
Videos.

**Architecture:** Un cliente interno con operaciones cerradas ejecutará
exclusivamente `POST /resources/search` y, si se solicita, el diagnóstico
`GET /config?settings=true`. El comando normalizará ambas búsquedas en memoria,
comparará el resultado con el manifiesto anterior y solo entonces hará un
reemplazo atómico. Ni el build ni una visita consultarán la Admin/Search API;
el navegador solo descargará las URLs públicas incluidas en el manifiesto.

**Tech Stack:** Node.js 22 (`fetch`, `node:test`, `node:fs`), JavaScript ESM,
JSON versionado, TypeScript estricto y Astro 6.

---

## Mapa de archivos

- Crear `scripts/cloudinary-folders.config.mjs`: modo de carpetas y fuentes
  permitidas.
- Crear `scripts/cloudinary-media.mjs`: expresiones Search, validación,
  normalización y manifiesto.
- Crear `scripts/cloudinary-media.test.mjs`: pruebas unitarias de configuración
  y transformación.
- Crear `scripts/cloudinary-admin.mjs`: cliente remoto cerrado y paginación.
- Crear `scripts/cloudinary-admin.test.mjs`: contrato HTTP y errores.
- Crear `scripts/cloudinary-sync-io.mjs`: lectura, guardia de eliminaciones y
  escritura atómica.
- Crear `scripts/cloudinary-sync-io.test.mjs`: pruebas de persistencia.
- Crear `scripts/sync-cloudinary.mjs`: orquestación, flags y resumen.
- Crear `scripts/sync-cloudinary.test.mjs`: pruebas del flujo completo con
  cliente simulado.
- Crear `src/data/cloudinary-media-adapter.mjs`: validación y adaptación del
  snapshot para Astro.
- Crear `scripts/cloudinary-site-adapter.test.mjs`: estados vacío y
  sincronizado del adaptador.
- Crear `src/data/generated/cloudinary-media.json`: snapshot inicial válido.
- Crear `.env.example`: nombres de credenciales sin valores.
- Modificar `.gitignore`: ignorar archivos locales de entorno.
- Modificar `package.json`: comandos de sincronización y pruebas.
- Modificar `src/data/site.ts`: adaptar el manifiesto a Galería y Videos.
- Modificar `src/pages/videos.astro`: retirar el mensaje “Próximamente” cuando
  existan videos.
- Modificar `scripts/smoke.mjs`: comprobar inventario manual o generado según el
  snapshot.
- Modificar `README.md`: operación, permisos y recuperación.

## Task 1: Configuración y expresiones Search

**Files:**

- Create: `scripts/cloudinary-folders.config.mjs`
- Create: `scripts/cloudinary-media.test.mjs`
- Create: `scripts/cloudinary-media.mjs`

- [ ] **Step 1: Escribir pruebas fallidas de configuración y expresiones**

Las pruebas importarán estas interfaces:

```js
import {
  buildSearchExpression,
  validateCloudinaryConfig,
} from "./cloudinary-media.mjs";

assert.deepEqual(
  validateCloudinaryConfig({
    folderMode: "dynamic",
    sources: [
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
    ],
  }).map(({ path }) => path),
  ["chaco-implantes/stand", "chaco-implantes/cajas"],
);

assert.equal(
  buildSearchExpression("dynamic", "chaco-implantes/stand"),
  'status=active AND type=upload AND (resource_type=image OR resource_type=video) AND (asset_folder="chaco-implantes/stand" OR asset_folder:chaco-implantes/stand/*)',
);

assert.equal(
  buildSearchExpression("fixed", "chaco-implantes/cajas"),
  'status=active AND type=upload AND (resource_type=image OR resource_type=video) AND (folder="chaco-implantes/cajas" OR folder:chaco-implantes/cajas/*)',
);
```

También se probarán modo inválido, rutas absolutas, rutas duplicadas,
solapamientos, categorías no admitidas y caracteres que no puedan representarse
de forma segura en la expresión.

- [ ] **Step 2: Ejecutar RED**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs
```

Expected: `FAIL` porque los módulos todavía no existen.

- [ ] **Step 3: Implementar configuración y validadores mínimos**

La configuración versionada será:

```js
export const cloudinaryFolderMode = "dynamic";

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

`validateCloudinaryConfig` devolverá fuentes normalizadas y rechazará
solapamientos. `buildSearchExpression` elegirá únicamente `asset_folder` para
`dynamic` o `folder` para `fixed` y combinará la carpeta exacta con `/*`.

- [ ] **Step 4: Ejecutar GREEN**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs
```

Expected: todas las pruebas de esta tarea pasan.

## Task 2: Normalización y manifiesto determinista

**Files:**

- Modify: `scripts/cloudinary-media.test.mjs`
- Modify: `scripts/cloudinary-media.mjs`

- [ ] **Step 1: Agregar pruebas fallidas de recursos**

Los fixtures cubrirán:

- `asset_folder` en modo dinámico y `folder` en modo fijo.
- `context.custom.title` y `context.custom.alt`.
- fallback a `display_name` y al nombre Unicode de `public_id`.
- imágenes con `thumb` y `full`.
- videos visuales con `src` MP4 y `poster` JPG.
- omisión de `raw`, `type` distinto de `upload`, `access_mode` autenticado,
  `access_control` superior o dentro de `context`, y audio sin dimensiones.
- rechazo de recursos fuera de la fuente y respuestas incompletas.
- fuente vacía salvo `allowEmpty: true`.
- `assetId` duplicado.
- orden descendente por `createdAt` y desempate binario por `assetId`.

La API pública será:

```js
const { manifest, skipped, countsBySource } = buildManifest({
  folderMode: "dynamic",
  sourceResults: [
    {
      source: cloudinaryFolders[0],
      resources: [imageResource, videoResource],
    },
  ],
});
```

El manifiesto esperado no tendrá fecha de ejecución:

```json
{
  "schemaVersion": 1,
  "images": [],
  "videos": []
}
```

- [ ] **Step 2: Ejecutar RED**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs
```

Expected: `FAIL` porque `buildManifest` todavía no existe.

- [ ] **Step 3: Implementar la transformación mínima**

Cada imagen tendrá:

```js
{
  assetId,
  sourceFolder,
  publicId,
  category,
  createdAt,
  title,
  alt,
  width,
  height,
  thumb,
  full,
}
```

Cada video tendrá:

```js
{
  assetId,
  sourceFolder,
  publicId,
  category,
  createdAt,
  title,
  poster,
  src,
  width,
  height,
  ...(duration !== undefined ? { duration } : {}),
}
```

Las transformaciones serán:

```text
image thumb: f_auto,q_auto,c_fill,g_auto,w_600,h_400
image full:  f_auto,q_auto,c_limit,w_1920
video src:   f_mp4,q_auto
video poster: so_0,f_jpg,q_auto,c_fill,g_auto,w_600,h_400
```

No se deduplicará silenciosamente: un identificador repetido abortará el
snapshot.

- [ ] **Step 4: Ejecutar GREEN**

Run:

```bash
node --test scripts/cloudinary-media.test.mjs
```

Expected: todas las pruebas de medios pasan.

## Task 3: Cliente Search cerrado y paginado

**Files:**

- Create: `scripts/cloudinary-admin.test.mjs`
- Create: `scripts/cloudinary-admin.mjs`

- [ ] **Step 1: Escribir pruebas fallidas del contrato HTTP**

Las pruebas inyectarán un `fetch` falso y comprobarán que:

```js
const client = createCloudinaryAdminClient({
  cloudName: "demo",
  apiKey: "viewer-key",
  apiSecret: "viewer-secret",
  fetchImpl,
});

await client.searchResources({
  expression,
});
```

produce únicamente:

```http
POST https://api.cloudinary.com/v1_1/demo/resources/search
Content-Type: application/json
Authorization: Basic ...
```

La segunda página conservará exactamente el cuerpo de la primera y añadirá
`next_cursor`. Se cubrirán cursores repetidos, más de 1.000 páginas, JSON
inválido, forma inválida, HTTP 401/403/429/500 y mensajes que no expongan el
secret.

`getFolderMode()` será la única operación adicional y usará:

```http
GET https://api.cloudinary.com/v1_1/demo/config?settings=true
```

- [ ] **Step 2: Ejecutar RED**

Run:

```bash
node --test scripts/cloudinary-admin.test.mjs
```

Expected: `FAIL` porque el cliente no existe.

- [ ] **Step 3: Implementar el cliente mínimo**

El módulo solo exportará `createCloudinaryAdminClient`. No habrá un método
`get`, `post` o `request` público. `searchResources` recibirá únicamente la
expresión; el cliente fijará `with_field`, `max_results` y `sort_by`, paginará
internamente y devolverá el arreglo completo. `getFolderMode` validará que
`settings.folder_mode` sea `dynamic` o `fixed`.

- [ ] **Step 4: Ejecutar GREEN**

Run:

```bash
node --test scripts/cloudinary-admin.test.mjs
```

Expected: todas las pruebas del cliente pasan.

## Task 4: Persistencia atómica y guardia de eliminaciones

**Files:**

- Create: `scripts/cloudinary-sync-io.test.mjs`
- Create: `scripts/cloudinary-sync-io.mjs`

- [ ] **Step 1: Escribir pruebas fallidas de seguridad local**

Se probarán estas funciones:

```js
const previous = await readManifest(outputPath);
const removed = findRemovedAssetIds(previous, next);
assertRemovalsAccepted(removed, { acceptRemovals: false });
const result = await writeManifestAtomic(outputPath, next);
```

Casos:

- archivo inexistente devuelve el manifiesto vacío solo cuando se permite
  explícitamente inicializarlo;
- JSON ilegible o `schemaVersion` desconocida aborta;
- una eliminación falla y enumera identificadores;
- `--accept-removals` permite esa reducción;
- `allowEmpty` no omite la guardia;
- contenido idéntico no reescribe el archivo;
- contenido distinto se escribe en UTF-8 con salto final;
- un error anterior al `rename` conserva el archivo previo y limpia el temporal.

- [ ] **Step 2: Ejecutar RED**

Run:

```bash
node --test scripts/cloudinary-sync-io.test.mjs
```

Expected: `FAIL` porque el módulo no existe.

- [ ] **Step 3: Implementar lectura, comparación y reemplazo**

`findRemovedAssetIds` comparará el conjunto combinado de imágenes y videos.
`writeManifestAtomic` serializará con dos espacios, creará un temporal en el
mismo directorio y lo renombrará sobre el destino. No incluirá metadatos
volátiles.

- [ ] **Step 4: Ejecutar GREEN**

Run:

```bash
node --test scripts/cloudinary-sync-io.test.mjs
```

Expected: todas las pruebas de persistencia pasan.

## Task 5: Comando de sincronización

**Files:**

- Create: `scripts/sync-cloudinary.test.mjs`
- Create: `scripts/sync-cloudinary.mjs`
- Create: `src/data/generated/cloudinary-media.json`
- Create: `.env.example`
- Modify: `.gitignore`
- Modify: `package.json`

- [ ] **Step 1: Escribir pruebas fallidas del orquestador**

`runSync` aceptará dependencias inyectables para probar sin red:

```js
await runSync({
  credentials,
  folderMode,
  sources,
  client,
  outputPath,
  acceptRemovals: false,
  verifyFolderMode: false,
  logger,
});
```

Se verificará que:

- ejecuta exactamente una búsqueda para `stand` y otra para `cajas`;
- cada cuerpo usa su propia expresión y `with_field: ["context"]`;
- compara el modo remoto solo con `verifyFolderMode: true`;
- un modo distinto, un fallo Search o una fuente vacía no llama al escritor;
- pasa `acceptRemovals` a la guardia;
- informa cantidades de imágenes, videos y omitidos por fuente;
- rechaza credenciales faltantes y flags desconocidos.

- [ ] **Step 2: Ejecutar RED**

Run:

```bash
node --test scripts/sync-cloudinary.test.mjs
```

Expected: `FAIL` porque el orquestador no existe.

- [ ] **Step 3: Implementar el comando y configuración local**

El snapshot inicial será:

```json
{
  "schemaVersion": 1,
  "images": [],
  "videos": []
}
```

`.env.example` contendrá únicamente:

```dotenv
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

La CLI cargará `.env.local` con Node, admitirá solo
`--accept-removals` y `--verify-folder-mode`, y terminará con código distinto de
cero ante cualquier error. `package.json` agregará:

```json
{
  "scripts": {
    "sync:cloudinary": "node scripts/sync-cloudinary.mjs",
    "test:cloudinary": "node --test scripts/cloudinary-*.test.mjs scripts/sync-cloudinary.test.mjs"
  }
}
```

- [ ] **Step 4: Ejecutar GREEN**

Run:

```bash
npm run test:cloudinary
```

Expected: todas las pruebas unitarias pasan sin solicitudes reales.

## Task 6: Integrar el manifiesto con Astro

**Files:**

- Create: `src/data/cloudinary-media-adapter.mjs`
- Create: `scripts/cloudinary-site-adapter.test.mjs`
- Modify: `src/data/site.ts`
- Modify: `src/pages/videos.astro`
- Modify: `scripts/smoke.mjs`

- [ ] **Step 1: Hacer que smoke describa ambos estados**

El smoke test leerá `src/data/generated/cloudinary-media.json`.

- Sin imágenes de `stand`, esperará las 80 URLs manuales.
- Con imágenes de `stand`, esperará solo las imágenes generadas de Eventos.
- Siempre sumará imágenes generadas de `cajas` a Instrumental.
- Sin videos, conservará el estado vacío.
- Con videos, esperará tarjetas, filtros, promoción desde Inicio y Galería, y
  ausencia del mensaje “Próximamente”.

- [ ] **Step 2: Probar el adaptador con una fixture no vacía**

Run:

```bash
node --test scripts/cloudinary-site-adapter.test.mjs
```

Expected: primero falla porque el adaptador no existe. Después debe cubrir un
snapshot vacío, imágenes de `stand` y `cajas`, videos, la sustitución del
fallback y el rechazo de `assetId` repetidos.

- [ ] **Step 3: Importar y adaptar el manifiesto**

El adaptador convertirá:

```js
cloudinaryMedia.images -> GalleryItem[]
cloudinaryMedia.videos -> VideoItem[]
```

Si hay al menos una imagen cuyo `sourceFolder` sea `chaco-implantes/stand` o
una subcarpeta, no agregará `eventGalleryImages`. Las imágenes locales,
`supplierSystems` y las cuatro URLs manuales de marcas no cambiarán.

`videos.astro` usará copy actual solo cuando `videos.length === 0`.

- [ ] **Step 4: Verificar la integración**

Run:

```bash
npm run check
npm run build
npm run test:smoke
```

Expected: typecheck, build y smoke pasan con el snapshot versionado.

## Task 7: Documentación, revisión y primera sincronización

**Files:**

- Modify: `README.md`
- Review:
  `docs/superpowers/specs/2026-07-25-cloudinary-media-sync-design.md`
- Review: all changed files

- [ ] **Step 1: Documentar el flujo seguro**

El README explicará:

- copiar `.env.example` a `.env.local`;
- usar una key no raíz y Viewer cuando la cuenta lo permita;
- elegir `dynamic` o `fixed` en la configuración;
- Search usa POST pero es una búsqueda de lectura;
- `/config` es opcional y no justifica ampliar permisos;
- no hay fallback automático;
- la consistencia eventual se resuelve reejecutando;
- una eliminación intencional requiere `--accept-removals`;
- `brands` sigue manual.

- [ ] **Step 2: Revisar secretos y endpoints**

Run:

```bash
rg -n "CLOUDINARY_API_SECRET|Authorization|/resources/search|/config" \
  . -g "!node_modules" -g "!dist" -g "!.env.local"
```

Expected: solo nombres de variables, pruebas con valores ficticios y los dos
endpoints permitidos; ningún secret real.

- [ ] **Step 3: Ejecutar verificación completa**

Run:

```bash
npm run test:cloudinary
npm run check
npm run build
npm run test:smoke
git diff --check
```

Expected: todos los comandos terminan con código 0.

- [ ] **Step 4: Ejecutar la primera sincronización real cuando estén las
  credenciales**

Run:

```bash
npm run sync:cloudinary
```

Expected: `stand` y `cajas` producen recursos publicables y el resumen permite
revisar las cantidades. Si una eliminación es legítima:

```bash
npm run sync:cloudinary -- --accept-removals
```

La ausencia de credenciales no bloquea el desarrollo ni el build: se conserva
el snapshot vacío y, por ello, las imágenes manuales de eventos.

## Resultado esperado

- Galería recibe imágenes de `stand` y `cajas` después de una sincronización.
- Videos recibe medios visuales de ambas fuentes.
- `brands` sigue controlado por sus cuatro URLs actuales.
- El build no depende de Cloudinary ni contiene credenciales.
- Search falla de forma explícita y nunca cambia de estrategia.
- Una respuesta parcial no puede borrar recursos sin aceptación.
- El manifiesto anterior permanece intacto ante errores.
