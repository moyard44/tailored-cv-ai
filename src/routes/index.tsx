import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "CV Tailor — Tailor your CV to any job in seconds" },
      {
        name: "description",
        content:
          "Upload your CV, paste a job description, and get an ATS-optimized resume instantly. Match score, missing keywords, and a rewritten CV.",
      },
      { property: "og:title", content: "CV Tailor — ATS-optimized resumes in seconds" },
      {
        property: "og:description",
        content: "AI-powered CV tailoring with match scoring and ATS optimization.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-hero)] opacity-[0.04]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]"
          />
          <div className="container relative mx-auto max-w-5xl px-4 pb-20 pt-20 sm:pt-28">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                AI-powered, ATS-optimized
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                Tailor your CV to any job in seconds
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Upload your CV, paste a job description, and get a clean,
                ATS-optimized resume instantly — with a match score, missing
                keywords, and a side-by-side comparison.
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 gap-2 px-6 text-base shadow-[var(--shadow-glow)]">
                  <Link to="/upload">
                    Start for free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground">No signup required.</p>
              </div>

              <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                {["No fake experience", "ATS-friendly format", "Instant results"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto max-w-5xl px-4 pb-24">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Smart parsing",
                desc: "Drop in PDF or DOCX. We extract your experience, skills, and education automatically.",
              },
              {
                icon: Target,
                title: "Match score",
                desc: "See exactly how well your CV aligns with the job — and what keywords you’re missing.",
              },
              {
                icon: Zap,
                title: "AI rewrite",
                desc: "Get a tailored, truthful CV with stronger phrasing and ATS-friendly formatting.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CV Tailor. Built for job seekers.
        </div>
      </footer>
    </div>
  );
}
