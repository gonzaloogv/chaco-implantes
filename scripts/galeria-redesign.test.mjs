import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const galeriaSource = await readFile(
  new URL("../src/pages/galeria.astro", import.meta.url),
  "utf8",
);
const galeriaStyles = await readFile(
  new URL("../src/styles/galeria.css", import.meta.url),
  "utf8",
).catch(() => "");
const siteSource = await readFile(
  new URL("../src/data/site.ts", import.meta.url),
  "utf8",
);

test("Galería usa una composición editorial propia", () => {
  assert.match(galeriaSource, /import "\.\.\/styles\/galeria\.css";/);
  assert.match(galeriaSource, /class="galeria-page"/);
  assert.match(galeriaSource, /data-galeria-hero-media/);
  assert.match(galeriaSource, /data-gallery-editorial-grid/);
});

test("Galería conserva filtros, carga progresiva y lightbox", () => {
  for (const content of [
    "data-gallery-filters",
    "data-gallery-item",
    "data-load-more",
    "data-lightbox",
    "data-lightbox-prev",
    "data-lightbox-next",
    "GALLERY_PAGE_SIZE",
  ]) {
    assert.ok(galeriaSource.includes(content), `Falta el comportamiento: ${content}`);
  }
});

test("El álbum de Eventos mantiene su acceso y contenido real", () => {
  assert.match(galeriaSource, /data-gallery-album/);
  assert.match(galeriaSource, /featuredEvent\.title/);
  assert.match(galeriaSource, /eventCount/);
  assert.doesNotMatch(galeriaSource, /\bcatalog-image-card\b/);
});

test("El álbum destacado recorre automáticamente cinco fotos reales del evento", () => {
  assert.match(
    galeriaSource,
    /const featuredAlbumImages = gallery[\s\S]*?\.filter\(\(item\) => item\.category === "Eventos"\)[\s\S]*?\.slice\(0, 5\)/,
  );
  assert.match(galeriaSource, /data-gallery-album-carousel/);
  assert.match(galeriaSource, /featuredAlbumImages\.map/);
  assert.match(galeriaSource, /data-gallery-album-dot/);
  assert.doesNotMatch(galeriaSource, /data-gallery-album-prev/);
  assert.doesNotMatch(galeriaSource, /data-gallery-album-next/);
  assert.match(galeriaSource, /window\.setInterval\([\s\S]*?3000/);
  assert.match(galeriaSource, /reduceMotion\.matches/);
  assert.match(
    galeriaStyles,
    /\.galeria-album__dots button\s*{[\s\S]*?min-width:\s*2\.25rem[\s\S]*?height:\s*2\.25rem/,
  );
});

test("El hero usa la nueva foto del congreso con transformación optimizada", () => {
  assert.match(
    siteSource,
    /eventMain:\s*`\$\{CLOUDINARY_BASE\}\/f_auto,q_auto,c_fill,g_auto,w_1600,h_1000\/v1783105553\/Congreso_Traumato-100_jvbmaf\.jpg`/,
  );
});

test("Galería no repite las seis imágenes de categorías de producto", () => {
  for (const categoryImage of [
    "categoryImages.cadera",
    "categoryImages.rodilla",
    "categoryImages.columna",
    "categoryImages.maxilofacial",
    'categoryImages["osteosintesis-placas"]',
    'categoryImages["osteosintesis-tornillos"]',
  ]) {
    assert.ok(
      !siteSource.includes(`image: ${categoryImage}, alt:`),
      `Todavía aparece ${categoryImage} dentro de galleryPool`,
    );
  }
});

test("El hero de Galería enlaza directamente con Videos", () => {
  assert.match(
    galeriaSource,
    /data-galeria-hero-action[\s\S]*?href="\/videos"/,
  );
});

test("La grilla combina formatos para evitar cards uniformes", () => {
  assert.match(galeriaSource, /gallery-card--wide/);
  assert.match(galeriaSource, /gallery-card--tall/);
  assert.match(galeriaStyles, /\.galeria-grid\s*{/);
  assert.match(galeriaStyles, /grid-auto-flow:\s*dense/);
});

test("Las imágenes fuera de la página actual no ocupan espacio", () => {
  assert.match(
    galeriaStyles,
    /\.galeria-card\.hidden\s*{[\s\S]*?display:\s*none/,
  );
});
