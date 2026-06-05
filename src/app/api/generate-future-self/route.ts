// Agent 3: Future Me — setup
import { NextRequest, NextResponse } from "next/server";
import { FutureSelf, ResumeAnalysis, UniverseType } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { getUniverse } from "@/lib/universes";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis, universeId, alternativeName, alternativeTitle } = await req.json() as {
      resumeAnalysis: ResumeAnalysis; universeId: UniverseType; alternativeName: string; alternativeTitle?: string;
    };
    if (!resumeAnalysis || !universeId || !alternativeName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const universe = getUniverse(universeId);
    const systemPrompt = `You are the Future Timeline Messenger for LinkedOut. Create a Future Self character who has lived an entire life in the ${universe.title} universe and speaks to their past self. They are NOT a coach — they ARE the user, older and wiser. Universe lore: ${universe.lore}`;

    const response = await callAI(systemPrompt, `Create the Future Self for this person.

CHARACTER: ${alternativeName}${alternativeTitle ? ` — ${alternativeTitle}` : ""}
TIMELINE SIGNATURE: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
ACHIEVEMENTS: ${resumeAnalysis.achievements.join(", ")}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}

Return this exact JSON:
{
  "name": "full name and title at this future point",
  "title": "dramatic title",
  "year": 2150,
  "personality": "2-3 sentences: who are they now?",
  "philosophy": "core belief forged through experience",
  "memories": ["5 vivid first-person memories of being the user — include vulnerable, funny, and crossroads moments"],
  "achievements": ["5-7 major achievements in this universe"],
  "regrets": ["3-5 human-scale regrets"],
  "lessons": ["5 lessons earned through experience"]
}`);

    const d = extractJSON<Record<string, unknown>>(response);
    const futureSelf: FutureSelf = {
      id: `future_${universeId}_${Date.now()}`,
      universeId,
      name: d.name as string,
      title: d.title as string,
      year: d.year as number,
      personality: d.personality as string,
      philosophy: d.philosophy as string,
      memories: d.memories as string[],
      achievements: d.achievements as string[],
      regrets: d.regrets as string[],
      lessons: d.lessons as string[],
      portrait: `portrait_${universeId}_${Date.now()}`,
    };
    return NextResponse.json(futureSelf);
  } catch (error: any) {
    console.error("Agent 3 error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate future self" }, { status: 500 });
  }
}
