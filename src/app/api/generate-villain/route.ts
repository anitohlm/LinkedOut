// Agent 6: Villain Self — powered by Foundry agent
import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysis } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis } = await req.json() as { resumeAnalysis: ResumeAnalysis };
    if (!resumeAnalysis) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const pronouns = resumeAnalysis.pronouns || "they/them";
    const response = await callAI("You are a dark mirror narrator who reveals the shadow-self hidden in every career. Return valid JSON only.", `Generate the Villain Self.

TIMELINE SIGNATURE: ${resumeAnalysis.timelineSignature}
NAME: ${resumeAnalysis.name || resumeAnalysis.firstName}
PRONOUNS: ${pronouns} — use these pronouns throughout, and make any honorific/title match (e.g. Emperor for he/him, Empress for she/her, a neutral title like Sovereign for they/them). Never use a gendered title that contradicts the pronouns.
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

notoriety/wealth/threatLevel are integers 0-100 (digits). Output COMPLETE valid JSON.`);

    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Agent 6 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
