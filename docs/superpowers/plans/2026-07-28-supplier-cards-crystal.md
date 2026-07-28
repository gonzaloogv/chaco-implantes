# Supplier Cards Crystal Implementation Plan

> **For agentic workers:** Use `executing-plans` and follow the RED-GREEN-REFACTOR
> cycle for the source contract.

**Goal:** Aplicar la variante A aprobada a las cards de proveedores e igualar el
tamaño óptico de sus logos.

**Architecture:** El cambio se limita al markup de proveedores en
`src/pages/index.astro`, sus reglas en `src/styles/home.css` y el contrato
existente en `scripts/home-redesign.test.mjs`. No se modifican datos, assets ni
componentes compartidos.

**Tech Stack:** Astro 6, CSS nativo, Node test runner y Playwright.

---

### Task 1: Fijar el contrato visual

**Files:**

- Modify: `scripts/home-redesign.test.mjs`

- [x] Exigir un contenedor de logo común y una señal de enlace por card.
- [x] Exigir grilla con separación, borde completo, radio, superficie
      translúcida y sombra interna.
- [x] Exigir ajustes ópticos explícitos para las cuatro variantes de logo.
- [x] Ejecutar `npm run test:home` y confirmar que falla por faltar el nuevo
      tratamiento.

### Task 2: Implementar la variante A

**Files:**

- Modify: `src/pages/index.astro`
- Modify: `src/styles/home.css`

- [x] Agrupar el logo en un marco de altura estable.
- [x] Separar nombre y flecha en un pie de card semántico.
- [x] Sustituir divisores por cards de cristal técnico.
- [x] Normalizar cada logo mediante límites y escalas ópticas por clase.
- [x] Integrar la acción secundaria con menor jerarquía.
- [x] Mantener hover, foco, responsive y reducción de movimiento.
- [x] Ejecutar `npm run test:home` y confirmar que pasa.

### Task 3: Verificar y ajustar

**Files:**

- Verify: `src/pages/index.astro`
- Verify: `src/styles/home.css`

- [x] Ejecutar build y levantar la home local.
- [x] Revisar la sección en desktop y mobile, incluyendo un estado hover.
- [x] Ajustar únicamente las escalas ópticas que visualmente lo necesiten.
- [x] Ejecutar `git diff --check`, `npm run verify:frontend` y
      `npm run test:video-player`.
- [x] Revisar el diff final y crear un commit atómico.
