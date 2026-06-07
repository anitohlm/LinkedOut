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

Return this exact JSON. notoriety, wealth, and threatLevel MUST be plain integers between 0 and 100 (no text, no words):
{
  "name": "their shadow-self name",
  "title": "their title in this timeline",
  "notoriety": 84,
  "wealth": 72,
  "threatLevel": 60,
  "originStory": "2-3 paragraphs on how the drift began",
  "philosophy": "their justifying worldview",
  "riseToPowar": "how they climbed, using their real skills for self-interest",
  "moralCompromises": ["4-6 specific compromises, gradual"],
  "alternateWorldview": "how they see the world, first person",
  "headlines": ["4 archive-style headlines about them"],
  "warningMessage": "a reflective warning to the user about this path",
  "portrait": "image generation prompt"
}

notoriety/wealth/threatLevel are integers 0-100 (digits). Output COMPLETE valid JSON.`, [], 3000);

    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Agent 6 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
