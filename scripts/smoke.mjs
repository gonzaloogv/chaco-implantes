import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const globalCss = readFileSync(join(root, "src/styles/global.css"), "utf8");
const homeCss = readFileSync(join(root, "src/styles/home.css"), "utf8");
const siteSource = readFileSync(join(root, "src/data/site.ts"), "utf8");
const cloudinaryManifest = JSON.parse(
  readFileSync(
    join(root, "src/data/generated/cloudinary-media.json"),
    "utf8",
  ),
);
const syncedStandImages = cloudinaryManifest.images.filter(
  ({ sourceFolder }) =>
    sourceFolder === "chaco-implantes/stand" ||
    sourceFolder.startsWith("chaco-implantes/stand/"),
);
const usesSyncedStandImages = syncedStandImages.length > 0;
const expectedGalleryItems =
  11 +
  cloudinaryManifest.images.length +
  (usesSyncedStandImages ? 0 : 80);
const expectedEventImages = usesSyncedStandImages
  ? cloudinaryManifest.images.filter(
      ({ category }) => category === "Eventos",
    ).length
  : 80;
const generatedInstrumentalImages = cloudinaryManifest.images.filter(
  ({ generatedLabelNumber, sourceFolder }) =>
    (sourceFolder === "chaco-implantes/cajas" ||
      sourceFolder.startsWith("chaco-implantes/cajas/")) &&
    Number.isInteger(generatedLabelNumber) &&
    generatedLabelNumber > 0,
);
const hasSyncedVideos = cloudinaryManifest.videos.length > 0;
const syncedVideoCategories = new Set(
  cloudinaryManifest.videos.map(({ category }) => category),
);
const eventHeroImage = "https://res.cloudinary.com/dz9tuwczf/image/upload/f_auto,q_auto,c_limit,w_1920/foto-evento_d0eg2f.jpg";
const oldProductTerm = String.fromCharCode(115, 117, 98, 99, 97, 116, 101, 103, 111, 114);
const expectedPublicAssets = [
  "public/favicon.ico",
  "public/favicon-32x32.png",
  "public/apple-touch-icon.png",
  "public/icon-512.png",
  "public/site.webmanifest",
  "public/assets/brand/og-image.jpg",
  "public/assets/images/hero.jpg",
  "public/assets/images/hero-instrumental.JPG",
  "public/assets/images/productos.jpg",
  "public/assets/images/quirofano.jpg",
  "public/assets/images/congreso-traumatologia-2024.JPG",
];

const pages = [
  ["index.html", "Prótesis, implantes e instrumental para equipos quirúrgicos"],
  ["catalogos/index.html", "Catálogos"],
  ["catalogos/cadera/index.html", "Cadera"],
  ["catalogos/cadera/productos/cotilo-doble/index.html", "Cotilo doble"],
  ["catalogos/rodilla/productos/rodilla-anv-ii/index.html", "Rodilla ANV II"],
  ["catalogos/osteosintesis-placas/productos/placa-bloqueada-35mm/index.html", "Ø3,5mm"],
  ["catalogos/osteosintesis-tornillos/productos/de-tobillo/index.html", "De tobillo"],
  ["catalogos/otros-productos/productos/perforador-sierra/index.html", "Perforador y Sierra"],
  ["galeria/index.html", "Galería"],
  ["eventos/index.html", "Capacitaciones y novedades"],
  ["nosotros/index.html", "Nosotros"],
  ["contacto/index.html", "Contacto"],
  ["videos/index.html", "Videos"],
];

const forbidden = [
  [108, 111, 118, 97, 98, 108, 101],
  [95, 95, 108, 53, 101],
  [64, 116, 97, 110, 115, 116, 97, 99, 107],
  [114, 101, 97, 99, 116, 45, 114, 111, 117, 116, 101, 114],
  [108, 117, 99, 105, 100, 101, 45, 114, 101, 97, 99, 116],
  [122, 111, 100],
].map((codes) => String.fromCharCode(...codes));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertInOrder(source, markers, label) {
  let previous = -1;
  for (const marker of markers) {
    const current = source.indexOf(marker);
    assert(current >= 0, `${label} missing marker: ${marker}`);
    assert(current > previous, `${label} marker out of order: ${marker}`);
    previous = current;
  }
}

function readOutputFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return readOutputFiles(fullPath);
    if (!/\.(astro|html|js|css|json|mjs|ts|txt|xml)$/i.test(entry.name)) return [];
    return [readFileSync(fullPath, "utf8")];
  });
}

for (const [file, text] of pages) {
  const fullPath = join(dist, file);
  assert(existsSync(fullPath), `Missing build output: ${file}`);
  const html = readFileSync(fullPath, "utf8");
  assert(html.includes(text), `Missing expected text in ${file}: ${text}`);
  assert(html.includes("<meta name=\"description\""), `Missing description meta in ${file}`);
  assert(html.includes("rel=\"canonical\""), `Missing canonical link in ${file}`);
}

for (const asset of expectedPublicAssets) {
  assert(existsSync(join(root, asset)), `Missing organized public asset: ${asset}`);
}

const home = readFileSync(join(dist, "index.html"), "utf8");
const expectedHomeMediaCards = hasSyncedVideos ? 2 : 1;
const catalogos = readFileSync(join(dist, "catalogos/index.html"), "utf8");
const catalogoCadera = readFileSync(join(dist, "catalogos/cadera/index.html"), "utf8");
const catalogoCotiloDoble = readFileSync(join(dist, "catalogos/cadera/productos/cotilo-doble/index.html"), "utf8");
const catalogoRodilla = readFileSync(join(dist, "catalogos/rodilla/index.html"), "utf8");
const catalogoRodillaAnv = readFileSync(join(dist, "catalogos/rodilla/productos/rodilla-anv-ii/index.html"), "utf8");
const catalogoPlacas = readFileSync(join(dist, "catalogos/osteosintesis-placas/index.html"), "utf8");
const catalogoPlaca35 = readFileSync(join(dist, "catalogos/osteosintesis-placas/productos/placa-bloqueada-35mm/index.html"), "utf8");
const catalogoTornillos = readFileSync(join(dist, "catalogos/osteosintesis-tornillos/index.html"), "utf8");
const catalogoDeTobillo = readFileSync(join(dist, "catalogos/osteosintesis-tornillos/productos/de-tobillo/index.html"), "utf8");
const catalogoOtros = readFileSync(join(dist, "catalogos/otros-productos/index.html"), "utf8");
const catalogoPerforador = readFileSync(join(dist, "catalogos/otros-productos/productos/perforador-sierra/index.html"), "utf8");
const galeria = readFileSync(join(dist, "galeria/index.html"), "utf8");
const eventos = readFileSync(join(dist, "eventos/index.html"), "utf8");
const nosotros = readFileSync(join(dist, "nosotros/index.html"), "utf8");
const contacto = readFileSync(join(dist, "contacto/index.html"), "utf8");
const videos = readFileSync(join(dist, "videos/index.html"), "utf8");
const source = readOutputFiles(join(root, "src")).join("\n");
assert(catalogoCadera.includes("data-catalog-products"), "Cadera catalog should expose the product grid");
assert(
  (catalogoCadera.match(/data-catalog-product(?=[\s>])/g) ?? []).length >= 15,
  "Cadera catalog should render its product cards",
);
assert(catalogoCadera.includes("Cotilo doble"), "Cadera catalog should include the Cotilo doble product");
assert(catalogoCadera.includes("Tallo delta"), "Cadera catalog should include the Tallo delta product");
assert(catalogoCadera.includes("/catalogos/cadera/productos/cotilo-doble"), "Cadera products should link to viewer pages");
assert(!catalogoCadera.toLowerCase().includes(oldProductTerm), "Cadera catalog should use product terminology");
assert(!catalogoCadera.includes("Ver PDF"), "Cadera product grid should not expose PDF actions");
assert(!catalogoCadera.includes("Opciones de cotilo para artroplastia"), "Cadera product grid should not render descriptions");
assert(!catalogoCadera.includes("data-catalog-viewer"), "Cadera catalog should not use the single PDF viewer");
assert(catalogoCotiloDoble.includes("data-catalog-viewer"), "Cadera product detail should use the catalog viewer");
assert(catalogoCotiloDoble.includes("Opciones de cotilo para artroplastia"), "Cadera product detail should render the description");
assert(catalogoCotiloDoble.includes("Solicitar catálogo PDF"), "Cadera product detail should use the catalog request label");
assert(!catalogoCotiloDoble.includes("Descargar PDF"), "Cadera product detail should not expose a misleading download action");
assert(
  !existsSync(join(dist, "catalogos/cadera/productos/cotilo-doble.pdf")),
  "Cadera product should not generate static PDF output",
);
assert(catalogoRodilla.includes("data-catalog-products"), "Rodilla catalog should expose the product grid");
assert(
  (catalogoRodilla.match(/data-catalog-product(?=[\s>])/g) ?? []).length >= 4,
  "Rodilla catalog should render its product cards",
);
assert(catalogoRodilla.includes("Rodilla ANV II"), "Rodilla catalog should include the Rodilla ANV II product");
assert(catalogoRodilla.includes("Suplementos ANV II"), "Rodilla catalog should include the Suplementos ANV II product");
assert(catalogoRodilla.includes("Rodilla MF"), "Rodilla catalog should include the Rodilla MF product");
assert(catalogoRodilla.includes("Rodilla Modular"), "Rodilla catalog should include the Rodilla Modular product");
assert(catalogoRodilla.includes("/catalogos/rodilla/productos/rodilla-anv-ii"), "Rodilla products should link to viewer pages");
assert(!catalogoRodilla.includes("Sistema de rodilla ANV II"), "Rodilla product grid should not render descriptions");
assert(!catalogoRodilla.includes("Ver PDF"), "Rodilla product grid should not expose PDF actions");
assert(!catalogoRodilla.includes("data-catalog-viewer"), "Rodilla catalog should not use the single PDF viewer");
assert(catalogoRodillaAnv.includes("data-catalog-viewer"), "Rodilla product detail should use the catalog viewer");
assert(catalogoRodillaAnv.includes("Sistema de rodilla ANV II"), "Rodilla product detail should render the description");
assert(catalogoRodillaAnv.includes("Solicitar catálogo PDF"), "Rodilla product detail should expose the catalog request action");
assert(catalogoPlacas.includes("data-catalog-products"), "Osteosynthesis plates catalog should expose the product grid");
assert(
  (catalogoPlacas.match(/data-catalog-product(?=[\s>])/g) ?? []).length >= 17,
  "Osteosynthesis plates catalog should render its product cards",
);
assert(catalogoPlacas.includes("Ø3,5mm"), "Osteosynthesis plates catalog should include the 3.5mm blocked plate product");
assert(catalogoPlacas.includes("Ø4,5mm"), "Osteosynthesis plates catalog should include the 4.5mm blocked plate product");
assert(catalogoPlacas.includes("Clavícula"), "Osteosynthesis plates catalog should include the clavicle product");
assert(catalogoPlacas.includes("Proximal"), "Osteosynthesis plates catalog should include the proximal tibia product");
assert(catalogoPlacas.includes("Húmero distal"), "Osteosynthesis plates catalog should include the distal humerus product");
assert(catalogoPlacas.includes("Volar poliaxial"), "Osteosynthesis plates catalog should include the polyaxial volar product");
assert(catalogoPlacas.includes("Herbert-Barouk"), "Osteosynthesis plates catalog should include the Herbert-Barouk product");
assert(
  catalogoPlacas.includes("/catalogos/osteosintesis-placas/productos/placa-bloqueada-35mm"),
  "Osteosynthesis plates products should link to viewer pages",
);
assert(!catalogoPlacas.includes("Placa bloqueada de Ø3,5 mm"), "Osteosynthesis plates product grid should not render descriptions");
assert(!catalogoPlacas.includes("Ver PDF"), "Osteosynthesis plates product grid should not expose PDF actions");
assert(!catalogoPlacas.includes("data-catalog-viewer"), "Osteosynthesis plates catalog should not use the single PDF viewer");
assert(catalogoPlaca35.includes("data-catalog-viewer"), "Osteosynthesis plates product detail should use the catalog viewer");
assert(catalogoPlaca35.includes("Placa bloqueada de Ø3,5 mm"), "Osteosynthesis plates product detail should render the description");
assert(catalogoPlaca35.includes("Solicitar catálogo PDF"), "Osteosynthesis plates product detail should expose the catalog request action");
assert(catalogoTornillos.includes("data-catalog-products"), "Osteosynthesis screws catalog should expose the product grid");
assert(
  (catalogoTornillos.match(/data-catalog-product(?=[\s>])/g) ?? []).length >= 6,
  "Osteosynthesis screws catalog should render its product cards",
);
assert(catalogoTornillos.includes("De tobillo"), "Osteosynthesis screws catalog should include the De tobillo product");
assert(catalogoTornillos.includes("Multidireccional"), "Osteosynthesis screws catalog should include the Multidireccional product");
assert(catalogoTornillos.includes("Retrógrado"), "Osteosynthesis screws catalog should include the Retrógrado product");
assert(catalogoTornillos.includes("Gamma GN"), "Osteosynthesis screws catalog should include the Gamma GN product");
assert(catalogoTornillos.includes("Clavo acerrojado de húmero"), "Osteosynthesis screws catalog should include the humerus nail product");
assert(catalogoTornillos.includes("Clavo placa tubo deslizante (Richard)"), "Osteosynthesis screws catalog should include the Richard product");
assert(
  catalogoTornillos.includes("/catalogos/osteosintesis-tornillos/productos/de-tobillo"),
  "Osteosynthesis screws products should link to viewer pages",
);
assert(!catalogoTornillos.includes("Clavo para artrodesis de tobillo"), "Osteosynthesis screws product grid should not render descriptions");
assert(!catalogoTornillos.includes("Ver PDF"), "Osteosynthesis screws product grid should not expose PDF actions");
assert(!catalogoTornillos.includes("data-catalog-viewer"), "Osteosynthesis screws catalog should not use the single PDF viewer");
assert(catalogoDeTobillo.includes("data-catalog-viewer"), "Osteosynthesis screws product detail should use the catalog viewer");
assert(catalogoDeTobillo.includes("Clavo para artrodesis de tobillo"), "Osteosynthesis screws product detail should render the description");
assert(catalogoDeTobillo.includes("Solicitar catálogo PDF"), "Osteosynthesis screws product detail should expose the catalog request action");
assert(catalogoOtros.includes("data-catalog-products"), "Other trauma products catalog should expose the product grid");
assert(
  (catalogoOtros.match(/data-catalog-product(?=[\s>])/g) ?? []).length >= 3,
  "Other trauma products catalog should render its product cards",
);
assert(catalogoOtros.includes("Perforador y Sierra"), "Other trauma products catalog should include the drill and saw product");
assert(catalogoOtros.includes("Universal"), "Other trauma products catalog should include the extraction system product");
assert(catalogoOtros.includes("Emergencia"), "Other trauma products catalog should include the emergency instrument product");
assert(
  catalogoOtros.includes("/catalogos/otros-productos/productos/perforador-sierra"),
  "Other trauma products should link to viewer pages",
);
assert(!catalogoOtros.includes("Motor Overfix para perforación"), "Other trauma product grid should not render descriptions");
assert(!catalogoOtros.includes("Ver PDF"), "Other trauma product grid should not expose PDF actions");
assert(!catalogoOtros.includes("data-catalog-viewer"), "Other trauma catalog should not use the single PDF viewer");
assert(catalogoPerforador.includes("data-catalog-viewer"), "Other trauma product detail should use the catalog viewer");
assert(catalogoPerforador.includes("Motor Overfix para perforación"), "Other trauma product detail should render the description");
assert(catalogoPerforador.includes("Solicitar catálogo PDF"), "Other trauma product detail should expose the catalog request action");
assertInOrder(home, [
  'data-home-section="hero"',
  'data-home-section="features"',
  'data-home-section="products"',
  'data-home-section="process"',
  'data-home-section="suppliers"',
  'data-home-section="congresses"',
  'data-home-section="multimedia"',
  'data-home-section="cta"',
  "data-site-footer",
], "Home section order");

for (const hook of [
  "data-home-trust-strip",
  "data-home-products-layout",
  "data-home-supplier-ecosystem",
  "data-home-support-layout",
  "data-home-event-story",
  "data-home-media-layout",
  "data-home-final-cta",
]) {
  assert(home.includes(hook), `Home should render editorial hook: ${hook}`);
}

assert(
  !home.includes("data-home-accent-band"),
  "Home should not render the superseded accent bands",
);

for (const label of [
  "Consulta técnica",
  "Disponibilidad",
  "Coordinación",
  "Acompañamiento",
]) {
  assert(home.includes(label), `Home should render service flow label: ${label}`);
}

assert((home.match(/data-value-pillar(?=[\s>])/g) ?? []).length === 4, "Home should render four compact value pillars");
assert(
  (home.match(/data-catalog-card/g) ?? []).length >= 6,
  "Home should render catalog cards with stable card markers",
);
assert(!home.includes("data-catalog-card-icon"), "Catalog cards should not render decorative icons");
assert(home.includes("nextar-hero_pdfhha"), "Home should use the Cloudinary NextAR full-hero image");
assert(home.includes("amis-hero_snoht3"), "Home should use the Cloudinary AMIS full-hero image");
assert(home.includes(eventHeroImage), "Home should use the events full-hero image");
assert(home.includes("data-hero-carousel"), "Home hero should include the differentiator carousel");
assert((home.match(/<article data-hero-slide/g) ?? []).length === 3, "Hero carousel should render three differentiator slides");
assert(
  /<article\b[^>]*data-hero-slide[^>]*data-active="true"[^>]*aria-hidden="false"/.test(home),
  "Home should expose a readable first hero slide without JavaScript",
);
assert(home.includes("NextAR"), "Hero carousel should describe the NextAR differentiator");
assert(home.includes("AMIS"), "Hero carousel should describe the AMIS differentiator");
assert(home.includes("Calidad que se siente. Confianza que se nota."), "Home should integrate the client slogan");
assert(home.includes("Coordinación para cirugías programadas"), "Home should include the professional support pillars");
assert(!home.includes("Tecnolog\u00c3\u00ada Medacta"), "NextAR hero copy should not mention Medacta");
assert(!home.includes("Consultar sistemas Medacta"), "NextAR hero CTA should not mention Medacta");
assert(home.includes("Productos para traumatología"), "Home should clarify the product category without the old tagline");
assert(!home.includes("Al servicio de la salud"), "Home should not render the old health-service tagline");
assert(home.includes("cat-cadera_gql4el"), "Home catalog cards should use Cloudinary category photography");
assert((home.match(/data-catalog-image-card/g) ?? []).length >= 6, "Home should render image-backed catalog cards");
assert(home.includes("catalog-card-link"), "Catalog cards should render a text-style CTA link");
assert(!home.includes("catalog-card-cta"), "Catalog cards should not render the catalog action as a button");
assert((catalogos.match(/data-catalog-image-card/g) ?? []).length === 8, "Catalog page should render every category as an image-backed card");
assert(catalogos.includes("page-hero-dark"), "Catalog page should use the dark premium page hero");
assert(catalogos.includes("cat-cadera_gql4el"), "Catalog page should preserve category background photography");
assert(catalogos.includes("No encontrás la línea que buscás?"), "Catalog page should include the institutional request CTA");
assert(catalogos.includes("Consulta por WhatsApp"), "Catalog page should include the WhatsApp CTA copy");
assert(!catalogos.includes("Solicitar información"), "Catalog cards should not keep secondary WhatsApp links inside each card");
assert(catalogoCadera.includes("catalog-detail-shell"), "Catalog detail should use the redesigned dark/light layout shell");
assert(!home.includes("data-professional-flow-item"), "Home should avoid the extra professional divider strip");
assert(
  home.includes("data-home-supplier-ecosystem"),
  "Home should include a brands and systems section",
);
assert(home.includes("MEDACTA"), "Brands section should mention Medacta");
assert(home.includes("BONSS"), "Brands section should mention BONSS");
assert(home.includes("Implantes Villalba"), "Brands section should mention Implantes Villalba");
assert(home.includes('href="https://www.medacta.com/"'), "Medacta brand card should link to the official site");
assert(home.includes('href="https://es.bonss.com.cn/"'), "BONSS brand card should link to the official site");
assert(home.includes('href="https://implantesvillalba.com.ar/"'), "Villalba brand card should link to the official site");
assert(home.includes('href="https://ros-medical.com/"'), "RosMedical brand card should link to the official site");
assert(!home.includes("data-institution-card"), "Institutional CTA should be fused into the commercial band");
assert(home.includes("Consultas comerciales e institucionales"), "Commercial band should cover commercial and institutional contact");
assert(!home.includes("Próximamente publicaremos"), "Home should not carry the aging upcoming-events notice");
assert(home.includes("Galería de imágenes"), "Home should include the gallery access card");
assert(
  (home.match(/data-home-media-card(?=[\s=>])/g) ?? []).length ===
    expectedHomeMediaCards,
  "Home multimedia should render gallery plus videos only when available",
);
assert(
  home.includes('data-home-media-card="gallery"'),
  "Home should always render gallery media",
);
assert(
  home.includes('data-home-media-card="videos"') === hasSyncedVideos,
  "Home should render video media only with synchronized videos",
);
assert(
  home.includes('href="/videos"') === hasSyncedVideos,
  "Home should promote the videos page only when synchronized videos exist",
);
assert(home.includes("61° Congreso Argentino de Ortopedia y Traumatología"), "Home should highlight the latest institutional event");
assert(
  home.includes('data-home-section="cta"') &&
    home.includes("data-home-final-cta"),
  "Commercial CTA should render the editorial final action",
);
assert((home.match(/data-nav-link/g) ?? []).length >= 6, "Header should expose nav link markers for state styling");
assert(home.includes('data-active="true"'), "Current nav item should be marked active");
assert(home.includes('data-transparent="true"'), "Home header should start in the transparent hero state");
assert(home.includes('href="/favicon-32x32.png"'), "Pages should link the PNG favicon");
assert(home.includes('rel="apple-touch-icon"'), "Pages should link the apple touch icon");
assert(home.includes('rel="manifest"'), "Pages should link the web manifest");
assert(home.includes("/assets/brand/og-image.jpg"), "Pages should use the dedicated og image");
assert(home.includes('content="summary_large_image"'), "Twitter card should use the large image format");
assert(home.includes('data-mobile-menu') && home.includes('data-state="closed"'), "Mobile menu should expose a closed state for native motion");
assert(home.includes("menu-icon-state"), "Mobile menu icons should be crossfade-ready");
assert((catalogos.match(/data-catalog-card/g) ?? []).length === 8, "Catalog page should keep every catalog card directly clickable");
assert(
  galeria.includes("Ver videos") === hasSyncedVideos,
  "Gallery should promote videos only when synchronized videos exist",
);
assert(galeria.includes("page-hero-dark"), "Gallery page should use the dark premium page hero");
assert(galeria.includes("<dialog") && galeria.includes('aria-modal="true"'), "Gallery lightbox should use an accessible modal dialog");
assert(galeria.includes("data-lightbox-caption-title"), "Gallery lightbox should expose a useful caption title");
assert(source.includes("showModal"), "Gallery lightbox should open with the native modal API");
assert(!galeria.includes("Material visual"), "Gallery hero should not duplicate its title with a generic eyebrow");
assert(galeria.includes('data-gallery-page-size="12"'), "Gallery should expose the first-page size");
assert(
  (galeria.match(/<button type="button" data-gallery-item/g) ?? []).length ===
    expectedGalleryItems,
  "Gallery should render the local items and the active Cloudinary inventory",
);
assert(
  (galeria.match(/data-category="Eventos"/g) ?? []).length ===
    expectedEventImages,
  "Gallery should render either synchronized or fallback event images",
);
for (const image of syncedStandImages) {
  assert(
    image.title === "61° Congreso Traumatología",
    `Event image should use the approved title: ${image.assetId}`,
  );
  assert(
    image.alt === "61° Congreso Traumatología",
    `Event image should use the approved alt: ${image.assetId}`,
  );
}
assert(!galeria.includes("/assets/images/evento.jpg"), "Gallery should not render the old local event image");
const renderedGeneratedImages = usesSyncedStandImages
  ? cloudinaryManifest.images
  : cloudinaryManifest.images.filter(
      ({ sourceFolder }) =>
        sourceFolder !== "chaco-implantes/stand" &&
        !sourceFolder.startsWith("chaco-implantes/stand/"),
    );
for (const image of renderedGeneratedImages) {
  assert(galeria.includes(image.thumb), `Gallery should render synchronized thumbnail ${image.assetId}`);
  assert(galeria.includes(image.full), `Gallery should render synchronized full image ${image.assetId}`);
}
for (const image of generatedInstrumentalImages) {
  const expectedLabel = `Producto instrumental ${image.generatedLabelNumber}`;
  assert(
    image.title === expectedLabel && image.alt === expectedLabel,
    `Generated instrumental label should match its number: ${image.assetId}`,
  );
  assert(
    galeria.includes(expectedLabel),
    `Gallery should render generated instrumental label ${expectedLabel}`,
  );
}
if (!usesSyncedStandImages) {
  assert(galeria.includes("Congreso_Traumato-99_ocnsrl.jpg"), "Gallery should include the fallback event images");
  assert(galeria.includes("61° Congreso Argentino de Ortopedia y Traumatología"), "Fallback event images should use the institutional congress title");
  assert(!galeria.includes("Chaco Implantes en evento profesional - foto"), "Fallback event images should not expose numbered placeholder titles");
}
assert(galeria.includes("f_auto,q_auto,c_fill,g_auto,w_600,h_400"), "Gallery thumbnails should use bounded Cloudinary 600x400 variants");
assert(galeria.includes("f_auto,q_auto,c_limit,w_1920"), "Gallery lightbox images should use Cloudinary 1920px capped variants");
assert((galeria.match(/loading="eager"/g) ?? []).length === 12, "Gallery should eager-load only the first visible batch");
assert((galeria.match(/fetchpriority="high"/g) ?? []).length === 4, "Gallery should give high priority only to the first visible row");
assert(galeria.includes("Cargar más"), "Gallery should include a load-more control");
assert(galeria.includes("data-gallery-album"), "Gallery should feature the events album card in the All view");
assert(galeria.includes(`${expectedEventImages} fotos`), "Gallery album card should expose the event photo count");
assert(galeria.includes("data-thumb-spinner"), "Gallery thumbnails should show a loading spinner until the image arrives");
assert(galeria.includes("data-lightbox-spinner"), "Gallery lightbox should show a loading spinner while a new image loads");
assert(source.includes("markThumbLoaded"), "Gallery should hide each thumbnail spinner once its image loads");
assert(galeria.includes("gallery-filter-active"), "Gallery filters should use a stable active style");
assert(galeria.includes("gallery-filter-idle"), "Gallery filters should use a stronger idle border style");
assert(contacto.includes("contact-field"), "Contact fields should use the unified field treatment");
assert(contacto.includes('aria-describedby="contact-nombre-error"'), "Contact form fields should connect inputs with validation messages");
assert(contacto.includes('id="contact-mensaje-error"'), "Contact form should expose stable error message ids");
assert(!contacto.includes("Contacto directo"), "Contact hero should not duplicate its title with a generic eyebrow");
assert(!contacto.includes('id="contact-telefono"'), "Contact form should not ask for a phone field");
assert(!contacto.includes('id="contact-email"'), "Contact form should not ask for an email field");
assert(!contacto.includes("data-email-submit"), "Contact form should not expose an email action");
assert(!contacto.includes("Enviar por email"), "Contact form should not render an email submit button");
assert(contacto.includes("Enviar por WhatsApp"), "Contact form should keep WhatsApp as the only submit action");
assert((contacto.match(/contact-link/g) ?? []).length >= 4, "Contact phone, email, social and map links should share subtle hover feedback");
assert(
  videos.includes("Pronto publicaremos nuestros videos") ===
    !hasSyncedVideos,
  "Videos page should show the empty state only without synchronized videos",
);
assert(videos.includes("data-videos-page"), "Videos page should expose the redesigned page marker");
assert(videos.includes("page-hero-dark"), "Videos page should use the dark premium page hero");
assert(videos.includes("page-surface"), "Videos page should use the shared light content surface");
assert(videos.includes("premium-card"), "Videos page empty state should use premium card treatment");
assert(
  videos.includes('data-video-filter="') ===
    (hasSyncedVideos && syncedVideoCategories.size >= 2),
  "Videos page should show category filters only when more than one category has videos",
);
assert(
  (videos.match(/data-video-item(?=[\s>])/g) ?? []).length ===
    cloudinaryManifest.videos.length,
  "Videos page should render every synchronized video",
);
const videoPlayerCount = (videos.match(/data-video-player(?=[\s=>])/g) ?? [])
  .length;
const videoTags = videos.match(/<video\b[^>]*>/g) ?? [];
const videoPosterTags =
  videos.match(
    /<img\b(?=[^>]*\bdata-video-poster(?=[\s=>]))[^>]*>/g,
  ) ?? [];
assert(
  videoPlayerCount === cloudinaryManifest.videos.length,
  "Videos page should render one accessible player per synchronized video",
);
assert(
  videoTags.length === cloudinaryManifest.videos.length,
  "Videos page should render one video element per synchronized video",
);
for (const tag of videoTags) {
  assert(
    /\sdata-video-media(?=[\s=>])/.test(tag),
    "Every video element should expose its media marker",
  );
  assert(
    /\sdata-src="[^"]+"/.test(tag),
    "Every video element should defer its source in data-src",
  );
  assert(
    !/(?:^|\s)src=/.test(tag),
    "Video elements should not load their source before interaction",
  );
  assert(
    !/\sposter(?=[\s=>])/.test(tag),
    "Video elements should render posters as separate lazy images",
  );
  assert(
    !/\scontrols(?=[\s=>])/.test(tag),
    "Video elements should use the custom accessible controls",
  );
  assert(
    /\spreload="none"/.test(tag),
    'Video elements should use preload="none"',
  );
  assert(
    /\splaysinline(?=[\s=>])/.test(tag),
    "Video elements should play inline",
  );
  assert(
    /\smuted(?=[\s=>])/.test(tag),
    "Video elements should remain muted",
  );
}
assert(
  videoPosterTags.length === videoPlayerCount,
  "Every video player should render one poster image",
);
for (const tag of videoPosterTags) {
  assert(
    /\sloading="lazy"/.test(tag),
    "Every video poster should load lazily",
  );
  assert(
    /\sdecoding="async"/.test(tag),
    "Every video poster should decode asynchronously",
  );
}
assert(
  (videos.match(/data-video-progress(?=[\s=>])/g) ?? []).length ===
    videoPlayerCount,
  "Every video player should expose an accessible progress control",
);
assert(
  (videos.match(/data-video-fullscreen(?=[\s=>])/g) ?? []).length ===
    videoPlayerCount,
  "Every video player should expose a fullscreen control",
);
assert(
  (videos.match(/data-video-fallback(?=[\s=>])/g) ?? []).length ===
    videoPlayerCount,
  "Every video player should expose a fallback link",
);
assert(videos.includes("SIN AUDIO"), "Video players should explain that playback is muted");
assert(!videos.includes("data-video-volume"), "Video players should not expose volume controls");
assert(
  cloudinaryManifest.videos.every(
    ({ duration }) => duration === undefined || duration >= 2,
  ),
  "Generated manifest should not contain videos shorter than two seconds",
);
for (const video of cloudinaryManifest.videos) {
  const isCajasVideo =
    video.sourceFolder === "chaco-implantes/cajas" ||
    video.sourceFolder.startsWith("chaco-implantes/cajas/");
  if (isCajasVideo) {
    assert(
      video.title === "Producto instrumental",
      `Cajas video should use the approved title: ${video.assetId}`,
    );
  }
  assert(videos.includes(video.src), `Videos page should render source ${video.assetId}`);
  assert(videos.includes(video.poster), `Videos page should render poster ${video.assetId}`);
  assert(
    video.src.includes("ac_none"),
    `Video source should omit audio delivery: ${video.assetId}`,
  );
  assert(
    video.poster.includes("c_pad"),
    `Video poster should preserve its full frame: ${video.assetId}`,
  );
}
if (hasSyncedVideos) {
  assert(!videos.includes("Próximamente:"), "Videos hero should not announce upcoming content after synchronization");
}
assert(source.includes("item.dataset.category === activeFilter"), "Videos page should filter cards by their category");
const controlsHideTimerCallback =
  source.match(
    /controlsTimeout = window\.setTimeout\(\(\) => \{([\s\S]*?)\}, 2200\);/,
  )?.[1] ?? "";
assert(
  controlsHideTimerCallback.includes(
    'root.dataset.state !== "playing"',
  ) &&
    controlsHideTimerCallback.includes("!finePointer.matches") &&
    controlsHideTimerCallback.includes(
      'root.matches(":focus-within")',
    ),
  "Video controls should revalidate player state before the hide timer fires",
);
assert(eventos.includes("data-eventos-page"), "Events page should expose the redesigned page marker");
assert(eventos.includes("page-hero-dark"), "Events page should use the dark premium page hero");
assert(eventos.includes("page-surface"), "Events page should use the shared light content surface");
assert(eventos.includes("data-featured-event"), "Events page should highlight the latest institutional event");
assert(eventos.includes(eventHeroImage), "Events page should use the updated events hero image");
assert(eventos.includes('href="/galeria?categoria=Eventos"'), "Events page image CTA should open the gallery with the Events filter");
assert(nosotros.includes("data-nosotros-page"), "About page should expose the redesigned page marker");
assert(nosotros.includes("page-hero-dark"), "About page should use the dark premium page hero");
assert(nosotros.includes("page-surface"), "About page should use the shared light content surface");
assert(nosotros.includes("Calidad que se siente. Confianza que se nota."), "About page should carry the client slogan");
assert(!nosotros.includes("Propuesta institucional"), "About page should not keep a generic eyebrow above the institutional heading");
assert(contacto.includes("data-contacto-page"), "Contact page should expose the redesigned page marker");
assert(contacto.includes("page-hero-dark"), "Contact page should use the dark premium page hero");
assert(contacto.includes("page-surface"), "Contact page should use the shared light content surface");
assert(contacto.includes("premium-card"), "Contact form should use premium card treatment");
assert(!contacto.includes("dark-card"), "Contact sidebar should share the light premium card treatment");

assert(!existsSync(join(dist, "profesionales/index.html")), "Unexpected /profesionales route output");

const output = readOutputFiles(dist).join("\n").toLowerCase();
assert(source.includes("data-filtering"), "Gallery filter changes should expose a short opacity transition state");
assert(source.includes("data-lightbox-loading"), "Gallery lightbox should expose a decoded image-loading state");
assert(source.includes("prefetchLightboxNeighbors"), "Gallery lightbox should warm neighboring full-size images for rapid navigation");
assert(source.includes(".decode()"), "Gallery lightbox should decode full images before swapping visible content");
assert(source.includes("lightboxRequestId"), "Gallery lightbox should ignore stale rapid navigation requests");
assert(source.includes("new URLSearchParams(window.location.search)"), "Gallery should read an initial filter from the URL");
assert((siteSource.match(/Congreso_[Tt]raumato-/g) ?? []).length === 80, "Source should keep the stand image list as event-only gallery content");
assert(source.includes("prefetchNextBatch"), "Gallery should progressively prefetch the next image batch");
assert(source.includes("requestIdleCallback"), "Gallery prefetch should wait for idle time when available");
assert(source.includes("new Image()"), "Gallery should warm upcoming thumbnail requests without rendering them");
assert(!existsSync(join(root, "prototipo")), "Prototype folder should not remain in the project root");
assert(!output.includes("prototipo"), "Build output should not reference prototype material");
assert(output.includes("logo-circular-white_saci0q"), "Build output should use the optimized Cloudinary header logo");
assert(output.includes("/assets/images/hero.jpg"), "Build output should use organized image asset paths");
assert(output.includes("cat-cadera_gql4el"), "Build output should include Cloudinary category image assets");
assert(!output.includes("/assets/logo-circular.png"), "Build output should not use old flat logo asset path");
assert(!output.includes("/assets/hero.jpg"), "Build output should not use old flat hero asset path");
assert(home.includes('id="profesionales"'), "Professionals section should remain only as a home section");
assert(!output.includes('href="/#profesionales"'), "Professionals should not be exposed as a global navigation destination");
assert(!output.includes("/profesionales"), "Unexpected /profesionales route reference in build output");
assert(
  /\.btn-secondary\s*{[\s\S]*background-color:\s*var\(--popover\)/.test(globalCss),
  "Secondary buttons should use a white surface background",
);
assert(
  /\.btn-light\s*{[\s\S]*background-color:\s*var\(--popover\)/.test(globalCss),
  "Light buttons should use a white surface background",
);
assert(/\.site-header \.nav-link::after\s*{[\s\S]*background:\s*var\(--brand-blue\)/.test(globalCss), "Desktop nav links should use the shared brand-blue underline");
assert(/\.nav-link\[data-active="true"\][\s\S]*opacity:\s*1/.test(globalCss), "Active desktop nav links should render at full opacity");
assert(/\.site-header\[data-transparent="true"\][\s\S]*background-color:\s*transparent/.test(globalCss), "Home header should start with an invisible background");
assert(/\.site-header\[data-transparent="true"\][\s\S]*border-color:\s*transparent/.test(globalCss), "Home header should not show a top-state border");
assert(/\.site-header\[data-transparent="true"\][\s\S]*backdrop-filter:\s*none/.test(globalCss), "Home header should not blur the hero while at top");
assert(/\.site-header\s*{[\s\S]*--header-big-h:\s*15vh/.test(globalCss), "Home header should retain the larger 15vh desktop top token (client request)");
assert(/\.site-header\[data-transparent="true"\]\s*\.site-header-inner\s*{[\s\S]*height:\s*var\(--header-big-h\)/.test(globalCss), "Home header should use the larger top-state height (client request)");
assert(/\.site-header\s*{[\s\S]*--logo-big:\s*clamp\(5rem, 10vh, 7\.5rem\)/.test(globalCss), "Home logo should retain its larger desktop top token (client request)");
assert(/\.site-header\[data-transparent="true"\]\s*\.site-logo-mark\s*{[\s\S]*height:\s*var\(--logo-big\)/.test(globalCss), "Home logo should scale up in the larger top state (client request)");
assert(
  /\.hero-shell\s*{[\s\S]*min-block-size:\s*100svh/.test(homeCss),
  "Home hero should use the small viewport as its stable minimum height",
);
assert(/\.hero-bg-slide\s*{[\s\S]*opacity:\s*0/.test(homeCss), "Hero background slides should fade from hidden state");
assert(/\.hero-bg-slide\[data-active="true"\]\s*{[\s\S]*opacity:\s*1/.test(homeCss), "Active hero background slide should be visible");
assert(/\.mobile-menu\[data-state="open"\]\s*{[\s\S]*transform:\s*translateY\(0\)/.test(globalCss), "Mobile menu should enter with a small transform-to-rest transition");
assert(/\.mobile-menu\[data-state="closed"\]\s*{[\s\S]*transform:\s*translateY\(-0\.375rem\)/.test(globalCss), "Mobile menu should rest hidden with a minimal upward offset");
assert(/\.menu-icon-state\s*{[\s\S]*transition:[\s\S]*opacity 150ms/.test(globalCss), "Mobile menu icons should crossfade quickly");
assert(/\.gallery-filter-active:hover\s*{[\s\S]*background-color:\s*var\(--primary\)/.test(globalCss), "Active gallery filters should not change away from selected colors on hover");
assert(/\.gallery-filter-idle\s*{[\s\S]*border-color:\s*color-mix\(in srgb, var\(--brand\) 48%, white\)/.test(globalCss), "Idle gallery filters should have a slightly more visible border");
assert(/\[data-gallery-grid\]\[data-filtering="true"\]\s*\.gallery-card:not\(\.hidden\)\s*{[\s\S]*opacity:\s*0\.72/.test(globalCss), "Gallery visible items should fade briefly during filter changes");
assert(/\.catalog-image-card:hover img[\s\S]*transform:\s*scale\(1\.05\)/.test(globalCss), "Image catalog cards should zoom their photography subtly on hover");
assert(/\.catalog-image-card:focus-visible[\s\S]*border-color/.test(globalCss), "Catalog image cards should have a clear focus motion state");
assert(/\.catalog-product-card:focus-within[\s\S]*border-color/.test(globalCss), "Catalog product cards should have a clear focus-within motion state");
assert(/\.catalog-card-link\s*{[\s\S]*color:\s*var\(--primary-foreground\)/.test(globalCss), "Catalog card links should render as white text over image cards");
assert(/\.contact-field\s*{[\s\S]*background-color:\s*var\(--popover\)/.test(globalCss), "Contact fields should use a white background");
assert(/\.contact-field\s*{[\s\S]*border-color:\s*color-mix\(in srgb, var\(--brand\) 48%, white\)/.test(globalCss), "Contact fields should use a soft brand border");
assert(/\.contact-field::placeholder\s*{[\s\S]*color:\s*var\(--deep\)/.test(globalCss), "Contact field placeholders should render dark blue");
assert(/\.contact-field\[aria-invalid="true"\][\s\S]*border-color:\s*var\(--destructive\)/.test(globalCss), "Contact invalid fields should transition to a clear error border");
assert(/\[data-error-for\]\[data-visible="true"\]\s*{[\s\S]*opacity:\s*1/.test(globalCss), "Contact error messages should fade in without delaying validation");
assert(/\.lightbox-panel\[data-lightbox-loading="true"\]\s*{[\s\S]*cursor:\s*progress/.test(globalCss), "Lightbox should expose a subtle loading state while keeping the current image visible");
assert(!/\.lightbox-panel\[data-lightbox-transitioning="true"\][\s\S]*opacity:\s*0/.test(globalCss), "Lightbox should not fade the current image to transparent before the next image is decoded");
assert(/\.contact-link:hover\s*{[\s\S]*color:\s*var\(--deep\)/.test(globalCss), "Contact links should have a clearly visible dark-blue hover");
assert(
  /\.home-section-header h2\s*{[\s\S]*letter-spacing:\s*-0\.03em/.test(homeCss),
  "Home display headings should use restrained negative tracking",
);
assert(
  !/letter-spacing:\s*-(?:0\.[3-9]|[1-9])/.test(homeCss),
  "Home should not use extreme negative tracking",
);
assert(!/tracking-(wide|tight|\[)/.test(source), "Source should keep letter spacing at the default value");
assert(!/transition:\s*all\b/.test(source), "Motion should not use transition: all");
assert(!/scale\(0\)/.test(source), "Motion should not animate from scale(0)");
assert(source.includes('matchMedia("(prefers-reduced-motion: reduce)")'), "Interaction scripts should respect reduced motion for approved motion");
assert(
  /--brand-navy:\s*#10294c/i.test(globalCss),
  "Shared chrome should expose the approved navy token",
);
assert(
  /--brand-blue:\s*#1a6fd4/i.test(globalCss),
  "Home accents should expose one approved blue token",
);
assert(
  /\.site-footer\s*{[\s\S]*background:\s*var\(--brand-navy\)/.test(globalCss),
  "Footer should close the home with the approved navy",
);
assert(
  /\.footer-link:hover\s*{[\s\S]*color:\s*#fff/.test(globalCss),
  "Footer links should use a high-contrast hover",
);
assert(
  !/\.btn-primary-soft:hover\s*{[^}]*background-color:/s.test(globalCss),
  "Soft primary hover should not repeat its base background",
);
for (const term of forbidden) {
  assert(!output.includes(term), `Forbidden trace found in build output: ${term}`);
}

console.log(`Smoke checks passed for ${pages.length} pages.`);
