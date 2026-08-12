import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const catalogosSource = await readFile(
  new URL("../src/pages/catalogos/index.astro", import.meta.url),
  "utf8",
);
const catalogosStyles = await readFile(
  new URL("../src/styles/catalogos.css", import.meta.url),
  "utf8",
).catch(() => "");
const siteDataSource = await readFile(
  new URL("../src/data/site.ts", import.meta.url),
  "utf8",
);
const catalogProductsSource =
  siteDataSource.match(
    /export const catalogProducts:\s*CatalogProduct\[\]\s*=\s*\[([\s\S]*?)\n\];/,
  )?.[1] ?? "";
const specialtySource = await readFile(
  new URL("../src/pages/catalogos/[categoria].astro", import.meta.url),
  "utf8",
);
const catalogViewerSource = await readFile(
  new URL("../src/components/CatalogViewer.astro", import.meta.url),
  "utf8",
);
const specialtyStyles = await readFile(
  new URL("../src/styles/catalogo-especialidad.css", import.meta.url),
  "utf8",
).catch(() => "");
const productPageSource = await readFile(
  new URL(
    "../src/pages/catalogos/[categoria]/productos/[producto].astro",
    import.meta.url,
  ),
  "utf8",
);
const productStyles = await readFile(
  new URL("../src/styles/catalogo-producto.css", import.meta.url),
  "utf8",
).catch(() => "");
const catalogDocumentsSource = await readFile(
  new URL("../src/data/catalog-documents.ts", import.meta.url),
  "utf8",
).catch(() => "");
let catalogViewerScrollModule;
try {
  catalogViewerScrollModule = await import(
    "../src/scripts/catalog-viewer-scroll.mjs"
  );
} catch {
  catalogViewerScrollModule = {};
}
let catalogViewerZoomModule;
try {
  catalogViewerZoomModule = await import(
    "../src/scripts/catalog-viewer-zoom.mjs"
  );
} catch {
  catalogViewerZoomModule = {};
}

const catalogDocumentFixtures = [
  {
    key: "cadera/amis",
    assetDirectory: "CADERA/AMIS",
    assetPrefix: "amis",
    pageCount: 5,
    pdfFile: "AMIS - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "amisPdf",
  },
  {
    key: "cadera/cotilo-doble",
    assetDirectory: "CADERA/Versafitcup/output",
    assetPrefix: "versafitcup",
    pageCount: 5,
    pdfFile:
      "Versafitcup Doble Movilidad - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "cotiloDoblePdf",
  },
  {
    key: "cadera/sistema-mpact",
    assetDirectory: "CADERA/MPact-Legible/output",
    assetPrefix: "mpact",
    pageCount: 6,
    pdfFile: "Sistema Mpact - Folleto - CHACO IMPLANTES.pdf",
    pdfVariable: "mpactPdf",
  },
  {
    key: "cadera/tallo-masterloc",
    assetDirectory: "CADERA/Masterloc-Legible/output",
    assetPrefix: "masterloc",
    pageCount: 6,
    pdfFile: "Masterloc - Fundamento de Diseno - CHACO IMPLANTES.pdf",
    pdfVariable: "masterlocPdf",
  },
  {
    key: "cadera/tallo-x-acta",
    assetDirectory: "CADERA/X-Acta-Legible/output",
    assetPrefix: "x-acta",
    pageCount: 7,
    pdfFile: "Tallo X-acta - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "xActaPdf",
  },
  {
    key: "cadera/tallo-revision-vizion",
    assetDirectory: "CADERA/M-Vizion-Legible/output",
    assetPrefix: "m-vizion",
    pageCount: 7,
    pdfFile:
      "Tallo de Revision Vizion - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "vizionPdf",
  },
  {
    key: "cadera/tallo-femoral-sms",
    assetDirectory: "CADERA/SMS-Legible/output",
    assetPrefix: "sms",
    pageCount: 6,
    pdfFile: "Tallo SMS - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "smsPdf",
  },
  {
    key: "cadera/sistema-quadra",
    assetDirectory: "CADERA/Quadra-Legible/output",
    assetPrefix: "quadra",
    pageCount: 7,
    pdfFile: "Sistema Quadra - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "quadraPdf",
  },
  {
    key: "cadera/versafitcup-cc-trio",
    assetDirectory: "CADERA/Versafitcup-CC-Trio-Legible/output",
    assetPrefix: "versafitcup-cc-trio",
    pageCount: 7,
    pdfFile: "Versafitcup CC Trio - Ficha Tecnica - CHACO IMPLANTES.pdf",
    pdfVariable: "versafitcupCcTrioPdf",
  },
  {
    key: "rodilla/gmk-primary",
    assetDirectory: "RODILLA/GMK-Primary-Legible/output",
    assetPrefix: "gmk-primary",
    pageCount: 7,
    pdfFile: "GMK Primary - Folleto - CHACO IMPLANTES.pdf",
    pdfVariable: "gmkPrimaryPdf",
  },
  {
    key: "rodilla/gmk-sphere",
    assetDirectory: "RODILLA/GMK-Sphere-Legible/output",
    assetPrefix: "gmk-sphere",
    pageCount: 7,
    pdfFile: "Rodilla GMK Sphere - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "gmkSpherePdf",
  },
  {
    key: "rodilla/gmk-primary-ps",
    assetDirectory: "RODILLA/GMK-Primary-PS-Legible/output",
    assetPrefix: "gmk-primary-ps",
    pageCount: 6,
    pdfFile:
      "Rodilla GMK Estabilizada Posterior - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "gmkPrimaryPsPdf",
  },
  {
    key: "rodilla/rodilla-sphere-medial-pivot",
    assetDirectory: "RODILLA/Sphere-Medial-Pivot-Legible/output",
    assetPrefix: "sphere-medial-pivot",
    pageCount: 6,
    pdfFile:
      "Rodilla Sphere Medial Pivot - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "sphereMedialPivotPdf",
  },
  {
    key: "rodilla/gmk-revision",
    assetDirectory: "RODILLA/GMK-Revision-Legible/output",
    assetPrefix: "gmk-revision",
    pageCount: 7,
    pdfFile: "GMK Revision - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "gmkRevisionPdf",
  },
  {
    key: "rodilla/moto-medial",
    assetDirectory: "RODILLA/MOTO-Medial-Legible/output",
    assetPrefix: "moto-medial",
    pageCount: 5,
    pdfFile: "MOTO Medial - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "motoMedialPdf",
  },
  {
    key: "rodilla/nextar-knee",
    assetDirectory: "RODILLA/NextAR-Legible/output",
    assetPrefix: "nextar",
    pageCount: 6,
    pdfFile: "NextAR Knee - Manual Tecnico - CHACO IMPLANTES.pdf",
    pdfVariable: "nextarPdf",
  },
  {
    key: "columna/columna-must",
    assetDirectory: "COLUMNA/MUST-Legible/output",
    assetPrefix: "must",
    pageCount: 6,
    pdfFile: "Columna MUST - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "mustPdf",
  },
  {
    key: "hombro/hombro-anatomico",
    assetDirectory: "HOMBROS/Hombro-Anatomico-Legible/output",
    assetPrefix: "hombro-anatomico",
    pageCount: 7,
    pdfFile:
      "Hombro Anatomico - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "hombroAnatomicoPdf",
  },
  {
    key: "hombro/protesis-reversa-hombro",
    assetDirectory: "HOMBROS/Protesis-Reversa-Hombro-Legible/output",
    assetPrefix: "protesis-reversa-hombro",
    pageCount: 5,
    pdfFile:
      "Protesis Reversa de Hombro - Tecnica Quirurgica - CHACO IMPLANTES.pdf",
    pdfVariable: "hombroReversoPdf",
  },
  {
    key: "hombro/sistema-hombro",
    assetDirectory: "HOMBROS/Sistema-Hombro-Legible/output",
    assetPrefix: "sistema-hombro",
    pageCount: 6,
    pdfFile: "Sistema de Hombro - Folleto - CHACO IMPLANTES.pdf",
    pdfVariable: "sistemaHombroPdf",
  },
];

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("Catálogos usa una portada editorial propia sin alterar las páginas internas", () => {
  assert.match(catalogosSource, /import "\.\.\/\.\.\/styles\/catalogos\.css";/);
  assert.match(catalogosSource, /class="catalogos-page"/);
  assert.match(catalogosSource, /data-catalog-directory/);
  assert.doesNotMatch(catalogosSource, /import CatalogCard/);
});

test("Las nueve categorías se organizan en tres grupos funcionales", () => {
  assert.match(
    catalogosSource,
    /slugs:\s*\["cadera",\s*"rodilla",\s*"hombro"\]/,
  );
  assert.match(
    catalogosSource,
    /slugs:\s*\[[\s\S]*?"columna"[\s\S]*?"maxilofacial"[\s\S]*?"osteosintesis-placas"[\s\S]*?"osteosintesis-tornillos"[\s\S]*?\]/,
  );
  assert.match(
    catalogosSource,
    /slugs:\s*\["instrumental-quirurgico",\s*"otros-productos"\]/,
  );
  assert.match(catalogosSource, /data-catalog-group={group\.id}/);
  assert.match(catalogosSource, /data-catalog-category/);
});

test("Los productos visibles corresponden a los veinte PDF y respetan su especialidad", () => {
  assert.equal(
    (catalogProductsSource.match(/categorySlug:/g) ?? []).length,
    20,
  );

  const expectedProducts = [
    ["cadera", "AMIS"],
    ["cadera", "Cadera de doble movilidad VersafitCup"],
    ["cadera", "Sistema Mpact"],
    ["cadera", "Tallo Masterloc"],
    ["cadera", "Tallo X-Acta"],
    ["cadera", "Tallo de revisión Vizion"],
    ["cadera", "Tallo femoral SMS"],
    ["cadera", "Sistema Quadra"],
    ["cadera", "VersafitCup CC Trio"],
    ["rodilla", "GMK Primary"],
    ["rodilla", "GMK Sphere"],
    ["rodilla", "GMK Primary PS"],
    ["rodilla", "Rodilla Sphere Medial Pivot"],
    ["rodilla", "GMK Revision"],
    ["rodilla", "MOTO Medial"],
    ["rodilla", "NextAR Knee"],
    ["columna", "Columna M.U.S.T."],
    ["hombro", "Hombro anatómico"],
    ["hombro", "Prótesis reversa de hombro"],
    ["hombro", "Sistema de hombro"],
  ];

  for (const [categorySlug, title] of expectedProducts) {
    assert.match(
      catalogProductsSource,
      new RegExp(
        `categorySlug:\\s*"${categorySlug}"[\\s\\S]*?title:\\s*"${title}"`,
      ),
    );
  }

  for (const removedProduct of [
    "Charnley-Müller",
    "Rodilla ANV II",
    "Placa bloqueada",
    "Perforador y Sierra",
  ]) {
    assert.doesNotMatch(catalogProductsSource, new RegExp(removedProduct));
  }

  assert.equal(
    (catalogDocumentsSource.match(/:\s*createCatalogDocument\(\{/g) ?? [])
      .length,
    20,
    "Todos los productos deben tener una vista previa configurada",
  );
});

test("Las portadas y productos usan los recursos locales entregados", async () => {
  const categoryImageFixtures = [
    ["cadera", "VERSAFITCUP_2.webp"],
    ["rodilla", "GMK_PRIMARY_PS_2.webp"],
    ["hombro", "PROTESIS_REVERSA_2.webp"],
    ["columna", "MUST_2.webp"],
  ];
  const productImageFixtures = [
    ["amis", "AMIs.webp"],
    ["cotilo-doble", "VERSAFITCUP.webp"],
    ["sistema-mpact", "MPACT.webp"],
    ["tallo-masterloc", "MASTERLOC.webp"],
    ["tallo-x-acta", "X-ACTA.webp"],
    ["tallo-revision-vizion", "M-VIZION.webp"],
    ["tallo-femoral-sms", "SMS.webp"],
    ["sistema-quadra", "QUADRA.webp"],
    ["versafitcup-cc-trio", "CC-TRIO.webp"],
    ["gmk-primary", "GMK-PRIMARY-PS.webp"],
    ["gmk-sphere", "GMK-SPHERE.webp"],
    ["gmk-primary-ps", "GMK-PRIMARY-PS.webp"],
    ["rodilla-sphere-medial-pivot", "SPHERE-MEDIAL.webp"],
    ["gmk-revision", "GMK-REVISION.webp"],
    ["moto-medial", "MOTO-MEDIAL.webp"],
    ["nextar-knee", "NEXTAR.webp"],
    ["columna-must", "MUST.webp"],
    ["hombro-anatomico", "HOMBRO-ANATOMICO.webp"],
    ["protesis-reversa-hombro", "PROTESIS-REVERSA.webp"],
    ["sistema-hombro", "SISTEMA-HOMBRO.webp"],
  ];

  for (const [categorySlug, fileName] of categoryImageFixtures) {
    const publicPath = `/catalogos/previews/${fileName}`;
    assert.match(
      siteDataSource,
      new RegExp(`${categorySlug}:\\s*"${escapeRegExp(publicPath)}"`),
    );
    await access(
      new URL(`../public/catalogos/previews/${fileName}`, import.meta.url),
    );
  }

  for (const [productSlug, fileName] of productImageFixtures) {
    const publicPath = `/catalogos/productos/${fileName}`;
    assert.match(
      siteDataSource,
      new RegExp(`"${escapeRegExp(productSlug)}":\\s*"${escapeRegExp(publicPath)}"`),
    );
    assert.match(
      catalogProductsSource,
      new RegExp(
        `slug:\\s*"${escapeRegExp(productSlug)}"[\\s\\S]*?image:\\s*catalogProductImages\\["${escapeRegExp(productSlug)}"\\]`,
      ),
    );
    await access(
      new URL(`../public/catalogos/productos/${fileName}`, import.meta.url),
    );
  }
});

test("El tratamiento aprobado diferencia portadas editoriales y productos técnicos", () => {
  assert.match(catalogosSource, /catalogos-card--preview/);
  assert.match(specialtySource, /catalog-specialty-hero__visual--preview/);
  assert.match(
    catalogosStyles,
    /\.catalogos-card--preview \.catalogos-card__media\s*{[\s\S]*?radial-gradient\([\s\S]*?#0c284c[\s\S]*?#0b223f/,
  );
  assert.match(
    catalogosStyles,
    /\.catalogos-card--preview \.catalogos-card__media img\s*{[\s\S]*?object-fit:\s*contain[\s\S]*?drop-shadow/,
  );
  assert.match(
    specialtyStyles,
    /\.catalog-specialty-hero__visual--preview\s*{[\s\S]*?overflow:\s*visible[\s\S]*?background:\s*transparent/,
  );
  assert.match(
    specialtyStyles,
    /\.catalog-specialty-hero__visual--preview::before\s*{[\s\S]*?z-index:\s*1[\s\S]*?radial-gradient\([\s\S]*?#0c284c/,
  );
  assert.match(
    specialtyStyles,
    /\.catalog-specialty-hero__visual--preview > img\s*{[\s\S]*?z-index:\s*2[\s\S]*?object-fit:\s*contain[\s\S]*?drop-shadow/,
  );
  assert.match(
    specialtyStyles,
    /\.catalog-specialty-card__media\s*{[\s\S]*?linear-gradient\([\s\S]*?#f8fbff/,
  );
  assert.match(
    specialtyStyles,
    /\.catalog-specialty-card__media img\s*{[\s\S]*?object-fit:\s*contain[\s\S]*?drop-shadow/,
  );
});

test("Las portadas transparentes mantienen un marco editorial estable", () => {
  assert.match(
    catalogosStyles,
    /\.catalogos-group--articular \.catalogos-card--preview,[\s\S]*?\.catalogos-group--fixacion \.catalogos-card--preview\s*{[\s\S]*?grid-template-rows:\s*clamp\(18rem,\s*25vw,\s*21rem\)\s+1fr/,
  );
  assert.match(
    catalogosStyles,
    /\.catalogos-card--preview \.catalogos-card__media img\s*{[\s\S]*?padding:\s*clamp\(1\.75rem,\s*2\.5vw,\s*2\.5rem\)/,
  );
  assert.match(
    catalogosStyles,
    /@media \(max-width:\s*48rem\)[\s\S]*?\.catalogos-card--preview,[\s\S]*?\.catalogos-group--fixacion \.catalogos-card--preview\s*{[\s\S]*?grid-template-rows:\s*clamp\(16rem,\s*68vw,\s*18rem\)\s+1fr/,
  );
});

test("La portada de especialidad superpone el acento sin recortar la placa navy", () => {
  assert.match(
    specialtyStyles,
    /\.catalog-specialty-hero__visual--preview\s*{[\s\S]*?overflow:\s*visible[\s\S]*?border:\s*0[\s\S]*?box-shadow:\s*none/,
  );
  assert.match(
    specialtyStyles,
    /\.catalog-specialty-hero__visual--preview > \.catalog-specialty-hero__accent\s*{[\s\S]*?z-index:\s*0/,
  );
  assert.match(
    specialtyStyles,
    /\.catalog-specialty-hero__visual--preview > \.catalog-specialty-hero__count\s*{[\s\S]*?z-index:\s*3/,
  );
});

test("El hero prioriza explorar especialidades y conserva la consulta secundaria", () => {
  assert.match(catalogosSource, /<h1>Catálogos<\/h1>/);
  assert.match(catalogosSource, /href="#catalog-directory"/);
  assert.match(catalogosSource, /wa\.catalogos/);
  assert.match(catalogosSource, /data-catalog-hero-index/);
});

test("La numeración aparece solo en las divisiones principales", () => {
  assert.match(catalogosSource, /<span>{group\.number}<\/span>/);
  assert.doesNotMatch(catalogosSource, /String\(index \+ 1\)/);
  assert.doesNotMatch(catalogosStyles, /\.catalogos-card__media > span/);
  assert.doesNotMatch(catalogosStyles, /\.catalogos-hero__index a span/);
  assert.match(
    catalogosStyles,
    /\.catalogos-group__header > span\s*{[\s\S]*?font-size:\s*clamp\(1\.2rem,\s*2vw,\s*1\.55rem\)/,
  );
});

test("La portada usa azul eléctrico, composición asimétrica y cierre comercial", () => {
  assert.match(catalogosStyles, /--catalog-electric:\s*#1a6fd4/);
  assert.match(catalogosStyles, /\.catalogos-group--fixacion[\s\S]*?grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(catalogosSource, /data-catalog-cta/);
  assert.match(catalogosStyles, /\.catalogos-cta\s*{/);
});

test("Las tarjetas de fijación equilibran imagen y contenido sin texto de relleno", () => {
  assert.match(
    catalogosStyles,
    /\.catalogos-group--fixacion \.catalogos-card\s*{[\s\S]*?grid-template-rows:\s*clamp\(22rem,\s*32vw,\s*26rem\)\s+minmax\(13\.5rem,\s*auto\)/,
  );
  assert.match(
    catalogosStyles,
    /\.catalogos-group--fixacion \.catalogos-card__media\s*{[\s\S]*?min-height:\s*0/,
  );
  assert.match(
    catalogosStyles,
    /@media \(max-width:\s*48rem\)[\s\S]*?\.catalogos-group--fixacion \.catalogos-card\s*{[\s\S]*?grid-template-rows:\s*minmax\(14rem,\s*auto\)\s+1fr/,
  );
  assert.match(
    siteDataSource,
    /Sistemas de fijación espinal con tornillos pediculares, barras y conectores para diferentes configuraciones quirúrgicas\./,
  );
  assert.match(
    siteDataSource,
    /Sistemas de placas y tornillos de bajo perfil para fijación maxilofacial y planificación por región anatómica\./,
  );
  assert.match(
    siteDataSource,
    /Placas anatómicas, bloqueadas y de compresión para traumatología, disponibles para distintas regiones anatómicas\./,
  );
  assert.match(
    siteDataSource,
    /Tornillos corticales, esponjosos y canulados en distintas medidas para sistemas de fijación y osteosíntesis\./,
  );
});

test("La composición se adapta a móvil sin alturas rígidas", () => {
  assert.match(catalogosStyles, /@media \(max-width:\s*48rem\)/);
  assert.match(
    catalogosStyles,
    /@media \(max-width:\s*48rem\)[\s\S]*?grid-template-columns:\s*1fr/,
  );
  assert.doesNotMatch(
    catalogosStyles,
    /(?:^|\n)\s+height:\s*(?:[3-9]\d|[1-9]\d{2,})rem/,
  );
  assert.match(catalogosStyles, /prefers-reduced-motion:\s*reduce/);
});

test("Las nueve especialidades comparten una portada editorial propia", () => {
  assert.match(
    specialtySource,
    /import "\.\.\/\.\.\/styles\/catalogo-especialidad\.css";/,
  );
  assert.match(specialtySource, /class="catalog-specialty-page"/);
  assert.match(specialtySource, /data-catalog-specialty-hero/);
  assert.match(specialtySource, /data-catalog-specialty-image/);
  assert.match(specialtyStyles, /\.catalog-specialty-hero\s*{/);
});

test("Los productos usan una grilla 3 2 1 y muestran información útil", () => {
  assert.match(specialtySource, /data-catalog-products/);
  assert.match(
    specialtySource,
    /class="catalog-specialty-card__description">\s*{product\.description}\s*<\/p>/,
  );
  assert.match(
    specialtyStyles,
    /\.catalog-specialty-grid\s*{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
  );
  assert.match(
    specialtyStyles,
    /@media \(max-width:\s*64rem\)[\s\S]*?\.catalog-specialty-grid\s*{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  );
  assert.match(
    specialtyStyles,
    /@media \(max-width:\s*42rem\)[\s\S]*?\.catalog-specialty-grid\s*{[\s\S]*?grid-template-columns:\s*1fr/,
  );
  assert.match(specialtySource, /href={product\.href}/);
});

test("Las especialidades sin productos ofrecen documentación sin duplicar la portada", () => {
  assert.match(catalogViewerSource, /data-catalog-request/);
  assert.match(catalogViewerSource, /Solicitá la documentación técnica/);
  assert.match(catalogViewerSource, /description \? \(/);
  assert.doesNotMatch(
    specialtySource,
    /<CatalogViewer[\s\S]*?description=/,
  );
  assert.match(catalogViewerSource, /Solicitar catálogo PDF/);
  assert.match(catalogViewerSource, /Contactar por WhatsApp/);
});

test("La ficha individual resuelve un documento real sin alterar sus rutas", () => {
  assert.match(
    productPageSource,
    /import "\.\.\/\.\.\/\.\.\/\.\.\/styles\/catalogo-producto\.css";/,
  );
  assert.match(productPageSource, /getCatalogDocument/);
  assert.match(productPageSource, /document={catalogDocument}/);
  assert.match(productPageSource, /class="catalog-product-page"/);
  assert.match(productPageSource, /canonicalPath={product\.href}/);
});

test("Los veinte productos enlazan su folleto vectorial y su ficha técnica", async () => {
  assert.match(catalogDocumentsSource, /import\.meta\.glob<string>/);
  assert.equal(
    (catalogDocumentsSource.match(/:\s*createCatalogDocument\(\{/g) ?? [])
      .length,
    catalogDocumentFixtures.length,
  );

  for (const fixture of catalogDocumentFixtures) {
    const documentBlock =
      catalogDocumentsSource.match(
        new RegExp(
          `"${escapeRegExp(fixture.key)}":\\s*createCatalogDocument\\(\\{([\\s\\S]*?)\\}\\)`,
        ),
      )?.[1] ?? "";

    assert.match(
      catalogDocumentsSource,
      new RegExp(
        `import\\s+${fixture.pdfVariable}\\s+from\\s+"\\.\\.\\/\\.\\.\\/docs\\/pdfs\\/ficha-tecnica\\/${escapeRegExp(fixture.pdfFile)}\\?url"`,
      ),
    );
    assert.match(
      documentBlock,
      new RegExp(`downloadUrl:\\s*${fixture.pdfVariable}`),
    );
    assert.match(
      documentBlock,
      new RegExp(
        `assetDirectory:\\s*"${escapeRegExp(fixture.assetDirectory)}"`,
      ),
    );
    assert.match(
      documentBlock,
      new RegExp(`assetPrefix:\\s*"${escapeRegExp(fixture.assetPrefix)}"`),
    );
    assert.match(
      documentBlock,
      new RegExp(`pageCount:\\s*${fixture.pageCount}`),
    );

    await access(
      new URL(
        `../docs/pdfs/ficha-tecnica/${fixture.pdfFile}`,
        import.meta.url,
      ),
    );

    for (let pageIndex = 1; pageIndex <= fixture.pageCount; pageIndex += 1) {
      const pageNumber = String(pageIndex).padStart(2, "0");
      await access(
        new URL(
          `../docs/pdfs/visor-pdf/${fixture.assetDirectory}/${fixture.assetPrefix}-${pageNumber}.webp`,
          import.meta.url,
        ),
      );
      await access(
        new URL(
          `../docs/pdfs/visor-pdf/${fixture.assetDirectory}/editable/${fixture.assetPrefix}-${pageNumber}.svg`,
          import.meta.url,
        ),
      );
    }
  }

  assert.match(catalogViewerSource, /const previewPages\s*=/);
  assert.match(catalogViewerSource, /src={page\.source}/);
  assert.match(catalogViewerSource, /src={page\.thumbnail}/);
});

test("El visor presenta páginas variables, navegación accesible y una sola descarga", () => {
  assert.match(catalogViewerSource, /data-catalog-document-viewer/);
  assert.match(catalogViewerSource, /data-viewer-page/);
  assert.match(catalogViewerSource, /data-viewer-thumbnail/);
  assert.match(catalogViewerSource, /data-viewer-prev/);
  assert.match(catalogViewerSource, /data-viewer-next/);
  assert.match(catalogViewerSource, /data-viewer-counter/);
  assert.match(catalogViewerSource, /data-viewer-complete-message/);
  assert.match(catalogViewerSource, /download/);
  assert.match(catalogViewerSource, /keydown/);
  assert.match(catalogViewerSource, /touchstart/);
  assert.doesNotMatch(catalogViewerSource, /Cinco páginas seleccionadas/);
  assert.match(
    catalogViewerSource,
    /Folleto de\s*{previewPages\.length}\s*páginas/,
  );
});

test("Las miniaturas conservan un tamaño legible cuando el folleto supera cinco páginas", () => {
  const thumbnailsRule =
    productStyles.match(
      /\.catalog-document-thumbnails\s*{([^}]*)}/,
    )?.[1] ?? "";

  assert.match(thumbnailsRule, /grid-auto-flow:\s*column/);
  assert.match(thumbnailsRule, /grid-auto-columns:\s*minmax\(/);
  assert.match(thumbnailsRule, /overflow-x:\s*auto/);
  assert.doesNotMatch(thumbnailsRule, /repeat\(5/);
  assert.match(catalogViewerSource, /scrollIntoView\(/);
});

test("El visor permite ampliar, ajustar y desplazar cada página en desktop y móvil", () => {
  assert.equal(
    typeof catalogViewerZoomModule.computeSteppedZoom,
    "function",
  );
  assert.equal(
    catalogViewerZoomModule.computeSteppedZoom({
      currentZoom: 1,
      direction: 1,
    }),
    1.25,
  );
  assert.equal(
    catalogViewerZoomModule.computeSteppedZoom({
      currentZoom: 2.5,
      direction: 1,
    }),
    2.5,
  );
  assert.equal(
    catalogViewerZoomModule.computePinchZoom({
      currentDistance: 150,
      initialDistance: 100,
      initialZoom: 1.5,
    }),
    2.25,
  );
  assert.deepEqual(
    catalogViewerZoomModule.clampViewerPan({
      contentHeight: 1200,
      contentWidth: 1000,
      panX: 900,
      panY: -500,
      viewportHeight: 600,
      viewportWidth: 800,
    }),
    { panX: 100, panY: -300 },
  );
  assert.match(catalogViewerSource, /data-viewer-zoom-out/);
  assert.match(catalogViewerSource, /data-viewer-zoom-value/);
  assert.match(catalogViewerSource, /data-viewer-zoom-in/);
  assert.match(catalogViewerSource, /data-viewer-zoom-reset/);
  assert.match(catalogViewerSource, /computePinchZoom/);
  assert.match(catalogViewerSource, /pointerdown/);
  assert.match(catalogViewerSource, /pointermove/);
  assert.ok(
    (catalogViewerSource.match(/draggable="false"/g) ?? []).length >= 2,
  );
  assert.match(catalogViewerSource, /dragstart/);
  assert.match(
    productStyles,
    /\.catalog-document-zoom-controls\s*{[\s\S]*?display:\s*inline-flex/,
  );
  assert.match(productStyles, /-webkit-user-drag:\s*none/);
  assert.match(
    productStyles,
    /\[data-viewer-zoomed\]\s+\.catalog-document-canvas\s*{[\s\S]*?touch-action:\s*none/,
  );
});

test("El zoom vectorial aumenta el área renderizada sin escalar una textura", () => {
  const pageRule =
    productStyles.match(
      /\.catalog-document-canvas figure\s*{([^}]*)}/,
    )?.[1] ?? "";

  assert.match(
    pageRule,
    /width:\s*auto/,
  );
  assert.match(
    pageRule,
    /height:\s*var\(--viewer-page-size,\s*100%\)/,
  );
  assert.match(pageRule, /aspect-ratio:\s*1200\s*\/\s*1698/);
  assert.doesNotMatch(pageRule, /scale\(/);
  assert.match(catalogViewerSource, /--viewer-page-size/);
});

test("La hoja ampliada queda centrada en todos los tamaños de pantalla", () => {
  const pageRule =
    productStyles.match(
      /\.catalog-document-canvas figure\s*{([^}]*)}/,
    )?.[1] ?? "";

  assert.match(pageRule, /position:\s*absolute/);
  assert.match(pageRule, /top:\s*50%/);
  assert.match(pageRule, /left:\s*50%/);
  assert.match(
    pageRule,
    /calc\(-50%\s*\+\s*var\(--viewer-pan-x,\s*0px\)\)/,
  );
  assert.match(
    pageRule,
    /calc\(-50%\s*\+\s*var\(--viewer-pan-y,\s*0px\)\)/,
  );
});

test("El visor limita el paneo después de medir la hoja ampliada", () => {
  const syncZoomView =
    catalogViewerSource.match(
      /const syncZoomView = \(\) => \{([\s\S]*?)\n\s*};/,
    )?.[1] ?? "";
  const pageSizeUpdate = syncZoomView.indexOf(
    'activePage.style.setProperty(\n          "--viewer-page-size"',
  );
  const panClamp = syncZoomView.indexOf("const boundedPan = clampViewerPan");

  assert.ok(pageSizeUpdate >= 0);
  assert.ok(panClamp > pageSizeUpdate);
  assert.match(syncZoomView, /contentHeight:\s*activePage\.offsetHeight/);
  assert.match(syncZoomView, /contentWidth:\s*activePage\.offsetWidth/);
});

test("El visor muestra cada página completa respetando la proporción del folleto", () => {
  const documentCanvasRule =
    productStyles.match(/\.catalog-document-canvas\s*{([^}]*)}/)?.[1] ?? "";

  assert.match(documentCanvasRule, /aspect-ratio:\s*1200\s*\/\s*1698/);
  assert.match(documentCanvasRule, /height:\s*auto/);
  assert.doesNotMatch(productStyles, /height:\s*clamp\(33rem,\s*61vw,\s*48rem\)/);
  assert.doesNotMatch(productStyles, /height:\s*clamp\(34rem,\s*112vw,\s*47rem\)/);
  assert.doesNotMatch(productStyles, /height:\s*clamp\(29rem,\s*132vw,\s*36rem\)/);
});

test("El visor se ajusta a escritorios de poca altura sin usar 100vh rígido", () => {
  const compactDesktopStyles =
    productStyles.match(
      /@media \(min-width:\s*60\.0625rem\) and \(max-height:\s*71\.875rem\)\s*{([\s\S]*?)\n}\n\n@media \(max-width:\s*60rem\)/,
    )?.[1] ?? "";
  const compactFigureRule =
    compactDesktopStyles.match(
      /\.catalog-document-canvas figure\s*{([^}]*)}/,
    )?.[1] ?? "";

  assert.match(
    productStyles,
    /@media \(min-width:\s*60\.0625rem\) and \(max-height:\s*71\.875rem\)/,
  );
  assert.match(
    productStyles,
    /\.catalog-document-viewer\s*{[\s\S]*?height:\s*min\(calc\(100dvh - 5\.75rem\),\s*65rem\)/,
  );
  assert.match(
    productStyles,
    /\.catalog-document-canvas\s*{[\s\S]*?min-height:\s*0[\s\S]*?aspect-ratio:\s*auto/,
  );
  assert.match(
    compactFigureRule,
    /min-height:\s*0/,
  );
  assert.match(
    compactFigureRule,
    /grid-template-rows:\s*minmax\(0,\s*1fr\)/,
  );
  assert.doesNotMatch(
    productStyles,
    /\.catalog-document-canvas img\s*{\s*width:\s*auto/,
  );
  assert.match(
    productStyles,
    /\.catalog-document-canvas img\s*{[\s\S]*?object-fit:\s*contain/,
  );
  assert.doesNotMatch(productStyles, /height:\s*100vh/);
});

test("El visor conserva la composición 65 35 y colapsa correctamente en móvil", () => {
  const productContentRule =
    productStyles.match(/\.catalog-product-content\s*{([^}]*)}/)?.[1] ?? "";
  assert.match(
    productStyles,
    /\.catalog-product-hero\s*{[\s\S]*?padding-block:\s*clamp\(6rem,\s*7\.5vw,\s*6\.5rem\)\s+clamp\(7rem,\s*10vw,\s*8rem\)/,
  );
  assert.match(
    productContentRule,
    /margin-top:\s*-5\.5rem/,
  );
  assert.match(
    productStyles,
    /\.catalog-product-layout\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.85fr\)\s+minmax\(18rem,\s*1fr\)/,
  );
  assert.match(
    productStyles,
    /@media \(max-width:\s*60rem\)[\s\S]*?\.catalog-product-layout\s*{[\s\S]*?grid-template-columns:\s*1fr/,
  );
  assert.match(productStyles, /\.catalog-document-thumbnail\[aria-selected="true"\]/);
  assert.match(productStyles, /prefers-reduced-motion:\s*reduce/);
});

test("El visor elimina progresivamente el solapamiento y la ficha conserva su recorrido sticky", () => {
  assert.equal(
    typeof catalogViewerScrollModule.computeViewerRevealOffset,
    "function",
  );
  assert.equal(
    typeof catalogViewerScrollModule.computeViewerMaximumShift,
    "function",
  );
  assert.equal(
    catalogViewerScrollModule.computeViewerMaximumShift({
      endSpacing: 102,
      overlap: 88,
    }),
    190,
  );
  assert.equal(
    catalogViewerScrollModule.computeViewerRevealOffset({
      maxShift: 88,
      reducedMotion: false,
      scrollY: 0,
    }),
    0,
  );
  assert.equal(
    catalogViewerScrollModule.computeViewerRevealOffset({
      maxShift: 88,
      reducedMotion: false,
      scrollY: 44,
    }),
    44,
  );
  assert.equal(
    catalogViewerScrollModule.computeViewerRevealOffset({
      maxShift: 88,
      reducedMotion: false,
      scrollY: 120,
    }),
    88,
  );
  assert.equal(
    catalogViewerScrollModule.computeViewerRevealOffset({
      maxShift: 88,
      reducedMotion: true,
      scrollY: 0,
    }),
    88,
  );
  assert.match(productPageSource, /data-catalog-product-hero/);
  assert.match(productPageSource, /data-catalog-product-content/);
  assert.match(productPageSource, /computeViewerMaximumShift/);
  assert.match(productPageSource, /getComputedStyle\(content\)\.paddingBottom/);
  assert.match(productPageSource, /computeViewerRevealOffset/);
  assert.match(productPageSource, /requestAnimationFrame/);
  assert.match(
    productStyles,
    /\.catalog-document-viewer\s*{[\s\S]*?margin-bottom:\s*var\(--catalog-viewer-max-shift,\s*0px\)[\s\S]*?transform:\s*translateY\(var\(--catalog-viewer-reveal-offset,\s*0px\)\)/,
  );
  assert.match(
    productStyles,
    /\.catalog-product-panel\s*{[\s\S]*?position:\s*sticky[\s\S]*?top:\s*6rem/,
  );
});
