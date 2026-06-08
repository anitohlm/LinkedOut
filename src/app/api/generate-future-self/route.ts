// Agent 3: Future Me — powered by Foundry agent
import { NextRequest, NextResponse } from "next/server";
import { FutureSelf, ResumeAnalysis, UniverseType } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { getUniverse } from "@/lib/universes";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis, universeId, alternativeName, alternativeTitle, worldName, eraName, worldDescription } = await req.json() as {
      resumeAnalysis: ResumeAnalysis; universeId: UniverseType; alternativeName: string; alternativeTitle?: string;
      worldName?: string; eraName?: string; worldDescription?: string;
    };
    if (!resumeAnalysis || !universeId || !alternativeName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const universe = getUniverse(universeId);

    // If the profile already established a world, the Future Self MUST live in that exact world.
    // Otherwise the model invents one in the same call (see WORLD GENERATION block below).
    const hasWorld = !!(worldName && eraName);
    const worldDirective = hasWorld
      ? `\n\n════════════════════════════════════════════\nYOUR WORLD — already established, use it EXACTLY (do NOT invent another)\n════════════════════════════════════════════\nworldName: "${worldName}"\neraName: "${eraName}"\nworldDescription: "${worldDescription || ""}"\nGround the memories, achievements and philosophy in THIS world and era. Return these exact values in the worldName/eraName/worldDescription fields.`
      : "";

    const response = await callAI("You are a visionary future-self narrator and worldbuilder. Create vivid, emotionally resonant future-self profiles set in living, specific civilizations — never generic genre skins. Return valid JSON only.", `Create the Future Self for this person in the ${universe.title} universe.

UNIVERSE (broad genre only — NOT the final answer): ${universe.title} — ${universe.lore}

CHARACTER: ${alternativeName}${alternativeTitle ? ` — ${alternativeTitle}` : ""}
TIMELINE SIGNATURE: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
ACHIEVEMENTS: ${resumeAnalysis.achievements.join(", ")}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}
${worldDirective}
════════════════════════════════════════════
WORLD GENERATION — make this a REAL place, not a genre
════════════════════════════════════════════
The UNIVERSE above is only a broad category. You must invent the SPECIFIC civilization and era this person actually lives in:
• worldName — a specific civilization/realm WITHIN the universe.
• eraName — the named historical period they live in.
• worldDescription — 1-2 concise sentences describing this world.

Shape examples (universe → world → era):
  Ancient Draconia → "The Ember Dominion" → "The Seventh Flight"
  Endless Seas     → "The Crimson Archipelago" → "Season of Black Sails"
  Cosmic Frontier  → "Helios Reach" → "Star Cycle 88"
  Neon Synthesis   → "The Lumen Grid" → "Protocol Era 12"
  Medieval Kingdom → "The Seven Banner Realms" → "The Third Succession"
  Eternal Night    → "The City Below" → "The Long Twilight"

CAREER DNA INFLUENCE — CRITICAL:
The world MUST be shaped by who THIS person is. The SAME universe must produce a DIFFERENT world for a different person.
  Teacher in Ancient Draconia      → World: "The Library Peaks",       Era: "Age of Forgotten Tomes"
  Security Analyst in Cosmic Frontier → World: "The Sentinel Belt",    Era: "Firewall Epoch"
  Nurse in Endless Seas            → World: "The Calmwater Archipelago", Era: "The Healing Tide"
Read this person's skills, achievements and personality, then let the world's identity, history and culture echo their craft.

Return this exact JSON:
{
  "name": "full name and title at this future point",
  "title": "dramatic title",
  "worldName": "the specific civilization within ${universe.title}, shaped by this person's Career DNA",
  "eraName": "the named historical era they live in",
  "worldDescription": "1-2 concise sentences describing this world",
  "year": 2150,
  "personality": "2-3 sentences: who are they now?",
  "philosophy": "core belief forged through experience",
  "memories": ["5 vivid first-person memories of being the user — include vulnerable, funny, and crossroads moments"],
  "achievements": ["5-7 major achievements in this universe"],
  "regrets": ["3-5 human-scale regrets"],
  "lessons": ["5 lessons earned through experience"]
}

Output COMPLETE, valid JSON only — do not get cut off.`);

    const d = extractJSON<Record<string, unknown>>(response);
    const futureSelf: FutureSelf = {
      id: `future_${universeId}_${Date.now()}`,
      universeId,
      name: d.name as string,
      title: d.title as string,
      // Worldbuilding — prefer the world established on the profile (consistency across screens),
      // else use the model's invention, else fall back to universe-derived defaults
      worldName: worldName || (d.worldName as string) || universe.title,
      eraName: eraName || (d.eraName as string) || `Year ${(d.year as number) || 2150}`,
      worldDescription: worldDescription || (d.worldDescription as string) || universe.lore,
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
