import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ResumeIN — AI Resume Optimization Platform" },
      {
        name: "description",
        content:
          "Tailor your resume for every opportunity. Upload your CV, paste a job description, and instantly generate an ATS-optimized professional resume.",
      },
      { property: "og:title", content: "ResumeIN — AI Resume Optimization Platform" },
      {
        property: "og:description",
        content: "AI-powered resume tailoring with match scoring and ATS optimization.",
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
          {/* ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[image:var(--gradient-brand)] opacity-20 blur-[140px]"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid" />

          <div className="container relative mx-auto max-w-5xl px-4 pb-24 pt-24 sm:pt-32">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="glass mb-7 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                AI Resume Optimization Platform
              </div>
              <h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
                Tailor Your Resume for{" "}
                <span className="text-gradient-brand">Every Opportunity</span>
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Upload your CV, paste a job description, and instantly generate
                an ATS-optimized professional resume.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 gap-2 bg-[image:var(--gradient-brand)] px-7 text-base font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03] hover:bg-[image:var(--gradient-brand)]"
                >
                  <Link to="/upload">
                    Start Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground">No signup required.</p>
              </div>

              <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                {["Honest, never fabricated", "ATS-friendly format", "Instant results"].map((t) => (
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
        <section className="container mx-auto max-w-5xl px-4 pb-28">
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
                desc: "See exactly how well your CV aligns with the job — and what keywords you're missing.",
              },
              {
                icon: Zap,
                title: "AI rewrite",
                desc: "Get a tailored, truthful CV with stronger phrasing and ATS-friendly formatting.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-[var(--shadow-glow)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[image:var(--gradient-brand)] text-primary-foreground shadow-[var(--shadow-glow)]">
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
          © {new Date().getFullYear()} ResumeIN. AI Resume Optimization Platform.
        </div>
      </footer>
    </div>
  );
}
