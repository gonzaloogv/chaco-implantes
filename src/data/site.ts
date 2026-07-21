const CLOUDINARY_BASE = "https://res.cloudinary.com/dz9tuwczf/image/upload";

// Fondos a pantalla completa / media pantalla
const HERO_TRANSFORM = "f_auto,q_auto,c_limit,w_1920";
// Fotos de categoría usadas en cards y heros de catálogo
const CATEGORY_TRANSFORM = "f_auto,q_auto,c_limit,w_1600";
// Logos del header (≤120px) y footer (40px)
const LOGO_HEADER_TRANSFORM = "f_auto,q_auto,w_256";
const LOGO_FOOTER_TRANSFORM = "f_auto,q_auto,w_128";

export const images = {
  hero: "/assets/images/hero.jpg",
  heroBg: "/assets/images/hero-instrumental.JPG",
  heroNextAR: `${CLOUDINARY_BASE}/${HERO_TRANSFORM}/v1781474473/nextar-hero_pdfhha.png`,
  heroAmis: `${CLOUDINARY_BASE}/${HERO_TRANSFORM}/v1781474563/amis-hero_snoht3.png`,
  heroEventos: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_Optimization/foto-evento_d0eg2f.jpg",
  quirofano: "/assets/images/quirofano.jpg",
  congreso: "/assets/images/congreso-traumatologia-2024.JPG",
  productos: "/assets/images/productos.jpg",
  logoCircular: `${CLOUDINARY_BASE}/${LOGO_FOOTER_TRANSFORM}/v1784636792/logo-circular_ybzerb.png`,
  logoCircularWhite: `${CLOUDINARY_BASE}/${LOGO_HEADER_TRANSFORM}/v1784636793/logo-circular-white_saci0q.png`,
  ogImage: "/assets/brand/og-image.jpg",
} as const;

export const categoryImages = {
  cadera: `${CLOUDINARY_BASE}/${CATEGORY_TRANSFORM}/v1784637756/cat-cadera_gql4el.png`,
  rodilla: `${CLOUDINARY_BASE}/${CATEGORY_TRANSFORM}/v1784637759/cat-rodilla_in1fhx.png`,
  columna: `${CLOUDINARY_BASE}/${CATEGORY_TRANSFORM}/v1784637757/cat-columna_eezmaq.png`,
  maxilofacial: `${CLOUDINARY_BASE}/${CATEGORY_TRANSFORM}/v1784637757/cat-maxilofacial_xdiyvh.png`,
  "osteosintesis-placas": `${CLOUDINARY_BASE}/${CATEGORY_TRANSFORM}/v1784637758/cat-osteosintesis-placas_qllsio.png`,
  "osteosintesis-tornillos": `${CLOUDINARY_BASE}/${CATEGORY_TRANSFORM}/v1784637758/cat-osteosintesis-tornillos_ryg1l4.png`,
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
    logo: `${CLOUDINARY_BASE}/f_auto,q_auto,w_600/v1784641411/Gemini_Generated_Image_13dauo13dauo13da-Photoroom_edbvnf.png`,
    logoAlt: "Logo de Medacta International",
    logoWidth: 2400,
    logoHeight: 1256,
    logoClass: "supplier-logo-mark",
  },
  {
    name: "BONSS",
    href: "https://es.bonss.com.cn/",
    logo: "/assets/brands/bonss-medical-brand-color.png",
    logoAlt: "Logo de BONSS Medical",
    logoWidth: 900,
    logoHeight: 258,
    logoClass: "supplier-logo-wide",
  },
  {
    name: "Implantes Villalba",
    href: "https://implantesvillalba.com.ar/",
    logo: `${CLOUDINARY_BASE}/f_auto,q_auto,w_600/v1784641387/Implantes_Villalba_sjvhr7.png`,
    logoAlt: "Logo de Implantes Villalba",
    logoWidth: 1787,
    logoHeight: 780,
    logoClass: "supplier-logo-tall",
  },
  {
    name: "RosMedical",
    href: "https://ros-medical.com/",
    logo: "/assets/brands/ross-medical-brand-color.png",
    logoAlt: "Logo de RosMedical",
    logoWidth: 900,
    logoHeight: 210,
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
    slug: "columna",
    title: "Columna",
    type: "Sistemas de fijación",
    tag: "Fijación",
    description: "Fijación espinal, tornillos pediculares, barras y conectores.",
    icon: "layers",
  },
  {
    slug: "maxilofacial",
    title: "Maxilofacial",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description: "Placas y tornillos de bajo perfil para fijación maxilofacial.",
    icon: "shield-check",
  },
  {
    slug: "osteosintesis-placas",
    title: "Osteosíntesis: placas",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description: "Placas anatómicas y de compresión para traumatología.",
    icon: "shield-check",
  },
  {
    slug: "osteosintesis-tornillos",
    title: "Osteosíntesis: tornillos",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description: "Tornillos corticales, esponjosos y canulados en distintas medidas.",
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

export const catalogProducts: CatalogProduct[] = [
  {
    categorySlug: "cadera",
    slug: "cotilo-doble",
    title: "Cotilo doble",
    label: "Cotilo",
    description:
      "Opciones de cotilo para artroplastia de cadera, con foco en estabilidad, disponibilidad de medidas y coordinación de instrumental.",
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
    image: images.productos,
    href: "/catalogos/cadera/productos/tallo-delta",
  },
  {
    categorySlug: "rodilla",
    slug: "rodilla-anv-ii",
    title: "Rodilla ANV II",
    label: "Caja de instrumental",
    description:
      "Sistema de rodilla ANV II para artroplastia, con instrumental asociado y referencias para planificación, medidas y coordinación comercial.",
    image: categoryImages.rodilla,
    href: "/catalogos/rodilla/productos/rodilla-anv-ii",
  },
  {
    categorySlug: "rodilla",
    slug: "suplementos-anv-ii",
    title: "Suplementos ANV II",
    label: "Caja de instrumental",
    description:
      "Suplementos para rodilla ANV II orientados a complementar la línea principal con componentes e instrumental de apoyo por procedimiento.",
    image: images.productos,
    href: "/catalogos/rodilla/productos/suplementos-anv-ii",
  },
  {
    categorySlug: "rodilla",
    slug: "rodilla-mf",
    title: "Rodilla MF",
    label: "Caja de instrumental",
    description:
      "Sistema de rodilla MF abisagrada para casos que requieren mayor estabilidad, con instrumental y referencias para consulta técnica-comercial.",
    image: categoryImages.rodilla,
    href: "/catalogos/rodilla/productos/rodilla-mf",
  },
  {
    categorySlug: "rodilla",
    slug: "rodilla-modular",
    title: "Rodilla Modular",
    label: "Caja de instrumental",
    description:
      "Sistema de rodilla modular para procedimientos de reemplazo y revisión, con opciones de configuración y coordinación de instrumental.",
    image: images.productos,
    href: "/catalogos/rodilla/productos/rodilla-modular",
  },
  {
    categorySlug: "osteosintesis-tornillos",
    slug: "de-tobillo",
    title: "De tobillo",
    label: "Clavo para artrodesis",
    description:
      "Clavo para artrodesis de tobillo, con referencias para planificación, disponibilidad de medidas y coordinación del instrumental.",
    image: categoryImages["osteosintesis-tornillos"],
    href: "/catalogos/osteosintesis-tornillos/productos/de-tobillo",
  },
  {
    categorySlug: "osteosintesis-tornillos",
    slug: "multidireccional",
    title: "Multidireccional",
    label: "Clavo de tibia",
    description:
      "Clavo de tibia multidireccional para osteosíntesis, con información de sistema, opciones de bloqueo y consulta técnico-comercial.",
    image: categoryImages["osteosintesis-tornillos"],
    href: "/catalogos/osteosintesis-tornillos/productos/multidireccional",
  },
  {
    categorySlug: "osteosintesis-tornillos",
    slug: "retrogrado",
    title: "Retrógrado",
    label: "Clavo de fémur",
    description:
      "Clavo de fémur retrógrado para fracturas femorales seleccionadas, con instrumental asociado y referencias para planificación.",
    image: categoryImages["osteosintesis-tornillos"],
    href: "/catalogos/osteosintesis-tornillos/productos/retrogrado",
  },
  {
    categorySlug: "osteosintesis-tornillos",
    slug: "gamma-gn",
    title: "Gamma GN",
    label: "Clavo de fémur",
    description:
      "Clavo de fémur Gamma GN para osteosíntesis proximal, con componentes e instrumental para coordinar disponibilidad por procedimiento.",
    image: images.productos,
    href: "/catalogos/osteosintesis-tornillos/productos/gamma-gn",
  },
  {
    categorySlug: "osteosintesis-tornillos",
    slug: "clavo-acerrojado-de-humero",
    title: "Clavo acerrojado de húmero",
    label: "Caja de instrumental",
    description:
      "Caja de instrumental para clavo acerrojado de húmero, orientada a procedimientos de osteosíntesis con soporte de medidas y componentes.",
    image: categoryImages["osteosintesis-tornillos"],
    href: "/catalogos/osteosintesis-tornillos/productos/clavo-acerrojado-de-humero",
  },
  {
    categorySlug: "osteosintesis-tornillos",
    slug: "clavo-placa-tubo-deslizante-richard",
    title: "Clavo placa tubo deslizante (Richard)",
    label: "Caja de instrumental",
    description:
      "Caja de instrumental para clavo placa tubo deslizante Richard, con referencias para planificación y coordinación comercial.",
    image: images.productos,
    href: "/catalogos/osteosintesis-tornillos/productos/clavo-placa-tubo-deslizante-richard",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "placa-bloqueada-35mm",
    title: "Ø3,5mm",
    label: "Placa bloqueada",
    description:
      "Placa bloqueada de Ø3,5 mm para osteosíntesis, con referencias para planificación, medidas disponibles y coordinación de instrumental.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/placa-bloqueada-35mm",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "placa-bloqueada-45mm",
    title: "Ø4,5mm",
    label: "Placa bloqueada",
    description:
      "Placa bloqueada de Ø4,5 mm para fijación de mayor demanda, con opciones de medidas e instrumental asociado.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/placa-bloqueada-45mm",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "clavicula",
    title: "Clavícula",
    label: "Placa",
    description:
      "Placa para clavícula orientada a fijación anatómica, con referencias de sistema para consulta técnica y disponibilidad.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/clavicula",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "tibia-proximal",
    title: "Proximal",
    label: "Placa tibia",
    description:
      "Placa tibial proximal para osteosíntesis, con información de medidas, configuración y coordinación comercial.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/tibia-proximal",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "humero-distal",
    title: "Húmero distal",
    label: "Placa",
    description:
      "Placa de húmero distal para fijación anatómica, con instrumental asociado y referencias para planificación del procedimiento.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/humero-distal",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "tibia-perone-distal",
    title: "Distal",
    label: "Placa para tibia/peroné",
    description:
      "Placa distal para tibia y peroné, con opciones para fijación y acompañamiento en selección de medidas.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/tibia-perone-distal",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "philo",
    title: "Philo",
    label: "Placa húmero proximal",
    description:
      "Placa Philo para húmero proximal, con referencias de sistema, medidas y soporte para coordinación de instrumental.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/philo",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "calcaneo",
    title: "Calcáneo",
    label: "Placa",
    description:
      "Placa para calcáneo destinada a fijación de fracturas seleccionadas, con información de componentes e instrumental.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/calcaneo",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "volar",
    title: "Volar",
    label: "Placa",
    description:
      "Placa volar para fijación distal, con referencias de medidas y consulta comercial para disponibilidad del sistema.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/volar",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "volar-poliaxial",
    title: "Volar poliaxial",
    label: "Placa",
    description:
      "Placa volar poliaxial para fijación con opciones de orientación, medidas e instrumental por procedimiento.",
    image: images.productos,
    href: "/catalogos/osteosintesis-placas/productos/volar-poliaxial",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "femur-distal",
    title: "Distal",
    label: "Placa de fémur",
    description:
      "Placa de fémur distal para osteosíntesis, con referencias de configuración, medidas y coordinación técnica-comercial.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/femur-distal",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "femur-gancho",
    title: "Gancho",
    label: "Placa para fémur tipo",
    description:
      "Placa para fémur tipo gancho, con información de sistema y disponibilidad para planificación quirúrgica.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/femur-gancho",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "cervical",
    title: "Cervical",
    label: "Placa",
    description:
      "Placa cervical para sistemas de fijación, con referencias de medidas, componentes e instrumental asociado.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/cervical",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "tornillos-canulados-35-45mm",
    title: "Ø3,5 y Ø4,5mm",
    label: "Tornillos canulados",
    description:
      "Tornillos canulados de Ø3,5 y Ø4,5 mm para fijación, con referencias de medidas y coordinación de disponibilidad.",
    image: images.productos,
    href: "/catalogos/osteosintesis-placas/productos/tornillos-canulados-35-45mm",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "minifragmentos-15-20mm",
    title: "Ø1,5mm y Ø2,0mm",
    label: "Minifragmentos",
    description:
      "Minifragmentos bloqueados de titanio de Ø1,5 y Ø2,0 mm, con instrumental y referencias para sistemas pequeños.",
    image: images.hero,
    href: "/catalogos/osteosintesis-placas/productos/minifragmentos-15-20mm",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "tornillos-canulados-27mm",
    title: "Ø2,7mm",
    label: "Tornillos canulados",
    description:
      "Tornillos canulados de Ø2,7 mm para fijación, con información de referencias y soporte para consulta comercial.",
    image: images.productos,
    href: "/catalogos/osteosintesis-placas/productos/tornillos-canulados-27mm",
  },
  {
    categorySlug: "osteosintesis-placas",
    slug: "herbert-barouk",
    title: "Herbert-Barouk",
    label: "Tornillos",
    description:
      "Tornillos Herbert-Barouk para fijación específica, con referencias de medidas y coordinación de instrumental según necesidad.",
    image: categoryImages["osteosintesis-placas"],
    href: "/catalogos/osteosintesis-placas/productos/herbert-barouk",
  },
  {
    categorySlug: "otros-productos",
    slug: "perforador-sierra",
    title: "Perforador y Sierra",
    label: "Motor Overfix",
    description:
      "Motor Overfix para perforación y sierra, con referencias de uso, componentes y coordinación de disponibilidad para quirófano.",
    image: categoryImages["otros-productos"],
    href: "/catalogos/otros-productos/productos/perforador-sierra",
  },
  {
    categorySlug: "otros-productos",
    slug: "universal",
    title: "Universal",
    label: "Sistema de extracción",
    description:
      "Sistema de extracción universal con instrumental organizado para procedimientos que requieren retiro, recambio o asistencia técnica.",
    image: categoryImages["instrumental-quirurgico"],
    href: "/catalogos/otros-productos/productos/universal",
  },
  {
    categorySlug: "otros-productos",
    slug: "emergencia",
    title: "Emergencia",
    label: "Caja de instrumental",
    description:
      "Caja de instrumental de emergencia para resolver requerimientos complementarios en quirófano con disponibilidad y coordinación previa.",
    image: categoryImages["instrumental-quirurgico"],
    href: "/catalogos/otros-productos/productos/emergencia",
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

// Último evento institucional destacado — compartido entre la home y la página Eventos
export const featuredEvent = {
  badge: "Noviembre 2024",
  title: "61° Congreso Argentino de Ortopedia y Traumatología",
  venue: "Hotel Hilton, Buenos Aires",
  description:
    "Participamos del 61° Congreso Argentino de Ortopedia y Traumatología, un encuentro dedicado a la innovación y la medicina personalizada para mejorar el bienestar de los pacientes. Junto a destacados expositores y referentes del rubro, compartimos los productos y el servicio de calidad que ofrecemos.",
  image: images.congreso,
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
];

const eventGalleryPool: { category: GalleryCategory; image: string; alt: string }[] = eventGalleryImages.map((image) => ({
  category: "Eventos",
  image,
  alt: EVENT_GALLERY_TITLE,
}));

export const gallery: GalleryItem[] = [...galleryPool, ...eventGalleryPool].map((base) => {
  return {
    category: base.category,
    thumb: cloudinaryVariant(base.image, GALLERY_THUMB_TRANSFORM),
    full: cloudinaryVariant(base.image, GALLERY_FULL_TRANSFORM),
    alt: base.alt,
  };
});

export type VideoItem = {
  id: string;
  category: GalleryCategory;
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
