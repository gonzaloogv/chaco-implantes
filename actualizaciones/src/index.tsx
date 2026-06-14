import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageCircle,
  Images,
  PlayCircle,
  Bone,
  Wrench,
  ShieldCheck,
  ClipboardList,
  Handshake,
  Boxes,
  Building2,
  CalendarClock,
  MapPin,
  Briefcase,
} from "lucide-react";
import { site, images, categories, categoryImages, whatsappLink } from "@/lib/site";
import congresoAsset from "@/assets/congreso-traumatologia-2024.jpg.asset.json";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chaco Implantes — Prótesis, implantes e instrumental" },
      {
        name: "description",
        content:
          "Distribución de prótesis, implantes e instrumental traumatológico en Resistencia, Chaco. Atención a profesionales e instituciones de salud.",
      },
      { property: "og:title", content: "Chaco Implantes" },
      {
        property: "og:description",
        content: "Prótesis, implantes e instrumental para traumatología.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});


// Flujo profesional / comercial — microcopy concreto, sin párrafos.
const flow = [
  { icon: ClipboardList, title: "Consulta por línea" },
  { icon: Handshake, title: "Coordinación comercial" },
  { icon: Boxes, title: "Disponibilidad y stock" },
  { icon: Building2, title: "Atención institucional" },
];

// Profesionales e instituciones — bloques de servicio.
const profBlocks = [
  {
    icon: CalendarClock,
    title: "Pedidos programados",
    text: "Coordinación de implantes e instrumental para cirugías programadas.",
  },
  {
    icon: Building2,
    title: "Clínicas y sanatorios",
    text: "Atención a instituciones de salud de Resistencia y la región.",
  },
  {
    icon: Wrench,
    title: "Instrumental para quirófano",
    text: "Cajas e instrumental específico por sistema de implantes.",
  },
  {
    icon: Briefcase,
    title: "Coordinación comercial",
    text: "Disponibilidad, reposición y seguimiento de requerimientos.",
  },
];



// Líneas principales del catálogo por especialidad.
const catalogSlugs = [
  "cadera",
  "rodilla",
  "columna",
  "maxilofacial",
  "osteosintesis-placas",
  "osteosintesis-tornillos",
];
const catalogLines = catalogSlugs
  .map((slug) => categories.find((c) => c.slug === slug))
  .filter((c): c is NonNullable<typeof c> => Boolean(c));

function Home() {
  return (
    <>
      {/* Hero — imagen de fondo con degradado lateral */}
      <section className="relative overflow-hidden border-b border-border bg-surface-2/45">
        {/* Imagen de fondo desktop: apaisada, foco hacia la derecha */}
        <img
          src={images.heroBg}
          alt="Instrumental quirúrgico e implantes traumatológicos"
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover object-right lg:block"
        />
        {/* Imagen de fondo mobile: vertical, foco hacia la derecha */}
        <img
          src={images.heroMobile}
          alt="Instrumental quirúrgico e implantes traumatológicos"
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_top] lg:hidden"
        />
        {/* Overlay desktop: sólido a la izquierda → transparente a la derecha (texto protagonista) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-surface-2 from-30% via-surface-2/80 to-transparent lg:block"
        />
        {/* Overlay mobile: velo más fuerte para legibilidad en pantalla angosta */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-2 via-surface-2/92 to-surface-2/70 lg:hidden"
        />
        {/* Soft brand medallion inspired by the circular logo */}
        <div
          aria-hidden
          className="brand-medallion pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full opacity-40"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-24 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-28 lg:pt-28 lg:px-8">
          <div className="duration-500 animate-in fade-in slide-in-from-bottom-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-px w-6 bg-brand" />
              Traumatología
            </span>
            <p className="mt-3 font-accent text-xl text-deep">{site.tagline}</p>
            <h1 className="mt-5 font-display text-3xl font-bold leading-[1.12] text-deep sm:text-4xl lg:text-5xl">
              Prótesis, implantes e instrumental para traumatología
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Distribución y coordinación comercial para profesionales e instituciones de salud.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/catalogos"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,background-color] duration-200 ease-out hover:bg-deep active:scale-[0.97] sm:w-auto"
              >
                Ver catálogos <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappLink("Hola, quisiera contactarme con Chaco Implantes.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out active:scale-[0.97] sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" /> Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Franja de especialidades — transición institucional */}
      <section className="bg-[#31487A]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {[
              { icon: Bone, label: "Prótesis e implantes" },
              { icon: Wrench, label: "Instrumental quirúrgico" },
              { icon: ShieldCheck, label: "Osteosíntesis" },
              { icon: MapPin, label: "Resistencia, Chaco" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 sm:gap-3">
                <item.icon className="h-4 w-4 shrink-0 text-white/80 sm:hidden" />
                <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 sm:flex">
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/90 sm:text-sm">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo por especialidad — eje principal del sitio */}
      <section className="border-b border-border bg-surface-2/45">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <span className="h-px w-6 bg-brand" />
                Catálogo por especialidad
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold text-deep sm:text-3xl">
                Líneas de productos
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Prótesis, implantes e instrumental organizados por especialidad.
              </p>
            </div>
            <Link
              to="/catalogos"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors duration-200 ease-out hover:text-deep"
            >
              Ver todos los catálogos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalogLines.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 3) * 80} className="h-full">
                <Link
                  to="/catalogos/$categoria"
                  params={{ categoria: c.slug }}
                  className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-xl border border-border bg-deep transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)] active:scale-[0.98]"
                >
                  <img
                    src={categoryImages[c.slug]}
                    alt={c.title}
                    loading="lazy"
                    decoding="async"
                    width={1024}
                    height={768}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-deep via-deep/55 to-deep/5"
                  />
                  <div className="relative p-5">
                    <span className="inline-block rounded border border-white/25 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                      {c.tag}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-semibold text-white">{c.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/75">
                      {c.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                      Ver catálogo
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* Flujo profesional / comercial */}
      <section className="bg-deep">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
            {flow.map((f, i) => (
              <Reveal
                key={f.title}
                delay={i * 70}
                className={`flex items-center gap-3 border-white/10 px-4 py-3 lg:flex-col lg:items-center lg:gap-2 lg:px-6 lg:border-0 ${
                  i % 2 === 0 ? "border-r" : ""
                } ${i < 2 ? "border-b" : ""}`}
              >
                <f.icon className="h-5 w-5 shrink-0 text-white lg:h-6 lg:w-6" />
                <p className="text-sm font-medium leading-tight text-white/75 lg:text-center lg:text-white/65">{f.title}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* Profesionales e instituciones */}
      <section id="profesionales" className="scroll-mt-20 border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-px w-6 bg-brand" />
              Profesionales e instituciones
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-deep sm:text-3xl">
              Trabajamos con traumatólogos, cirujanos, clínicas y sanatorios
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {profBlocks.map((b, i) => (
              <Reveal
                key={b.title}
                delay={(i % 2) * 60}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_4px_16px_-10px_rgba(15,23,42,0.2)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary ring-1 ring-border">
                  <b.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-deep">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start gap-4 rounded-lg border border-border bg-secondary/40 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-deep">
                Coordinación para instituciones
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Escribinos para coordinar el suministro de prótesis, implantes e instrumental.
              </p>
            </div>
            <a
              href={whatsappLink("Hola, quisiera solicitar contacto institucional con Chaco Implantes.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-200 ease-out hover:bg-deep active:scale-[0.97]"
            >
              <MessageCircle className="h-4 w-4" /> Contacto institucional
            </a>
          </div>
        </div>
      </section>

      {/* Franja divisoria — clínicas y sanatorios (Ink / frase centrada) */}
      <section className="bg-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-14 lg:px-8">
          <Reveal>
            <span className="mx-auto block h-px w-10 bg-brand" />
            <p className="mt-5 font-display text-lg font-medium leading-snug text-white/90 sm:text-2xl">
              Acompañamos a clínicas y sanatorios con logística confiable de prótesis, implantes e instrumental.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Galería y videos — contenido destacado + CTAs */}
      <section className="border-b border-border bg-surface-2/45">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-px w-6 bg-brand" />
              Material visual
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-deep sm:text-3xl">
              Galería y videos
            </h2>
            <p className="mt-2 text-muted-foreground">
              Recorré nuestras fotos de productos e instrumental, y nuestros videos institucionales.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Link
              to="/galeria"
              className="group relative flex h-60 flex-col justify-end overflow-hidden rounded-xl border border-border bg-deep transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)]"
            >
              <img
                src={categoryImages["instrumental-quirurgico"]}
                alt="Galería de productos e instrumental"
                loading="lazy"
                decoding="async"
                width={1024}
                height={768}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-deep via-deep/55 to-deep/5" />
              <div className="relative p-6">
                <h3 className="font-display text-lg font-semibold text-white">Galería de imágenes</h3>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  <Images className="h-4 w-4" /> Ver galería
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
            <Link
              to="/videos"
              className="group relative flex h-60 flex-col justify-end overflow-hidden rounded-xl border border-border bg-deep transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)]"
            >
              <img
                src={images.quirofano}
                alt="Videos institucionales"
                loading="lazy"
                decoding="async"
                width={1024}
                height={768}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-deep via-deep/55 to-deep/5" />
              <div className="relative p-6">
                <h3 className="font-display text-lg font-semibold text-white">Videos</h3>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  <PlayCircle className="h-4 w-4" /> Ver videos
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>


      {/* CTA intermedia — Consultas comerciales y catálogos */}
      <section className="bg-[#31487A]">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
              Consultas comerciales y catálogos
            </h2>
            <p className="mt-2 text-sm text-[#D9E1F1]">
              Coordinamos pedidos, disponibilidad y requerimientos por línea de producto.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <a
              href={whatsappLink("Hola, quisiera coordinar un pedido con Chaco Implantes.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#192338] transition-[transform,box-shadow,background-color] duration-200 ease-out hover:bg-[#D9E1F1] active:scale-[0.97]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <Link
              to="/catalogos"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:border-white hover:bg-white/20 active:scale-[0.97]"
            >
              Ver catálogos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Eventos y capacitaciones — último evento + próximamente */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-px w-6 bg-brand" />
              Actividad institucional
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-deep sm:text-3xl">
              Eventos y capacitaciones
            </h2>
          </div>

          {/* Último evento destacado */}
          <Reveal className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:grid md:grid-cols-2">
            <div className="relative aspect-[16/10] md:aspect-auto">
              <img
                src={congresoAsset.url}
                alt="Equipo de Chaco Implantes en el 61° Congreso Argentino de Ortopedia y Traumatología, Hotel Hilton Buenos Aires 2024"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <span className="inline-flex w-fit items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary ring-1 ring-border">
                Noviembre 2024
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-deep">
                61° Congreso Argentino de Ortopedia y Traumatología
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" /> Hotel Hilton, Buenos Aires
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Participamos del 61° Congreso Argentino de Ortopedia y Traumatología, un encuentro
                dedicado a la innovación y la medicina personalizada para mejorar el bienestar de los
                pacientes. Junto a destacados expositores y referentes del rubro, compartimos los
                productos y el servicio de calidad que ofrecemos.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink("Hola, vi que participaron del Congreso Argentino de Ortopedia y Traumatología. Quisiera más información.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-200 ease-out hover:bg-deep active:scale-[0.97]"
                >
                  <MessageCircle className="h-4 w-4" /> Consultanos
                </a>
                <Link
                  to="/eventos"
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-secondary/40 px-5 py-2.5 text-sm font-semibold text-deep transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:bg-secondary active:scale-[0.97]"
                >
                  Ver todos los eventos <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Próximamente */}
          <Reveal className="mt-6 flex flex-col items-start gap-5 rounded-lg border border-dashed border-border bg-card px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary ring-1 ring-border">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-deep">
                  Próximamente publicaremos nuevas fechas y actividades profesionales.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Jornadas, capacitaciones para equipos de quirófano y novedades de líneas de producto.
                </p>
              </div>
            </div>
            <Link
              to="/eventos"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,background-color] duration-200 ease-out hover:bg-deep active:scale-[0.97]"
            >
              Ver eventos <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
