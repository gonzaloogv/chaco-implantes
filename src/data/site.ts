export const images = {
  hero: "/assets/images/hero.jpg",
  quirofano: "/assets/images/quirofano.jpg",
  evento: "/assets/images/evento.jpg",
  productos: "/assets/images/productos.jpg",
  logo: "/assets/brand/logo.png",
  logoCircular: "/assets/brand/logo-circular.png",
  bannerMarca: "/assets/brand/banner-marca.jpg",
} as const;

export const site = {
  name: "Chaco Implantes",
  tagline: "Al servicio de la salud",
  activity:
    "Comercialización y distribución de prótesis, implantes e instrumental traumatológico nacional e importado.",
  phoneDisplay: "0362-4571854",
  whatsappNumber: "543624571854",
  address: "Corrientes 781, Resistencia, Chaco 3500",
  instagramHandle: "@chacoimplanteok",
  instagramUrl: "https://www.instagram.com/chacoimplanteok/",
  email: "contacto@chacoimplantes.com.ar",
  baseUrl: "https://chacoimplantes.com.ar",
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const nav = [
  { label: "Inicio", href: "/" },
  { label: "Catálogos", href: "/catalogos" },
  { label: "Galería", href: "/galeria" },
  { label: "Eventos", href: "/eventos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
] as const;

export const footerNav = [
  { label: "Catálogos", href: "/catalogos" },
  { label: "Galería", href: "/galeria" },
  { label: "Eventos", href: "/eventos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
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

export type GalleryItem = {
  id: string;
  category: "Productos" | "Instrumental" | "Eventos" | "Quirófano";
  image: string;
  alt: string;
};

export const galleryFilters = ["Productos", "Instrumental", "Quirófano", "Eventos"] as const;

export const gallery: GalleryItem[] = [
  { id: "g1", category: "Productos", image: images.productos, alt: "Placas y tornillos de osteosíntesis" },
  { id: "g2", category: "Instrumental", image: images.hero, alt: "Cajas e instrumental traumatológico" },
  { id: "g3", category: "Quirófano", image: images.quirofano, alt: "Quirófano equipado para cirugía" },
  { id: "g4", category: "Eventos", image: images.evento, alt: "Jornada con profesionales de la región" },
];

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
