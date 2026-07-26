# Chaco Implantes

Sitio corporativo multipage para Chaco Implantes, desarrollado con Astro, TypeScript y Tailwind CSS.

## Stack

- Astro 6
- TypeScript estricto
- Tailwind CSS 4
- Build estatico

## Scripts

```bash
npm run dev
npm run check
npm run build
npm run test:cloudinary
npm run sync:cloudinary
npm run test:smoke
npm run preview
```

## Estructura

- `src/components/`: componentes reutilizables de UI.
- `src/data/site.ts`: contenido, navegacion, categorias, galeria y rutas de assets.
- `src/data/generated/cloudinary-media.json`: último inventario válido de imágenes y videos sincronizados.
- `src/layouts/BaseLayout.astro`: layout base, metadatos SEO y JSON-LD.
- `src/pages/`: rutas multipage del sitio.
- `src/styles/global.css`: Tailwind, tokens visuales y estados de interaccion.
- `public/assets/brand/`: logos e imagenes de marca.
- `public/assets/images/`: imagenes editoriales y de secciones.
- `scripts/smoke.mjs`: smoke checks de build, rutas, SEO, estructura y trazas no deseadas.

## Medios de Cloudinary

El build y el navegador no consultan la Admin/Search API ni reciben
credenciales. El navegador solo descarga las URLs públicas de entrega
incluidas en el manifiesto.

`npm run sync:cloudinary` usa la Search API para generar un manifiesto estático:

- `chaco-implantes/stand` y sus subcarpetas alimentan `Eventos`.
- `chaco-implantes/cajas` y sus subcarpetas alimentan `Instrumental`.
- `brands` permanece manual en `src/data/site.ts`.

Las imágenes de `cajas` sin `context.custom.title`, `caption` o `alt` reciben
un nombre `Producto instrumental N`. El sincronizador conserva el número por
`assetId` y asigna a cada imagen nueva el menor número libre.

Los videos con una duración conocida menor a dos segundos se registran como
`short_video` y no se publican. El archivo original permanece en Cloudinary.

### Configuración

1. Copiar `.env.example` como `.env.local`.
2. Completar `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y
   `CLOUDINARY_API_SECRET`.
3. Confirmar `cloudinaryFolderMode` en
   `scripts/cloudinary-folders.config.mjs`: debe ser `dynamic` o `fixed`.
4. Ejecutar:

```bash
npm run sync:cloudinary
```

La key recomendada es una key no raíz, exclusiva para este flujo y con rol
Viewer sobre `stand` y `cajas` cuando la cuenta permita permisos por carpeta.
La key raíz del product environment conserva permisos completos aunque el
script solo ejecute lecturas, por lo que no se recomienda para este uso.
No ampliar permisos solo para detectar el modo: la comprobación de
`GET /config?settings=true` es opcional y se ejecuta únicamente con:

```bash
npm run sync:cloudinary -- --verify-folder-mode
```

La búsqueda principal usa `POST /resources/search` con un cuerpo JSON. Aunque
el método HTTP sea POST, esa operación solo busca recursos y no los modifica.
El cliente no implementa endpoints de carga, edición ni eliminación.

No existe fallback automático a otro método de listado. Ante credenciales
incorrectas, falta de permisos, un límite de API o una respuesta inválida, el
comando termina con error y conserva el manifiesto anterior. La Search API
puede tardar algunos segundos en reflejar cambios recientes; en ese caso se
debe volver a ejecutar el mismo comando.

Si el nuevo resultado elimina recursos presentes en el manifiesto, la
sincronización se detiene y enumera sus `assetId`. Después de revisar que la
reducción sea intencional, se acepta con:

```bash
npm run sync:cloudinary -- --accept-removals
```

Mientras el manifiesto no contenga imágenes válidas de `stand`, Galería
conserva las 80 imágenes manuales de eventos. Cuando se genere el primer
snapshot real de esa carpeta, el sitio usa exclusivamente las imágenes
sincronizadas para evitar duplicados.

## Verificacion

Antes de entregar cambios, correr:

```bash
npm run test:cloudinary
npm run check
npm run build
npm run test:smoke
npm audit --omit=dev
```
