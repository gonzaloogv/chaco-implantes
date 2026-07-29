# Imágenes optimizadas del home y títulos de medios

Fecha: 2026-07-29

Estado: aprobado

## Contexto

El home usa una imagen local de quirófano en dos secciones y una imagen de
categoría genérica en la tarjeta de la galería. Las tres imágenes elegidas para
reemplazarlas ya existen en Cloudinary, pero sus URLs originales entregan JPEG
de entre 1,1 MB y 1,9 MB sin transformación.

La última sincronización también dejó:

- 126 imágenes de `chaco-implantes/cajas` con títulos visibles numerados como
  `Producto instrumental 1…126`;
- 98 videos de `chaco-implantes/cajas` con el título técnico
  `Producto instrumental`, que la página convierte en
  `Caja de instrumental N.º …`;
- un video de `chaco-implantes/stand` con un título genérico.

El usuario aprobó reemplazar las tres imágenes del home por variantes
optimizadas, retirar la numeración visible del instrumental y titular el video
del stand como `61° Congreso de Traumatología — Stand Chaco Implantes`.

## Objetivos

- Usar las tres imágenes indicadas en sus secciones exactas del home.
- Entregar variantes de Cloudinary con formato, calidad, recorte y dimensiones
  adecuados para cada contenedor.
- Mantener las imágenes originales intactas en Cloudinary.
- Mostrar `Producto instrumental` en las fotos de cajas, sin número visible.
- Mostrar `Instrumental` en los videos de cajas, sin número visible.
- Mostrar `61° Congreso de Traumatología — Stand Chaco Implantes` en el video
  de stand.
- Mantener el comportamiento estable en sincronizaciones futuras.

## Fuera de alcance

- Subir, editar, mover o eliminar recursos en Cloudinary.
- Cambiar el layout, alturas, proporciones o animaciones del home.
- Modificar imágenes del hero principal, catálogos, eventos o proveedores.
- Eliminar `generatedLabelNumber` del esquema del manifiesto.
- Cambiar la reproducción silenciosa o el diseño del player.
- Sincronizar carpetas distintas de `stand` y `cajas`.

## Diseño

### Variantes optimizadas del home

`src/data/site.ts` declarará transformaciones específicas y tres propiedades
descriptivas dentro de `images`.

| Uso | Recurso | Transformación |
| --- | --- | --- |
| Tarjeta Galería de imágenes | `v1785277687/chaco-36_yd3o1w.jpg` | `f_auto,q_auto,c_fill,g_auto,w_1400,h_960` |
| Tarjeta Videos | `v1783105556/Congreso_traumato-236_fteaqx.jpg` | `f_auto,q_auto,c_fill,g_auto,w_1200,h_960` |
| Acompañamiento profesional | `v1785277732/chaco-64_evgaky.jpg` | `f_auto,q_auto,c_fill,g_auto,w_1200,h_1400` |

Las transformaciones se ubicarán antes de la versión de Cloudinary. `f_auto`
y `q_auto` elegirán el formato y calidad según el navegador; `c_fill,g_auto`
adaptará el encuadre al contenedor conservando el foco relevante; `w` y `h`
evitarán descargar los originales de alta resolución.

Las variantes se comprobaron antes de la implementación y pesan
aproximadamente 192 KB, 138 KB y 168 KB, respectivamente. No se agregará
`srcset` porque el alcance aprobado pide optimizar las URLs existentes y las
dimensiones elegidas ya cubren pantallas de alta densidad sin introducir una
nueva estrategia responsive.

`src/pages/index.astro` usará:

- la variante de `chaco-36` en `data-home-media-card="gallery"`;
- la variante `Congreso_traumato-236` en
  `data-home-media-card="videos"`;
- la variante de `chaco-64` en `.home-support-media`.

Los textos alternativos describirán el contenido y la finalidad de cada foto,
sin repetir el título de la tarjeta:

- `Preparación de cajas e instrumental quirúrgico`;
- `Profesionales durante el 61° Congreso de Traumatología`;
- `Preparación y control de instrumental en Chaco Implantes`.

### Fotos de cajas sin numeración visible

La opción `unnamedImageLabel` seguirá identificando las imágenes de cajas que
no tienen título editorial en Cloudinary. El generador conservará
`generatedLabelNumber` como dato interno estable, pero asignará a `title` y
`alt` solamente el texto `Producto instrumental`.

Si una imagen recibe después título o texto alternativo editorial en
Cloudinary, ese contenido continuará teniendo prioridad. No se usará
`fixedImageTitle` porque sobrescribiría esa metadata editorial.

Conservar `generatedLabelNumber` evita perder el historial interno y no afecta
la interfaz: el adaptador y las páginas no lo renderizan directamente.

### Videos sin numeración

La configuración por carpeta usará títulos fijos distintos:

- `chaco-implantes/stand`:
  `61° Congreso de Traumatología — Stand Chaco Implantes`;
- `chaco-implantes/cajas`: `Instrumental`.

`src/pages/videos.astro` dejará de convertir un título genérico en
`Caja de instrumental N.º …` y renderizará directamente `video.title`. Así la
numeración no reaparecerá aunque un manifiesto anterior o una metadata futura
incluyan el antiguo texto genérico.

El campo `position` del reproductor seguirá recibiendo el índice. Es un dato de
navegación y accesibilidad, no forma parte del título visible.

### Sincronización

Después de cambiar el generador y la configuración se ejecutará:

```bash
npm run sync:cloudinary
```

La sincronización volverá a consultar `stand` y `cajas`, verificará las
variantes de video y su ausencia de audio, y reemplazará el manifiesto de forma
atómica. No se espera ninguna baja de `assetId`; si el inventario remoto vuelve
a cambiar y activa la protección de eliminaciones, el proceso se detendrá sin
reemplazar el manifiesto para revisar primero la diferencia.

## Archivos

- `src/data/site.ts`: URLs transformadas y nombres de las tres imágenes.
- `src/pages/index.astro`: asignación de imágenes y textos alternativos.
- `scripts/cloudinary-folders.config.mjs`: títulos fijos por carpeta.
- `scripts/cloudinary-media.mjs`: etiqueta visible sin número y conservación
  del número interno.
- `src/pages/videos.astro`: eliminación de la numeración de presentación.
- `src/data/generated/cloudinary-media.json`: resultado regenerado.
- Pruebas existentes de home, Cloudinary, sincronización y smoke: expectativas
  actualizadas al nuevo contrato.

## Pruebas

La implementación seguirá pruebas primero:

1. Hacer fallar una prueba que exija las tres URLs transformadas y sus usos en
   el home.
2. Hacer fallar pruebas que exijan títulos de fotos sin sufijo numérico.
3. Hacer fallar pruebas que distingan el título del video de stand y el de los
   videos de cajas.
4. Hacer fallar una prueba que prohíba
   `Caja de instrumental N.º` en la página de videos.
5. Aplicar los cambios mínimos de producción.
6. Resincronizar y verificar el manifiesto resultante.

## Verificación

- `npm run test:home`
- `npm run test:cloudinary`
- `npm run sync:cloudinary`
- `npm run verify:cloudinary-video-audio`
- `npm run check`
- `npm run build`
- `npm run test:video-player`
- Auditoría del HTML generado para confirmar las tres URLs del home y la
  ausencia de títulos numerados.

`npm run test:smoke` también se ejecutará. Su aserción previa de la imagen
NextAR del hero está desactualizada respecto de cambios locales ya existentes;
si continúa siendo el único fallo, se informará por separado y no se
modificará dentro de este alcance.
