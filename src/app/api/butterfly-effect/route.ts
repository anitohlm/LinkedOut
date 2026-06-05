// Agent 7: Butterfly Effect
import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysis } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { BUTTERFLY_EFFECT_PROMPT } from "@/lib/agents/prompts";

export async function POST(req: NextRequest) {
  try {
    const { decision, resumeAnalysis } = await req.json() as { decision: string; resumeAnalysis: ResumeAnalysis };
    if (!decision || !resumeAnalysis) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const response = await callAI(BUTTERFLY_EFFECT_PROMPT, `Generate 4 alternate timelines from this changed decision.

DECISION: "${decision}"
TIMELINE SIGNATURE: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}

Return JSON: { "timelines": [{ "letter", "title", "universe", "summary", "milestones": [], "tone" }], "stabilityDelta": -10 }`);

    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Agent 7 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
