import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  Lightbulb,
  Mail,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { StepIndicator } from "@/components/step-indicator";
import { getSession, type TailorResult } from "@/lib/cv-store";
import { parseTailoredCV } from "@/lib/cv-parse";
import {
  ResumeDocument,
  buildResumeCSS,
  type ResumeOptions,
} from "@/components/resume-document";
import { CustomizationPanel } from "@/components/customization-panel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
  head: () => ({
    meta: [
      { title: "Your tailored CV — CV Tailor" },
      {
        name: "description",
        content:
          "Live ATS-friendly resume preview, premium templates, and one-click PDF export.",
      },
    ],
  }),
});

const DEFAULT_OPTIONS: ResumeOptions = {
  template: "minimal",
  accent: "#2563eb",
  fontSize: 11,
  compact: false,
  fontFamily: "Inter",
};

function ResultsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<{ result: TailorResult } | null>(null);
  const [options, setOptions] = useState<ResumeOptions>(DEFAULT_OPTIONS);
  const [showDownload, setShowDownload] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = getSession();
    if (!s.result) {
      navigate({ to: "/upload" });
      return;
    }
    setData({ result: s.result });
  }, [navigate]);

  const resume = useMemo(() => {
    if (!data) return null;
    return parseTailoredCV(data.result.tailoredCV, {
      name: data.result.parsed.name,
      contact: data.result.parsed.contact,
    });
  }, [data]);

  if (!data || !resume) return null;
  const { result } = data;

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadPdf = () => {
    const node = docRef.current;
    if (!node) return;
    const html = node.outerHTML;
    const css = buildResumeCSS(options);
    const win = window.open("", "_blank", "width=900,height=1100");
    if (!win) {
      toast.error("Pop-ups blocked. Allow pop-ups to download PDF.");
      return;
    }
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
      <title>${resume.name || "Tailored CV"}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet"/>
      <style>${css} body{margin:0;background:#fff;}</style>
      </head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <StepIndicator current={3} />

        {/* Header */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Your tailored CV is ready
            </h1>
            <p className="mt-2 text-muted-foreground">
              Live preview, premium templates, and ATS-safe PDF export.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/job" })}
            className="gap-2 self-start sm:self-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Edit job description
          </Button>
        </div>

        {/* Score + insights */}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <ScoreCard score={result.matchScore} seniority={result.jobAnalysis.seniority} />
          <KeywordCard title="Matched keywords" items={result.matchedKeywords} kind="success" />
          <KeywordCard title="Missing keywords" items={result.missingKeywords} kind="warning" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <InsightCard
            title="Your strengths"
            icon={<CheckCircle2 className="h-4 w-4 text-success" />}
            items={result.strengths}
          />
          <InsightCard
            title="Suggestions"
            icon={<Lightbulb className="h-4 w-4 text-warning" />}
            items={result.suggestions}
          />
        </div>

        {/* Resume builder area */}
        <div className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Resume preview</h2>
              <p className="text-sm text-muted-foreground">
                Pick a template and customize — your CV updates live.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyText(result.tailoredCV)}
                className="gap-2"
              >
                <Copy className="h-4 w-4" /> Copy text
              </Button>
              <Button
                size="sm"
                onClick={() => setShowDownload(true)}
                className="gap-2 shadow-[var(--shadow-glow)]"
              >
                <Download className="h-4 w-4" /> Download CV
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <CustomizationPanel
              options={options}
              onChange={setOptions}
              onDownload={() => setShowDownload(true)}
            />

            <div className="rounded-2xl border border-border bg-[oklch(0.96_0.005_250)] p-4 sm:p-8 shadow-[var(--shadow-card)]">
              <div className="mx-auto overflow-hidden rounded-lg bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.25)]">
                <ResumeDocument ref={docRef} resume={resume} options={options} />
              </div>
            </div>
          </div>
        </div>

        {/* Cover letter */}
        {result.coverLetter && (
          <div className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <Mail className="h-5 w-5 text-brand" /> Cover letter
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCover((v) => !v)}>
                  {showCover ? "Hide" : "Show"}
                </Button>
                {showCover && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyText(result.coverLetter)}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                )}
              </div>
            </div>
            {showCover && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {result.coverLetter}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Button variant="ghost" onClick={() => navigate({ to: "/upload" })}>
            Tailor another CV →
          </Button>
        </div>
      </main>

      {/* Download confirmation modal */}
      <Dialog open={showDownload} onOpenChange={setShowDownload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Download your tailored CV</DialogTitle>
            <DialogDescription>
              Preview of the selected template. Export is high-quality, ATS-safe PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[420px] overflow-auto rounded-lg border border-border bg-[oklch(0.96_0.005_250)] p-3">
            <div className="origin-top scale-[0.7] sm:scale-[0.78]">
              <div className="mx-auto bg-white shadow-md">
                <ResumeDocument resume={resume} options={options} />
              </div>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setShowDownload(false)}>
              Back to edit
            </Button>
            <Button variant="outline" onClick={() => copyText(result.tailoredCV)} className="gap-2">
              <Copy className="h-4 w-4" /> Copy text
            </Button>
            <Button
              onClick={() => {
                setShowDownload(false);
                setTimeout(downloadPdf, 100);
              }}
              className="gap-2 shadow-[var(--shadow-glow)]"
            >
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScoreCard({ score, seniority }: { score: number; seniority: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(score)));
  const color = safe >= 75 ? "text-success" : safe >= 50 ? "text-warning" : "text-destructive";
  const ring = safe >= 75 ? "stroke-success" : safe >= 50 ? "stroke-warning" : "stroke-destructive";
  const C = 2 * Math.PI * 44;
  const offset = C - (safe / 100) * C;
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" strokeWidth="8" className="stroke-muted" />
            <circle
              cx="50" cy="50" r="44" fill="none" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              className={cn("transition-all duration-700", ring)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-2xl font-bold", color)}>{safe}%</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Match score
          </div>
          <div className="mt-1 text-base font-semibold text-foreground">
            {safe >= 75 ? "Strong match" : safe >= 50 ? "Decent match" : "Needs work"}
          </div>
          {seniority && (
            <div className="mt-2 text-xs text-muted-foreground">
              Role level: <span className="font-medium text-foreground">{seniority}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KeywordCard({
  title, items, kind,
}: { title: string; items: string[]; kind: "success" | "warning" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center gap-2">
        {kind === "success" ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <XCircle className="h-4 w-4 text-warning" />
        )}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">None detected.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.slice(0, 24).map((k) => (
            <span
              key={k}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium",
                kind === "success"
                  ? "bg-success/10 text-success"
                  : "bg-warning/15 text-warning-foreground",
              )}
            >
              {k}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function InsightCard({
  title, icon, items,
}: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon} {title}
      </h3>
      <ul className="space-y-2">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground" />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
