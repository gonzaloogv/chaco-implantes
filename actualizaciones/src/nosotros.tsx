import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageCheck, MapPin, Stethoscope, FileText, ArrowRight } from "lucide-react";
import { site, images } from "@/lib/site";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Nosotros — Chaco Implantes" },
      {
        name: "description",
        content:
          "Chaco Implantes: distribución de prótesis, implantes e instrumental traumatológico en Resistencia, Chaco, con atención a profesionales e instituciones.",
      },
      { property: "og:title", content: "Nosotros — Chaco Implantes" },
      { property: "og:description", content: "Distribución traumatológica en Resistencia, Chaco." },
      { property: "og:url", content: "/nosotros" },
    ],
    links: [{ rel: "canonical", href: "/nosotros" }],
  }),
  component: Nosotros,
});

const features = [
  {
    icon: PackageCheck,
    title: "Distribución traumatológica",
    text: "Prótesis, implantes e instrumental nacional e importado.",
  },
  {
    icon: MapPin,
    title: "Atención en Resistencia",
    text: "Base en Corrientes 781, Resistencia, Chaco.",
  },
  {
    icon: Stethoscope,
    title: "Coordinación con profesionales",
    text: "Traumatólogos, cirujanos, clínicas y sanatorios.",
  },
  {
    icon: FileText,
    title: "Catálogos por línea",
    text: "Cadera, rodilla, columna y osteosíntesis.",
  },
];

function Nosotros() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-deep sm:text-4xl">Nosotros</h1>
          <p className="mt-4 text-base text-muted-foreground">
            {site.name} distribuye prótesis, implantes e instrumental traumatológico en Resistencia,
            Chaco, acompañando a profesionales e instituciones de salud en cada procedimiento.
          </p>
          <p className="mt-4 font-accent text-xl text-primary">{site.tagline}</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <img
            src={images.quirofano}
            alt="Quirófano equipado para cirugía traumatológica"
            loading="lazy"
            width={1200}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <section className="mt-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i % 2) * 60}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary ring-1 ring-border">
                <f.icon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-deep">{f.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <Link
          to="/contacto"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-200 ease-out hover:bg-deep active:scale-[0.97]"
        >
          Contactar a Chaco Implantes <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

