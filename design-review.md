# Design review — chaco-implantes.vercel.app

Revisión de diseño hecha sobre el sitio deployado (desktop 1440px, 2026-07-21).
Tareas ordenadas por prioridad. Verificar cada fix visualmente antes de dar por cerrado.

## P1 — Bugs visibles

### 1. Carrusel del hero: transición rota
**Síntoma:** durante el crossfade los textos de dos slides quedan superpuestos e ilegibles varios segundos (badges y CTAs duplicados uno sobre otro). También se capturó un estado intermedio con el hero gris/vacío y una franja blanca a la derecha.
**Fix:**
- Fade corto (300–500 ms). El slide saliente debe terminar en `visibility: hidden` y tener `pointer-events: none` durante toda la transición (que no queden CTAs invisibles clickeables).
- Revisar que ningún estado intermedio deje ver el fondo de la página.
- Alternativa recomendada: eliminar el carrusel y dejar hero fijo con el slide de NextAR (el más fuerte visualmente); "Cadera AMIS" y "Actividad profesional" pasan a secciones propias más abajo.

### 2. Logos de proveedores ilegibles (sección "Proveedores y sistemas")
**Síntoma:** Medacta se ve como un glifo blanco sin nombre (irreconocible); Villalba es un triángulo oscuro casi invisible sobre card oscura. Solo BONSS y RosMedical se leen.
**Fix:** usar versiones monocromas BLANCAS completas (isotipo + wordmark) para los 4 logos, con opacidad pareja (~0.8) sobre las cards oscuras. Si no hay versión blanca de un logo, aplicar `filter: brightness(0) invert(1)` sobre la versión oscura.

### 3. Slide "Cadera · AMIS": imagen invisible
**Síntoma:** el overlay oscurece tanto la foto que la mitad derecha del hero queda negra/vacía.
**Fix:** bajar la opacidad del overlay (o usar gradiente lateral: oscuro sobre el texto, transparente sobre la foto) hasta que la imagen se perciba. Verificar contraste del texto (WCAG AA) después del cambio.

### 4. Nosotros: imagen del hero no carga
**Síntoma:** el panel derecho del hero es una caja vacía con caption ("Coordinación comercial, disponibilidad e instrumental...").
**Fix:** cargar/corregir la ruta de esa imagen. Buena candidata: la foto del stand del congreso (ya existe en Eventos).

## P2 — Catálogo

### 5. Imágenes del catálogo de Cadera inconsistentes
Tres problemas conviven en `/catalogos/cadera`:
- Cards sin imagen (queda el placeholder degradé): Cotilo doble, Charnley-Müller, Thompson, Judett Plus, Cadera XL, Explant, Giliberty, Refuerzo acetabular.
- La MISMA foto genérica de quirófano repetida en productos distintos: Endoprótesis modular, Cadera no cementada Hip-Lock y Tallo SP.
- "Tallo delta" muestra placas y tornillos, no un tallo → verificar correspondencia producto–imagen en todos los catálogos.
**Criterio:** cada producto con foto/render real del implante. Si no hay foto, mejor un placeholder honesto y consistente (ícono de la categoría) que una foto genérica repetida.

### 6. Lazy-load brusco
**Síntoma:** al scrollear, las cards aparecen vacías y las imágenes "explotan" tarde.
**Fix:** `loading="eager"` + `fetchpriority="high"` en imágenes above-the-fold (hero, primeras cards); `width`/`height` explícitos en todas las `<img>` para evitar saltos de layout; comprimir los PNG del hero y unificar pipeline de imágenes (WebP/AVIF — hoy hay mezcla de .png pesados, un .JPG sin optimizar y solo una imagen por Cloudinary).

## P3 — Sistema visual y contenido

7. **Tagline repetida:** "Calidad que se siente. Confianza que se nota." aparece en los 3 slides del hero y otra vez en Nosotros. Dejarla UNA sola vez (fuera del carrusel).
8. **Footer, texto "Productos para traumatología":** está en serif itálica, desentona con todo el sistema tipográfico. Unificar con la sans del sitio.
9. **Header sticky:** al scrollear hay un flash con fondo blanco y logo/nav ilegibles (transición del estado scrolled). Revisar la transición de background.
10. **Exceso de CTAs idénticos de WhatsApp** (hero ×3, secciones, footer): dejar un primario por sección; el resto como link secundario.
11. **Home muy larga:** "Consultas comerciales", "Coordinación para instituciones" y el bloque de contacto se pisan → fusionar en un solo bloque de contacto.
12. **Eventos en la home:** el último es de noviembre 2024 y el aviso "Próximamente publicaremos nuevas fechas" envejece mal. Sacar la sección de la home o reformular sin fecha protagonista.
13. **Diferenciales genéricos** ("asesoramiento personalizado", "atención humana"): concretarlos (stock en Resistencia, tiempos de entrega, acompañamiento en quirófano, cobertura NEA).

## P4 — Detalles de texto y datos

14. Falta "¿" de apertura en "No encontrás la línea que buscás?" (página Catálogos). Revisar todo el sitio por preguntas sin signo de apertura.
15. Horario en Contacto dice "12:30 a 16:30 h" y "16:30 a 20:30 h" (rango corrido, sospechoso). Confirmar con el cliente si es 8:30–12:30 y 16:30–20:30.
16. Cards de catálogo: el nombre de categoría aparece duplicado en el markup ("Cadera Artroplastia Cadera"). Verificar que no sea texto visible duplicado; si es para screen readers, usar `aria-label` o `sr-only` correctamente.
17. "+ otras líneas" es vago → cuantificar o listar.
18. Email `chacoimplantes@gmail.com`: sugerir al cliente migrar a `info@chacoimplantes.com.ar` (el dominio ya existe).
19. Verificar handle de Instagram `@chacoimplanteok` (¿falta una "s"?).
20. Nav duplicada en el HTML (desktop + mobile): confirmar que la versión oculta tenga `aria-hidden` / `inert` para no duplicar landmarks de accesibilidad.

## Pendiente de revisar
- Vista mobile real (no se pudo emular en esta revisión): hero, menú hamburguesa, grillas de cards y footer en ≤400px.
- Páginas Galería y Eventos en detalle.
