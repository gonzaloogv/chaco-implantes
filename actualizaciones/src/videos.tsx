import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PlayCircle, Images, CalendarClock } from "lucide-react";
import { videos, type VideoItem } from "@/lib/site";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Videos — Chaco Implantes" },
      {
        name: "description",
        content:
          "Videos institucionales y de productos de Chaco Implantes. Reproducción bajo demanda.",
      },
      { property: "og:title", content: "Videos — Chaco Implantes" },
      { property: "og:description", content: "Material audiovisual institucional y de productos." },
      { property: "og:url", content: "/videos" },
    ],
    links: [{ rel: "canonical", href: "/videos" }],
  }),
  component: Videos,
});

function Videos() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-deep sm:text-4xl">Videos</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Material institucional y de productos. Los videos se cargan sólo al reproducir.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3 rounded-xl bg-deep p-5 text-deep-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Images className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold">¿Preferís ver imágenes?</p>
            <p className="text-xs text-white/70">Recorré la galería de productos, instrumental y eventos.</p>
          </div>
        </div>
        <Link
          to="/galeria"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-deep transition-colors hover:bg-brand/90"
        >
          <Images className="h-4 w-4" /> Ver galería
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-5 rounded-lg border border-dashed border-border bg-card px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary ring-1 ring-border">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-deep">
                Pronto publicaremos nuestros videos institucionales y de productos.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Mientras tanto, podés recorrer la galería de imágenes.
              </p>
            </div>
          </div>
          <Link
            to="/galeria"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-deep"
          >
            <Images className="h-4 w-4" /> Ir a la galería
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoCard({ video }: { video: VideoItem }) {
  const [playing, setPlaying] = useState(false);
  const isMobile = useIsMobile();

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-video bg-secondary/50">
        {playing ? (
          <video
            src={video.src}
            poster={video.poster}
            controls
            autoPlay={!isMobile}
            preload="none"
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Reproducir ${video.title}`}
            className="group absolute inset-0 h-full w-full"
          >
            <img
              src={video.poster}
              alt={video.title}
              loading="lazy"
              decoding="async"
              width={640}
              height={360}
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-deep/30 transition-colors group-hover:bg-deep/40">
              <PlayCircle className="h-14 w-14 text-white drop-shadow" />
            </span>
          </button>
        )}
      </div>
      <div className="px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-deep">{video.title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{video.category}</p>
      </div>
    </article>
  );
}
