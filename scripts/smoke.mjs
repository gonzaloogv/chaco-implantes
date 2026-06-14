import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const globalCss = readFileSync(join(root, "src/styles/global.css"), "utf8");
const expectedPublicAssets = [
  "public/assets/brand/logo.png",
  "public/assets/brand/logo-circular.png",
  "public/assets/brand/banner-marca.jpg",
  "public/assets/images/hero.jpg",
  "public/assets/images/hero-instrumental.JPG",
  "public/assets/images/hero-mobile.JPG",
  "public/assets/images/productos.jpg",
  "public/assets/images/quirofano.jpg",
  "public/assets/images/evento.jpg",
  "public/assets/images/congreso-traumatologia-2024.JPG",
  "public/assets/images/cat-cadera.jpg",
  "public/assets/images/cat-rodilla.jpg",
  "public/assets/images/cat-columna.jpg",
  "public/assets/images/cat-maxilofacial.jpg",
  "public/assets/images/cat-osteosintesis-placas.jpg",
  "public/assets/images/cat-osteosintesis-tornillos.jpg",
  "public/assets/images/cat-instrumental-quirurgico.jpg",
  "public/assets/images/cat-otros-productos.jpg",
];

const pages = [
  ["index.html", "Prótesis, implantes e instrumental para traumatología"],
  ["catalogos/index.html", "Catálogos"],
  ["catalogos/cadera/index.html", "Cadera"],
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
const galeria = readFileSync(join(dist, "galeria/index.html"), "utf8");
const contacto = readFileSync(join(dist, "contacto/index.html"), "utf8");
const videos = readFileSync(join(dist, "videos/index.html"), "utf8");
assert(
  (home.match(/data-specialty-icon/g) ?? []).length === 4,
  "Home specialty band should render exactly one icon per item",
);
assert(
  (home.match(/data-catalog-card/g) ?? []).length >= 6,
  "Home should render catalog cards with stable card markers",
);
assert(!home.includes("data-catalog-card-icon"), "Catalog cards should not render decorative icons");
assert(home.includes("/assets/images/hero-instrumental.JPG"), "Home should use the updated desktop hero image");
assert(home.includes("/assets/images/hero-mobile.JPG"), "Home should use the updated mobile hero image");
assert(home.includes("/assets/images/cat-cadera.jpg"), "Home catalog cards should use category photography");
assert((home.match(/data-catalog-image-card/g) ?? []).length >= 6, "Home should render image-backed catalog cards");
assert(home.includes("catalog-card-link"), "Catalog cards should render a text-style CTA link");
assert(!home.includes("catalog-card-cta"), "Catalog cards should not render the catalog action as a button");
assert((catalogos.match(/data-catalog-image-card/g) ?? []).length === 8, "Catalog page should render every category as an image-backed card");
assert((home.match(/data-professional-flow-item/g) ?? []).length === 4, "Professional flow should render four compact divider items");
assert(home.includes("Galería y videos"), "Home should include the updated gallery and videos section");
assert(home.includes("61° Congreso Argentino de Ortopedia y Traumatología"), "Home should highlight the latest institutional event");
assert(home.includes('data-commercial-band="primary"'), "Commercial CTA band should match the specialty band background");
assert(home.includes("btn-primary-soft"), "Hero catalog CTA should use the softer primary treatment by default");
assert(home.includes("link-primary-soft"), "Catalog text CTA should use the softer primary link treatment by default");
assert(home.includes("btn-glass-outline"), "Commercial catalog CTA should use the glass card outline treatment");
assert((home.match(/data-nav-link/g) ?? []).length >= 6, "Header should expose nav link markers for state styling");
assert(home.includes('data-active="true"'), "Current nav item should be marked active");
assert(home.includes('data-transparent-header="true"'), "Home header should start in the transparent hero state");
assert(catalogos.includes("catalog-info-link"), "Catalog request information links should have a visible hover treatment");
assert(galeria.includes("Ver videos"), "Gallery should link to the videos page");
assert(galeria.includes('data-gallery-page-size="12"'), "Gallery should expose the first-page size");
assert((galeria.match(/<button type="button" data-gallery-item/g) ?? []).length === 24, "Gallery should render a paginable 24-item set");
assert(galeria.includes("Cargar más"), "Gallery should include a load-more control");
assert(galeria.includes("gallery-filter-active"), "Gallery filters should use a stable active style");
assert(galeria.includes("gallery-filter-idle"), "Gallery filters should use a stronger idle border style");
assert(contacto.includes("contact-field"), "Contact fields should use the unified field treatment");
assert(contacto.includes("btn-email-soft"), "Contact email action should use a subtly tinted secondary button");
assert((contacto.match(/contact-link/g) ?? []).length >= 4, "Contact phone, email, social and map links should share subtle hover feedback");
assert(videos.includes("Pronto publicaremos nuestros videos"), "Videos page should provide an empty state until videos are available");

assert(!existsSync(join(dist, "profesionales/index.html")), "Unexpected /profesionales route output");

const output = readOutputFiles(dist).join("\n").toLowerCase();
const source = readOutputFiles(join(root, "src")).join("\n");
assert(!existsSync(join(root, "prototipo")), "Prototype folder should not remain in the project root");
assert(!output.includes("prototipo"), "Build output should not reference prototype material");
assert(output.includes("/assets/brand/logo-circular.png"), "Build output should use organized brand asset paths");
assert(output.includes("/assets/images/hero.jpg"), "Build output should use organized image asset paths");
assert(output.includes("/assets/images/cat-cadera.jpg"), "Build output should include category image assets");
assert(!output.includes("/assets/logo-circular.png"), "Build output should not use old flat logo asset path");
assert(!output.includes("/assets/hero.jpg"), "Build output should not use old flat hero asset path");
assert(home.includes('id="profesionales"'), "Professionals section should remain only as a home section");
assert(!output.includes('href="/#profesionales"'), "Professionals should not be exposed as a global navigation destination");
assert(!output.includes("/profesionales"), "Unexpected /profesionales route reference in build output");
assert(
  /\.btn-primary\s*{[\s\S]*background-color:\s*var\(--primary\)/.test(globalCss),
  "Primary buttons should define a stable readable background",
);
assert(
  /\.btn-secondary\s*{[\s\S]*background-color:\s*var\(--popover\)/.test(globalCss),
  "Secondary buttons should use a white surface background",
);
assert(
  /\.btn-light\s*{[\s\S]*background-color:\s*var\(--popover\)/.test(globalCss),
  "Light buttons should use a white surface background",
);
assert(/\.nav-link\s*{[\s\S]*opacity:\s*0\.68/.test(globalCss), "Desktop nav links should have a lower default opacity");
assert(/\.nav-link\[data-active="true"\][\s\S]*opacity:\s*1/.test(globalCss), "Active desktop nav links should render at full opacity");
assert(/\.site-header\[data-transparent="true"\][\s\S]*background-color:\s*transparent/.test(globalCss), "Home header should support a transparent hero state");
assert(/\.hero-desktop-image\s*{[\s\S]*display:\s*none/.test(globalCss), "Desktop hero image should be hidden by default");
assert(/\.hero-mobile-image\s*{[\s\S]*display:\s*block/.test(globalCss), "Mobile hero image should be visible by default");
assert(/@media\s*\(min-width:\s*64rem\)\s*{[\s\S]*\.hero-mobile-bg,\s*\.hero-mobile-image\s*{[\s\S]*display:\s*none !important/.test(globalCss), "Desktop breakpoint should hide the mobile hero image");
assert(/\.btn-primary-soft\s*{[\s\S]*background-color:\s*color-mix\(in srgb, var\(--primary\) 82%, white\)/.test(globalCss), "Soft primary buttons should start below full primary strength");
assert(/\.btn-primary:hover\s*{[\s\S]*background-color:\s*var\(--deep\)/.test(globalCss), "Primary CTA buttons should have a clearly visible hover state");
assert(/\.btn-primary-soft:hover\s*{[\s\S]*background-color:\s*var\(--primary\)/.test(globalCss), "Soft primary buttons should hover to full primary");
assert(/\.link-primary-soft:hover\s*{[\s\S]*color:\s*var\(--primary\)/.test(globalCss), "Soft primary links should hover to full primary");
assert(/\.btn-glass-outline\s*{[\s\S]*background-color:\s*rgba\(255, 255, 255, 0\.1\)/.test(globalCss), "Glass outline buttons should match flow card surface");
assert(/\.footer-link:hover\s*{[\s\S]*color:\s*var\(--brand\)/.test(globalCss), "Footer links should use the subtle brand hover");
assert(/\.catalog-info-link:hover\s*{[\s\S]*background-color:\s*var\(--surface-2\)/.test(globalCss), "Catalog info links should gain a subtle surface hover");
assert(/\.gallery-filter-active:hover\s*{[\s\S]*background-color:\s*var\(--primary\)/.test(globalCss), "Active gallery filters should not change away from selected colors on hover");
assert(/\.gallery-filter-idle\s*{[\s\S]*border-color:\s*color-mix\(in srgb, var\(--brand\) 48%, white\)/.test(globalCss), "Idle gallery filters should have a slightly more visible border");
assert(/\.catalog-image-card:hover img[\s\S]*transform:\s*scale\(1\.05\)/.test(globalCss), "Image catalog cards should zoom their photography subtly on hover");
assert(/\.catalog-card-link\s*{[\s\S]*color:\s*var\(--primary-foreground\)/.test(globalCss), "Catalog card links should render as white text over image cards");
assert(/\.contact-field\s*{[\s\S]*background-color:\s*var\(--popover\)/.test(globalCss), "Contact fields should use a white background");
assert(/\.contact-field\s*{[\s\S]*border-color:\s*color-mix\(in srgb, var\(--brand\) 48%, white\)/.test(globalCss), "Contact fields should use a soft brand border");
assert(/\.contact-field::placeholder\s*{[\s\S]*color:\s*var\(--deep\)/.test(globalCss), "Contact field placeholders should render dark blue");
assert(/\.btn-email-soft\s*{[\s\S]*background-color:\s*color-mix\(in srgb, var\(--surface-2\) 72%, white\)/.test(globalCss), "Email button should sit subtly apart from white/card backgrounds");
assert(/\.contact-link:hover\s*{[\s\S]*color:\s*var\(--deep\)/.test(globalCss), "Contact links should have a clearly visible dark-blue hover");
assert(!/letter-spacing:\s*-/.test(globalCss), "Typography should not use negative letter spacing");
assert(!/tracking-(wide|tight|\[)/.test(source), "Source should keep letter spacing at the default value");
assert(/--background:\s*#f3f6fb;/i.test(globalCss), "Default page background should be the light neutral surface");
assert(/--surface:\s*#f3f6fb;/i.test(globalCss), "Default surface should be the light neutral surface");
assert(/--surface-2:\s*#d9e1f1;/i.test(globalCss), "Ice color should remain reserved for emphasized sections");
for (const term of forbidden) {
  assert(!output.includes(term), `Forbidden trace found in build output: ${term}`);
}

console.log(`Smoke checks passed for ${pages.length} pages.`);
