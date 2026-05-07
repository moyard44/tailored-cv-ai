import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TEMPLATES,
  ACCENT_PRESETS,
  type ResumeOptions,
  type TemplateId,
} from "@/components/resume-document";

interface Props {
  options: ResumeOptions;
  onChange: (next: ResumeOptions) => void;
  onDownload: () => void;
}

const FONTS = ["Inter", "Poppins", "Roboto", "Georgia"];

export function CustomizationPanel({ options, onChange, onDownload }: Props) {
  const set = <K extends keyof ResumeOptions>(k: K, v: ResumeOptions[K]) =>
    onChange({ ...options, [k]: v });

  return (
    <aside className="sticky top-24 flex h-fit flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Template</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">ATS-friendly designs</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => set("template", t.id as TemplateId)}
              className={cn(
                "group relative rounded-xl border p-3 text-left transition-all",
                options.template === t.id
                  ? "border-brand bg-brand/5 ring-2 ring-brand/30"
                  : "border-border bg-background hover:border-brand/40",
              )}
            >
              <TemplateThumb id={t.id as TemplateId} accent={options.accent} />
              <div className="mt-2 text-xs font-semibold text-foreground">{t.name}</div>
              <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                {t.description}
              </div>
              {options.template === t.id && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-brand-foreground">
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Accent color</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("accent", c)}
              aria-label={`Accent ${c}`}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                options.accent === c ? "border-foreground" : "border-transparent",
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Font</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => set("fontFamily", f)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                options.fontFamily === f
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
              style={{ fontFamily: f }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Font size</h3>
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => set("fontSize", Math.max(9, options.fontSize - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="min-w-[3ch] text-center text-sm font-medium tabular-nums">
            {options.fontSize}px
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => set("fontSize", Math.min(14, options.fontSize + 1))}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
        <div>
          <div className="text-sm font-medium text-foreground">Compact mode</div>
          <div className="text-xs text-muted-foreground">Tighter spacing</div>
        </div>
        <input
          type="checkbox"
          checked={options.compact}
          onChange={(e) => set("compact", e.target.checked)}
          className="h-4 w-4 accent-[color:var(--brand)]"
        />
      </label>

      <Button
        size="lg"
        onClick={onDownload}
        className="w-full shadow-[var(--shadow-glow)]"
      >
        Download CV
      </Button>
    </aside>
  );
}

function TemplateThumb({ id, accent }: { id: TemplateId; accent: string }) {
  const bar = (w: string, color = "#cbd5e1") => (
    <div style={{ height: 3, width: w, background: color, borderRadius: 2 }} />
  );
  return (
    <div className="aspect-[3/4] w-full overflow-hidden rounded-md border border-border bg-white p-2">
      {id === "minimal" && (
        <div className="flex flex-col gap-1.5">
          <div style={{ height: 6, width: "60%", background: "#0f172a", borderRadius: 2 }} />
          {bar("40%", accent)}
          <div className="my-1 h-px w-full bg-slate-200" />
          {bar("30%", accent)}
          {bar("90%")}
          {bar("85%")}
          {bar("70%")}
        </div>
      )}
      {id === "corporate" && (
        <div className="flex flex-col items-center gap-1.5">
          <div style={{ height: 7, width: "70%", background: "#0f172a", borderRadius: 2 }} />
          {bar("40%")}
          <div style={{ height: 2, width: "100%", background: accent }} />
          <div className="self-start">{bar("35%", "#0f172a")}</div>
          {bar("90%")}
          {bar("85%")}
          {bar("70%")}
        </div>
      )}
      {id === "creative" && (
        <div className="flex flex-col gap-1.5">
          <div
            style={{
              padding: 4,
              background: accent + "1a",
              borderLeft: `3px solid ${accent}`,
              borderRadius: 3,
            }}
          >
            <div style={{ height: 5, width: "55%", background: "#0f172a", borderRadius: 2 }} />
            <div style={{ marginTop: 3, height: 2, width: "35%", background: "#94a3b8", borderRadius: 2 }} />
          </div>
          <div className="mt-1">{bar("30%", accent)}</div>
          {bar("90%")}
          {bar("85%")}
          {bar("70%")}
        </div>
      )}
      {id === "tech" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-end justify-between">
            <div style={{ height: 6, width: "45%", background: "#0f172a", borderRadius: 2 }} />
            <div className="flex flex-col items-end gap-0.5">
              {bar("40%")}
              {bar("30%")}
            </div>
          </div>
          <div className="my-0.5 h-px w-full border-t border-dashed border-slate-300" />
          <div className="flex items-center gap-1">
            <div style={{ height: 3, width: 8, background: accent, borderRadius: 1 }} />
            {bar("30%", "#0f172a")}
          </div>
          {bar("90%")}
          {bar("85%")}
          {bar("70%")}
        </div>
      )}
    </div>
  );
}
