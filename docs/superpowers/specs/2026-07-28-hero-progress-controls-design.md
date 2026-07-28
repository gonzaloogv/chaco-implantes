# Control de progreso del hero

## Objetivo

Evolucionar el control actual del carrusel para que comunique cuánto falta para
el próximo slide y permita navegar hacia atrás o adelante sin perder el control
manual de reproducción.

## Dirección visual aprobada

El control permanecerá centrado en la parte inferior del hero y se dividirá en
dos piezas alineadas:

1. Una cápsula navy translúcida con flecha anterior, los indicadores de slides
   y flecha siguiente.
2. Un botón circular de play/pause inmediatamente a la derecha.

La cápsula tendrá borde tenue, fondo oscuro y separación compacta. Los
indicadores inactivos serán círculos huecos; el activo tendrá un centro sólido
y un aro animado que mostrará el avance del ciclo. Se renderizará un indicador
por slide, por lo que el contenido actual mostrará tres.

## Comportamiento

- El aro activo avanzará de `0` a `100 %` durante los `6500 ms` actuales.
- Al completar el aro, el carrusel avanzará al siguiente slide y comenzará un
  nuevo ciclo.
- Las flechas navegarán circularmente: anterior desde el primer slide irá al
  último y siguiente desde el último volverá al primero.
- Seleccionar una flecha o un indicador cambiará el slide y reiniciará su ciclo.
- Pausar congelará el aro en el punto exacto alcanzado.
- Reanudar continuará desde ese mismo punto, sin reiniciar el ciclo.
- La pausa automática por hover y por salir del viewport conservará el progreso
  restante. La decisión manual existente seguirá teniendo prioridad sobre el
  hover.
- Con `prefers-reduced-motion: reduce`, no habrá avance automático ni animación
  del aro; flechas e indicadores seguirán funcionando.

## Estructura y estado

El carrusel seguirá siendo responsable de slides, fondos y controles. No se
modificarán `heroSlides`, el contenido del hero ni la navbar.

El temporizador se modelará con una única fuente de verdad:

- índice activo;
- milisegundos restantes;
- instante de inicio del tramo en reproducción;
- estado manual (`auto`, `playing` o `paused`);
- visibilidad y hover del hero.

El progreso visual se derivará de ese mismo estado para evitar que el aro y el
cambio de slide se desincronicen.

## Accesibilidad

- Las flechas tendrán nombres accesibles “Slide anterior” y “Slide siguiente”.
- Los indicadores conservarán el título del slide en su `aria-label` y
  expondrán el activo mediante `aria-pressed`.
- Play/pause conservará su etiqueta dinámica y estado actual.
- Todas las acciones serán botones reales, operables con teclado y con foco
  visible.
- El círculo visual podrá ser pequeño, pero cada objetivo interactivo tendrá un
  área táctil mínima de `40 × 40 px`.

## Responsive

En desktop el conjunto conservará su posición y respiración. En mobile se
reducirán gaps y padding de la cápsula sin ocultar flechas, indicadores ni
play/pause, y sin generar overflow horizontal.

## Verificación

- Prueba de estructura para flechas, aro de progreso y control separado.
- Prueba de navegador para navegación circular, selección directa y estado de
  play/pause.
- Comprobación de que el progreso se congela al pausar y continúa al reanudar.
- Verificación con movimiento reducido, desktop y mobile.
- Ejecución completa de `npm run verify:frontend` y
  `npm run test:video-player`.
