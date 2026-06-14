import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MapPin, Phone, Instagram, Mail, MessageCircle, Send, Clock } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Chaco Implantes" },
      {
        name: "description",
        content:
          "Contactá a Chaco Implantes en Resistencia, Chaco. WhatsApp 0362-4571854, Corrientes 781.",
      },
      { property: "og:title", content: "Contacto — Chaco Implantes" },
      { property: "og:description", content: "Escribinos o coordiná por WhatsApp." },
      { property: "og:url", content: "/contacto" },
    ],
    links: [{ rel: "canonical", href: "/contacto" }],
  }),
  component: Contacto,
});

const schema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre").max(100),
  institucion: z.string().trim().min(2, "Ingresá tu institución o especialidad").max(120),
  telefono: z.string().trim().min(6, "Ingresá un teléfono válido").max(30),
  email: z.string().trim().email("Email inválido").max(255),
  mensaje: z.string().trim().min(10, "Contanos brevemente tu consulta").max(1000),
});

type FormData = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormData, string>>;

const empty: FormData = { nombre: "", institucion: "", telefono: "", email: "", mensaje: "" };

function Contacto() {
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Errors>({});

  const buildMessage = (d: FormData) =>
    `Hola, soy ${d.nombre} (${d.institucion}).\n` +
    `Teléfono: ${d.telefono}\nEmail: ${d.email}\n\n${d.mensaje}`;

  const validate = () => {
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return null;
    }
    setErrors({});
    return result.data;
  };

  const onWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const data = validate();
    if (!data) return;
    window.open(whatsappLink(buildMessage(data)), "_blank", "noopener,noreferrer");
  };

  const onEmail = () => {
    const data = validate();
    if (!data) return;
    const subject = encodeURIComponent(`Consulta de ${data.nombre} — ${data.institucion}`);
    const body = encodeURIComponent(buildMessage(data));
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
  };

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const field =
    "w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary";

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-deep sm:text-4xl">Contacto</h1>
        <p className="mt-3 text-muted-foreground">
          Escribinos tu consulta y la enviamos por WhatsApp o email, o comunicate directamente.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <form onSubmit={onWhatsApp} className="rounded-lg border border-brand/40 bg-surface p-6 sm:p-8" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-deep">Nombre</label>
              <input className={field} value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre" />
              {errors.nombre && <p className="mt-1 text-xs text-destructive">{errors.nombre}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-deep">
                Institución / especialidad
              </label>
              <input
                className={field}
                value={form.institucion}
                onChange={set("institucion")}
                placeholder="Clínica, sanatorio o especialidad"
              />
              {errors.institucion && (
                <p className="mt-1 text-xs text-destructive">{errors.institucion}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-deep">Teléfono</label>
              <input className={field} value={form.telefono} onChange={set("telefono")} placeholder="Teléfono de contacto" />
              {errors.telefono && <p className="mt-1 text-xs text-destructive">{errors.telefono}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-deep">Email</label>
              <input className={field} value={form.email} onChange={set("email")} placeholder="correo@ejemplo.com" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-deep">Mensaje</label>
            <textarea
              className={`${field} min-h-32 resize-y`}
              value={form.mensaje}
              onChange={set("mensaje")}
              placeholder="Contanos tu consulta o requerimiento"
            />
            {errors.mensaje && <p className="mt-1 text-xs text-destructive">{errors.mensaje}</p>}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,background-color] duration-200 ease-out hover:bg-deep active:scale-[0.97]"
            >
              <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
            </button>
            <button
              type="button"
              onClick={onEmail}
              className="btn-secondary inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out active:scale-[0.97]"
            >
              <Send className="h-4 w-4" /> Enviar por email
            </button>
          </div>
        </form>

        {/* Info */}
        <aside className="space-y-5">
          <div className="rounded-lg border border-brand/40 bg-surface-2/45 p-6">

            <h2 className="font-display text-lg font-semibold text-deep">Datos de contacto</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  {site.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{site.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  {site.instagramHandle}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${site.email}`} className="hover:text-primary">
                  {site.email}
                </a>
              </li>
            </ul>
            <a
              href={whatsappLink("Hola, quisiera hacer una consulta a Chaco Implantes.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,background-color] duration-200 ease-out hover:bg-deep active:scale-[0.97]"
            >
              <MessageCircle className="h-4 w-4" /> Hablar por WhatsApp
            </a>
          </div>

          <div className="rounded-lg border border-brand/40 bg-surface-2/45 p-6">
            <h2 className="font-display text-lg font-semibold text-deep">Ubicación y horario</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{site.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="space-y-0.5 text-sm text-muted-foreground">
                  <p className="text-deep font-semibold">Horario comercial</p>
                  <p>Lun a vie</p>
                  <p>12:30 a 16:30 h</p>
                  <p>16:30 a 20:30 h</p>
                </div>
              </li>
            </ul>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors duration-200 ease-out hover:text-deep"
            >
              <MapPin className="h-4 w-4" /> Cómo llegar
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
