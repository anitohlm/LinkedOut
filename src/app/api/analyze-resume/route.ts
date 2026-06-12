// Agent 1: Resume Analyst — powered by Foundry agent
import { NextRequest, NextResponse } from "next/server";
import { callAI, extractJSON } from "@/lib/agents/foundry";

export async function POST(req: NextRequest) {
  try {
    const { resumeText, explicitPronouns } = await req.json();
    if (!resumeText) return NextResponse.json({ error: "Resume text is required" }, { status: 400 });

    const pronounsInstruction = explicitPronouns
      ? `"pronouns": "${explicitPronouns}" — the user has explicitly chosen these pronouns. Use exactly this value.`
      : `"pronouns": "infer the person's likely pronouns from their name and any cues: one of 'he/him', 'she/her', or 'they/them'. If genuinely unclear, use 'they/them'."`;

    const response = await callAI("You are an expert resume analyst. Extract structured data from resumes and return valid JSON only.", `Extract the identity hidden within this resume. Return JSON only.

RESUME:
${resumeText}

Return this exact JSON structure:
{
  "name": "full name of the person from the resume header",
  "firstName": "just their first name",
  ${pronounsInstruction},
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
