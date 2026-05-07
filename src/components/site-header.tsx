import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/60 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-brand)] shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-foreground">
            Resume<span className="text-gradient-brand font-bold">IN</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/upload"
            className="rounded-lg px-3.5 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "rounded-lg px-3.5 py-2 text-foreground font-medium" }}
          >
            Get started
          </Link>
          <Link
            to="/upload"
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-brand)] px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          >
            Start Free
          </Link>
        </nav>
      </div>
    </header>
  );
}
