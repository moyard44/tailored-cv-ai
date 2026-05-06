import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Lightbulb,
  Mail,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { StepIndicator } from "@/components/step-indicator";
import { getSession, type TailorResult } from "@/lib/cv-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
  head: () => ({
    meta: [
      { title: "Your tailored CV — CV Tailor" },
      { name: "description", content: "Match score, missing keywords, and your ATS-optimized CV." },
    ],
  }),
});

function ResultsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    cvText: string;
    result: TailorResult;
  } | null>(null);
  const [showCover, setShowCover] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s.result) {
      navigate({ to: "/upload" });
      return;
    }
    setData({ cvText: s.cvText, result: s.result });
  }, [navigate]);

  if (!data) return null;
  const { cvText, result } = data;

  const downloadText = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const downloadPdf = async () => {
    // Print-style PDF via browser print of a hidden iframe
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Tailored CV</title>
      <style>
        body { font-family: -apple-system, system-ui, Arial, sans-serif; padding: 48px; color: #111; line-height: 1.5; max-width: 800px; margin: 0 auto; }
        pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
      </style></head><body><pre>${escapeHtml(result.tailoredCV)}</pre></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <StepIndicator current={3} />

        {/* Header */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Your tailored CV is ready
            </h1>
            <p className="mt-2 text-muted-foreground">
              {result.parsed.name ? `Optimized for ${result.parsed.name}` : "ATS-optimized and ready to download."}
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate({ to: "/job" })} className="gap-2 self-start sm:self-auto">
            <ArrowLeft className="h-4 w-4" /> Edit job description
          </Button>
        </div>

        {/* Score + Insights */}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <ScoreCard score={result.matchScore} seniority={result.jobAnalysis.seniority} />
          <KeywordCard
            title="Matched keywords"
            items={result.matchedKeywords}
            kind="success"
          />
          <KeywordCard
            title="Missing keywords"
            items={result.missingKeywords}
            kind="warning"
          />
        </div>

        {/* Insights */}
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

        {/* Comparison */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Before vs after</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(result.tailoredCV)} className="gap-2">
                <Copy className="h-4 w-4" /> Copy CV
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadText("tailored-cv.txt", result.tailoredCV)} className="gap-2">
                <Download className="h-4 w-4" /> .txt
              </Button>
              <Button size="sm" onClick={downloadPdf} className="gap-2">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <CVPanel label="Original CV" text={cvText} />
            <CVPanel label="Tailored CV" text={result.tailoredCV} highlight />
          </div>
        </div>

        {/* Cover letter */}
        {result.coverLetter && (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <Mail className="h-5 w-5 text-brand" /> Cover letter
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCover((v) => !v)}>
                  {showCover ? "Hide" : "Show"}
                </Button>
                {showCover && (
                  <Button variant="outline" size="sm" onClick={() => copy(result.coverLetter)} className="gap-2">
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
    </div>
  );
}

function ScoreCard({ score, seniority }: { score: number; seniority: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(score)));
  const color =
    safe >= 75 ? "text-success" : safe >= 50 ? "text-warning" : "text-destructive";
  const ring =
    safe >= 75 ? "stroke-success" : safe >= 50 ? "stroke-warning" : "stroke-destructive";
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

function CVPanel({ label, text, highlight }: { label: string; text: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-card shadow-[var(--shadow-soft)]",
        highlight ? "border-brand/40 ring-1 ring-brand/20" : "border-border",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
        {highlight && (
          <span className="ml-auto rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
            ATS-optimized
          </span>
        )}
      </div>
      <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap p-5 font-mono text-xs leading-relaxed text-foreground">
        {text}
      </pre>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
