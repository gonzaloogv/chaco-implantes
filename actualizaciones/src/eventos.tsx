import { createFileRoute } from "@tanstack/react-router";
import { CalendarOff, MapPin, MessageCircle } from "lucide-react";
import { events, whatsappLink } from "@/lib/site";
import { Reveal } from "@/components/Reveal";
import congresoAsset from "@/assets/congreso-traumatologia-2024.jpg.asset.json";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Capacitaciones y novedades — Chaco Implantes" },
      {
        name: "description",
        content:
          "Capacitaciones, jornadas y novedades de Chaco Implantes para profesionales e instituciones de salud en Resistencia, Chaco.",
      },
      { property: "og:title", content: "Capacitaciones y novedades — Chaco Implantes" },
      { property: "og:description", content: "Capacitaciones y novedades del rubro traumatológico." },
      { property: "og:url", content: "/eventos" },
    ],
    links: [{ rel: "canonical", href: "/eventos" }],
  }),
  component: Eventos,
});

function Eventos() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-deep sm:text-4xl">
          Capacitaciones y novedades
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Publicamos jornadas, capacitaciones para equipos de quirófano y novedades de líneas de
          producto.
        </p>
      </header>

      {events.length === 0 ? (
        <Reveal className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary ring-1 ring-border">
            <CalendarOff className="h-5 w-5" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-deep">
            No hay próximos eventos publicados
          </p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Escribinos para conocer capacitaciones o coordinar una visita técnica.
          </p>
          <a
            href={whatsappLink(
              "Hola, quisiera información sobre capacitaciones y novedades de Chaco Implantes.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-200 ease-out hover:bg-deep active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4" /> Consultar por WhatsApp
          </a>
        </Reveal>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e, i) => (
            <Reveal
              key={e.id}
              delay={(i % 3) * 60}
              className="rounded-lg border border-border bg-card p-5"
            >
              <p className="text-xs font-medium text-primary">{e.date}</p>
              <h2 className="mt-2 font-display text-base font-semibold text-deep">{e.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{e.place}</p>
              <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
            </Reveal>
          ))}
        </div>
      )}

      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-deep sm:text-3xl">
            Nuestro último evento
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Un recorrido por las jornadas y congresos donde acompañamos a la comunidad médica.
          </p>
        </Reveal>

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
              productos y el servicio de calidad que ofrecemos, reafirmando nuestro compromiso de
              estar al servicio de la salud.
            </p>
            <a
              href={whatsappLink(
                "Hola, vi que participaron del Congreso Argentino de Ortopedia y Traumatología. Quisiera más información.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-200 ease-out hover:bg-deep active:scale-[0.97]"
            >
              <MessageCircle className="h-4 w-4" /> Consultanos
            </a>
          </div>
        </Reveal>
      </section>
    </div>

  );
}
