// Agent 3: Future Me — powered by Foundry agent
import { NextRequest, NextResponse } from "next/server";
import { FutureSelf, ResumeAnalysis, UniverseType } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { getUniverse } from "@/lib/universes";

// Per-universe role guidance — keeps each world's roles native to its tone and prevents the
// mystical/archival fillers (Sage, Archivist, Warden…) from bleeding across every universe.
const UNIVERSE_ROLE_GUIDE: Record<UniverseType, { tone: string; avoid?: string[]; prefer?: string[] }> = {
  medieval: { tone: "feudal and courtly — banners, oaths, succession, stone keeps." },
  cyberpunk: { tone: "a neon megacity of augments and rogue networks — corporate, electric, self-made." },
  pirate: { tone: "open seas and free ports — tides, sails, salt, and hard-won freedom." },
  dragon: { tone: "ancient and volcanic — power measured in centuries, embers and slow wisdom." },
  galactic: {
    tone: "post-Earth and technologically advanced — starfaring, orbital, engineered. NOT mystical, archival, or medieval.",
    avoid: ["Sage", "Lorekeeper", "Archivist", "Warden", "Elder"],
    prefer: ["Signal Shepherd", "Quantum Explorer", "Void Cartographer", "Stellar Pathfinder", "Orbital Strategist", "Colony Architect", "Neural Navigator", "Deep Field Analyst"],
  },
  vampire: { tone: "eternal night — immortal courts, memory, gothic and patient." },
};

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis, universeId, alternativeName, alternativeTitle, worldName, eraName, worldDescription } = await req.json() as {
      resumeAnalysis: ResumeAnalysis; universeId: UniverseType; alternativeName: string; alternativeTitle?: string;
      worldName?: string; eraName?: string; worldDescription?: string;
    };
    if (!resumeAnalysis || !universeId || !alternativeName) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const universe = getUniverse(universeId);

    // Role guidance native to THIS universe's tone (avoid/prefer lists where defined)
    const rg = UNIVERSE_ROLE_GUIDE[universeId];
    const roleGuide =
      `\nWORLD TONE for ${universe.title}: ${rg.tone}` +
      (rg.avoid?.length ? `\nAvoid these role words here (wrong tone): ${rg.avoid.join(", ")}.` : "") +
      (rg.prefer?.length ? `\nPrefer roles in this spirit: ${rg.prefer.join(", ")}.` : "");

    // If the profile already established a world, the Future Self MUST live in that exact world.
    // Otherwise the model invents one in the same call (see WORLD GENERATION block below).
    const hasWorld = !!(worldName && eraName);
    const worldDirective = hasWorld
      ? `\n\n════════════════════════════════════════════\nYOUR WORLD — already established, use it EXACTLY (do NOT invent another)\n════════════════════════════════════════════\nworldName: "${worldName}"\neraName: "${eraName}"\nworldDescription: "${worldDescription || ""}"\nGround the memories, achievements and philosophy in THIS world and era. Return these exact values in the worldName/eraName/worldDescription fields.`
      : "";

    const response = await callAI("You are a visionary future-self narrator and worldbuilder. Create vivid, emotionally resonant future-self profiles set in living, specific civilizations — never generic genre skins. Return valid JSON only.", `Create the Future Self for this person in the ${universe.title} universe.

UNIVERSE (broad genre only — NOT the final answer): ${universe.title} — ${universe.lore}

CHARACTER: ${alternativeName}${alternativeTitle ? ` — ${alternativeTitle}` : ""}
PRONOUNS: ${resumeAnalysis.pronouns || "they/them"} — this future self IS the user, so use these pronouns and a matching (or neutral) title. Never use a gendered title or pronoun that contradicts them.
TIMELINE SIGNATURE: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
ACHIEVEMENTS: ${resumeAnalysis.achievements.join(", ")}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}

════════════════════════════════════════════
LIFE DIVERGENCE RULE
════════════════════════════════════════════
This universe is ONE of six different LIVES — not one life wearing six costumes.
Preserve the user's STRENGTHS. Do NOT preserve their profession. Let this world change who they became.
- Build their role from their strengths expressed through THIS world — never a re-skin of their real job, and never the same occupational noun with a themed adjective.
- Avoid the "same role, different paint" trap:
    BAD:  Archivist · Lorekeeper · Flame Archivist · Space Archivist
    GOOD: Royal Cartographer · Memory Architect · Fleet Navigator · Rune Forger · Quantum Explorer · Dream Smuggler
- The "title" below must name a life native to ${universe.title} that this person GREW INTO — earned and specific, not a literal translation of their résumé.
${roleGuide}
${worldDirective}
════════════════════════════════════════════
WORLD GENERATION — world first, career second
════════════════════════════════════════════
The UNIVERSE above is only a broad genre category. Invent the world like a world-builder — freely and independently of this person's career:

• worldName — invent an original, vivid name for a specific civilization or realm within the universe. Think geography, culture, history — not the person's job. No two generations should share a name.
• eraName — invent a named historical period: a time of war, discovery, collapse, or renaissance. Invented freely; not tied to the person's résumé.
• worldDescription — 1-2 sentences describing what makes this civilization distinctive.

Once the world is established, derive the title from: (this person's core strengths + personality) × (what roles this specific world has to offer). The title is what this world made of them — native to the civilization, earned through their nature.

Return this exact JSON:
{
  "name": "full name and title at this future point",
  "title": "an earned, dramatic role native to this world — drawn from their STRENGTHS, a genuinely different life (not a re-skin of their real profession, and no 'themed-adjective + same noun' costumes). Honor the WORLD TONE / avoid / prefer guidance above.",
  "worldName": "the specific civilization within ${universe.title}, shaped by this person's Career DNA",
  "eraName": "the named historical era they live in",
  "worldDescription": "1-2 concise sentences describing this world",
  "year": 2150,
  "personality": "2-3 sentences: who are they now?",
  "philosophy": "core belief forged through experience",
  "memories": ["5 vivid first-person memories written in the voice and language of this world — no modern vocabulary. Each memory should feel like it happened in this civilization: smells, sounds, stakes, and people native to this world. No web, network, protocol, database, incident, KPI, or modern corporate language unless the universe is Cyberpunk or Galactic."],
  "achievements": ["5-7 major achievements expressed as in-world events — vivid, historically-phrased, native to this civilization's language and stakes. Not 'Led a cross-functional team' but 'Rallied the fractured war-bands of the Northern Reaches under a single banner during the Siege of Valmoor'. No modern vocabulary in non-tech universes."],
  "regrets": ["3-5 human-scale regrets phrased in the language of this world — things this person failed to do, people they let down, choices that still haunt them, expressed through this civilization's values and relationships"],
  "lessons": ["5 lessons earned through hard experience — written as wisdom this person would actually speak aloud in this world, not modern self-help language"]
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
