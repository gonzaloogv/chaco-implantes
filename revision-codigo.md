# Revisión de código — chaco-implantes

Revisión técnica del código fuente (2026-07-21). Complementa a `design-review.md`: acá va lo que
**no** está cubierto ahí — bugs latentes, código muerto, duplicación, rendimiento y la lista completa
de imágenes sin optimizar. Solo devolución escrita, no se modificó nada.

Estado general: `astro check` y `tsc --noEmit` pasan sin errores. El código está prolijo y varios
puntos del design-review ya están resueltos en el código (ver sección 7).

---

## 1. Bugs / riesgos inmediatos

### 1.1 Favicons borrados pero todavía referenciados
`git status` muestra `public/favicon.ico` y `public/favicon.svg` borrados (sin commitear), pero
`src/layouts/BaseLayout.astro:44-45` sigue linkeando ambos. Si se commitea el borrado tal cual,
todas las páginas van a pedir favicons 404. Restaurarlos o reemplazarlos por uno derivado del
logo circular antes del próximo deploy.

### 1.2 `images.logo` apunta a un archivo que no existe
`src/data/site.ts:12` define `logo: "/assets/brand/logo.png"`, pero en `public/assets/brand/` no hay
ningún `logo.png`. Hoy nadie usa esa entrada (por eso no rompe), pero es una mina: el primer
componente que la use va a renderizar una imagen rota. Borrar la entrada o agregar el archivo.

### 1.3 El preload del layout precarga el logo equivocado
`BaseLayout.astro:46` hace `<link rel="preload">` de `logo-circular.png` (428 KB), que solo se usa
en el **footer** (a 40 px) y como og:image. El header —lo primero que se ve— usa
`logo-circular-white.png` (3,4 MB), que **no** se precarga. Resultado: se le da prioridad de red a
un asset de abajo de todo y el logo real del header compite tarde. Si se optimiza el logo blanco
(ver §3), precargar ese; o directamente sacar el preload.

### 1.4 La galería sirve los PNG originales como "thumbnails"
`cloudinaryVariant()` (`src/data/site.ts:812`) solo transforma URLs de Cloudinary; para rutas
locales devuelve la URL sin tocar. Los 11 items locales de `galleryPool` quedan con
`thumb = full = PNG original`. Como los primeros 12 items cargan con `loading="eager"` (y 4 con
`fetchpriority="high"`), abrir `/galeria` descarga **~14 MB** de PNGs para mostrar miniaturas de
600×400 (solo `cat-osteosintesis-tornillos.png` son 3,9 MB). Opciones: subir esas 11 fotos a
Cloudinary como el resto, o generar variantes locales optimizadas.

### 1.5 El carrusel no reinicia el timer al tocar un punto
En `src/pages/index.astro:359-393`, `setInterval` corre fijo cada 6,5 s y los clicks en los dots no
lo resetean: si el usuario elige un slide justo antes del tick, el carrusel se lo pisa al instante.
Además no hay forma de **pausarlo** (WCAG 2.2.2 pide pausa para contenido auto-rotativo), no se
detiene con `prefers-reduced-motion` y sigue rotando aunque el hero ya no esté en pantalla.
Mínimo: `clearInterval` + reinicio al interactuar, y frenarlo bajo `prefers-reduced-motion`.

---

## 2. Rendimiento — más allá de comprimir imágenes

- **Peso real de la home:** los 3 fondos del hero están apilados en el viewport, así que el
  `loading="lazy"` de los slides 2 y 3 no difiere nada: se bajan `nextar-hero.png` (2,1 MB) +
  `amis-hero.png` (2 MB) + la foto de Cloudinary de entrada, más el logo del header (3,4 MB).
  Solo "above the fold" son **~8 MB**; scrolleando la home completa (6 cards de categoría + foto
  del congreso) se superan los **20 MB**. Esto explica gran parte del jank que describe el
  design-review.
- **Causa probable del bug P1-1 del design-review (transición del carrusel):** los fades son de
  300–420 ms en CSS, pero decodificar PNGs de 2 MB + el `drop-shadow(0 0 34px …)` de
  `.hero-photo-glow` aplicado a una imagen full-viewport + el `scale` de 1200 ms bloquean el main
  thread y estiran visualmente la transición. Optimizar las imágenes del hero probablemente
  resuelva la mitad del síntoma antes de tocar la lógica.
- **Pipeline de imágenes:** todo son `<img>` planos desde `public/`. Astro trae `astro:assets`
  (`<Image />`): moviendo las imágenes a `src/assets/` se obtiene WebP/AVIF, `srcset` responsive y
  dimensiones automáticas sin servicio externo. Es el cambio estructural que evita volver a caer
  en esto con cada foto nueva.
- **Fuentes:** se cargan 3 familias de Google Fonts; **Kurale** existe solo para la línea del
  tagline en el footer (`font-accent`, `Footer.astro:21`). El design-review (#8) ya pide unificar
  esa tipografía — al hacerlo, sacar Kurale del `<link>` en `BaseLayout.astro:51` ahorra una
  familia entera.
- **og:image:** el default es `logo-circular.png` (1920×1909, 428 KB). Para previews de WhatsApp,
  conviene un og dedicado de ~1200×630 y <100 KB (WhatsApp incluso ignora imágenes muy pesadas).

---

## 3. Lista de imágenes sin optimizar (pedido explícito)

Ordenadas por urgencia = peso × exposición. Objetivo general: WebP/AVIF, dimensión máxima cercana
al tamaño de render, <200 KB para fotos grandes.

| Archivo (`public/…`) | Peso | Dimensiones | Dónde se usa | Recomendación |
|---|---|---|---|---|
| `assets/brand/logo-circular-white.png` | **3,4 MB** | 2060×2048 | Header de **todas** las páginas, se muestra a 44–120 px | La más crítica del sitio. Exportar a ~256×256 WebP/PNG (<20 KB) |
| `assets/images/cat-osteosintesis-tornillos.png` | **3,9 MB** | 2380×1785 | Card de categoría, cards de producto, thumb de galería | ~800px de ancho WebP (<120 KB) |
| `assets/images/congreso-traumatologia-2024.JPG` | **2,4 MB** | 6000×3376 | Home (Eventos) y página Eventos | Redimensionar a ~1400px WebP (<180 KB); considerar subirla a Cloudinary como el resto de fotos de evento |
| `assets/images/cat-columna.png` | 2,4 MB | 2362×1771 | Card de categoría, galería | ~800px WebP |
| `assets/images/cat-osteosintesis-placas.png` | 2,3 MB | 2374×1781 | Cards de categoría/producto, galería | ~800px WebP |
| `assets/images/nextar-hero.png` | 2,1 MB | 1699×926 | Fondo slide 1 del hero (eager, `fetchpriority=high`) | WebP calidad ~80 (<250 KB); es LCP de la home |
| `assets/images/amis-hero.png` | 2,0 MB | 1672×941 | Fondo slide 2 del hero + cards de producto | WebP (<250 KB) |
| `assets/images/cat-rodilla.png` | 1,8 MB | 2363×1772 | Cards de categoría/producto, galería | ~800px WebP |
| `assets/images/cat-maxilofacial.png` | 1,7 MB | 2358×1768 | Card de categoría, galería | ~800px WebP |
| `assets/images/cat-cadera.png` | 1,6 MB | 2355×1766 | Cards de categoría/producto, galería, hero de `/catalogos/cadera` | ~800px WebP |
| `assets/images/eventos-hero.jpg` | 0,9 MB | 4989×3326 | **Nadie la usa** (ver §4) | Borrar (o optimizar si se recupera) |
| `assets/images/hero-mobile.JPG` | 0,7 MB | 1329×2364 | **Nadie la usa** (ver §4) | Borrar |
| `assets/images/hero-instrumental.JPG` | 0,7 MB | 1920×1079 | Solo card del producto "Explant" | ~800px WebP (<100 KB); renombrar extensión `.JPG`→`.jpg` de paso |
| `assets/brand/logo-circular.png` | 0,4 MB | 1920×1909 | Footer (40 px), preload, og:image | ~256px para footer + og dedicado 1200×630 |
| `assets/brand/banner-marca.jpg` | 164 KB | 1600×889 | **Nadie la usa** (ver §4) | Borrar |
| `assets/brands/bonss-medical-brand-color.png` | 132 KB | 900×258 | Sección proveedores (home) | ~400px, <30 KB |
| `assets/brands/ross-medical-brand-color.png` | 115 KB | 900×210 | Sección proveedores | ~400px, <30 KB |
| `assets/images/evento.jpg` | 103 KB | 1200×900 | **Nadie la usa** (ver §4) | Borrar |

Las restantes (`hero.jpg`, `quirofano.jpg`, `productos.jpg`, `cat-instrumental-quirurgico.jpg`,
`cat-otros-productos.jpg`, `medacta`, `villalba`) están en 28–76 KB: aceptables, solo entrarían en
una pasada de conversión a WebP si se unifica el pipeline.

Nota: las 80 fotos del congreso ya van por Cloudinary con `f_auto,q_auto` — ese es el modelo a
seguir para el resto.

---

## 4. Código muerto y archivos huérfanos

**Exports de `src/data/site.ts` que nadie importa:**
- `specialtyBadges` (línea 73) — no se renderiza en ninguna página.
- `professionalFlow` (línea 88) — ídem (el smoke test incluso asegura que **no** exista en la home).
- `wa` (línea 49) — irónico: se creó "para evitar strings duplicados", pero todas las páginas
  siguen llamando `whatsappLink()` con los mismos textos inline. Adoptarlo o borrarlo (ver §5).
- `images.heroMobile`, `images.logo`, `images.evento`, `images.bannerMarca` — nunca leídos.
- `GalleryItem.id` — se genera `g1…g91` pero ningún código lo lee.
- `VideoItem.category` admite `"Capacitaciones"`, pero los filtros de `/videos` usan
  `galleryFilters` (que no la incluye): un video de esa categoría jamás podría filtrarse.

**Archivos huérfanos en `public/` (~1,9 MB desplegados al pedo):**
- `assets/images/eventos-hero.jpg` (el hero de eventos ahora es de Cloudinary)
- `assets/images/hero-mobile.JPG`
- `assets/images/evento.jpg`
- `assets/brand/banner-marca.jpg`

Ojo: los cuatro están pinneados por `expectedPublicAssets` en `scripts/smoke.mjs:10-32` — para
borrarlos hay que actualizar esa lista también.

**Clases CSS definidas en `global.css` sin ningún uso en templates:**
`.hero-desktop-bg`, `.hero-desktop-fade`, `.hero-desktop-image`, `.hero-mobile-image`,
`.hero-mobile-bg`, `.hero-carousel-link`, `.btn-outline-light`, `.btn-email-soft`,
`.catalog-info-link`, `.flow-card`, `.flow-card-icon` — restos del hero anterior y del botón de
email eliminado. También la regla `main > div:first-child { padding-top: 7rem }`
(`global.css:116`) es letra muerta: todas las páginas arrancan con `<section>`, nunca con `<div>`.
Ojo de nuevo: `smoke.mjs:367` asserta que `.catalog-info-link:hover` exista en el CSS — limpiar
ambos juntos.

**Íconos definidos y nunca usados** (`src/components/Icon.astro`): `send`, `download`,
`calendar-off`.

**`stand.txt` en la raíz:** es la lista cruda de URLs de Cloudinary que ya vive en
`site.ts:eventGalleryImages`. Es material de trabajo, no del sitio — moverlo a `reference/`
(ya está gitignoreado) o borrarlo.

**Atributo redundante en el header:** `Header.astro` mantiene `data-transparent`,
`data-transparent-header` y `data-home-header`; el CSS solo usa el primero y el tercero.
`data-transparent-header` existe únicamente porque `smoke.mjs:251` lo asserta.

---

## 5. Duplicación / refactors sugeridos

### 5.1 Cinco rutas de producto casi idénticas → una
`src/pages/catalogos/{cadera,rodilla,osteosintesis-placas,osteosintesis-tornillos,otros-productos}/productos/[producto].astro`
difieren solo en el slug, el título y el texto del "volver" (lo verifiqué con diff). Todo eso ya
está en `categories`/`catalogProducts`. Una sola ruta
`src/pages/catalogos/[categoria]/productos/[producto].astro` con `getStaticPaths()` sobre
`catalogProducts` genera las mismas 32 páginas y elimina ~250 líneas repetidas. Además, hoy
agregar una categoría con productos implica acordarse de crear una carpeta nueva.

### 5.2 Mensajes de WhatsApp duplicados
"Hola, quisiera contactarme…", "…coordinar un pedido…", "…contacto institucional…" están escritos
inline en `index.astro` y a la vez definidos en el export `wa` que nadie usa. Elegir uno de los
dos caminos. Sugerencia: expandir `wa` con todos los mensajes del sitio (hay ~14 distintos) y que
los templates solo referencien claves — un solo lugar para corregir redacción.

### 5.3 `smoke.mjs` está sobre-acoplado a la implementación
Es una suite valiosa (rutas, SEO, regresiones de contenido), pero ~la mitad de las aserciones
pinean detalles internos: reglas CSS exactas por regex, conteos exactos de cards (15/17/6/4/3),
atributos `data-*` específicos, existencia de assets huérfanos. Consecuencia práctica: **casi
cualquier limpieza de §4 o refactor de §5 rompe el smoke test sin que nada esté roto de verdad**.
Sugerencia: conservar las aserciones de rutas/SEO/textos de cliente y aflojar las de CSS y conteos
(`>= 1` en vez de `=== 15`, etc.).

---

## 6. Contenido placeholder que ya parece bug en producción

- **`CatalogViewer` es un visor simulado:** los botones anterior/siguiente solo cambian un número
  ("Vista previa de página 3") y el recuadro dice literalmente "contenido de muestra". Para un
  usuario real es un visor roto. Además el campo `pages` (6, 8, 10…) es metadata inventada que se
  muestra como dato ("Páginas: 8"). Mientras no haya PDFs/páginas reales, conviene reemplazar el
  visor por la ficha + CTA de WhatsApp, sin paginación ni conteo.
- **La home promociona `/videos`, que está vacía:** la card "Videos" de la sección "Galería y
  videos" y el banner dentro de `/galeria` llevan a una página cuyo único contenido es "pronto
  publicaremos". Sugerencia: ocultar esos accesos (y los filtros de la página de videos) hasta que
  `videos[]` tenga contenido — la página puede quedar publicada pero sin promoción.
- **Descripción del congreso duplicada** entre `index.astro:323` y `eventos.astro:66` con
  redacciones levemente distintas — unificar en `site.ts` como single source of truth, igual que
  el resto del contenido.

---

## 7. Cosas del design-review que el código ya resuelve (o re-enfoca)

- **#20 (nav duplicada / accesibilidad):** ya está bien resuelto — el menú móvil tiene
  `aria-hidden` + `inert` estáticos y labels distintos ("Principal" / "Principal movil"). Ítem
  cerrable.
- **#2 (logos ilegibles):** el CSS ya aplica el fix sugerido (`grayscale + brightness(0) +
  invert(1)` en `.supplier-logo`). El problema real es el **asset** de Medacta: es solo el isotipo
  (858×699, sin wordmark). Hace falta conseguir la versión logo+texto; no hay fix de CSS posible.
- **#4 (imagen de Nosotros no carga):** en el código la ruta es correcta y `quirofano.jpg` existe
  y pesa 76 KB. No pude reproducir la causa desde el fuente — verificar si el deploy está
  desactualizado o si fue un fallo puntual de red antes de "arreglar" algo acá.
- **#1 (transición del carrusel):** ver §2 — gran parte del síntoma es peso/decodificación de
  imágenes, no solo la lógica de fades. Atacar imágenes primero, después medir.

---

## 8. Detalles menores

- `:root { color-scheme: dark }` (`global.css:4`) con la mayoría del contenido sobre superficies
  claras: scrollbars y controles nativos (resize del textarea de contacto, autofill) salen en
  modo oscuro sobre cards blancas. Evaluar `color-scheme: light` en las secciones claras.
- Títulos de página mezclan separadores: "Catálogos **-** Chaco Implantes" vs "Contacto **—**
  Chaco Implantes". Unificar.
- `Footer.astro:77`: "© 2026" hardcodeado — usar `new Date().getFullYear()` en el frontmatter.
- JSON-LD de Organization (`BaseLayout.astro:53`) sin `url` ni `logo`; se puede tipar como
  `MedicalBusiness`/`LocalBusiness` y sumar `openingHoursSpecification` cuando se confirme el
  horario (design-review #15).
- `sitemap.xml.ts` no incluye las 32 páginas de producto (`/catalogos/*/productos/*`) — agregarlas
  mapeando `catalogProducts` (`product.href` ya trae la ruta).
- `robots.txt.ts`: los `Allow: /catalogos/<slug>` son redundantes (`Allow: /` ya cubre todo).
  Inofensivo, pero es ruido.
- `astro.config.mjs` no define `site`; con `site: "https://chacoimplantes.com.ar"` los helpers de
  Astro (y futuras integraciones de sitemap) quedan alineados con `site.baseUrl`.
- `index.astro:77`: el contenedor de dots tiene `aria-label="Diferenciadores"` sobre un `<div>` sin
  `role` — se ignora; usar `role="group"` (y el label debería describir qué es: "Slides del hero").
- `Icon.astro:55`: un nombre de ícono desconocido cae silenciosamente en `package-check`, lo que
  puede esconder typos — en dev convendría warnear.
- Las 80 fotos del congreso comparten el mismo `alt` textual; es válido, pero para lectores de
  pantalla la galería es indistinguible. Bajo costo: sufijos "— foto N" solo en `aria-label` del
  botón (el smoke test hoy prohíbe placeholders numerados en el alt, tenerlo en cuenta).
