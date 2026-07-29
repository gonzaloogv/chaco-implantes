# Altura compacta del control de progreso

## Objetivo

Reducir la altura visual del control inferior del hero sin modificar su ancho,
sus iconos ni su comportamiento.

## Cambio aprobado

- La cápsula de navegación conservará el padding horizontal actual.
- El padding vertical de `.hero-carousel-nav` pasará a `0`.
- En desktop se usará `padding: 0 0.25rem`.
- En mobile se usará `padding: 0 0.1875rem`.
- Los botones conservarán sus dimensiones de `40 × 40 px`.
- El botón de play/pause seguirá siendo circular y permanecerá separado.

Con estas medidas la altura máxima del conjunto pasa de aproximadamente `50 px`
a `42 px`, mientras que el ancho permanece igual.

## Alcance

El ajuste afecta únicamente `src/styles/home.css`. No se modificarán el markup,
el temporizador, el progreso circular, la navegación, la navbar ni el contenido
del hero.

## Verificación

- Contrato CSS que exige padding vertical nulo y padding horizontal conservado.
- Revisión visual breve en desktop y mobile.
- Confirmación de que no aparece overflow horizontal.
