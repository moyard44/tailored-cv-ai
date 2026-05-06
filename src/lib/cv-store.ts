// Tiny in-memory store + sessionStorage persistence for the CV flow.
// Keeps state across route navigations without needing a database.

export interface TailorResult {
  parsed: { name: string; contact: string; summary: string };
  jobAnalysis: {
    keySkills: string[];
    tools: string[];
    responsibilities: string[];
    seniority: string;
  };
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  suggestions: string[];
  tailoredCV: string;
  coverLetter: string;
}

export interface CVSession {
  cvText: string;
  cvFileName?: string;
  jobDescription: string;
  result?: TailorResult;
}

const KEY = "cv-tailor-session";

export function getSession(): CVSession {
  if (typeof window === "undefined") return { cvText: "", jobDescription: "" };
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return { cvText: "", jobDescription: "" };
    return JSON.parse(raw);
  } catch {
    return { cvText: "", jobDescription: "" };
  }
}

export function setSession(patch: Partial<CVSession>) {
  const next = { ...getSession(), ...patch };
  sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}
