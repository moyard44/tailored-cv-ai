import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <FileText className="h-4 w-4" />
          </span>
          <span className="text-foreground">CV Tailor</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/upload"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground font-medium" }}
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
