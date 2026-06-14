import heroAsset from "@/assets/hero.jpg.asset.json";
import quirofanoAsset from "@/assets/quirofano.jpg.asset.json";
import eventoAsset from "@/assets/evento.jpg.asset.json";
import productosAsset from "@/assets/productos.jpg.asset.json";
import logoAsset from "@/assets/logo.png.asset.json";
import logoCircularAsset from "@/assets/logo-circular.png.asset.json";
import bannerMarcaAsset from "@/assets/banner-marca.jpg.asset.json";
import heroBgAsset from "@/assets/hero-instrumental.jpg.asset.json";
import heroMobileAsset from "@/assets/hero-mobile.jpg.asset.json";

import catCadera from "@/assets/cat-cadera.jpg";
import catRodilla from "@/assets/cat-rodilla.jpg";
import catColumna from "@/assets/cat-columna.jpg";
import catMaxilofacial from "@/assets/cat-maxilofacial.jpg";
import catPlacas from "@/assets/cat-osteosintesis-placas.jpg";
import catTornillos from "@/assets/cat-osteosintesis-tornillos.jpg";
import catInstrumental from "@/assets/cat-instrumental-quirurgico.jpg";
import catOtros from "@/assets/cat-otros-productos.jpg";

export const images = {
  hero: heroAsset.url,
  /** Imagen de fondo del hero (apaisada, foco a la derecha). */
  heroBg: heroBgAsset.url,
  /** Imagen de fondo del hero para mobile (vertical). */
  heroMobile: heroMobileAsset.url,
  quirofano: quirofanoAsset.url,
  evento: eventoAsset.url,
  productos: productosAsset.url,
  logo: logoAsset.url,
  logoCircular: logoCircularAsset.url,
  bannerMarca: bannerMarcaAsset.url,
};

/** Imagen de fondo por categoría de catálogo. */
export const categoryImages: Record<string, string> = {
  cadera: catCadera,
  rodilla: catRodilla,
  columna: catColumna,
  maxilofacial: catMaxilofacial,
  "osteosintesis-placas": catPlacas,
  "osteosintesis-tornillos": catTornillos,
  "instrumental-quirurgico": catInstrumental,
  "otros-productos": catOtros,
};

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
  hours: "Lunes a viernes, 8:30 a 12:30h y de 16:30 a 22:30",
};

/** Build a wa.me link with an optional prefilled message. */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const nav = [
  { label: "Inicio", to: "/" },
  { label: "Catálogos", to: "/catalogos" },
  { label: "Galería", to: "/galeria" },
  { label: "Eventos", to: "/eventos" },
  { label: "Nosotros", to: "/nosotros" },
  { label: "Contacto", to: "/contacto" },
] as const;

export type Category = {
  slug: string;
  title: string;
  type: string;
  tag: string;
  description: string;
  pages: number;
};

export const categories: Category[] = [
  {
    slug: "cadera",
    title: "Cadera",
    type: "Prótesis e implantes",
    tag: "Artroplastia",
    description: "Prótesis de cadera primarias y de revisión, vástagos y cotilos nacionales e importados.",
    pages: 6,
  },
  {
    slug: "rodilla",
    title: "Rodilla",
    type: "Prótesis e implantes",
    tag: "Artroplastia",
    description: "Prótesis total y parcial, componentes femorales, tibiales y de polietileno.",
    pages: 6,
  },
  {
    slug: "columna",
    title: "Columna",
    type: "Sistemas de fijación",
    tag: "Fijación",
    description: "Fijación espinal, tornillos pediculares, barras y conectores.",
    pages: 5,
  },
  {
    slug: "maxilofacial",
    title: "Maxilofacial",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description: "Placas y tornillos de bajo perfil para fijación maxilofacial.",
    pages: 4,
  },
  {
    slug: "osteosintesis-placas",
    title: "Osteosíntesis: placas",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description: "Placas anatómicas y de compresión para traumatología.",
    pages: 7,
  },
  {
    slug: "osteosintesis-tornillos",
    title: "Osteosíntesis: tornillos",
    type: "Osteosíntesis",
    tag: "Osteosíntesis",
    description: "Tornillos corticales, esponjosos y canulados en distintas medidas.",
    pages: 5,
  },
  {
    slug: "instrumental-quirurgico",
    title: "Instrumental quirúrgico",
    type: "Instrumental",
    tag: "Instrumental",
    description: "Cajas e instrumental específico por sistema y procedimiento.",
    pages: 8,
  },
  {
    slug: "otros-productos",
    title: "Otros productos traumatológicos",
    type: "Productos varios",
    tag: "Insumos",
    description: "Insumos, descartables y productos complementarios.",
    pages: 4,
  },
];

export type GalleryCategory =
  | "Productos"
  | "Instrumental"
  | "Quirófano"
  | "Eventos";

export type GalleryItem = {
  id: string;
  category: GalleryCategory;
  /** Miniatura liviana para la grilla (lazy). */
  thumb: string;
  /** Imagen grande, sólo se carga al abrir el lightbox. */
  full: string;
  alt: string;
};

export const galleryFilters = ["Productos", "Instrumental", "Quirófano", "Eventos"] as const;

/** Cuántas imágenes mostrar antes del botón "Cargar más". */
export const GALLERY_PAGE_SIZE = 12;

// Pool base de imágenes disponibles. Cuando el cliente cargue su material real
// (200+ fotos), basta con reemplazar/ampliar este arreglo: la grilla pagina,
// hace lazy-load y abre la imagen grande sólo en el lightbox.
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

// Genera un set demostrativo paginable. Reemplazable por material real.
export const gallery: GalleryItem[] = Array.from({ length: 24 }, (_, i) => {
  const base = galleryPool[i % galleryPool.length];
  return {
    id: `g${i + 1}`,
    category: base.category,
    thumb: base.image,
    full: base.image,
    alt: base.alt,
  };
});

export type VideoItem = {
  id: string;
  category: GalleryCategory | "Capacitaciones";
  /** Póster liviano (no carga el video hasta reproducir). */
  poster: string;
  /** URL del video; vacío = aún sin material. */
  src: string;
  title: string;
};

/** Videos institucionales. preload="none" + carga al reproducir. */
export const videos: VideoItem[] = [];


export type EventItem = {
  id: string;
  date: string;
  title: string;
  place: string;
  description: string;
};

/** Próximos eventos / capacitaciones. Vacío = sin actividades publicadas. */
export const events: EventItem[] = [];
