import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { categories, categoryImages, whatsappLink } from "@/lib/site";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/catalogos/")({
  head: () => ({
    meta: [
      { title: "Catálogos — Chaco Implantes" },
      {
        name: "description",
        content:
          "Catálogos de cadera, rodilla, columna, maxilofacial, osteosíntesis e instrumental quirúrgico.",
      },
      { property: "og:title", content: "Catálogos — Chaco Implantes" },
      {
        property: "og:description",
        content: "Líneas de prótesis, implantes e instrumental traumatológico.",
      },
      { property: "og:url", content: "/catalogos" },
    ],
    links: [{ rel: "canonical", href: "/catalogos" }],
  }),
  component: Catalogos,
});

function Catalogos() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-deep sm:text-4xl">Catálogos</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Líneas de prótesis, implantes e instrumental por especialidad.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 3) * 60} className="h-full">
            <div className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-xl border border-border bg-deep transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)]">
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
                className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-deep/10"
              />
              <div className="relative p-5">
                <span className="inline-block rounded border border-white/25 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                  {c.tag}
                </span>
                <h2 className="mt-3 font-display text-lg font-semibold text-white">{c.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-white/75">{c.description}</p>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/15 pt-4">
                  <Link
                    to="/catalogos/$categoria"
                    params={{ categoria: c.slug }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:text-brand"
                  >
                    Ver catálogo <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={whatsappLink(`Hola, quisiera información sobre la categoría ${c.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-white/70 transition-colors duration-200 ease-out hover:text-white"
                  >
                    Solicitar información
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}


