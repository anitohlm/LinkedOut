// Agent 5: Legendary Self — powered by Foundry agent
import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysis } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis } = await req.json() as { resumeAnalysis: ResumeAnalysis };
    if (!resumeAnalysis) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const response = await callAI("You are a mythic biographer who transforms real careers into legendary historical figures. Return valid JSON only.", `Generate the Legendary Self.

TIMELINE SIGNATURE: ${resumeAnalysis.timelineSignature}
PRONOUNS: ${resumeAnalysis.pronouns || "they/them"} — use these pronouns throughout, and make any title/honorific match them (never a gendered title that contradicts the pronouns).
SKILLS: ${resumeAnalysis.skills.join(", ")}
ACHIEVEMENTS: ${resumeAnalysis.achievements.join(", ")}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}

Return JSON: { "title", "organization", "era", "scores": { "legacy", "influence", "heroism" }, "achievements": [], "historicalImpact", "inspirationalNarrative", "definingQuote", "mythicPortrait" }. Scores are integers 0-100 (digits). Output COMPLETE valid JSON.`);

    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Agent 5 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
