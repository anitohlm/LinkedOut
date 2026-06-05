// Agent 6: Villain Self
import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysis } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { VILLAIN_SELF_PROMPT } from "@/lib/agents/prompts";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis } = await req.json() as { resumeAnalysis: ResumeAnalysis };
    if (!resumeAnalysis) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const response = await callAI(VILLAIN_SELF_PROMPT, `Generate the Villain Self.

TIMELINE SIGNATURE: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
ACHIEVEMENTS: ${resumeAnalysis.achievements.join(", ")}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}

Return JSON: { "name", "title", "notoriety", "wealth", "threatLevel", "originStory", "philosophy", "riseToPowar", "moralCompromises": [], "alternateWorldview", "headlines": [], "warningMessage", "portrait" }`);

    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Agent 6 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
