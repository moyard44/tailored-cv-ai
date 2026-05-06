// Tailor CV edge function - analyzes a CV against a job description
// and returns a tailored ATS-optimized version using Lovable AI.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  cvText: string;
  jobDescription: string;
  mode?: "tailor" | "cover_letter" | "pitch";
}

const SYSTEM_PROMPT = `You are an expert career coach and ATS (Applicant Tracking System) optimization specialist.

CRITICAL RULES:
- NEVER fabricate experience, jobs, companies, dates, or skills the candidate doesn't have
- Only enhance, rephrase, and reorganize existing content
- Use strong action verbs and quantified achievements where the original mentions them
- Optimize for ATS: simple text, clear sections, no tables/graphics
- Prioritize keywords from the job description that genuinely match the candidate's background
- Be honest about gaps; do not invent metrics

Return ONLY valid JSON matching the requested schema. No markdown, no commentary.`;

function buildPrompt(cvText: string, jobDescription: string) {
  return `Analyze this CV against the job description and return a complete tailored result.

JOB DESCRIPTION:
"""
${jobDescription}
"""

ORIGINAL CV:
"""
${cvText}
"""

Return JSON with this exact structure:
{
  "parsed": {
    "name": "string",
    "contact": "string (email/phone/location combined)",
    "summary": "string"
  },
  "jobAnalysis": {
    "keySkills": ["string"],
    "tools": ["string"],
    "responsibilities": ["string"],
    "seniority": "string"
  },
  "matchScore": <integer 0-100>,
  "matchedKeywords": ["string"],
  "missingKeywords": ["string"],
  "strengths": ["string"],
  "suggestions": ["string"],
  "tailoredCV": "string - the full rewritten CV in plain text, ATS-friendly, with sections: SUMMARY, SKILLS, EXPERIENCE, EDUCATION. Use clear headings, bullet points starting with '- ', and quantified achievements. Keep it truthful to the original.",
  "coverLetter": "string - a tailored 3-paragraph cover letter"
}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvText, jobDescription } = (await req.json()) as RequestBody;

    if (!cvText || cvText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "CV text is too short or empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!jobDescription || jobDescription.trim().length < 30) {
      return new Response(
        JSON.stringify({ error: "Job description is too short or empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildPrompt(cvText, jobDescription) },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content returned from AI");

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON if wrapped
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Invalid AI response format");
      parsed = JSON.parse(match[0]);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tailor-cv error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
