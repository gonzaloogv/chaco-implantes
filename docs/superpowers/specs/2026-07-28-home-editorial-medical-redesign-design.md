# Rediseño editorial médico de la home

**Fecha:** 2026-07-28

**Estado:** aprobado para revisión escrita

**Dirección elegida:** editorial médico modular, con claridad de catálogo

**Alcance:** home, integración visual del header y reorganización visual del footer

**Reemplaza:** `2026-07-28-home-frontend-redesign-design.md`

## Objetivo

Reconstruir la home de Chaco Implantes para que se perciba como una marca médico-tecnológica confiable, especializada y contemporánea. La página debe abandonar la sucesión de bandas y grillas equivalentes para adoptar una composición editorial: bloques con jerarquías distintas, imágenes protagonistas, acceso claro a productos y una cadencia visual más natural.

El rediseño conservará todo el contenido real, las rutas, los enlaces, el comportamiento del hero y la contracción del header por scroll. El footer conservará su contenido, pero podrá reorganizarse para ser más compacto y legible.

## Principios de diseño

1. **Jerarquía antes que simetría.** Las secciones no tendrán la misma altura ni el mismo peso visual.
2. **Cards sólo cuando representan objetos navegables.** Productos, multimedia y contenido editorial secundario pueden usar cards. Proveedores, estadísticas, proceso y CTA no deben convertirse automáticamente en cards.
3. **Ritmo compartido, composiciones distintas.** La unidad provendrá de la grilla, los gutters, la escala tipográfica, los radios, los bordes y el tratamiento de imagen.
4. **Producto y actividad reales.** Las imágenes conservarán color y textura natural. No se aplicará un filtro azul uniforme a todo el material.
5. **Confianza verificable.** No se publicarán cifras inventadas ni afirmaciones que no estén respaldadas por el contenido actual.
6. **Movimiento funcional.** La animación debe explicar estado o jerarquía, no decorar cada bloque.
7. **Claridad regional.** El sitio debe verse más cuidado que los distribuidores locales de referencia, sin imitar la escala corporativa de un fabricante multinacional.

## Referencias y traducción al proyecto

El criterio combina aprendizajes de varios referentes:

- Nobel Biocare: alternancia de historias grandes de producto y módulos secundarios.
- Straumann: potencia del hero y acceso visible a las familias de soluciones.
- OSSIS: propuesta breve, técnica y respaldada por argumentos claros.
- Stryker Orthopaedics: taxonomía clínica comprensible para una cartera amplia.
- Medacta: segmentación por necesidad, sin replicar su navegación ni sus cards equivalentes.

No se copiarán layouts, textos, imágenes ni recursos de terceros. Las referencias definen ritmo, jerarquía y función de los módulos.

## Contenido y comportamiento que se conservan

- Los tres slides actuales del hero.
- Títulos, descripciones, imágenes, llamadas a la acción y destinos del hero.
- El comportamiento expandido del header al inicio de la home.
- La contracción progresiva del header durante el scroll.
- Los cuatro diferenciales actuales.
- Las seis categorías destacadas y sus rutas.
- Los cuatro proveedores y el acceso a otras líneas.
- Los cuatro pasos del acompañamiento comercial.
- El congreso destacado existente.
- Los accesos condicionales a galería y videos.
- El CTA comercial y sus enlaces.
- Los textos, categorías, enlaces y datos de contacto del footer.
- El render estático desde `src/data/site.ts`.

El contenido podrá recibir ajustes editoriales menores de longitud o puntuación sólo cuando sean necesarios para la composición. No se cambiará su significado ni se añadirán datos comerciales no confirmados.

## Arquitectura de la página

### 1. Header y hero

El header seguirá siendo transparente y amplio al iniciar la home, y compacto sobre una superficie legible después del scroll. La lógica de `header-shrink.mjs` no se modificará salvo que una prueba revele un defecto funcional.

El hero conservará:

- `min-height: 100svh`, con fallback compatible y crecimiento intrínseco.
- Los tres fondos y el crossfade actual.
- Controles de selección y pausa.
- CTA principal y acceso a WhatsApp.
- Pausa por interacción y respeto por `prefers-reduced-motion`.

La intervención será visual:

- Mejorar el recorte focal de las imágenes por breakpoint.
- Reducir el peso del overlay azul y recuperar matices de la fotografía.
- Mantener un único bloque de texto alineado a la izquierda.
- Limitar el ancho del título y el párrafo para evitar líneas excesivamente largas.
- Simplificar el eyebrow y los controles para que no compitan con el mensaje.
- Evitar efectos luminosos intensos alrededor de logo, botones o indicadores.

### 2. Franja de confianza

Después del hero habrá una franja compacta de transición con los cuatro diferenciales actuales.

No será una banda azul alta ni una fila de cards. Será una superficie sólida blanco cálido, contenida por la grilla principal y superpuesta aproximadamente `2rem` sobre el borde inferior del hero en desktop. Cada diferencial tendrá icono, etiqueta y separación tipográfica, sin caja individual.

Su función es:

- Traducir la promesa del hero en pruebas rápidas.
- Introducir la superficie clara del resto de la página.
- Crear una primera pausa corta antes del catálogo.

En móvil se mostrará en dos columnas. No habrá carrusel horizontal.

### 3. Productos

Productos será el núcleo de la home y la sección de mayor desarrollo después del hero.

Las seis categorías se mostrarán en una composición editorial asimétrica:

- La primera categoría de la lista actual funcionará como pieza destacada.
- Tendrá mayor superficie de imagen, título, breve descripción y acceso visible.
- Las cinco categorías restantes usarán módulos compactos con imagen, título y señal de navegación.
- La jerarquía será puramente visual. Todas las categorías mantendrán igual accesibilidad y el mismo destino actual.

En desktop se usará una grilla de doce columnas. La pieza destacada ocupará aproximadamente la mitad de la composición y los módulos secundarios completarán una matriz equilibrada. En tablet se reducirá la asimetría. En móvil todas las categorías se apilarán en una sola columna con una diferencia de altura moderada para la primera.

El acceso a todos los catálogos permanecerá visible en el encabezado o cierre de la sección.

### 4. Proveedores

Los proveedores se presentarán como un ecosistema de marcas y sistemas, no como cuatro cards comerciales.

La sección tendrá:

- Una introducción editorial corta.
- Una línea o grilla de logos sin cajas pesadas.
- Cajas ópticas consistentes para compensar las distintas proporciones de marca.
- Nombre, especialidad o descriptor existente cuando corresponda.
- Enlaces externos con estados hover y focus claros.
- El acceso a otras líneas como enlace secundario real, nunca con apariencia deshabilitada.

En desktop el texto ocupará cuatro columnas y los logos las ocho restantes. En móvil los logos se organizarán en dos columnas y pasarán a una columna sólo si su legibilidad lo exige.

### 5. Acompañamiento profesional

Los cuatro pasos actuales se integrarán en una sección dividida:

- Un panel fotográfico relacionado con instrumental, quirófano o actividad profesional.
- Un bloque de contenido con los cuatro pasos numerados.

La numeración y una línea de continuidad comunicarán secuencia. No se usarán cuatro cards independientes. El bloque debe explicar el servicio humano y operativo que acompaña a los productos.

En desktop la imagen y el proceso compartirán una composición de aproximadamente cinco y siete columnas. En móvil la imagen aparecerá primero y los pasos después, respetando el orden de lectura.

### 6. Congreso destacado

El evento se mostrará como una historia editorial única:

- Fotografía amplia.
- Fecha y ubicación como metadatos secundarios.
- Título y descripción como foco.
- Acceso a consulta y a la página de eventos.

No se simulará una grilla de noticias cuando existe un solo evento destacado. En desktop la imagen ocupará aproximadamente ocho columnas y el panel sólido de contenido se superpondrá sobre su lateral derecho, sin ocultar el punto focal. En móvil no habrá superposición: imagen y contenido se apilarán.

### 7. Multimedia

Multimedia tendrá dos módulos grandes:

- Galería como pieza principal.
- Videos como pieza complementaria cuando existan videos publicados.

La relación desktop será asimétrica, cercana a siete y cinco columnas. Ambos módulos compartirán tratamiento de imagen, borde y jerarquía, pero no necesitarán la misma altura exacta.

Si no existen videos, la galería ocupará todo el ancho sin dejar espacio vacío. En móvil se mostrará una columna.

### 8. CTA final

El CTA será una única composición breve y contenida. No repetirá la geometría de la franja de confianza ni del proceso.

Debe incluir:

- Un encabezado corto.
- Una línea de apoyo.
- WhatsApp como acción primaria.
- Catálogos como acción secundaria.

Usará el navy institucional con contraste alto. Tendrá margen propio y no se solapará con el footer. En móvil los botones ocuparán el ancho disponible sin quedar cubiertos por otros elementos.

### 9. Footer

Se conservará todo el contenido real del footer:

- Identidad y actividad.
- Categorías.
- Secciones.
- Teléfono.
- Dirección.
- Instagram.
- Línea legal.

La composición se reorganizará para reducir altura:

- Desktop: identidad amplia y tres grupos secundarios dentro de una grilla de doce columnas.
- Tablet: dos columnas.
- Móvil: identidad y contacto a ancho completo, categorías y secciones en dos columnas cuando el ancho lo permita.

No se añadirán acordeones ni dependencias. La jerarquía se resolverá con layout, espaciado y tipografía.

## Sistema visual

### Personalidad

- Médico-tecnológica.
- Precisa y confiable.
- Editorial, no publicitaria.
- Contemporánea sin parecer experimental.
- Cercana a profesionales e instituciones.

### Parámetros de dirección

- Variación visual: `7/10`.
- Intensidad de movimiento: `4/10`.
- Densidad de información: `3/10`.

### Paleta

La página será predominantemente clara:

- Navy institucional para header compacto, tipografía principal y footer.
- Blanco cálido o gris frío muy claro como superficie principal.
- Azul pálido para alternar bloques sin cortes bruscos.
- Azul saturado sólo para acciones, estados y pequeños acentos.
- Tonos naturales en fotografía y logos.

No habrá gradientes animados. Se admite un gradiente estático y discreto en el hero cuando sea necesario para el contraste del texto.

### Tipografía

Se conservarán Montserrat para display y Poppins para cuerpo. La mejora vendrá de su uso:

- Títulos grandes con menos peso visual y mejor longitud de línea.
- Jerarquía clara entre eyebrow, título, descripción y metadatos.
- Párrafos entre 48 y 68 caracteres por línea en desktop.
- `text-wrap: balance` en títulos y `text-wrap: pretty` en textos cuando sea compatible.
- Menos mayúsculas sostenidas.
- Menos etiquetas dentro de pills.

### Grilla y espaciado

- Contenedor máximo cercano a `80rem`.
- Grilla conceptual de doce columnas en desktop.
- Gutters fluidos mediante `clamp()`.
- Separación vertical amplia, pero no idéntica, según la importancia de cada sección.
- Espaciado desktop aproximado entre `6.5rem` y `9rem`.
- Espaciado tablet entre `4.5rem` y `6rem`.
- Espaciado móvil entre `3.5rem` y `4.5rem`.

Sólo el hero tendrá una altura mínima ligada al viewport. Las demás secciones usarán altura intrínseca. Se permitirá `min-height` cuando ayude al equilibrio de una composición dividida, pero no para igualar artificialmente bloques distintos.

### Bordes, radios y sombras

- Un radio principal moderado entre `0.75rem` y `1rem`.
- Botones con radio menor que las superficies editoriales.
- Bordes fríos y sutiles para separar superficies claras.
- Sombras escasas y de baja opacidad.
- Sin glow persistente en cards, iconos o botones.

## Familias de módulos

El rediseño limitará la interfaz a tres familias:

1. **Módulo de categoría:** imagen, título y navegación.
2. **Panel editorial:** imagen más contenido para proceso, evento o multimedia.
3. **Superficie de acción:** CTA breve con una acción primaria y una secundaria.

Los proveedores y diferenciales serán elementos tipográficos dentro de una grilla, no una cuarta familia de cards.

## Movimiento e interacción

- Conservar la contracción del header.
- Conservar el crossfade y autoplay controlado del hero.
- Hover de imagen con escala máxima cercana a `1.02`.
- Desplazamiento de flecha o subrayado de hasta `4px`.
- Elevación máxima de `2px` sólo en módulos navegables.
- Transiciones entre `180ms` y `260ms`.
- Sin animaciones de entrada masivas durante el scroll.
- Sin parallax, smooth-scroll externo ni nuevas librerías.
- Foco visible y equivalente visual al hover.
- `prefers-reduced-motion` elimina escalas y desplazamientos no esenciales.

## Responsive

### Desktop

- Asimetría plena en productos, proceso, evento y multimedia.
- Uso de doce columnas.
- Header expandido con navegación completa.

### Tablet

- Asimetría reducida.
- Productos en una combinación de pieza destacada y grilla de dos columnas.
- Proceso y evento pueden conservar dos columnas mientras el contenido no se comprima.

### Móvil

- Una columna principal.
- Orden semántico igual al orden visual.
- Franja de confianza y proveedores en dos columnas sólo cuando sean legibles.
- Títulos limitados para evitar encabezados de cuatro líneas.
- Botones principales a ancho completo cuando sea necesario.
- Sin overflow horizontal a `320px`.
- Ninguna imagen con altura fija que recorte contenido esencial.

## Arquitectura técnica

### Datos

`src/data/site.ts` seguirá siendo la fuente única de los datos de la home. No se agregan APIs, solicitudes de red ni estados de carga.

### Marcado

`src/pages/index.astro` seguirá componiendo la página. No se extraerán componentes nuevos si sólo encapsulan unas pocas líneas sin reutilización. Se podrá ampliar `CatalogCard` con una variante explícita si esto evita duplicación real y no afecta páginas internas.

Los landmarks, niveles de encabezado y listas semánticas deberán reflejar la estructura visual.

### CSS

`src/styles/home.css` se reescribirá como hoja exclusiva de la home en lugar de sumar una nueva capa sobre el diseño anterior.

La implementación deberá:

- Conservar en `global.css` sólo tokens y componentes realmente compartidos.
- Buscar referencias en todo `src` antes de borrar selectores.
- Eliminar reglas del ritmo palindrómico, bandas idénticas y grillas reemplazadas.
- Evitar selectores excesivamente específicos.
- Preferir clases semánticas de la home sobre cadenas largas de utilidades para composiciones complejas.
- Mantener UTF-8 en todos los archivos.

No se agregarán dependencias ni se modificará la arquitectura de Astro.

## Accesibilidad

- Contraste WCAG AA para texto normal y controles.
- Controles del hero accesibles por teclado.
- Foco visible en enlaces, botones, logos y cards.
- Orden de lectura coherente.
- Texto alternativo significativo para imágenes.
- Enlaces externos identificables por su contexto o etiqueta accesible.
- Áreas táctiles de al menos `44px` cuando corresponda.
- Funcionamiento legible con JavaScript desactivado.
- Sin recortes al `200%` de zoom.
- Soporte completo para movimiento reducido.

## Verificación

### Automatizada

- `npm run test:home`
- `npm run test:header`
- `npm run check`
- `npm run build`
- `npm run test:smoke`
- `npm run verify:home-layout`

Los tests acoplados a las bandas idénticas o al ritmo anterior deberán reemplazarse por verificaciones funcionales y geométricas del nuevo layout.

### Visual

Revisión con navegador real en:

- Desktop de `1440px`.
- Laptop de `1280px`.
- Tablet cercana a `768px`.
- Móvil de `390px`.
- Móvil mínimo de `320px`.

La revisión debe cubrir:

- Header expandido, en transición y compacto.
- Los tres slides del hero.
- Jerarquía de las seis categorías.
- Legibilidad óptica de logos.
- Secuencia del proceso.
- Evento y multimedia con y sin videos.
- Separación real entre CTA y footer.
- Hover, focus y movimiento reducido.
- Ausencia de overflow, solapamientos y contenido recortado.

## Criterios de aceptación

1. La home conserva todos sus datos, rutas y enlaces actuales.
2. El hero y el header conservan su comportamiento funcional.
3. La página ya no depende de tres bandas azules idénticas.
4. Productos usa una jerarquía editorial y conserva las seis categorías.
5. Proveedores se presenta sin cards pesadas y mantiene todos sus enlaces.
6. Los cuatro pasos aparecen como una secuencia, no como cuatro cards.
7. Congreso se muestra como una historia única.
8. Multimedia mantiene dos módulos grandes y responde correctamente cuando no hay videos.
9. El CTA no se solapa con el footer en ningún breakpoint.
10. El footer conserva todo su contenido real y reduce su altura visual.
11. No se publican métricas o afirmaciones inventadas.
12. No se agregan dependencias.
13. No se alteran páginas internas fuera de los estilos compartidos estrictamente necesarios.
14. Se elimina el CSS obsoleto de la home después de verificar referencias.
15. Las verificaciones automatizadas y visuales terminan correctamente.

## Riesgos y mitigaciones

- **La asimetría puede sentirse arbitraria:** sostenerla con una grilla de doce columnas y relaciones repetibles.
- **La categoría destacada puede parecer más importante comercialmente:** documentar que la jerarquía sigue el orden actual y es sólo editorial.
- **Los logos tienen proporciones incompatibles:** normalizar cajas ópticas sin deformar ni recolorear marcas.
- **El evento actual puede quedar desactualizado:** conservar el dato real, reducir el protagonismo de la fecha y no inventar eventos.
- **Las imágenes disponibles pueden no soportar recortes grandes:** validar resolución y punto focal antes de cerrar cada composición.
- **La limpieza puede afectar páginas internas:** buscar cada selector y token antes de eliminarlo, y verificar rutas secundarias con smoke tests.
- **Los tests actuales fijan el diseño anterior:** reemplazar sólo aserciones visuales obsoletas y conservar pruebas de contenido, rutas y comportamiento.
