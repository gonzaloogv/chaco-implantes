# Títulos de eventos y videos listos para reproducir

Fecha: 2026-07-26
Estado: aprobado por definición del usuario

## Objetivo

La galería y la página de videos no deben mostrar identificadores técnicos de
Cloudinary. La sincronización tampoco debe publicar un video cuya
transformación MP4 siga en proceso.

## Títulos visibles

La sincronización aplicará estos títulos sin cambiar nombres ni metadatos en
Cloudinary:

- Cada imagen de `chaco-implantes/stand` usará
  `61° Congreso Traumatología` como `title` y `alt`.
- Cada video de `chaco-implantes/cajas` usará
  `Producto instrumental` como `title`.
- Las imágenes de `chaco-implantes/cajas` conservarán la numeración
  `Producto instrumental N` ya implementada.

Los títulos fijos reemplazarán el `publicId`, el `display_name` y cualquier
texto editorial de los recursos incluidos en esas reglas. Las URLs, los
archivos originales y sus metadatos remotos permanecerán intactos.

La configuración de carpetas declarará los títulos fijos. `buildManifest`
seguirá siendo responsable de escribirlos en el manifiesto.

## Preparación de videos

Los archivos originales son MOV con HEVC. El sitio entrega una transformación
MP4 compatible mediante Cloudinary. La primera solicitud puede devolver
`423 Locked` mientras Cloudinary genera esa versión, por lo que el elemento
`video` no inicia la reproducción.

Antes de reemplazar el manifiesto, el sincronizador comprobará cada URL MP4 con
una solicitud de rango mínimo:

- `200 OK` o `206 Partial Content`: el video está listo.
- `423 Locked`: esperará y volverá a consultar durante un plazo acotado.
- Otro estado HTTP, un error de red o el vencimiento del plazo: cancelará la
  sincronización.

El sincronizador procesará hasta seis videos en paralelo. Ante un `423`,
esperará dos segundos entre intentos y concederá hasta 120 segundos por video.
Si falla cualquier comprobación, conservará el manifiesto anterior y devolverá
un error explícito. Los reintentos no modificarán los originales, aunque
Cloudinary generará y almacenará versiones derivadas y contabilizará las
transformaciones correspondientes.

## Flujo

1. Search API obtiene los recursos de `stand` y `cajas`.
2. `buildManifest` filtra recursos, aplica los títulos y conserva la numeración
   existente de las imágenes instrumentales.
3. Las validaciones de eliminaciones se ejecutan con el comportamiento actual.
4. El sincronizador comprueba que cada MP4 responda como contenido reproducible.
5. El sincronizador reemplaza el manifiesto de forma atómica.
6. Astro publica los títulos y URLs ya comprobados.

## Pruebas

Las pruebas unitarias comprobarán:

- el título fijo de todas las imágenes de `stand`;
- el título fijo de todos los videos de `cajas`;
- la conservación de `Producto instrumental N` en las imágenes;
- la aceptación de respuestas `200` y `206`;
- el reintento de `423` hasta obtener contenido;
- el error por estado inesperado o plazo vencido;
- la conservación del manifiesto anterior si un video no queda listo.

La verificación final ejecutará:

```text
npm run test:cloudinary
npm run check
npm run build
npm run test:smoke
```

Una prueba en Chromium reproducirá videos del inicio, centro y final de la
colección y comprobará que avancen desde el segundo cero sin errores de red.

## Fuera de alcance

- Renombrar, borrar o editar activos originales en Cloudinary.
- Numerar los videos.
- Cambiar los títulos de imágenes que no provengan de `stand`.
- Cambiar el umbral de dos segundos.
