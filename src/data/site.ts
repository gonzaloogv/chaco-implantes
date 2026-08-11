import cloudinaryMediaData from "./generated/cloudinary-media.json";
import { buildSiteMediaCollections } from "./cloudinary-media-adapter.mjs";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dz9tuwczf/image/upload";

// Fondos a pantalla completa / media pantalla
const HERO_TRANSFORM = "f_auto,q_auto,c_limit,w_1920";
// Fotos de categoría usadas en cards y heros de catálogo
const CATEGORY_TRANSFORM = "f_auto,q_auto,c_limit,w_1600";
// Logos del header (≤120px) y footer (40px)
const LOGO_HEADER_TRANSFORM = "f_auto,q_auto,w_256";
const LOGO_FOOTER_TRANSFORM = "f_auto,q_auto,w_128";

export const images = {
  instrumental: `${CLOUDINARY_BASE}/f_auto,q_auto,c_fill,g_auto,w_1400,h_960/v1785277783/chaco-120_fxo1fj.jpg`,
  professionalWork: `${CLOUDINARY_BASE}/f_auto,q_auto,c_fill,g_auto,w_1400,h_960/v1785277685/chaco-34_pof7i8.jpg`,
  productOverview: `${CLOUDINARY_BASE}/f_auto,q_auto,c_fill,g_auto,w_1400,h_960/v1785277764/chaco-100_jrh9me.jpg`,
  eventMain: `${CLOUDINARY_BASE}/f_auto,q_auto,c_fill,g_auto,w_1600,h_1000/v1783105553/Congreso_Traumato-100_jvbmaf.jpg`,
  heroNextAR: `${CLOUDINARY_BASE}/${HERO_TRANSFORM}/v1785284880/NextAR_HERO_twzvis.png`,
  heroAmis: `${CLOUDINARY_BASE}/${HERO_TRANSFORM}/v1785290373/amis_noxkiq.png`,
  heroEventos: `${CLOUDINARY_BASE}/f_auto,q_auto,c_fill,g_faces,w_1600,h_900/v1783107290/Congreso_Traumato-65_yvgqxc.jpg`,
  homeGallery: `${CLOUDINARY_BASE}/f_auto,q_auto,c_fill,g_auto,w_1400,h_960/v1785277687/chaco-36_yd3o1w.jpg`,
  homeSupport: `${CLOUDINARY_BASE}/f_auto,q_auto,c_fill,g_auto,w_1200,h_1400/v1785277685/chaco-34_pof7i8.jpg`,
  homeVideos: `${CLOUDINARY_BASE}/f_auto,q_auto,c_fill,g_auto,w_1200,h_960/v1783107299/Congreso_Traumato-82_cc6z1u.jpg`,
  logoCircular: `${CLOUDINARY_BASE}/${LOGO_FOOTER_TRANSFORM}/v1784636792/logo-circular_ybzerb.png`,
  logoCircularWhite: `${CLOUDINARY_BASE}/${LOGO_HEADER_TRANSFORM}/v1784636793/logo-circular-white_saci0q.png`,
  ogImage: "/assets/brand/og-image.jpg",
} as const;

export const catalogPreviewImages = {
  cadera: "/catalogos/previews/VERSAFITCUP_2.webp",
  rodilla: "/catalogos/previews/GMK_PRIMARY_PS_2.webp",
  hombro: "/catalogos/previews/PROTESIS_REVERSA_2.webp",
  columna: "/catalogos/previews/MUST_2.webp",
  maxilofacial: "/catalogos/previews/osteosintesis-maxilofacial.png",
  "osteosintesis-placas": "/catalogos/previews/osteosintesis-placas.png",
  "osteosintesis-tornillos":
    "/catalogos/previews/osteosintesis-tornillos.png",
} as const;

export const categoryImages = {
  ...catalogPreviewImages,
  "instrumental-quirurgico": `${CLOUDINARY_BASE}/${CATEGORY_TRANSFORM}/v1784637756/cat-instrumental-quirurgico_se6ozy.jpg`,
  "otros-productos": `${CLOUDINARY_BASE}/${CATEGORY_TRANSFORM}/v1784637759/cat-otros-productos_pbymtq.jpg`,
} as const;

export const site = {
  name: "Chaco Implantes",
  tagline: "Productos para traumatología",
  activity:
    "Comercialización y distribución de prótesis, implantes e instrumental traumatológico nacional e importado.",
  phoneDisplay: "0362-4571854",
  whatsappNumber: "543624571854",
  address: "Corrientes 781, Resistencia, Chaco 3500",
  instagramHandle: "@chacoimplanteok",
  instagramUrl: "https://www.instagram.com/chacoimplanteok/",
  email: "chacoimplantes@gmail.com",
  baseUrl: "https://chacoimplantes.com.ar",
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Links de WhatsApp nombrados — único lugar donde se redactan los mensajes estáticos
export const wa = {
  general:        whatsappLink("Hola, quisiera contactarme con Chaco Implantes."),
  sitio:          whatsappLink("Hola, me comunico desde el sitio de Chaco Implantes."),
  consulta:       whatsappLink("Hola, quisiera hacer una consulta a Chaco Implantes."),
  catalogos:      whatsappLink("Hola, quisiera solicitar información sobre los catálogos de Chaco Implantes."),
  lineaFaltante:  whatsappLink("Hola, no encuentro la línea que busco en los catálogos de Chaco Implantes."),
  congreso:       whatsappLink("Hola, vi que participaron del Congreso Argentino de Ortopedia y Traumatología. Quisiera más información."),
  capacitaciones: whatsappLink("Hola, quisiera información sobre capacitaciones y novedades de Chaco Implantes."),
} as const;

export const nav = [
  { label: "Inicio",    href: "/" },
  { label: "Catálogos", href: "/catalogos" },
  { label: "Galería",   href: "/galeria" },
  { label: "Eventos",   href: "/eventos" },
  { label: "Nosotros",  href: "/nosotros" },
  { label: "Contacto",  href: "/contacto" },
] as const;

export const footerNav = [
  { label: "Catálogos", href: "/catalogos" },
  { label: "Galería",   href: "/galeria" },
  { label: "Eventos",   href: "/eventos" },
  { label: "Nosotros",  href: "/nosotros" },
  { label: "Contacto",  href: "/contacto" },
] as const;

// Diferenciales concretos (sugeridos en design-review #13) — confirmar redacción con el cliente
export const valuePillars = [
  { icon: "boxes", label: "Stock e instrumental en Resistencia" },
  { icon: "calendar-clock", label: "Coordinación para cirugías programadas" },
  { icon: "wrench", label: "Acompañamiento técnico en quirófano" },
  { icon: "map-pin", label: "Cobertura en Chaco y el NEA" },
] as const;

export const serviceFlow = [
  {
    step: "01",
    label: "Consulta técnica",
    description:
      "Relevamos el procedimiento, el sistema requerido y las necesidades del equipo médico.",
  },
  {
    step: "02",
    label: "Disponibilidad",
    description:
      "Confirmamos stock, medidas e instrumental antes de coordinar la entrega.",
  },
  {
    step: "03",
    label: "Coordinación",
    description:
      "Acordamos tiempos, logística y documentación con la institución.",
  },
  {
    step: "04",
    label: "Acompañamiento",
    description:
      "Brindamos soporte técnico antes y durante el procedimiento, según las necesidades del equipo.",
  },
] as const;

export type HeroSlide = {
  eyebrow: string;
  title: string;
  text: string;
  ctaLabel: string;
  href: string;
  image: string;
  imageAlt: string;
};

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "NextAR · Planificación 3D",
    title: "Tecnología aplicada a procedimientos de alta precisión",
    text: "Planificación personalizada, realidad aumentada y soporte visual para acompañar el flujo quirúrgico con información clara en cada etapa.",
    ctaLabel: "Consultar tecnología",
    href: "/contacto",
    image: images.heroNextAR,
    imageAlt: "Sistema NextAR con planificación 3D y realidad aumentada",
  },
  {
    eyebrow: "Cadera · AMIS",
    title: "Sistemas para abordajes modernos de cadera",
    text: "Acompañamos procedimientos de cadera con productos, instrumental y coordinación comercial para equipos que requieren precisión y disponibilidad.",
    ctaLabel: "Ver línea de cadera",
    href: "/catalogos/cadera",
    image: images.heroAmis,
    imageAlt: "Sistema AMIS para abordaje anterior de cadera",
  },
  {
    eyebrow: "Actividad profesional",
    title: "Actualización constante junto a profesionales",
    text: "Participamos en congresos, capacitaciones y espacios de intercambio para acercar novedades, productos y soporte a instituciones de salud.",
    ctaLabel: "Ver eventos",
    href: "/eventos",
    image: images.heroEventos,
    imageAlt: "Equipo de Chaco Implantes en eventos y congresos profesionales",
  },
] as const;

export type SupplierSystem = {
  name: string;
  href: string;
  logo: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  logoClass: "supplier-logo-mark" | "supplier-logo-wide" | "supplier-logo-tall" | "supplier-logo-ross";
};

export const supplierSystems: SupplierSystem[] = [
  {
    name: "MEDACTA",
    href: "https://www.medacta.com/",
    logo: `${CLOUDINARY_BASE}/f_auto,q_auto,c_limit,w_600/v1785295625/Medacta_international_fxxqfm.png`,
    logoAlt: "Logo de Medacta International",
    logoWidth: 2193,
    logoHeight: 823,
    logoClass: "supplier-logo-mark",
  },
  {
    name: "BONSS",
    href: "https://es.bonss.com.cn/",
    logo: `${CLOUDINARY_BASE}/f_auto,q_auto,c_limit,w_600/v1785295619/BONSS_hbor6w.png`,
    logoAlt: "Logo de BONSS Medical",
    logoWidth: 1840,
    logoHeight: 855,
    logoClass: "supplier-logo-wide",
  },
  {
    name: "Implantes Villalba",
    href: "https://implantesvillalba.com.ar/",
    logo: `${CLOUDINARY_BASE}/f_auto,q_auto,c_limit,w_600/v1785295621/Implantes_Villalba_pan8nq.png`,
    logoAlt: "Logo de Implantes Villalba",
    logoWidth: 1787,
    logoHeight: 780,
    logoClass: "supplier-logo-tall",
  },
  {
    name: "RosMedical",
    href: "https://ros-medical.com/",
    logo: `${CLOUDINARY_BASE}/f_auto,q_auto,c_limit,w_600/v1785295629/RosMedical_nomflr.png`,
    logoAlt: "Logo de RosMedical",
    logoWidth: 1874,
    logoHeight: 839,
    logoClass: "supplier-logo-ross",
  },
] as const;

export type Category = {
  slug: string;
  title: string;
  type: string;
  tag: string;
  description: string;
  icon: "bone" | "layers" | "shield-check" | "wrench" | "package-check";
};

export const categories: Category[] = [
  {
    slug: "cadera",
    title: "Cadera",
    type: "Prótesis e implantes",
    tag: "Artroplastia",
    description: "Prótesis de cadera primarias y de revisión, vástagos y cotilos nacionales e importados.",
    icon: "bone",
  },
  {
    slug: "rodilla",
    title: "Rodilla",
    type: "Prótesis e implantes",
    tag: "Artroplastia",
    description: "Prótesis total y parcial, componentes femorales, tibiales y de polietileno.",
    icon: "bone",
  },
  {
    slug: "hombro",
    title: "Hombro",
    type: "Prótesis e implantes",
    tag: "Artroplastia",
    description:
      "Sistemas de artroplastia anatómica y reversa de hombro, con alternativas primarias y convertibles.",
    icon: "bone",
  },
  {
    slug: "columna",
    title: "Columna",
    type: "Sistemas de fijación",
    tag: "Fijación",
    description:
      "Sistemas de fijación espinal con tornillos pediculares, barras y conectores para diferentes configuraciones quirúrgicas.",
    icon: "layers",
  },
  {
    slug: "maxilofacial",
    title: "Maxilofacial",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description:
      "Sistemas de placas y tornillos de bajo perfil para fijación maxilofacial y planificación por región anatómica.",
    icon: "shield-check",
  },
  {
    slug: "osteosintesis-placas",
    title: "Osteosíntesis: placas",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description:
      "Placas anatómicas, bloqueadas y de compresión para traumatología, disponibles para distintas regiones anatómicas.",
    icon: "shield-check",
  },
  {
    slug: "osteosintesis-tornillos",
    title: "Osteosíntesis: tornillos",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description:
      "Tornillos corticales, esponjosos y canulados en distintas medidas para sistemas de fijación y osteosíntesis.",
    icon: "shield-check",
  },
  {
    slug: "instrumental-quirurgico",
    title: "Instrumental quirúrgico",
    type: "Instrumental",
    tag: "Instrumental",
    description: "Cajas e instrumental específico por sistema y procedimiento.",
    icon: "wrench",
  },
  {
    slug: "otros-productos",
    title: "Otros productos traumatológicos",
    type: "Productos varios",
    tag: "Insumos",
    description: "Insumos, descartables y productos complementarios.",
    icon: "package-check",
  },
];

export type CatalogProduct = {
  categorySlug: string;
  slug: string;
  title: string;
  label: string;
  description: string;
  image: string;
  href: string;
};

export const catalogProductImages = {
  "amis": "/catalogos/productos/AMIs.webp",
  "cotilo-doble": "/catalogos/productos/VERSAFITCUP.webp",
  "sistema-mpact": "/catalogos/productos/MPACT.webp",
  "tallo-masterloc": "/catalogos/productos/MASTERLOC.webp",
  "tallo-x-acta": "/catalogos/productos/X-ACTA.webp",
  "tallo-revision-vizion": "/catalogos/productos/M-VIZION.webp",
  "tallo-femoral-sms": "/catalogos/productos/SMS.webp",
  "sistema-quadra": "/catalogos/productos/QUADRA.webp",
  "versafitcup-cc-trio": "/catalogos/productos/CC-TRIO.webp",
  "gmk-primary": "/catalogos/productos/GMK-PRIMARY-PS.webp",
  "gmk-sphere": "/catalogos/productos/GMK-SPHERE.webp",
  "gmk-primary-ps": "/catalogos/productos/GMK-PRIMARY-PS.webp",
  "rodilla-sphere-medial-pivot": "/catalogos/productos/SPHERE-MEDIAL.webp",
  "gmk-revision": "/catalogos/productos/GMK-REVISION.webp",
  "moto-medial": "/catalogos/productos/MOTO-MEDIAL.webp",
  "nextar-knee": "/catalogos/productos/NEXTAR.webp",
  "columna-must": "/catalogos/productos/MUST.webp",
  "hombro-anatomico": "/catalogos/productos/HOMBRO-ANATOMICO.webp",
  "protesis-reversa-hombro": "/catalogos/productos/PROTESIS-REVERSA.webp",
  "sistema-hombro": "/catalogos/productos/SISTEMA-HOMBRO.webp",
} as const;

export const catalogProducts: CatalogProduct[] = [
  {
    categorySlug: "cadera",
    slug: "amis",
    title: "AMIS",
    label: "Técnica quirúrgica",
    description:
      "Abordaje anterior mínimamente invasivo para artroplastia total de cadera, con posicionador móvil de miembro inferior.",
    image: catalogProductImages["amis"],
    href: "/catalogos/cadera/productos/amis",
  },
  {
    categorySlug: "cadera",
    slug: "cotilo-doble",
    title: "Cadera de doble movilidad VersafitCup",
    label: "Cotilo acetabular press-fit",
    description:
      "Sistema acetabular de doble movilidad para artroplastia de cadera, con opciones de medidas y componentes asociados.",
    image: catalogProductImages["cotilo-doble"],
    href: "/catalogos/cadera/productos/cotilo-doble",
  },
  {
    categorySlug: "cadera",
    slug: "sistema-mpact",
    title: "Sistema Mpact",
    label: "Cotilo sin cementar",
    description:
      "Sistema de cotilos hemisféricos sin cementar para artroplastia total de cadera primaria y de revisión.",
    image: catalogProductImages["sistema-mpact"],
    href: "/catalogos/cadera/productos/sistema-mpact",
  },
  {
    categorySlug: "cadera",
    slug: "tallo-masterloc",
    title: "Tallo Masterloc",
    label: "Vástago en cuña cónica",
    description:
      "Sistema femoral con vástago en cuña cónica para artroplastia total de cadera.",
    image: catalogProductImages["tallo-masterloc"],
    href: "/catalogos/cadera/productos/tallo-masterloc",
  },
  {
    categorySlug: "cadera",
    slug: "tallo-x-acta",
    title: "Tallo X-Acta",
    label: "Tallo femoral cementado",
    description:
      "Tallo femoral cementado de doble conicidad y sin collar para artroplastia de cadera.",
    image: catalogProductImages["tallo-x-acta"],
    href: "/catalogos/cadera/productos/tallo-x-acta",
  },
  {
    categorySlug: "cadera",
    slug: "tallo-revision-vizion",
    title: "Tallo de revisión Vizion",
    label: "Sistema femoral modular",
    description:
      "Sistema femoral modular no cementado para procedimientos de revisión de cadera.",
    image: catalogProductImages["tallo-revision-vizion"],
    href: "/catalogos/cadera/productos/tallo-revision-vizion",
  },
  {
    categorySlug: "cadera",
    slug: "tallo-femoral-sms",
    title: "Tallo femoral SMS",
    label: "Tallo corto no cementado",
    description:
      "Tallo femoral corto y conservador de hueso para artroplastia total o parcial de cadera.",
    image: catalogProductImages["tallo-femoral-sms"],
    href: "/catalogos/cadera/productos/tallo-femoral-sms",
  },
  {
    categorySlug: "cadera",
    slug: "sistema-quadra",
    title: "Sistema Quadra",
    label: "Tallo femoral",
    description:
      "Sistema de tallos femorales para artroplastia total de cadera primaria.",
    image: catalogProductImages["sistema-quadra"],
    href: "/catalogos/cadera/productos/sistema-quadra",
  },
  {
    categorySlug: "cadera",
    slug: "versafitcup-cc-trio",
    title: "VersafitCup CC Trio",
    label: "Cotilo acetabular sin cementar",
    description:
      "Cotilo acetabular sin cementar para artroplastia total de cadera.",
    image: catalogProductImages["versafitcup-cc-trio"],
    href: "/catalogos/cadera/productos/versafitcup-cc-trio",
  },
  {
    categorySlug: "rodilla",
    slug: "gmk-primary",
    title: "GMK Primary",
    label: "Sistema de rodilla primaria",
    description:
      "Sistema para artroplastia total primaria de rodilla con diferentes necesidades de estabilidad.",
    image: catalogProductImages["gmk-primary"],
    href: "/catalogos/rodilla/productos/gmk-primary",
  },
  {
    categorySlug: "rodilla",
    slug: "gmk-sphere",
    title: "GMK Sphere",
    label: "Rodilla medialmente estabilizada",
    description:
      "Sistema de artroplastia total de rodilla con concepto de estabilidad medial.",
    image: catalogProductImages["gmk-sphere"],
    href: "/catalogos/rodilla/productos/gmk-sphere",
  },
  {
    categorySlug: "rodilla",
    slug: "gmk-primary-ps",
    title: "GMK Primary PS",
    label: "Rodilla estabilizada posterior",
    description:
      "Sistema de artroplastia total de rodilla con estabilización posterior.",
    image: catalogProductImages["gmk-primary-ps"],
    href: "/catalogos/rodilla/productos/gmk-primary-ps",
  },
  {
    categorySlug: "rodilla",
    slug: "rodilla-sphere-medial-pivot",
    title: "Rodilla Sphere Medial Pivot",
    label: "Artroplastia total de rodilla",
    description:
      "Sistema de rodilla con diseño medial pivot para artroplastia total.",
    image: catalogProductImages["rodilla-sphere-medial-pivot"],
    href: "/catalogos/rodilla/productos/rodilla-sphere-medial-pivot",
  },
  {
    categorySlug: "rodilla",
    slug: "gmk-revision",
    title: "GMK Revision",
    label: "Sistema de rodilla de revisión",
    description:
      "Sistema de revisión de rodilla para reconstrucción y estabilización protésica.",
    image: catalogProductImages["gmk-revision"],
    href: "/catalogos/rodilla/productos/gmk-revision",
  },
  {
    categorySlug: "rodilla",
    slug: "moto-medial",
    title: "MOTO Medial",
    label: "Sistema de rodilla parcial",
    description:
      "Sistema de reemplazo unicompartimental medial para artroplastia parcial de rodilla.",
    image: catalogProductImages["moto-medial"],
    href: "/catalogos/rodilla/productos/moto-medial",
  },
  {
    categorySlug: "rodilla",
    slug: "nextar-knee",
    title: "NextAR Knee",
    label: "Navegación en artroplastia",
    description:
      "Plataforma de navegación para artroplastia de rodilla con sensores y gafas inteligentes.",
    image: catalogProductImages["nextar-knee"],
    href: "/catalogos/rodilla/productos/nextar-knee",
  },
  {
    categorySlug: "columna",
    slug: "columna-must",
    title: "Columna M.U.S.T.",
    label: "Fijación vertebral posterior",
    description:
      "Sistema universal de tornillos pediculares para fijación vertebral posterior.",
    image: catalogProductImages["columna-must"],
    href: "/catalogos/columna/productos/columna-must",
  },
  {
    categorySlug: "hombro",
    slug: "hombro-anatomico",
    title: "Hombro anatómico",
    label: "Artroplastia anatómica",
    description:
      "Sistema de artroplastia anatómica de hombro para reconstrucción protésica.",
    image: catalogProductImages["hombro-anatomico"],
    href: "/catalogos/hombro/productos/hombro-anatomico",
  },
  {
    categorySlug: "hombro",
    slug: "protesis-reversa-hombro",
    title: "Prótesis reversa de hombro",
    label: "Artroplastia reversa",
    description:
      "Sistema de artroplastia reversa de hombro con configuración de vástago corto.",
    image: catalogProductImages["protesis-reversa-hombro"],
    href: "/catalogos/hombro/productos/protesis-reversa-hombro",
  },
  {
    categorySlug: "hombro",
    slug: "sistema-hombro",
    title: "Sistema de hombro",
    label: "Configuración anatómica y reversa",
    description:
      "Sistema completo y convertible con configuraciones anatómica y reversa de hombro.",
    image: catalogProductImages["sistema-hombro"],
    href: "/catalogos/hombro/productos/sistema-hombro",
  },
];

export const featuredCatalogSlugs = [
  "cadera",
  "rodilla",
  "hombro",
  "maxilofacial",
  "columna",
  "osteosintesis-tornillos",
] as const;

export const featuredCategories = featuredCatalogSlugs
  .map((slug) => categories.find((category) => category.slug === slug))
  .filter((category): category is Category => Boolean(category));

// Último evento institucional destacado — compartido entre la home y la página Eventos
export const featuredEvent = {
  badge: "Noviembre 2024",
  title: "61° Congreso Argentino de Ortopedia y Traumatología",
  venue: "Hotel Hilton, Buenos Aires",
  description:
    "Participamos del 61° Congreso Argentino de Ortopedia y Traumatología, un encuentro dedicado a la innovación y la medicina personalizada para mejorar el bienestar de los pacientes. Junto a destacados expositores y referentes del rubro, compartimos los productos y el servicio de calidad que ofrecemos.",
  image: images.eventMain,
  imageAlt:
    "Equipo de Chaco Implantes en el 61° Congreso Argentino de Ortopedia y Traumatología, Hotel Hilton Buenos Aires 2024",
} as const;

export type GalleryCategory = "Productos" | "Instrumental" | "Eventos" | "Quirófano";

export type GalleryItem = {
  category: GalleryCategory;
  thumb: string;
  full: string;
  alt: string;
};

type GeneratedCloudinaryImage = {
  assetId: string;
  sourceFolder: string;
  publicId: string;
  category: GalleryCategory;
  createdAt: string;
  title: string;
  alt: string;
  width: number;
  height: number;
  thumb: string;
  full: string;
};

type GeneratedCloudinaryVideo = {
  assetId: string;
  sourceFolder: string;
  publicId: string;
  category: GalleryCategory;
  createdAt: string;
  title: string;
  poster: string;
  src: string;
  width: number;
  height: number;
  duration?: number;
  audioEnabled?: boolean;
};

type CloudinaryMediaManifest = {
  schemaVersion: 1;
  images: GeneratedCloudinaryImage[];
  videos: GeneratedCloudinaryVideo[];
};

const cloudinaryMedia =
  cloudinaryMediaData as CloudinaryMediaManifest;

export const galleryFilters = ["Productos", "Instrumental", "Quirófano", "Eventos"] as const;

export const GALLERY_PAGE_SIZE = 12;
const CLOUDINARY_UPLOAD_SEGMENT = "/image/upload/";
const GALLERY_THUMB_TRANSFORM = "f_auto,q_auto,c_fill,g_auto,w_600,h_400";
const GALLERY_FULL_TRANSFORM = "f_auto,q_auto,c_limit,w_1920";
const EVENT_GALLERY_TITLE = "61° Congreso Argentino de Ortopedia y Traumatología";

const isCloudinaryTransformSegment = (segment: string) =>
  segment.startsWith("t_") || segment.split(",").every((part) => /^[a-z]{1,3}_/.test(part));

const cloudinaryVariant = (url: string, transformation: string) => {
  const [base, rest] = url.split(CLOUDINARY_UPLOAD_SEGMENT);
  if (!rest) return url;

  const parts = rest.split("/");
  const assetPath = isCloudinaryTransformSegment(parts[0] || "") ? parts.slice(1).join("/") : rest;
  return `${base}${CLOUDINARY_UPLOAD_SEGMENT}${transformation}/${assetPath}`;
};

const eventGalleryImages = [
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-99_ocnsrl.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-98_yxjvqv.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-97_fvfbip.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-96_jy442k.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-94_cayape.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-95_ksf5oj.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-93_qk6t7z.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-91_vrn8qd.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-92_z3fruw.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-90_eo21jt.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-89_av3hws.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-88_xmmnzc.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-86_a01tji.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-87_ecangz.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-85_ltfxq8.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-82_cc6z1u.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-84_pcshmz.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-81_zyiozh.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-80_nwifrl.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-78_ttvgtb.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-79_ydqllb.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-76_ujchpi.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-77_ramqm2.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-75_iv6ite.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-74_usnp9z.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-71_uzxx19.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-73_n3nixf.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-72_r3fony.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-70_h6yuzj.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-68_ehzk0m.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-69_biecuk.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-66_jsiowk.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-67_vzjbhc.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-65_yvgqxc.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-64_ahtkgt.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-63_lgxc8v.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-62_c0j6nb.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-61_ha4yc5.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-60_vmhgvf.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-57_nrmroe.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-59_khgscc.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-58_a2sxpw.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-56_qkfcvb.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-54_vqi90v.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-55_j6q3sh.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-53_dm9ssd.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-52_v7poi1.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-51_rh6qee.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-50_j8feme.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-49_kfw1hy.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-48_ukylmv.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-47_ckpt6m.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-46_tdc8lt.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-45_e7n3of.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-44_jajceb.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-43_actk4v.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-252_h6b0t7.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-249_r5clgj.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-251_vp0buq.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-250_aiwhft.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-248_c7chsc.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-247_mszrpf.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-246_ctyda9.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-245_pzogyw.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-244_xw1ycj.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-241_dxamgn.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-243_y8nriq.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-240_rdglqt.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-239_i06352.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-238_taa9gp.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-235_qm5qzw.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-236_fteaqx.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-234_elmhde.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-231_eptjtt.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-232_eiiphi.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-233_s0j08g.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-100_jvbmaf.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-102_xfshwn.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_Traumato-101_ho2aad.jpg",
  "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/Congreso_traumato-230_m0ssnq.jpg",
] as const;

const galleryPool: { category: GalleryCategory; image: string; alt: string }[] = [
  {
    category: "Productos",
    image: images.productOverview,
    alt: "Preparación de instrumental y componentes traumatológicos",
  },
  {
    category: "Instrumental",
    image: images.instrumental,
    alt: "Instrumental motorizado para procedimientos traumatológicos",
  },
  {
    category: "Quirófano",
    image: images.professionalWork,
    alt: "Preparación y organización de instrumental",
  },
];

const eventGalleryPool: { category: GalleryCategory; image: string; alt: string }[] = eventGalleryImages.map((image) => ({
  category: "Eventos",
  image,
  alt: EVENT_GALLERY_TITLE,
}));

const staticGallery = galleryPool.map((base) => {
  return {
    category: base.category,
    thumb: cloudinaryVariant(base.image, GALLERY_THUMB_TRANSFORM),
    full: cloudinaryVariant(base.image, GALLERY_FULL_TRANSFORM),
    alt: base.alt,
  };
});
const fallbackEventGallery = eventGalleryPool.map((base) => ({
  category: base.category,
  thumb: cloudinaryVariant(base.image, GALLERY_THUMB_TRANSFORM),
  full: cloudinaryVariant(base.image, GALLERY_FULL_TRANSFORM),
  alt: base.alt,
}));

export type VideoItem = {
  id: string;
  category: GalleryCategory;
  poster: string;
  src: string;
  title: string;
  duration?: number;
  audioEnabled: boolean;
};

const synchronizedMedia = buildSiteMediaCollections({
  manifest: cloudinaryMedia,
  baseGallery: staticGallery,
  fallbackEvents: fallbackEventGallery,
}) as {
  gallery: GalleryItem[];
  videos: VideoItem[];
};

export const gallery = synchronizedMedia.gallery;
export const videos = synchronizedMedia.videos;
