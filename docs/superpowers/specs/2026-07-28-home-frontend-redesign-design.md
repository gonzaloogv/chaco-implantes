# Rediseño estructural de la home

**Fecha:** 2026-07-28

**Estado:** aprobado para planificación

**Alcance:** home, header, footer y estilos compartidos estrictamente necesarios

## Objetivo

Rediseñar la home de Chaco Implantes para que se perciba sobria, tecnológica y coherente, sin los cortes de saturación actuales. Se conservarán los datos, enlaces y comportamientos existentes. El cambio principal será estructural: orden visual, alturas mínimas, grillas, paddings, superficies, jerarquía tipográfica y limpieza del CSS asociado.

La referencia visual se traducirá como un ritmo palindrómico flexible:

`navy → azul → claro → claro → azul → claro → claro → azul → navy`

La simetría será estricta en las tres bandas azules y flexible en las secciones claras.

## Alcance

### Incluido

- Home completa.
- Header compartido, sin modificar su lógica de contracción por scroll.
- Footer compartido.
- Organización y limpieza de los estilos exclusivos de la home.
- Incorporación de una banda de proceso con palabras verificables.
- Ajustes de responsive, accesibilidad y movimiento reducido.
- Actualización de pruebas que hoy fijan decisiones visuales obsoletas.

### Fuera de alcance

- Rediseño estructural de Catálogos, Galería, Videos, Eventos, Nosotros o Contacto.
- Cambios de rutas, APIs, integración con Cloudinary o lógica de negocio.
- Nuevas dependencias o migración de Astro, Tailwind o TypeScript.
- Publicación de estadísticas numéricas no verificadas.
- Reescritura general de `global.css` o eliminación de reglas usadas por páginas internas.

## Contenido que se conserva

- Los tres slides actuales del hero.
- Los cuatro diferenciales.
- Las seis categorías destacadas y sus datos.
- Los cuatro proveedores y el acceso a otras líneas.
- El evento destacado existente.
- Los accesos condicionales a galería y videos.
- El CTA comercial, sus enlaces y los datos institucionales.
- El contenido y los enlaces actuales del footer.

No se incorporarán las cifras ilustrativas de la maqueta de referencia. La nueva banda central mostrará:

1. Consulta técnica.
2. Disponibilidad.
3. Coordinación.
4. Acompañamiento.

## Arquitectura visual

### Orden de la página

1. Hero con navbar expandida.
2. Banda azul de diferenciales.
3. Productos.
4. Proveedores.
5. Banda azul de proceso.
6. Congreso destacado.
7. Multimedia.
8. Banda azul de CTA.
9. Footer.

### Nivel 1: hero y footer

El hero conservará `min-height: 100dvh` para sostener la entrada institucional y el recorrido de contracción del header. El contenido podrá crecer si el viewport, el zoom o el texto lo requieren.

El footer tendrá altura intrínseca y una presencia navy equivalente como cierre, sin forzar que mida lo mismo que el hero. La primera banda azul se superpondrá parcialmente al final del hero y la última al inicio del footer, reproduciendo la simetría conceptual de la referencia.

### Nivel 2: tres bandas azules idénticas

Las bandas de diferenciales, proceso y CTA usarán una única clase estructural y los mismos tokens por breakpoint:

| Propiedad | Desktop | Tablet y móvil |
| --- | --- | --- |
| Ancho | `min(100% - 3rem, 80rem)` | `min(100% - 2rem, 80rem)` |
| Altura base | `min-height: 7.5rem` | `min-height: 11rem` |
| Padding | `1.25rem 1.5rem` | `1rem 1.25rem` |
| Radio | `1rem` | `0.875rem` |
| Grilla | cuatro columnas | dos columnas |

Se usará `min-height`, no `height`, para evitar recortes con zoom, cambios de fuente o contenido más largo. Las tres bandas deberán resultar iguales en condiciones normales dentro de cada breakpoint; si una necesidad de accesibilidad obliga a crecer, el contenido tendrá prioridad.

Las únicas diferencias permitidas serán:

- El contenido interno.
- El solape de la primera banda con el hero.
- El solape de la última banda con el footer.

Color, ancho, padding, radio, sombra y altura base serán idénticos.

### Nivel 0: superficie clara continua

Productos, proveedores, congreso y multimedia compartirán:

- Un mismo sistema de gutters y contenedor máximo.
- Una altura mínima común en desktop.
- Paddings verticales derivados de una única escala.
- Fondo `#f6f9fd` o su variación fría `#eef5fc`.
- Títulos, eyebrows y descripciones con la misma jerarquía.
- Separaciones suaves dentro de la misma familia cromática.

La altura se implementará como `min-height`, no como altura fija. Cada sección podrá crecer según su contenido. Todas partirán de la misma base por breakpoint:

| Breakpoint | Altura mínima de las secciones claras |
| --- | --- |
| Desktop, desde `64rem` | `36rem` |
| Tablet, desde `40rem` hasta `63.999rem` | `32rem` |
| Móvil, menos de `40rem` | `30rem` |

## Composición de las secciones claras

### Productos

- Se conservan las seis categorías actuales.
- Se reutiliza `CatalogCard`.
- Grilla de tres columnas en desktop, dos en tablet y una en móvil.
- Las imágenes y títulos mantendrán prioridad sobre decoración o efectos.

### Proveedores

- Se conservan los cuatro proveedores actuales.
- Cuatro columnas en desktop y reducción progresiva a dos y una.
- Logos legibles, con peso óptico parejo y sin forzar una apariencia monocroma si perjudica su marca.
- El acceso a otras líneas se mantiene como acción secundaria.

### Congreso

- Se conserva el único evento actual.
- Se muestra como una historia destacada de imagen y contenido, no como una grilla ficticia.
- La fecha seguirá visible, pero no dominará la jerarquía.

### Multimedia

- Dos cards grandes: galería y videos.
- Una columna en móvil.
- Si no existen videos publicados, la galería ocupará el ancho disponible sin dejar un hueco.

## Paleta y superficies

La home y los elementos compartidos en alcance usarán una familia cromática reducida:

| Token conceptual | Valor |
| --- | --- |
| Navy institucional | `#10294c` |
| Azul principal | `#1a6fd4` |
| Azul fuerte | `#1552a3` |
| Superficie clara | `#f6f9fd` |
| Superficie fría | `#eef5fc` |
| Superficie interna | `#f0f6fd` |
| Borde | `#dce8f7` |
| Texto principal | `#10294c` |
| Texto secundario | `#4a6485` |
| Texto sobre navy | `#bfd6f4` |

Se introducirán tokens canónicos nuevos para este sistema. No se remapearán de forma indiscriminada los alias usados por páginas internas; esto evita un rediseño accidental fuera de alcance.

Los fondos de las bandas serán esencialmente estáticos. Se permite un radial muy sutil para profundidad, pero no gradientes de color animados ni cambios cromáticos durante el scroll.

## Tipografía

Se conservan Montserrat para display y Poppins para cuerpo. La fuente no es la causa principal del problema actual y cambiarla añadiría alcance sin resolver la fragmentación cromática.

Se ajustarán:

- Escala de títulos.
- Tracking negativo moderado en encabezados grandes.
- Line-height más compacto en display y más cómodo en cuerpo.
- Ancho máximo de párrafos.
- `text-wrap: balance` o `pretty` donde corresponda.
- Pesos 500 y 600 para jerarquías intermedias.

## Movimiento e interacción

### Navbar

La lógica de `header-shrink.mjs` no cambiará:

- Expandida al inicio de la home.
- Interpolación durante los primeros 140 px.
- Estado compacto al continuar el scroll.
- Estado compacto permanente en páginas internas.
- Snap accesible cuando el usuario prefiere movimiento reducido.
- Actualización limitada por `requestAnimationFrame`.

Solo se ajustarán colores o superficies necesarios para integrarla con el nuevo hero.

### Hero

- Se conserva el carrusel y sus tres slides.
- Crossfade corto y controlado.
- Escala muy leve de la imagen.
- Sin movimiento de gradientes ni superposición interactiva de slides ocultos.
- Se mantienen pausa, controles, visibilidad y soporte para movimiento reducido.

### Cards y acciones

- Hover de hasta `translateY(-2px)`.
- Estado activo con reducción de escala sutil.
- Transiciones de 180 a 240 ms.
- Foco visible para teclado.
- Ningún contenido o acción dependerá de la animación.
- No se añadirán librerías de smooth scroll, parallax o animación.

## Organización de CSS

Se creará `src/styles/home.css`, importado únicamente por la home, para alojar:

- Hero y carrusel.
- Tres bandas azules.
- Secciones claras y sus grillas.
- Proveedores, congreso y multimedia de la home.
- Responsive y movimiento reducido exclusivos de esta página.

`src/styles/global.css` conservará:

- Tokens compartidos.
- Reset y estilos base.
- Header, footer y botones.
- Componentes y estados usados por páginas internas.

La separación busca reducir mezcla de responsabilidades, no crear un nuevo sistema de estilos.

## Limpieza de CSS

La auditoría no detectó un conjunto grande de clases semánticas completamente muertas: las reglas actuales tienen uso en alguna ruta. Por eso la limpieza será conservadora y verificable.

Se eliminarán:

- Reglas antiguas de la home sustituidas por `home.css`.
- Tokens confirmados sin consumidores.
- Duplicación de `min-height` del hero.
- Hovers que repiten exactamente el estado base.
- Colores literales repetidos dentro del alcance cuando exista un token equivalente.
- Comentarios y selectores que ya no describan la implementación.

No se eliminará una regla solo porque la home no la use. Antes de borrar se comprobarán sus referencias en todo `src`.

## Accesibilidad y responsive

- Landmarks y encabezados semánticos.
- Contraste WCAG AA para texto normal.
- Foco visible y áreas táctiles suficientes.
- Sin overflow horizontal a 320 px.
- Sin recortes al 200 % de zoom.
- Orden de lectura coherente con el orden visual.
- `prefers-reduced-motion` respetado en header, hero y microinteracciones.
- Imágenes significativas con texto alternativo actual.
- Bandas iguales por breakpoint sin sacrificar contenido accesible.

## Datos y estados

El render continúa siendo estático desde `src/data/site.ts`. No se agregan solicitudes, estados de carga ni manejo de errores de red.

Los únicos estados condicionales relevantes permanecen:

- Videos presentes: se muestran galería y videos.
- Videos ausentes: la galería usa todo el ancho.
- JavaScript desactivado: el primer slide y el header deben seguir siendo legibles.

## Verificación

### Automatizada

- Tests de `header-shrink.mjs`.
- `npm run check`.
- `npm run build`.
- `npm run test:smoke`.
- `npm run test:video-player`.
- Tests de Cloudinary cuando el cambio alcance el manifiesto o sus componentes.

Los smoke tests se actualizarán solo donde hoy fijan CSS obsoleto. Se conservarán sus controles de contenido, rutas, SEO y ausencia de trazas no deseadas.

### Visual

Se revisará con navegador real:

- Desktop de 1440 px.
- Tablet.
- Móvil de 390 px y mínimo de 320 px.
- Navbar expandida y compacta.
- Igualdad geométrica de las tres bandas en cada breakpoint.
- Solapes hero/features y CTA/footer.
- Ausencia de overflow y contenido recortado.
- Hero durante transiciones y con movimiento reducido.
- Estados hover, active y focus.

## Criterios de aceptación

1. La home mantiene todos sus datos y enlaces actuales.
2. La secuencia cromática coincide con el ritmo aprobado.
3. Las tres bandas azules comparten geometría real en cada breakpoint.
4. Los bloques claros usan grillas acordes a su contenido.
5. La navbar conserva su comportamiento actual y sus tests.
6. No se publican estadísticas numéricas inventadas.
7. No se introduce ninguna dependencia.
8. Las reglas obsoletas de la home no permanecen duplicadas en `global.css`.
9. Las páginas internas conservan su estructura y funcionalidad.
10. Typecheck, build, pruebas relevantes y revisión visual terminan correctamente.

## Riesgos y mitigaciones

- **Tests acoplados al CSS anterior:** actualizar solo las aserciones visuales obsoletas y preservar las funcionales.
- **Cambios compartidos que afecten páginas internas:** usar tokens nuevos y limitar la remoción de CSS mediante búsqueda global.
- **Bandas iguales con contenido desigual:** controlar la longitud, usar una grilla común y permitir crecimiento ante zoom o accesibilidad.
- **Evento antiguo en la home:** conservar el dato existente sin convertir la fecha en el foco visual.
- **Logos con proporciones distintas:** normalizar su caja y tamaño óptico, no deformar las imágenes.
