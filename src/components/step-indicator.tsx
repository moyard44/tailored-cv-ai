import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  current: 1 | 2 | 3;
}

const steps = [
  { id: 1, label: "Upload CV" },
  { id: 2, label: "Job description" },
  { id: 3, label: "Results" },
] as const;

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 sm:gap-4">
      {steps.map((s, i) => {
        const active = current === s.id;
        const done = current > s.id;
        return (
          <div key={s.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  done && "border-success bg-success text-success-foreground",
                  active && "border-brand bg-brand text-brand-foreground shadow-[var(--shadow-glow)]",
                  !active && !done && "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? "✓" : s.id}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="h-px w-8 bg-border sm:w-12" />
            )}
          </div>
        );
      })}
    </div>
  );
}
