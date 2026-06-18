export const images = {
  hero: "/assets/images/hero.jpg",
  heroBg: "/assets/images/hero-instrumental.JPG",
  heroMobile: "/assets/images/hero-mobile.JPG",
  heroNextAR: "/assets/images/nextar-hero.png",
  heroAmis: "/assets/images/amis-hero.png",
  heroEventos: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_Optimization/foto-evento_d0eg2f.jpg",
  quirofano: "/assets/images/quirofano.jpg",
  evento: "/assets/images/evento.jpg",
  congreso: "/assets/images/congreso-traumatologia-2024.JPG",
  productos: "/assets/images/productos.jpg",
  logo: "/assets/brand/logo.png",
  logoCircular: "/assets/brand/logo-circular.png",
  logoCircularWhite: "/assets/brand/logo-circular-white.png",
  bannerMarca: "/assets/brand/banner-marca.jpg",
} as const;

export const categoryImages = {
  cadera: "/assets/images/cat-cadera.png",
  rodilla: "/assets/images/cat-rodilla.png",
  columna: "/assets/images/cat-columna.png",
  maxilofacial: "/assets/images/cat-maxilofacial.png",
  "osteosintesis-placas": "/assets/images/cat-osteosintesis-placas.png",
  "osteosintesis-tornillos": "/assets/images/cat-osteosintesis-tornillos.png",
  "instrumental-quirurgico": "/assets/images/cat-instrumental-quirurgico.jpg",
  "otros-productos": "/assets/images/cat-otros-productos.jpg",
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

// Links de WhatsApp nombrados — evita strings duplicados en templates
export const wa = {
  general:       whatsappLink("Hola, quisiera contactarme con Chaco Implantes."),
  pedido:        whatsappLink("Hola, quisiera coordinar un pedido con Chaco Implantes."),
  institucional: whatsappLink("Hola, quisiera solicitar contacto institucional con Chaco Implantes."),
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

// Badges de la franja superior del hero
export const specialtyBadges = [
  { icon: "bone",         label: "Prótesis e implantes" },
  { icon: "wrench",       label: "Instrumental quirúrgico" },
  { icon: "shield-check", label: "Osteosíntesis" },
  { icon: "map-pin",      label: "Resistencia, Chaco" },
] as const;

export const valuePillars = [
  { icon: "handshake", label: "Asesoramiento personalizado" },
  { icon: "shield-check", label: "Tecnología y materiales de primera línea" },
  { icon: "boxes", label: "Soluciones adaptadas a cada necesidad" },
  { icon: "building-2", label: "Atención humana y profesional" },
] as const;

// Items de la franja divisora entre catálogos y profesionales
export const professionalFlow = [
  { icon: "clipboard-list", title: "Consulta por línea" },
  { icon: "handshake",      title: "Coordinación comercial" },
  { icon: "boxes",          title: "Disponibilidad y stock" },
  { icon: "building-2",     title: "Atención profesional" },
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
  label: string;
  text: string;
};

export const supplierSystems: SupplierSystem[] = [
  {
    name: "MEDACTA",
    label: "Sistemas internacionales",
    text: "Sistemas para cadera, rodilla y columna, con líneas orientadas a procedimientos de alta complejidad.",
  },
  {
    name: "BONSS",
    label: "Productos exclusivos",
    text: "Líneas seleccionadas de implantes e instrumental para ampliar opciones según necesidad quirúrgica.",
  },
  {
    name: "Implantes Villalba",
    label: "Industria nacional",
    text: "Implantes y sistemas nacionales para osteosíntesis y traumatología, con acompañamiento en pedidos.",
  },
  {
    name: "Nacionales e importados",
    label: "Cobertura de catálogo",
    text: "Combinamos proveedores y líneas de producto para resolver disponibilidad e instrumental por procedimiento.",
  },
] as const;

export type Category = {
  slug: string;
  title: string;
  type: string;
  tag: string;
  description: string;
  pages: number;
  icon: "bone" | "layers" | "shield-check" | "wrench" | "package-check";
};

export const categories: Category[] = [
  {
    slug: "cadera",
    title: "Cadera",
    type: "Prótesis e implantes",
    tag: "Artroplastia",
    description: "Prótesis de cadera primarias y de revisión, vástagos y cotilos nacionales e importados.",
    pages: 6,
    icon: "bone",
  },
  {
    slug: "rodilla",
    title: "Rodilla",
    type: "Prótesis e implantes",
    tag: "Artroplastia",
    description: "Prótesis total y parcial, componentes femorales, tibiales y de polietileno.",
    pages: 6,
    icon: "bone",
  },
  {
    slug: "columna",
    title: "Columna",
    type: "Sistemas de fijación",
    tag: "Fijación",
    description: "Fijación espinal, tornillos pediculares, barras y conectores.",
    pages: 5,
    icon: "layers",
  },
  {
    slug: "maxilofacial",
    title: "Maxilofacial",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description: "Placas y tornillos de bajo perfil para fijación maxilofacial.",
    pages: 4,
    icon: "shield-check",
  },
  {
    slug: "osteosintesis-placas",
    title: "Osteosíntesis: placas",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description: "Placas anatómicas y de compresión para traumatología.",
    pages: 7,
    icon: "shield-check",
  },
  {
    slug: "osteosintesis-tornillos",
    title: "Osteosíntesis: tornillos",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description: "Tornillos corticales, esponjosos y canulados en distintas medidas.",
    pages: 5,
    icon: "shield-check",
  },
  {
    slug: "instrumental-quirurgico",
    title: "Instrumental quirúrgico",
    type: "Instrumental",
    tag: "Instrumental",
    description: "Cajas e instrumental específico por sistema y procedimiento.",
    pages: 8,
    icon: "wrench",
  },
  {
    slug: "otros-productos",
    title: "Otros productos traumatológicos",
    type: "Productos varios",
    tag: "Insumos",
    description: "Insumos, descartables y productos complementarios.",
    pages: 4,
    icon: "package-check",
  },
];

export type CatalogProduct = {
  categorySlug: string;
  slug: string;
  title: string;
  label: string;
  description: string;
  pages: number;
  image: string;
  href: string;
};

export const catalogProducts: CatalogProduct[] = [
  {
    categorySlug: "cadera",
    slug: "cotilo-doble",
    title: "Cotilo doble",
    label: "Cotilo",
    description:
      "Opciones de cotilo para artroplastia de cadera, con foco en estabilidad, disponibilidad de medidas y coordinación de instrumental.",
    pages: 8,
    image: categoryImages.cadera,
    href: "/catalogos/cadera/productos/cotilo-doble",
  },
  {
    categorySlug: "cadera",
    slug: "charnley-muller",
    title: "Charnley-Müller",
    label: "Caja de instrumental",
    description:
      "Instrumental asociado a sistemas Charnley-Müller para procedimientos de cadera y recambios planificados.",
    pages: 10,
    image: images.productos,
    href: "/catalogos/cadera/productos/charnley-muller",
  },
  {
    categorySlug: "cadera",
    slug: "thompson",
    title: "Thompson",
    label: "Caja de instrumental",
    description:
      "Caja de instrumental Thompson para resolver preparación, prueba y asistencia intraoperatoria en procedimientos de cadera.",
    pages: 8,
    image: images.hero,
    href: "/catalogos/cadera/productos/thompson",
  },
  {
    categorySlug: "cadera",
    slug: "judett-plus",
    title: "Judett Plus",
    label: "Caja de instrumental",
    description:
      "Instrumental Judett Plus orientado a equipos que requieren organización clara de componentes y disponibilidad por cirugía.",
    pages: 8,
    image: images.productos,
    href: "/catalogos/cadera/productos/judett-plus",
  },
  {
    categorySlug: "cadera",
    slug: "cadera-xl",
    title: "Cadera XL",
    label: "Espaciadores de cadera",
    description:
      "Espaciadores de cadera para planificación y soporte en procedimientos que requieren alternativas temporales o de revisión.",
    pages: 6,
    image: images.heroAmis,
    href: "/catalogos/cadera/productos/cadera-xl",
  },
  {
    categorySlug: "cadera",
    slug: "explant",
    title: "Explant",
    label: "Caja de instrumental",
    description:
      "Caja de instrumental Explant para extracción, recambio y asistencia técnica en escenarios de mayor complejidad.",
    pages: 9,
    image: images.heroBg,
    href: "/catalogos/cadera/productos/explant",
  },
  {
    categorySlug: "cadera",
    slug: "giliberty",
    title: "Giliberty",
    label: "Caja de instrumental",
    description:
      "Instrumental Giliberty para acompañar procedimientos de cadera con componentes identificables y flujo de trabajo ordenado.",
    pages: 8,
    image: categoryImages.cadera,
    href: "/catalogos/cadera/productos/giliberty",
  },
  {
    categorySlug: "cadera",
    slug: "refuerzo-acetabular",
    title: "Refuerzo acetabular",
    label: "Caja de instrumental",
    description:
      "Opciones de refuerzo acetabular para casos que requieren soporte adicional, planificación de medidas y coordinación previa.",
    pages: 7,
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/cadera/productos/refuerzo-acetabular",
  },
  {
    categorySlug: "cadera",
    slug: "endoprotesis-modular-cadera",
    title: "Endoprótesis modular de cadera",
    label: "Endoprótesis modular",
    description:
      "Sistema modular para reconstrucción y reemplazo de cadera en procedimientos que exigen configuración por necesidad quirúrgica.",
    pages: 9,
    image: images.heroAmis,
    href: "/catalogos/cadera/productos/endoprotesis-modular-cadera",
  },
  {
    categorySlug: "cadera",
    slug: "hip-lock",
    title: "Hip-Lock",
    label: "Cúpula no cementada",
    description:
      "Cúpula no cementada Hip-Lock con información de referencia para selección, medidas disponibles y componentes asociados.",
    pages: 8,
    image: categoryImages.cadera,
    href: "/catalogos/cadera/productos/hip-lock",
  },
  {
    categorySlug: "cadera",
    slug: "monoblock",
    title: "Monoblock",
    label: "Caja de instrumental",
    description:
      "Instrumental Monoblock para preparación y asistencia en procedimientos de cadera con necesidades de caja específica.",
    pages: 7,
    image: images.hero,
    href: "/catalogos/cadera/productos/monoblock",
  },
  {
    categorySlug: "cadera",
    slug: "cadera-no-cementada-hip-lock",
    title: "Cadera no cementada Hip-Lock",
    label: "Prótesis para reemplazo total de cadera",
    description:
      "Línea no cementada Hip-Lock para reemplazo total de cadera, con referencias para planificación y consulta comercial.",
    pages: 10,
    image: images.heroAmis,
    href: "/catalogos/cadera/productos/cadera-no-cementada-hip-lock",
  },
  {
    categorySlug: "cadera",
    slug: "tallo-spotorno",
    title: "Tallo Spotorno",
    label: "Tallo",
    description:
      "Tallo Spotorno para procedimientos de cadera, con descripción técnica inicial y acceso al PDF de referencia.",
    pages: 6,
    image: categoryImages.cadera,
    href: "/catalogos/cadera/productos/tallo-spotorno",
  },
  {
    categorySlug: "cadera",
    slug: "tallo-sp",
    title: "Tallo SP",
    label: "Tallo no cementado",
    description:
      "Tallo SP no cementado con información organizada para consulta de características, medidas y coordinación de pedidos.",
    pages: 6,
    image: images.heroAmis,
    href: "/catalogos/cadera/productos/tallo-sp",
  },
  {
    categorySlug: "cadera",
    slug: "tallo-delta",
    title: "Tallo delta",
    label: "Tallo no cementado",
    description:
      "Tallo delta para reemplazo de cadera no cementado, con acceso rápido al PDF y detalle de uso comercial inicial.",
    pages: 6,
    image: images.productos,
    href: "/catalogos/cadera/productos/tallo-delta",
  },
];

export const featuredCatalogSlugs = [
  "cadera",
  "rodilla",
  "columna",
  "maxilofacial",
  "osteosintesis-placas",
  "osteosintesis-tornillos",
] as const;

export const featuredCategories = featuredCatalogSlugs
  .map((slug) => categories.find((category) => category.slug === slug))
  .filter((category): category is Category => Boolean(category));

export type GalleryCategory = "Productos" | "Instrumental" | "Eventos" | "Quirófano";

export type GalleryItem = {
  id: string;
  category: GalleryCategory;
  thumb: string;
  full: string;
  alt: string;
};

export const galleryFilters = ["Productos", "Instrumental", "Quirófano", "Eventos"] as const;

export const GALLERY_PAGE_SIZE = 12;

const galleryPool: { category: GalleryCategory; image: string; alt: string }[] = [
  { category: "Productos", image: images.productos, alt: "Placas y tornillos de osteosíntesis" },
  { category: "Productos", image: categoryImages.cadera, alt: "Prótesis de cadera" },
  { category: "Productos", image: categoryImages.rodilla, alt: "Prótesis de rodilla" },
  { category: "Productos", image: categoryImages.columna, alt: "Sistema de fijación de columna" },
  { category: "Productos", image: categoryImages.maxilofacial, alt: "Placas maxilofaciales" },
  { category: "Productos", image: categoryImages["osteosintesis-placas"], alt: "Placas de osteosíntesis" },
  { category: "Productos", image: categoryImages["osteosintesis-tornillos"], alt: "Tornillos de osteosíntesis" },
  { category: "Instrumental", image: categoryImages["instrumental-quirurgico"], alt: "Caja de instrumental quirúrgico" },
  { category: "Instrumental", image: images.hero, alt: "Instrumental traumatológico" },
  { category: "Instrumental", image: categoryImages["otros-productos"], alt: "Insumos y descartables" },
  { category: "Quirófano", image: images.quirofano, alt: "Quirófano equipado para cirugía" },
  { category: "Eventos", image: images.evento, alt: "Jornada con profesionales de la región" },
];

export const gallery: GalleryItem[] = Array.from({ length: 24 }, (_, index) => {
  const base = galleryPool[index % galleryPool.length];
  return {
    id: `g${index + 1}`,
    category: base.category,
    thumb: base.image,
    full: base.image,
    alt: base.alt,
  };
});

export type VideoItem = {
  id: string;
  category: GalleryCategory | "Capacitaciones";
  poster: string;
  src: string;
  title: string;
};

export const videos: VideoItem[] = [];

export const professionalBlocks = [
  {
    icon: "calendar-clock",
    title: "Pedidos programados",
    text: "Coordinación de implantes e instrumental para cirugías programadas.",
  },
  {
    icon: "building-2",
    title: "Clínicas y sanatorios",
    text: "Atención a instituciones de salud de Resistencia y la región.",
  },
  {
    icon: "wrench",
    title: "Instrumental para quirófano",
    text: "Cajas e instrumental específico por sistema de implantes.",
  },
  {
    icon: "briefcase",
    title: "Coordinación comercial",
    text: "Disponibilidad, reposición y seguimiento de requerimientos.",
  },
] as const;
