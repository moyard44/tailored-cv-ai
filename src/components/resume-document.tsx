// Renders a parsed resume into one of 4 ATS-friendly styled templates.
// Pure single-column markup. Styles live in a single <style> block so the
// same DOM can be serialized into a print iframe for PDF export.

import { forwardRef } from "react";
import type { ParsedResume } from "@/lib/cv-parse";

export type TemplateId = "minimal" | "corporate" | "creative" | "tech";

export interface ResumeOptions {
  template: TemplateId;
  accent: string; // hex
  fontSize: number; // base px (10-12 typical)
  compact: boolean;
  fontFamily: string; // e.g. "Inter"
}

interface Props {
  resume: ParsedResume;
  options: ResumeOptions;
}

export const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  { id: "minimal", name: "Modern Minimal", description: "Clean typography, spacious layout" },
  { id: "corporate", name: "Corporate Professional", description: "Executive, traditional hierarchy" },
  { id: "creative", name: "Creative ATS", description: "Modern section headers, elegant" },
  { id: "tech", name: "Tech Professional", description: "Structured, UI-inspired" },
];

export const ACCENT_PRESETS = [
  "#2563eb", // blue
  "#0f172a", // slate
  "#0d9488", // teal
  "#9333ea", // purple
  "#dc2626", // red
  "#ea580c", // orange
];

// Generates the CSS for the resume document. Exported so the PDF print
// pipeline can reuse the same styles outside of React.
export function buildResumeCSS(opts: ResumeOptions): string {
  const { template, accent, fontSize, compact, fontFamily } = opts;
  const gap = compact ? 10 : 16;
  const sectionGap = compact ? 14 : 22;

  const base = `
.resume-doc {
  font-family: ${fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #111827;
  background: #ffffff;
  font-size: ${fontSize}px;
  line-height: 1.5;
  padding: 48px 56px;
  width: 100%;
  max-width: 816px; /* ~ Letter at 96dpi */
  margin: 0 auto;
  box-sizing: border-box;
}
.resume-doc * { box-sizing: border-box; }
.resume-doc h1, .resume-doc h2, .resume-doc h3, .resume-doc p, .resume-doc ul, .resume-doc li {
  margin: 0; padding: 0;
}
.resume-doc ul { list-style: none; }
.resume-doc .r-section { margin-top: ${sectionGap}px; }
.resume-doc .r-section:first-of-type { margin-top: 0; }
.resume-doc .r-entry { margin-top: ${gap}px; }
.resume-doc .r-entry:first-child { margin-top: 0; }
.resume-doc .r-bullet {
  position: relative;
  padding-left: 14px;
  margin-top: 4px;
  color: #1f2937;
}
.resume-doc .r-bullet::before {
  content: "";
  position: absolute;
  left: 2px; top: 0.6em;
  width: 4px; height: 4px;
  border-radius: 9999px;
  background: ${accent};
}
.resume-doc .r-skills {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-top: ${gap / 2}px;
}
.resume-doc .r-skill {
  font-size: ${Math.max(fontSize - 1, 9)}px;
  padding: 3px 9px;
  border-radius: 6px;
  background: ${accent}14;
  color: ${accent};
  font-weight: 500;
}
.resume-doc .r-name { letter-spacing: -0.01em; }
.resume-doc .r-contact { color: #4b5563; font-size: ${Math.max(fontSize - 1, 9)}px; }
@media print {
  .resume-doc { padding: 36px 44px; box-shadow: none; }
  @page { size: Letter; margin: 0.5in; }
}
`;

  const minimal = `
.resume-doc.t-minimal .r-header { padding-bottom: ${gap}px; border-bottom: 1px solid #e5e7eb; margin-bottom: ${sectionGap}px; }
.resume-doc.t-minimal .r-name { font-size: ${fontSize * 2}px; font-weight: 600; color: #0f172a; }
.resume-doc.t-minimal .r-contact { margin-top: 6px; }
.resume-doc.t-minimal .r-section-title {
  font-size: ${Math.max(fontSize - 1, 10)}px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 600;
  color: ${accent};
  margin-bottom: ${gap}px;
}
.resume-doc.t-minimal .r-entry-heading { font-weight: 600; color: #0f172a; }
`;

  const corporate = `
.resume-doc.t-corporate { font-family: "Georgia", "Cambria", serif; }
.resume-doc.t-corporate .r-header { text-align: center; padding-bottom: ${gap}px; border-bottom: 2px solid ${accent}; margin-bottom: ${sectionGap}px; }
.resume-doc.t-corporate .r-name { font-size: ${fontSize * 2.1}px; font-weight: 700; color: #0f172a; letter-spacing: 0.02em; }
.resume-doc.t-corporate .r-contact { margin-top: 8px; }
.resume-doc.t-corporate .r-section-title {
  font-size: ${fontSize + 1}px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 700;
  color: #0f172a;
  border-bottom: 1px solid #cbd5e1;
  padding-bottom: 4px;
  margin-bottom: ${gap}px;
}
.resume-doc.t-corporate .r-entry-heading { font-weight: 700; color: #0f172a; font-family: "Helvetica", "Arial", sans-serif; }
.resume-doc.t-corporate .r-bullet::before { background: #475569; }
.resume-doc.t-corporate .r-skill { background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0; }
`;

  const creative = `
.resume-doc.t-creative .r-header {
  padding: ${gap + 4}px ${gap + 8}px;
  background: linear-gradient(135deg, ${accent}11, ${accent}05);
  border-left: 4px solid ${accent};
  border-radius: 8px;
  margin-bottom: ${sectionGap}px;
}
.resume-doc.t-creative .r-name { font-size: ${fontSize * 2.1}px; font-weight: 700; color: #0f172a; }
.resume-doc.t-creative .r-contact { margin-top: 6px; }
.resume-doc.t-creative .r-section-title {
  position: relative;
  display: inline-block;
  font-size: ${fontSize + 2}px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: ${gap}px;
  padding-bottom: 4px;
}
.resume-doc.t-creative .r-section-title::after {
  content: "";
  position: absolute; left: 0; right: 0; bottom: -2px;
  height: 3px; background: ${accent};
  border-radius: 2px;
}
.resume-doc.t-creative .r-entry-heading { font-weight: 600; color: #0f172a; }
`;

  const tech = `
.resume-doc.t-tech .r-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 16px;
  padding-bottom: ${gap}px;
  border-bottom: 1px dashed #cbd5e1;
  margin-bottom: ${sectionGap}px;
}
.resume-doc.t-tech .r-name { font-size: ${fontSize * 2}px; font-weight: 700; color: #0f172a; }
.resume-doc.t-tech .r-contact { text-align: right; line-height: 1.6; }
.resume-doc.t-tech .r-section-title {
  font-size: ${fontSize + 1}px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: ${gap}px;
  font-family: "JetBrains Mono", "SF Mono", Menlo, monospace;
}
.resume-doc.t-tech .r-section-title::before {
  content: "// ";
  color: ${accent};
}
.resume-doc.t-tech .r-entry-heading { font-weight: 600; color: #0f172a; }
.resume-doc.t-tech .r-skill {
  border-radius: 4px;
  font-family: "JetBrains Mono", "SF Mono", Menlo, monospace;
}
`;

  const tplCSS =
    template === "minimal"
      ? minimal
      : template === "corporate"
        ? corporate
        : template === "creative"
          ? creative
          : tech;

  return base + tplCSS;
}

export const ResumeDocument = forwardRef<HTMLDivElement, Props>(function ResumeDocument(
  { resume, options },
  ref,
) {
  const skillsSectionPresent = resume.sections.some((s) => s.title.includes("SKILL"));
  return (
    <div ref={ref} className={`resume-doc t-${options.template}`}>
      <style dangerouslySetInnerHTML={{ __html: buildResumeCSS(options) }} />
      <header className="r-header">
        <div>
          <h1 className="r-name">{resume.name || "Your Name"}</h1>
          {resume.contact && <div className="r-contact">{resume.contact}</div>}
        </div>
      </header>

      {resume.sections.map((section, idx) => {
        const isSkills = section.title.includes("SKILL") && resume.skills.length > 0;
        return (
          <section key={idx} className="r-section">
            <h2 className="r-section-title">{titleCase(section.title)}</h2>
            {isSkills ? (
              <div className="r-skills">
                {resume.skills.map((s, i) => (
                  <span key={i} className="r-skill">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              section.entries.map((entry, i) => (
                <div key={i} className="r-entry">
                  {entry.heading && <div className="r-entry-heading">{entry.heading}</div>}
                  {entry.bullets.length > 0 &&
                    (entry.bullets.length === 1 && !entry.heading ? (
                      <p style={{ marginTop: 4 }}>{entry.bullets[0]}</p>
                    ) : (
                      <ul>
                        {entry.bullets.map((b, j) => (
                          <li key={j} className="r-bullet">
                            {b}
                          </li>
                        ))}
                      </ul>
                    ))}
                </div>
              ))
            )}
          </section>
        );
      })}
      {/* Defensive: if no skills section but we have skill chips, do nothing */}
      {!skillsSectionPresent && null}
    </div>
  );
});

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
