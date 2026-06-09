# Chaco Implantes

Sitio corporativo multipage para Chaco Implantes, desarrollado con Astro, TypeScript y Tailwind CSS.

## Stack

- Astro 6
- TypeScript estricto
- Tailwind CSS 4
- Build estatico

## Scripts

```bash
npm run dev
npm run check
npm run build
npm run test:smoke
npm run preview
```

## Estructura

- `src/components/`: componentes reutilizables de UI.
- `src/data/site.ts`: contenido, navegacion, categorias, galeria y rutas de assets.
- `src/layouts/BaseLayout.astro`: layout base, metadatos SEO y JSON-LD.
- `src/pages/`: rutas multipage del sitio.
- `src/styles/global.css`: Tailwind, tokens visuales y estados de interaccion.
- `public/assets/brand/`: logos e imagenes de marca.
- `public/assets/images/`: imagenes editoriales y de secciones.
- `scripts/smoke.mjs`: smoke checks de build, rutas, SEO, estructura y trazas no deseadas.

## Verificacion

Antes de entregar cambios, correr:

```bash
npm run build
npm run test:smoke
npm run check
npm audit --omit=dev
```
