import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { ArrowRight, FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { StepIndicator } from "@/components/step-indicator";
import { extractTextFromFile } from "@/lib/extract-cv";
import { getSession, setSession } from "@/lib/cv-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
  head: () => ({
    meta: [
      { title: "Upload your CV — CV Tailor" },
      { name: "description", content: "Upload a PDF or DOCX, or paste your CV text to get started." },
    ],
  }),
});

function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const initial = typeof window !== "undefined" ? getSession() : { cvText: "", jobDescription: "" };
  const [cvText, setCvText] = useState(initial.cvText || "");
  const [fileName, setFileName] = useState<string | undefined>(initial.cvFileName);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large (max 10 MB).");
      return;
    }
    setParsing(true);
    try {
      const text = await extractTextFromFile(file);
      if (text.length < 50) {
        toast.error("Couldn't extract enough text. Try pasting it manually.");
      } else {
        setCvText(text);
        setFileName(file.name);
        toast.success(`Extracted ${text.length.toLocaleString()} characters from ${file.name}`);
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to parse file.");
    } finally {
      setParsing(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onContinue = () => {
    if (cvText.trim().length < 50) {
      toast.error("Please add your CV (at least 50 characters).");
      return;
    }
    setSession({ cvText: cvText.trim(), cvFileName: fileName });
    navigate({ to: "/job" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <StepIndicator current={1} />
        <div className="mt-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Upload your CV
          </h1>
          <p className="mt-2 text-muted-foreground">
            Drop a PDF or DOCX file, or paste the text below.
          </p>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card px-6 py-12 text-center transition-all",
            dragOver ? "border-brand bg-accent" : "border-border hover:border-brand/50 hover:bg-accent/30",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {parsing ? (
            <>
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-brand" />
              <p className="font-medium text-foreground">Parsing your CV…</p>
            </>
          ) : fileName ? (
            <>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                <FileText className="h-6 w-6" />
              </div>
              <p className="font-medium text-foreground">{fileName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {cvText.length.toLocaleString()} characters extracted
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFileName(undefined);
                  setCvText("");
                }}
                className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </>
          ) : (
            <>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-brand">
                <Upload className="h-6 w-6" />
              </div>
              <p className="font-medium text-foreground">
                Drop your CV here, or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, or TXT • Max 10 MB</p>
            </>
          )}
        </div>

        {/* Manual paste fallback */}
        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Or paste CV text
          </label>
          <Textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste the contents of your CV here…"
            className="min-h-[200px] resize-y bg-card font-mono text-sm leading-relaxed"
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={onContinue} size="lg" className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
