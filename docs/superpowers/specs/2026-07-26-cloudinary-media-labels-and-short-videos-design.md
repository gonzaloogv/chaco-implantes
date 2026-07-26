# Nombres de instrumental y videos cortos de Cloudinary

Fecha: 2026-07-26
Estado: aprobado

## Objetivo

La galería debe mostrar nombres útiles para las imágenes de instrumental que
solo tienen un identificador técnico. La sincronización también debe omitir los
videos accidentales cuya duración sea menor a dos segundos.

## Alcance

El cambio cubre los recursos sincronizados desde estas carpetas:

- `chaco-implantes/cajas`: nombres visibles de imágenes y filtro de videos.
- `chaco-implantes/stand`: filtro de videos.

Las imágenes manuales, `brands`, los videos de dos segundos o más y los
recursos con nombres editoriales conservan su comportamiento.

## Nombres visibles de instrumental

`buildManifest` asignará un nombre a cada imagen sincronizada desde
`chaco-implantes/cajas` que no tenga texto editorial.

La sincronización considerará editorial cualquier texto no vacío cargado en
`context.custom.title`, `context.custom.caption` o `context.custom.alt`. Si
existe alguno, el manifiesto usará esos campos para resolver `title` y `alt`.
`display_name`, `publicId` y la versión humanizada del nombre del archivo son
valores técnicos para esta carpeta y no evitan la numeración.

Si solo existe `context.custom.alt`, el sitio lo usará como `title` y `alt`. Si
existe un título o caption, el sitio lo usará como título y preferirá el alt
personalizado para el texto alternativo.

Cada imagen sin nombre recibirá:

```text
Producto instrumental 1
Producto instrumental 2
Producto instrumental 3
```

Las imágenes con texto editorial no consumen un número. El manifiesto guardará
el entero asignado en `generatedLabelNumber`, además de escribir el rótulo en
`title` y `alt`. El adaptador usará ese texto en la tarjeta, la etiqueta
accesible y el lightbox.

En la primera sincronización, las imágenes actuales recibirán números según el
orden del manifiesto. En sincronizaciones posteriores, el sincronizador
recuperará la asignación anterior por `assetId`. Una imagen nueva tomará el
menor entero positivo que no esté en uso. Una imagen existente conservará su
número mientras mantenga el mismo `assetId` y no reciba texto editorial.

El sitio no cambia el `publicId`, las URLs, los metadatos ni el archivo guardado
en Cloudinary.

## Filtro de videos cortos

`buildManifest` omitirá un recurso de tipo video cuando Cloudinary informe una
duración finita mayor o igual a cero y menor a `2`.

- `1.999` segundos: se omite.
- `2` segundos: se conserva.
- Duración ausente: se conserva porque la sincronización no puede comprobarla.

El sincronizador registrará estos recursos en `skipped` con el motivo
`short_video` y sumará cada omisión al contador de la fuente. El manifiesto
anterior seguirá intacto si el filtro deja una fuente obligatoria sin recursos
publicables.

La integración usa permisos de lectura. El filtro no elimina ni modifica
activos en Cloudinary.

## Flujo de datos

1. Search API devuelve imágenes y videos.
2. El sincronizador lee el manifiesto anterior para recuperar los números
   asignados por `assetId`.
3. `buildManifest` valida los recursos, omite los videos cortos y asigna
   números a las imágenes de instrumental sin texto editorial.
4. El sincronizador guarda el manifiesto mediante el reemplazo atómico
   existente.
5. `buildSiteMediaCollections` adapta los nombres guardados para la galería.
6. Astro genera Galería y Videos desde esas colecciones.

## Pruebas

Las pruebas del manifiesto cubrirán dos imágenes sin nombre, una imagen con
texto editorial y una imagen de Eventos. Comprobarán la primera asignación, la
conservación por `assetId`, el uso del menor número libre y la resolución de un
caso que solo tenga alt personalizado.

Las pruebas de videos cubrirán duraciones menores a dos segundos, iguales a dos
segundos y ausentes. También comprobarán el motivo `short_video` y los
contadores por fuente.

La verificación final ejecutará:

```text
npm run test:cloudinary
npm run check
npm run build
npm run test:smoke
```

Después de sincronizar los datos reales, una comprobación en el navegador
confirmará los nombres de Galería y la ausencia de videos menores a dos
segundos.

## Fuera de alcance

- Renombrar o borrar activos en Cloudinary.
- Cambiar títulos de videos.
- Numerar imágenes de Eventos, Productos, Quirófano o `brands`.
- Conservar un número si Cloudinary reemplaza la imagen y genera otro
  `assetId`.
