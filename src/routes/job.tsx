import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { StepIndicator } from "@/components/step-indicator";
import { getSession, setSession } from "@/lib/cv-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/job")({
  component: JobPage,
  head: () => ({
    meta: [
      { title: "Paste the job description — CV Tailor" },
      { name: "description", content: "Paste the job description you’re targeting to tailor your CV." },
    ],
  }),
});

const PLACEHOLDER = `Paste the full job description here…

Example:
We're hiring a Senior Product Designer to lead end-to-end design for our growth surfaces. You'll partner with PMs and engineers, run user research, and ship polished UI in Figma. Required: 5+ years in product design, strong systems thinking, experience with B2B SaaS…`;

function JobPage() {
  const navigate = useNavigate();
  const [jd, setJd] = useState("");
  const [cvReady, setCvReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s.cvText || s.cvText.length < 50) {
      toast.error("Please upload your CV first.");
      navigate({ to: "/upload" });
      return;
    }
    setCvReady(true);
    if (s.jobDescription) setJd(s.jobDescription);
  }, [navigate]);

  const onTailor = async () => {
    const trimmed = jd.trim();
    if (trimmed.length < 30) {
      toast.error("Please paste a longer job description (at least 30 characters).");
      return;
    }
    if (trimmed.length > 20000) {
      toast.error("Job description is too long. Please trim it to under 20,000 characters.");
      return;
    }
    const session = getSession();
    if (!session.cvText || session.cvText.length < 50) {
      toast.error("CV is missing. Please upload your CV again.");
      navigate({ to: "/upload" });
      return;
    }

    try {
      setSession({ jobDescription: trimmed, result: undefined });
    } catch (e) {
      console.error("Failed to persist job description:", e);
      toast.error("Couldn't save your input. Try clearing browser storage and retry.");
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    try {
      console.log("[tailor-cv] invoking edge function", {
        cvLen: session.cvText.length,
        jdLen: trimmed.length,
      });
      const { data, error } = await supabase.functions.invoke("tailor-cv", {
        body: { cvText: session.cvText, jobDescription: trimmed },
      });
      clearTimeout(timeout);

      if (error) {
        console.error("[tailor-cv] invoke error:", error, (error as any)?.context);
        let serverMsg: string | undefined;
        try {
          const ctx = (error as any).context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            serverMsg = body?.error;
          } else if (ctx?.error) {
            serverMsg = ctx.error;
          }
        } catch {
          /* ignore */
        }
        const msg = (serverMsg || error.message || "Failed to tailor CV.").toLowerCase();
        if (msg.includes("rate")) {
          toast.error("Rate limit reached. Please wait a moment and try again.");
        } else if (msg.includes("credit")) {
          toast.error("AI credits exhausted. Please add credits in workspace settings.");
        } else {
          toast.error(serverMsg || error.message || "Failed to tailor CV.");
        }
        return;
      }
      if (!data) {
        toast.error("Empty response from AI. Please try again.");
        return;
      }
      if ((data as any).error) {
        toast.error((data as any).error);
        return;
      }
      if (!(data as any).tailoredCV) {
        console.error("[tailor-cv] unexpected payload:", data);
        toast.error("AI returned an unexpected format. Please try again.");
        return;
      }

      try {
        setSession({ result: data });
      } catch (e) {
        console.error("Failed to persist result:", e);
        toast.error("Result was too large to store. Try a shorter CV or job description.");
        return;
      }
      navigate({ to: "/results" });
    } catch (e: any) {
      clearTimeout(timeout);
      console.error("[tailor-cv] unexpected error:", e);
      if (e?.name === "AbortError") {
        toast.error("Request timed out after 90s. Please try again.");
      } else {
        toast.error(e?.message ? `Error: ${e.message}` : "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!cvReady) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <StepIndicator current={2} />
        <div className="mt-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Paste the job description
          </h1>
          <p className="mt-2 text-muted-foreground">
            We’ll extract key skills, requirements, and seniority — then tailor your CV to match.
          </p>
        </div>

        <Textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder={PLACEHOLDER}
          className="mt-6 min-h-[320px] resize-y bg-card text-sm leading-relaxed"
        />

        <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/upload" })}
            disabled={loading}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={onTailor} disabled={loading} size="lg" className="gap-2 shadow-[var(--shadow-glow)]">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Tailoring your CV…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Tailor my CV
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
