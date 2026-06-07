// Agent 5: Legendary Self
import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysis } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { LEGENDARY_SELF_PROMPT } from "@/lib/agents/prompts";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis } = await req.json() as { resumeAnalysis: ResumeAnalysis };
    if (!resumeAnalysis) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const response = await callAI(LEGENDARY_SELF_PROMPT, `Generate the Legendary Self.

TIMELINE SIGNATURE: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
ACHIEVEMENTS: ${resumeAnalysis.achievements.join(", ")}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}

Return JSON: { "title", "organization", "era", "scores": { "legacy", "influence", "heroism" }, "achievements": [], "historicalImpact", "inspirationalNarrative", "definingQuote", "mythicPortrait" }. Scores are integers 0-100 (digits). Output COMPLETE valid JSON.`, [], 3000);

    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Agent 5 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
