import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, MessageCircle } from "lucide-react";
import { nav, site, images, whatsappLink } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const transparent = isHome && !isScrolled && !open;

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 60) setIsScrolled(true);
      if (window.scrollY < 20) setIsScrolled(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        transparent
          ? "fixed inset-x-0 top-0 z-50 transition-all duration-500 bg-transparent"
          : "fixed inset-x-0 top-0 z-50 transition-all duration-500 bg-background/85 backdrop-blur-md border-b border-border"
      }
    >
      <div className={`flex w-full items-center justify-between px-4 lg:px-10 ${transparent ? "h-20" : "h-16"}`}>
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={images.logoCircular}
            alt={`${site.name} logo`}
            width={40}
            height={40}
            className="h-9 w-9 rounded-full lg:h-10 lg:w-10"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-deep">
              Chaco <span className="text-primary">Implantes</span>
            </span>
            <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Traumatología
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-out hover:text-deep"
              activeProps={{ className: "bg-secondary text-deep font-semibold" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink("Hola, me comunico desde el sitio de Chaco Implantes.")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,background-color] duration-200 ease-out hover:bg-deep active:scale-[0.97] sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-deep transition-transform duration-200 ease-out active:scale-[0.97] lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="overflow-hidden border-t border-border bg-background duration-200 animate-in slide-in-from-top-2 fade-in lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-out hover:bg-secondary hover:text-deep"
                activeProps={{ className: "bg-secondary text-deep" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={whatsappLink("Hola, me comunico desde el sitio de Chaco Implantes.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-200 ease-out active:scale-[0.97]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
