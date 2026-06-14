import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  MessageCircle,
  FileText,
} from "lucide-react";
import { categories, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/catalogos/$categoria")({
  loader: ({ params }) => {
    const category = categories.find((c) => c.slug === params.categoria);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.category.title ?? "Catálogo";
    return {
      meta: [
        { title: `${title} — Catálogo | Chaco Implantes` },
        {
          name: "description",
          content: loaderData?.category.description ?? "Catálogo técnico de Chaco Implantes.",
        },
        { property: "og:title", content: `${title} — Chaco Implantes` },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-deep">Catálogo no encontrado</h1>
      <p className="mt-2 text-muted-foreground">La categoría solicitada no existe.</p>
      <Link to="/catalogos" className="mt-6 inline-flex text-primary hover:text-deep">
        Volver a catálogos
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-deep">No se pudo cargar el catálogo</h1>
      <Link to="/catalogos" className="mt-6 inline-flex text-primary hover:text-deep">
        Volver a catálogos
      </Link>
    </div>
  ),
  component: CatalogoDetalle,
});

function CatalogoDetalle() {
  const { category } = Route.useLoaderData();
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);

  const total = category.pages;
  const go = (next: number) => {
    if (next < 0 || next >= total) return;
    setDir(next > page ? 1 : -1);
    setPage(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/catalogos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a catálogos
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Viewer */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-lg border border-border bg-secondary/50">
            <div
              key={page}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center duration-300 animate-in fade-in ${
                dir > 0 ? "slide-in-from-right-6" : "slide-in-from-left-6"
              }`}
            >
              <FileText className="h-10 w-10 text-primary/70" />
              <p className="font-display text-lg font-semibold text-deep">{category.title}</p>
              <p className="text-sm text-muted-foreground">Vista previa de página {page + 1}</p>
              <p className="mt-2 text-xs text-muted-foreground/80">
                Catálogo técnico — contenido de muestra
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(page - 1)}
              disabled={page === 0}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-deep transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-deep"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-muted-foreground">
              {page + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => go(page + 1)}
              disabled={page === total - 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-deep transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-deep"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {category.type}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-deep">{category.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{category.description}</p>

            <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tipo de producto</dt>
                <dd className="font-medium text-deep">{category.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Páginas</dt>
                <dd className="font-medium text-deep">{category.pages}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-3">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-semibold text-deep transition-colors hover:border-primary hover:text-primary"
            >
              <Download className="h-4 w-4" /> Descargar PDF
            </a>
            <a
              href={whatsappLink(`Hola, quisiera información sobre el catálogo de ${category.title}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-deep"
            >
              <MessageCircle className="h-4 w-4" /> Contactar por WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
