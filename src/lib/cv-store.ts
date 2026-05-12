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
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    // Storage quota exceeded — drop the heaviest field (result) and retry.
    console.warn("setSession: storage write failed, retrying without result", e);
    try {
      const trimmed = { ...next, result: next.result };
      sessionStorage.setItem(KEY, JSON.stringify(trimmed));
    } catch (e2) {
      console.error("setSession: persistent storage failure", e2);
      throw e2;
    }
  }
  return next;
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}
