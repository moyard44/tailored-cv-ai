// Parses an ATS plaintext CV (as produced by the AI) into structured sections
// for rendering in styled resume templates.

export interface ParsedSection {
  title: string;
  // Either a list of paragraphs/bullets, or a list of "entry" blocks
  // (used for EXPERIENCE / EDUCATION where each item has a header + bullets).
  entries: ParsedEntry[];
}

export interface ParsedEntry {
  // Heading line of the entry (e.g. "Senior Product Designer — Acme · 2021-2024").
  // For SUMMARY/SKILLS this is empty and bullets contain the body lines.
  heading?: string;
  bullets: string[];
}

export interface ParsedResume {
  name: string;
  contact: string;
  sections: ParsedSection[];
  // Convenience: skills extracted as flat list (if a SKILLS section exists).
  skills: string[];
}

const KNOWN_TITLES = [
  "SUMMARY",
  "PROFILE",
  "OBJECTIVE",
  "SKILLS",
  "TECHNICAL SKILLS",
  "CORE SKILLS",
  "EXPERIENCE",
  "WORK EXPERIENCE",
  "PROFESSIONAL EXPERIENCE",
  "EMPLOYMENT",
  "EDUCATION",
  "PROJECTS",
  "CERTIFICATIONS",
  "AWARDS",
  "LANGUAGES",
  "INTERESTS",
  "PUBLICATIONS",
  "VOLUNTEER",
  "ACHIEVEMENTS",
];

function isHeading(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (trimmed.length > 60) return null;
  // Match if line is all uppercase (allowing & / spaces) or matches a known title.
  const upper = trimmed.toUpperCase();
  const stripped = upper.replace(/[:#*]/g, "").trim();
  if (KNOWN_TITLES.includes(stripped)) return stripped;
  // All caps short line w/o sentence punctuation
  if (
    /^[A-Z0-9 &/\-]+$/.test(stripped) &&
    stripped.length >= 3 &&
    !/\d{4}/.test(stripped)
  ) {
    return stripped;
  }
  return null;
}

function isBullet(line: string): boolean {
  return /^\s*([-*•·]|\d+\.)\s+/.test(line);
}

function stripBullet(line: string): string {
  return line.replace(/^\s*([-*•·]|\d+\.)\s+/, "").trim();
}

export function parseTailoredCV(
  raw: string,
  fallback: { name: string; contact: string },
): ParsedResume {
  const text = (raw || "").replace(/\r\n/g, "\n").trim();
  const lines = text.split("\n");

  // Detect name/contact at the top (first 1–4 lines that aren't a heading).
  let cursor = 0;
  let name = fallback.name || "";
  let contact = fallback.contact || "";

  // Try to pull the first non-empty line as name if it looks like a name.
  while (cursor < lines.length && !lines[cursor].trim()) cursor++;
  if (cursor < lines.length && !isHeading(lines[cursor])) {
    const first = lines[cursor].trim();
    // Heuristic: looks like a name (no @, no digits-heavy, short)
    if (
      first.length < 60 &&
      !first.includes("@") &&
      !/\d{3,}/.test(first) &&
      !/SUMMARY|PROFILE/i.test(first)
    ) {
      name = name || first;
      cursor++;
    }
  }
  // Collect contact lines until heading
  const contactLines: string[] = [];
  while (cursor < lines.length && !isHeading(lines[cursor])) {
    const t = lines[cursor].trim();
    if (t) contactLines.push(t);
    cursor++;
    if (contactLines.length >= 3) break;
  }
  if (contactLines.length) contact = contactLines.join(" · ");

  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;
  let currentEntry: ParsedEntry | null = null;

  const pushEntry = () => {
    if (currentEntry && current) {
      if (currentEntry.heading || currentEntry.bullets.length) {
        current.entries.push(currentEntry);
      }
      currentEntry = null;
    }
  };

  const startSection = (title: string) => {
    pushEntry();
    current = { title, entries: [] };
    sections.push(current);
    currentEntry = null;
  };

  for (; cursor < lines.length; cursor++) {
    const line = lines[cursor];
    const heading = isHeading(line);
    if (heading) {
      startSection(heading);
      continue;
    }
    if (!current) {
      // No section yet — treat as summary
      startSection("SUMMARY");
    }
    const trimmed = line.trim();
    if (!trimmed) {
      pushEntry();
      continue;
    }
    if (isBullet(line)) {
      if (!currentEntry) currentEntry = { heading: "", bullets: [] };
      currentEntry.bullets.push(stripBullet(line));
    } else {
      // Heading-style line within section (e.g. job title)
      const isExperienceLike =
        current!.title.includes("EXPERIENCE") ||
        current!.title.includes("EDUCATION") ||
        current!.title.includes("PROJECT");
      if (isExperienceLike) {
        pushEntry();
        currentEntry = { heading: trimmed, bullets: [] };
      } else {
        if (!currentEntry) currentEntry = { heading: "", bullets: [] };
        currentEntry.bullets.push(trimmed);
      }
    }
  }
  pushEntry();

  // Extract skills as flat list
  const skillsSection = sections.find((s) => s.title.includes("SKILL"));
  let skills: string[] = [];
  if (skillsSection) {
    const flat = skillsSection.entries.flatMap((e) => e.bullets);
    skills = flat
      .flatMap((line) => line.split(/[,•|·]/))
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40);
  }

  return { name, contact, sections, skills };
}
