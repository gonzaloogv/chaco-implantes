# Diseño de cards de proveedores: cristal técnico

## Objetivo

Dar mayor jerarquía a las marcas dentro de la sección azul de proveedores sin
convertirla en una grilla blanca ni competir con el contenido principal.

## Dirección aprobada

- Mantener el fondo eléctrico `#1a6fd4`.
- Reemplazar los divisores planos por cuatro cards translúcidas con borde fino,
  radio contenido y profundidad interna sutil.
- Conservar el cambio a fondo nieve y logo en color original durante hover.
- Añadir una señal discreta de enlace a cada card.
- Mantener dos columnas en tablet y mobile normal; pasar a una columna sólo en
  pantallas muy angostas.

## Normalización de logos

Los logos no se igualarán por ancho matemático sino por peso óptico. Todas las
cards compartirán un área de logo de la misma altura y cada variante existente
(`mark`, `wide`, `tall`, `ross`) tendrá límites y una escala explícitos para
compensar proporciones, aire transparente y grosor de trazo.

La normalización no altera archivos de imagen ni datos. Se resuelve sólo con
markup semántico y CSS acotado a la home.

## Criterios de aceptación

- Las cuatro marcas se perciben equivalentes en jerarquía a primera vista.
- Ningún logo se recorta o desborda a 1440 px, 768 px o 390 px.
- Las cards conservan contraste legible en reposo, foco y hover.
- `prefers-reduced-motion` sigue anulando los desplazamientos.
- La acción “Consultar otras líneas” queda visualmente integrada pero
  subordinada a las marcas.
