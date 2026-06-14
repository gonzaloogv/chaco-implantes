import { type ReactNode } from "react";

/**
 * Subtle entrance animation using pure CSS (tw-animate-css). Content is always
 * rendered and ends fully visible — no dependency on a JS animation engine or
 * IntersectionObserver, so it can never get stuck hidden during SSR/hydration.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
      className={`duration-500 animate-in fade-in slide-in-from-bottom-3 ${className}`}
    >
      {children}
    </div>
  );
}
