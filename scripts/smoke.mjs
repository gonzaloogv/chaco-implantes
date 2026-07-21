import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const globalCss = readFileSync(join(root, "src/styles/global.css"), "utf8");
const eventHeroImage = "https://res.cloudinary.com/dz9tuwczf/image/upload/t_Optimization/foto-evento_d0eg2f.jpg";
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
assert((home.match(/data-value-pillar(?=[\s>])/g) ?? []).length === 4, "Home should render four compact value pillars");
assert((home.match(/lift-card flex items-start/g) ?? []).length >= 4, "Home should render four professional support cards");
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
assert(home.includes("NextAR"), "Hero carousel should describe the NextAR differentiator");
assert(home.includes("AMIS"), "Hero carousel should describe the AMIS differentiator");
assert(home.includes("Calidad que se siente. Confianza que se nota."), "Home should integrate the client slogan");
assert(home.includes("Pedidos programados"), "Home should include the professional support pillars");
assert(!home.includes("TecnologÃ­a Medacta"), "NextAR hero copy should not mention Medacta");
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
assert(home.includes("data-suppliers-section"), "Home should include a brands and systems section");
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
assert(!home.includes('href="/videos"'), "Home should not promote the videos page while it is empty");
assert(home.includes("61° Congreso Argentino de Ortopedia y Traumatología"), "Home should highlight the latest institutional event");
assert(home.includes('data-commercial-band="primary"'), "Commercial CTA band should retain a clear blue commercial cue");
assert(home.includes("btn-primary-soft"), "Hero catalog CTA should use the softer primary treatment by default");
assert(home.includes("link-primary-soft"), "Catalog text CTA should use the softer primary link treatment by default");
assert(home.includes("btn-glass-outline"), "Commercial catalog CTA should use the glass card outline treatment");
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
assert(!galeria.includes("Ver videos"), "Gallery should not promote the empty videos page");
assert(galeria.includes("page-hero-dark"), "Gallery page should use the dark premium page hero");
assert(galeria.includes("<dialog") && galeria.includes('aria-modal="true"'), "Gallery lightbox should use an accessible modal dialog");
assert(galeria.includes("data-lightbox-caption-title"), "Gallery lightbox should expose a useful caption title");
assert(source.includes("showModal"), "Gallery lightbox should open with the native modal API");
assert(!galeria.includes("Material visual"), "Gallery hero should not duplicate its title with a generic eyebrow");
assert(galeria.includes('data-gallery-page-size="12"'), "Gallery should expose the first-page size");
assert((galeria.match(/<button type="button" data-gallery-item/g) ?? []).length >= 91, "Gallery should render the base gallery and event photo set");
assert((galeria.match(/data-category="Eventos"/g) ?? []).length >= 80, "Gallery should categorize the stand photos as event images");
assert(!galeria.includes("/assets/images/evento.jpg"), "Gallery should not render the old local event image");
assert(galeria.includes("Congreso_Traumato-99_ocnsrl.jpg"), "Gallery should include the event images listed in stand.txt");
assert(galeria.includes("61° Congreso Argentino de Ortopedia y Traumatología"), "Event gallery images should use the institutional congress title");
assert(!galeria.includes("Chaco Implantes en evento profesional - foto"), "Event gallery images should not expose numbered placeholder titles");
assert(galeria.includes("f_auto,q_auto,c_fill,g_auto,w_600,h_400"), "Gallery thumbnails should use bounded Cloudinary 600x400 variants");
assert(galeria.includes("f_auto,q_auto,c_limit,w_1920"), "Gallery lightbox images should use Cloudinary 1920px capped variants");
assert((galeria.match(/loading="eager"/g) ?? []).length === 12, "Gallery should eager-load only the first visible batch");
assert((galeria.match(/fetchpriority="high"/g) ?? []).length === 4, "Gallery should give high priority only to the first visible row");
assert(galeria.includes("Cargar más"), "Gallery should include a load-more control");
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
assert(videos.includes("Pronto publicaremos nuestros videos"), "Videos page should provide an empty state until videos are available");
assert(videos.includes("data-videos-page"), "Videos page should expose the redesigned page marker");
assert(videos.includes("page-hero-dark"), "Videos page should use the dark premium page hero");
assert(videos.includes("page-surface"), "Videos page should use the shared light content surface");
assert(videos.includes("premium-card"), "Videos page empty state should use premium card treatment");
assert(!videos.includes('data-video-filter="'), "Videos page should hide category filters while there are no videos");
assert(source.includes("item.dataset.category === activeFilter"), "Videos page should filter cards by their category");
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
assert((source.match(/Congreso_[Tt]raumato-/g) ?? []).length === 80, "Source should keep the stand image list as event-only gallery content");
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
  /\.btn-primary\s*{[\s\S]*background:\s*linear-gradient\(135deg, var\(--primary\)/.test(globalCss),
  "Primary buttons should define a stable readable signature-blue gradient",
);
assert(
  /\.btn-secondary\s*{[\s\S]*background-color:\s*var\(--popover\)/.test(globalCss),
  "Secondary buttons should use a white surface background",
);
assert(
  /\.btn-light\s*{[\s\S]*background-color:\s*var\(--popover\)/.test(globalCss),
  "Light buttons should use a white surface background",
);
assert(/\.nav-link::after\s*{[\s\S]*background:\s*var\(--primary\)/.test(globalCss), "Desktop nav links should use the signature-blue active underline");
assert(/\.nav-link\[data-active="true"\][\s\S]*opacity:\s*1/.test(globalCss), "Active desktop nav links should render at full opacity");
assert(/\.site-header\[data-transparent="true"\][\s\S]*background-color:\s*transparent/.test(globalCss), "Home header should start with an invisible background");
assert(/\.site-header\[data-transparent="true"\][\s\S]*border-color:\s*transparent/.test(globalCss), "Home header should not show a top-state border");
assert(/\.site-header\[data-transparent="true"\][\s\S]*backdrop-filter:\s*none/.test(globalCss), "Home header should not blur the hero while at top");
assert(/\.site-header\[data-transparent="true"\]\s*\.site-header-inner\s*{[\s\S]*height:\s*15vh/.test(globalCss), "Home header should use the larger 15vh desktop top state");
assert(/\.site-header\[data-transparent="true"\]\s*\.site-logo-mark\s*{[\s\S]*height:\s*clamp\(5rem, 10vh, 7\.5rem\)/.test(globalCss), "Home logo should scale up in the larger top state");
assert(/\.hero-shell\s*{[\s\S]*min-height:\s*100vh/.test(globalCss), "Hero should occupy the full viewport height");
assert(/\.hero-shell\s*{[\s\S]*background:\s*linear-gradient\(150deg, #0f172a/.test(globalCss), "Hero should use the deep blue gradient direction");
assert(/\.hero-bg-slide\s*{[\s\S]*opacity:\s*0/.test(globalCss), "Hero background slides should fade from hidden state");
assert(/\.hero-bg-slide\[data-active="true"\]\s*{[\s\S]*opacity:\s*1/.test(globalCss), "Active hero background slide should be visible");
assert(/\.mobile-menu\[data-state="open"\]\s*{[\s\S]*transform:\s*translateY\(0\)/.test(globalCss), "Mobile menu should enter with a small transform-to-rest transition");
assert(/\.mobile-menu\[data-state="closed"\]\s*{[\s\S]*transform:\s*translateY\(-0\.375rem\)/.test(globalCss), "Mobile menu should rest hidden with a minimal upward offset");
assert(/\.menu-icon-state\s*{[\s\S]*transition:[\s\S]*opacity 150ms/.test(globalCss), "Mobile menu icons should crossfade quickly");
assert(/\.btn-primary-soft\s*{[\s\S]*background-color:\s*var\(--primary\)/.test(globalCss), "Soft primary buttons should keep accessible white text contrast");
assert(/\.btn-primary:hover\s*{[\s\S]*background:\s*linear-gradient\(135deg, var\(--primary-strong\)/.test(globalCss), "Primary CTA buttons should have a clearly visible blue hover state");
assert(/\.btn-primary-soft:hover\s*{[\s\S]*background-color:\s*var\(--primary\)/.test(globalCss), "Soft primary buttons should hover to full primary");
assert(/\.link-primary-soft:hover\s*{[\s\S]*color:\s*var\(--primary\)/.test(globalCss), "Soft primary links should hover to full primary");
assert(/\.btn-glass-outline\s*{[\s\S]*background-color:\s*rgba\(217, 225, 241, 0\.08\)/.test(globalCss), "Glass outline buttons should match the dark premium glass surface");
assert(/\.footer-link:hover\s*{[\s\S]*color:\s*var\(--brand\)/.test(globalCss), "Footer links should use the subtle brand hover");
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
assert(!/letter-spacing:\s*-/.test(globalCss), "Typography should not use negative letter spacing");
assert(!/tracking-(wide|tight|\[)/.test(source), "Source should keep letter spacing at the default value");
assert(!/transition:\s*all\b/.test(source), "Motion should not use transition: all");
assert(!/scale\(0\)/.test(source), "Motion should not animate from scale(0)");
assert(source.includes('matchMedia("(prefers-reduced-motion: reduce)")'), "Interaction scripts should respect reduced motion for approved motion");
assert(/--primary:\s*#2b6cb8;/i.test(globalCss), "Primary accent should use an accessible client-facing blue signature");
assert(/--primary-glow:\s*#60a5fa;/i.test(globalCss), "Glow accent should use the electric blue highlight");
assert(/--background:\s*#0f172a;/i.test(globalCss), "Default page background should move to the dark premium foundation");
assert(/--surface:\s*#eef2f9;/i.test(globalCss), "Main content surface should remain readable over the dark foundation");
assert(/--surface-2:\s*#d9e1f1;/i.test(globalCss), "Ice color should remain reserved for emphasized sections");
for (const term of forbidden) {
  assert(!output.includes(term), `Forbidden trace found in build output: ${term}`);
}

console.log(`Smoke checks passed for ${pages.length} pages.`);
