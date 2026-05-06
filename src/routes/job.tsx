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
    if (jd.trim().length < 30) {
      toast.error("Please paste a longer job description.");
      return;
    }
    const session = getSession();
    setSession({ jobDescription: jd.trim(), result: undefined });
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tailor-cv", {
        body: { cvText: session.cvText, jobDescription: jd.trim() },
      });
      if (error) {
        const msg = (error as any).context?.error || error.message || "Failed to tailor CV.";
        if (msg.toLowerCase().includes("rate")) {
          toast.error("Rate limit reached. Please wait a moment and try again.");
        } else if (msg.toLowerCase().includes("credit")) {
          toast.error("AI credits exhausted. Please add credits in workspace settings.");
        } else {
          toast.error(msg);
        }
        return;
      }
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setSession({ result: data });
      navigate({ to: "/results" });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
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
