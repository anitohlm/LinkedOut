// Agent 1: Resume Analyst
import { NextRequest, NextResponse } from "next/server";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { RESUME_ANALYST_PROMPT } from "@/lib/agents/prompts";

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();
    if (!resumeText) return NextResponse.json({ error: "Resume text is required" }, { status: 400 });

    const response = await callAI(RESUME_ANALYST_PROMPT, `Extract the identity hidden within this resume. Return JSON only.

RESUME:
${resumeText}

Return this exact JSON structure:
{
  "name": "full name of the person from the resume header",
  "firstName": "just their first name",
  "skills": ["array of technical and soft skills"],
  "competencies": ["core competencies that define how they work"],
  "strengths": ["recurring strengths across all roles"],
  "achievements": ["major achievements that show impact"],
  "industries": ["industries and domains they have worked in"],
  "seniority": "junior|mid|senior|lead|executive",
  "personalityIndicators": ["personality traits inferred from choices, not stated"],
  "careerTrajectory": "where is this person heading?",
  "majorLifeDecisions": ["significant pivots or transitions visible in the resume"],
  "timelineSignature": "2-3 sentence poetic essence of who this person is at their core",
  "summary": "2-3 sentence professional summary"
}`);

    const analysis = extractJSON<Record<string, unknown>>(response);
    return NextResponse.json({ ...analysis, timelineSignature: analysis.timelineSignature || `sig_${Date.now()}` });
  } catch (error: any) {
    console.error("Agent 1 error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze resume" }, { status: 500 });
  }
}
