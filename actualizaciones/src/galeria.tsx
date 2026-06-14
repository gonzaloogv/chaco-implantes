import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { gallery, galleryFilters, GALLERY_PAGE_SIZE, type GalleryItem } from "@/lib/site";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galería — Chaco Implantes" },
      {
        name: "description",
        content:
          "Galería de productos, instrumental, quirófano y eventos de Chaco Implantes.",
      },
      { property: "og:title", content: "Galería — Chaco Implantes" },
      { property: "og:description", content: "Imágenes de productos, instrumental y actividades." },
      { property: "og:url", content: "/galeria" },
    ],
    links: [{ rel: "canonical", href: "/galeria" }],
  }),
  component: Galeria,
});

function Galeria() {
  const [filter, setFilter] = useState<string>("Todos");
  const [visible, setVisible] = useState(GALLERY_PAGE_SIZE);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const items = useMemo(
    () => (filter === "Todos" ? gallery : gallery.filter((g) => g.category === filter)),
    [filter],
  );

  const shown = items.slice(0, visible);
  const active = activeIndex !== null ? items[activeIndex] : null;

  const selectFilter = (f: string) => {
    setFilter(f);
    setVisible(GALLERY_PAGE_SIZE);
  };

  const go = (delta: number) => {
    if (activeIndex === null) return;
    const next = (activeIndex + delta + items.length) % items.length;
    setActiveIndex(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-deep sm:text-4xl">Galería</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Productos, instrumental y actividades con profesionales e instituciones.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3 rounded-xl bg-deep p-5 text-deep-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <PlayCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold">¿Buscás material audiovisual?</p>
            <p className="text-xs text-white/70">Encontrá videos institucionales y de productos.</p>
          </div>
        </div>
        <Link
          to="/videos"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-deep transition-colors hover:bg-brand/90"
        >
          <PlayCircle className="h-4 w-4" /> Ver videos
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {["Todos", ...galleryFilters].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => selectFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-[background-color,border-color,color] duration-200 ease-out ${
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_4px_16px_-10px_rgba(15,23,42,0.2)] active:scale-[0.98]"
          >
            <span className="relative block aspect-[4/3] overflow-hidden bg-secondary/50">
              <img
                src={item.thumb}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                width={400}
                height={300}
                className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
              />
            </span>
            <span className="flex items-center gap-2 px-3 py-2.5">
              <span className="h-3 w-px shrink-0 bg-brand" />
              <span className="line-clamp-1 text-xs font-medium text-deep">{item.alt}</span>
            </span>
          </button>
        ))}
      </div>

      {visible < items.length && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + GALLERY_PAGE_SIZE)}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-deep transition-colors hover:border-primary hover:text-primary"
          >
            Cargar más ({items.length - visible})
          </button>
        </div>
      )}

      {active && (
        <Lightbox item={active} onClose={() => setActiveIndex(null)} onPrev={() => go(-1)} onNext={() => go(1)} />
      )}
    </div>
  );
}

function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: GalleryItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep/85 p-4 duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-md text-deep-foreground hover:bg-white/10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="Anterior"
        className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-deep-foreground hover:bg-white/10 sm:left-6"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-deep-foreground hover:bg-white/10 sm:right-6"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <figure
        className="max-h-[85vh] max-w-3xl overflow-hidden rounded-xl bg-card duration-300 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* La imagen grande se carga sólo aquí, al abrir el lightbox. */}
        <img
          src={item.full}
          alt={item.alt}
          decoding="async"
          className="max-h-[78vh] w-full object-contain"
        />
        <figcaption className="px-4 py-3 text-sm text-muted-foreground">
          {item.alt} · {item.category}
        </figcaption>
      </figure>
    </div>
  );
}
