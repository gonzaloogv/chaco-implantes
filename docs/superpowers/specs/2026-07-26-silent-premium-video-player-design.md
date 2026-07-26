# Reproductor premium sin pista de audio

Fecha: 2026-07-26
Estado: diseño aprobado; documento pendiente de revisión final

## Contexto

La página `/videos` publica 70 videos sincronizados desde Cloudinary. En la
implementación actual, cada tarjeta usa los controles nativos del navegador,
declara la URL MP4 desde el render inicial y muestra un póster generado con
recorte. Los controles varían entre navegadores, incluyen opciones de volumen y
no acompañan la identidad visual del sitio.

Cuatro de los videos publicados son verticales. El uso actual de
`object-cover` los recorta para llenar una tarjeta horizontal.

## Objetivos

- Entregar al navegador MP4 sin pista de audio, no solamente silenciados.
- Aplicar la dirección visual aprobada “B — Control flotante”: tecnológica,
  premium y sobria.
- Evitar controles de volumen o cualquier opción para reactivar sonido.
- Conservar completos tanto los videos horizontales como los verticales.
- Mantener una carga liviana aunque la colección incluya 70 elementos.
- Sostener navegación por teclado, foco visible y estados comprensibles.

## Fuera de alcance

- Modificar, reemplazar o eliminar los archivos originales de Cloudinary.
- Agregar audio, subtítulos, reproducción automática o listas de reproducción.
- Incorporar el SDK Cloudinary Video Player u otra dependencia.
- Cambiar títulos, categorías, filtros o el umbral mínimo de dos segundos.
- Adoptar streaming adaptativo HLS o DASH.
- Rediseñar otras páginas o los estilos globales no relacionados.

## Entrega sin audio

La transformación de origen pasará de:

```text
f_mp4,q_auto
```

a:

```text
f_mp4,q_auto,ac_none
```

Cloudinary documenta que `ac_none` elimina por completo el canal de audio de la
variante entregada:

https://cloudinary.com/documentation/audio_transformations

El cambio crea nuevas variantes derivadas para los 70 recursos, pero no
modifica los originales. La sincronización conservará su flujo actual:

1. Search API obtiene los recursos.
2. `buildManifest` genera las nuevas URLs con `ac_none`.
3. La comprobación de readiness prepara cada MP4 y cada nuevo póster, y
   reintenta respuestas `423 Locked`.
4. Un inspector MP4 comprueba que cada candidato contenga video y no contenga
   ningún track de audio.
5. El manifiesto se reemplaza únicamente si todas las variantes están
   disponibles por HTTP y superan la inspección.

El elemento `<video>` también permanecerá silenciado como defensa adicional,
pero el cumplimiento principal será la ausencia real de una pista de audio en
el MP4 derivado. No se renderizarán controles de volumen.

## Arquitectura del reproductor

Se creará `src/components/VideoPlayer.astro`. El componente encapsulará el
marcado, los estilos acotados y el comportamiento de reproducción. Se apoyará
en el elemento HTML `<video>` y las APIs nativas del navegador, sin un SDK
externo.

La página `src/pages/videos.astro` seguirá siendo responsable de la grilla, los
filtros y el estado vacío. Cada tarjeta delegará la experiencia audiovisual al
nuevo componente. El `<video>` interno se conservará dentro de
`[data-video-item]`, por lo que la lógica existente podrá seguir pausándolo al
ocultar una categoría.

La duración del manifiesto se propagará mediante
`src/data/cloudinary-media-adapter.mjs` y el tipo `VideoItem` para mostrar el
tiempo total antes de descargar metadatos. No se cambiará la versión del
esquema. Si un recurso futuro no informa duración, el control mostrará un valor
`--:--` y mantendrá deshabilitado el rango hasta recibir `loadedmetadata`.

## Dirección visual

Cada tarjeta conservará la relación 16:9 y el contenido editorial inferior con
el título `Producto instrumental` y su categoría.

El área audiovisual tendrá:

- fondo azul profundo;
- póster decorativo con texto alternativo vacío y carga diferida;
- botón de reproducción circular y claro en el estado inicial;
- distintivo discreto `SIN AUDIO` en la esquina superior;
- degradado inferior para sostener los controles sin tapar el contenido;
- botón reproducir/pausar, progreso, tiempo transcurrido/total y pantalla
  completa;
- estados integrados de carga, error, reintento y repetición.

El video usará `object-contain` dentro del marco oscuro. De esa forma, los
cuatro videos verticales se muestran completos y los espacios laterales se
integran con la paleta. El póster también se generará sin recorte destructivo y
se presentará sobre el mismo fondo mediante esta transformación:

```text
so_0,f_jpg,q_auto,b_rgb:0f172a,c_pad,ar_16:9,w_600
```

El `c_pad` conserva el cuadro completo dentro de un lienzo 16:9 y usa el azul
profundo del sitio para el espacio restante. La readiness preparará también
estas 70 nuevas variantes de póster antes de publicar el manifiesto.

Los controles serán visibles al inicio y mientras el reproductor esté pausado.
Durante la reproducción podrán atenuarse después de un período breve de
inactividad únicamente en dispositivos con puntero preciso. Volverán a
mostrarse con movimiento, foco o interacción. En pantallas táctiles
permanecerán fácilmente recuperables y tendrán objetivos de al menos 44 píxeles.

## Comportamiento

- No habrá reproducción automática.
- El MP4 se almacenará inicialmente en `data-src`; el componente asignará
  `src` al primer intento de reproducción.
- El póster será una imagen independiente con `loading="lazy"` y
  `decoding="async"`.
- `preload="none"` evitará descargas anticipadas del video.
- Al comenzar un video, cualquier otro video de la página se pausará.
- Hacer clic en el video o en el botón principal alternará
  reproducción/pausa.
- El rango de progreso permitirá buscar dentro del video y actualizará el
  tiempo visible.
- Al finalizar aparecerá la acción de reproducir nuevamente.
- Al fallar la carga se mostrará un mensaje breve y una acción de reintento.
- El botón de pantalla completa solicitará fullscreen sobre el contenedor para
  conservar los controles. Si esa API no está disponible, el botón se ocultará
  en lugar de delegar a un reproductor nativo con controles diferentes.
- Cuando un filtro oculte una tarjeta, el evento `pause` mantendrá sincronizado
  el estado visual del componente.
- El marcado incluirá un enlace simple para abrir el MP4. El componente lo
  ocultará únicamente después de inicializarse correctamente, de modo que
  también cubra un fallo del módulo con JavaScript habilitado.

## Accesibilidad

- Todos los botones tendrán nombres accesibles en español y reflejarán su
  acción actual.
- Los nombres incluirán la posición del video dentro de la colección para
  distinguir controles repetidos sin cambiar el título visible.
- El control de progreso será un `input type="range"` con valor textual.
- La reproducción podrá manejarse mediante botones nativos con
  `Enter` y `Espacio`; las flechas del rango conservarán su comportamiento
  estándar.
- Los controles respetarán el foco global visible y el contraste WCAG AA.
- Los estados de carga y error se anunciarán sin convertir el avance del tiempo
  en una región viva.
- Las transiciones respetarán `prefers-reduced-motion`.
- Ninguna información esencial dependerá del audio.

Los videos existentes se tratarán como material visual complementario del
título, la categoría y el contexto comercial de la página; no constituyen
instrucciones clínicas ni comunican requisitos de seguridad exclusivamente
mediante movimiento. Los controles apuntarán a WCAG AA, pero no se afirmará que
un título genérico describe visualmente cada clip. Si en el futuro se publica
un video que transmita instrucciones o información esencial, su publicación
requerirá una descripción textual equivalente obtenida del contexto editorial
de Cloudinary o incorporada al manifiesto.

## Archivos previstos

- `scripts/cloudinary-media.mjs`
- `scripts/cloudinary-media.test.mjs`
- `scripts/cloudinary-video-readiness.mjs`
- `scripts/cloudinary-video-readiness.test.mjs`
- `scripts/cloudinary-video-audio.mjs`, nuevo
- `scripts/cloudinary-video-audio.test.mjs`, nuevo
- `scripts/verify-cloudinary-video-audio.mjs`, nuevo
- `scripts/sync-cloudinary.mjs`
- `scripts/sync-cloudinary.test.mjs`
- `src/data/generated/cloudinary-media.json`, regenerado por sincronización
- `src/data/cloudinary-media-adapter.mjs`
- `src/data/site.ts`
- `scripts/cloudinary-site-adapter.test.mjs`
- `src/components/VideoPlayer.astro`, nuevo
- `src/components/Icon.astro`
- `src/pages/videos.astro`
- `scripts/smoke.mjs`
- `package.json`
- `README.md`, únicamente para documentar la variante sin audio

Los estilos específicos permanecerán dentro del componente. No se agregará una
dependencia ni se cambiará la arquitectura general del sitio.

## Pruebas y verificación

La implementación se realizará partiendo de pruebas que fallen para cada
contrato nuevo.

Las pruebas automatizadas comprobarán:

- que todas las URLs de video generadas incluyan `ac_none`;
- que readiness prepare tanto el MP4 como el póster y preserve el manifiesto
  anterior si cualquiera de las dos variantes falla;
- que la inspección de audio se ejecute antes de la escritura atómica y preserve
  byte por byte el manifiesto anterior ante un track `soun`, un MP4 inválido o
  un error de red;
- que la duración se conserve en el adaptador del sitio;
- que cada recurso publicado tenga un reproductor personalizado;
- que no se rendericen controles nativos ni controles de volumen;
- que el póster declare carga diferida.

La verificación de navegador comprobará:

- cero solicitudes MP4 antes de la primera interacción;
- carga y reproducción al pulsar el control;
- pausa automática del video anterior al iniciar otro;
- pausa al ocultar una tarjeta mediante filtros;
- búsqueda por la barra de progreso;
- entrada y salida de pantalla completa cuando la API esté disponible;
- estados de repetición y error;
- uso por teclado y controles táctiles;
- presentación completa de videos verticales;
- ausencia de pistas de audio expuestas por el video cargado.

Además, las 70 variantes resultantes se inspeccionarán para confirmar que sus
contenedores MP4 no incluyan un track de tipo `soun`. Para que esta comprobación
sea reproducible sin dependencias externas, se agregará un verificador local
que:

1. lea por rangos los encabezados de cajas MP4 hasta encontrar `moov`;
2. descargue únicamente esa caja;
3. recorra `trak/mdia/hdlr`;
4. exija al menos un handler `vide` y rechace cualquier handler `soun`;
5. procese con concurrencia acotada las 70 URLs del manifiesto.

El parser tendrá pruebas unitarias con contenedores mínimos de video, audio y
estructuras inválidas. También limitará el tamaño aceptado de `moov`, la
cantidad de cajas y solicitudes de rango, y comprobará cada offset contra el
tamaño remoto antes de reservar memoria.

La misma inspección se integrará en `runSync`, mediante una dependencia
inyectable, después de readiness y antes de `writeManifestAtomic`. Un track de
audio, una estructura inválida o un error de red abortarán la sincronización y
dejarán intacto el manifiesto anterior. El comando independiente se mantendrá
como auditoría repetible del manifiesto ya publicado:

```text
npm run verify:cloudinary-video-audio
```

La verificación final ejecutará:

```text
npm run test:cloudinary
npm run sync:cloudinary
npm run verify:cloudinary-video-audio
npm run check
npm run build
npm run test:smoke
```

La sincronización requiere las credenciales locales de solo lectura ya
configuradas. No se publicará ni se hará push desde este flujo.

## Riesgos y mitigaciones

- **Nuevas variantes demoradas:** `ac_none` y los pósteres sin recorte obligan
  a preparar 140 derivados. La readiness reintenta `423` y conserva el
  manifiesto anterior.
- **Controles personalizados incompletos:** el componente cubrirá explícitamente
  teclado, táctil, carga, error, progreso y fullscreen antes de reemplazar los
  controles nativos.
- **Carga inicial excesiva:** los MP4 no recibirán `src` hasta el primer play y
  los pósteres usarán carga diferida.
- **Recorte de material vertical:** el contenido se presentará con
  `object-contain` sobre un fondo intencional, no mediante `object-cover`.
- **Diferencias de fullscreen móvil:** se mantendrá una ruta de degradación
  segura cuando el contenedor no pueda entrar en pantalla completa.
