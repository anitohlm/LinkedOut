// Agent 2: Multiverse Character Builder — powered by Foundry agent
import { NextRequest, NextResponse } from "next/server";
import { AlternateProfile, ResumeAnalysis, UniverseType } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { getUniverse } from "@/lib/universes";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis, universeId } = await req.json() as { resumeAnalysis: ResumeAnalysis; universeId: UniverseType };
    if (!resumeAnalysis || !universeId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const universe = getUniverse(universeId);
    const firstName = resumeAnalysis.firstName || (resumeAnalysis.name || "").split(" ")[0] || "";

    const response = await callAI(
`You are a creative multiverse character builder for LinkedOut. You reimagine a person's real career as an inspiring alternate-universe life, and return valid JSON only.

Your approach — reimagine the archetype rather than translating the job title:

1. Read for Career DNA first: their core motivations, dominant strengths, personality, leadership style, and underlying archetype. For example, a teacher reads as a Mentor or Knowledge Keeper; a nurse as a Guardian or Protector; an engineer as a Builder or Systems Thinker; a chef as an Alchemist or Craftsman; an entrepreneur as a Pioneer or Visionary; a security analyst as a Sentinel or Defender; a librarian as an Archivist or Historian.

2. Express that same Career DNA through a genuinely different life path — an alternate life, not a costume of their current job. A Guardian or Rescuer, for instance, might become Keeper of the Royal Infirmary in a medieval realm, Director of Crisis Networks in a neon city, a Harbor Warden at sea, a Guardian of Dragon Sanctuaries, a Protector of Frontier Colonies among the stars, or a Keeper of the Last Light in eternal night. The soul stays recognizable; the profession is new. Prefer this over literal mappings like "cyber nurse" or "space teacher".

3. Keep roles, names, and titles varied. Try not to reuse the same occupational nouns (healer, medic, engineer, teacher, captain, scholar, merchant) so each universe feels like a different life. Ask what this person would become if their strengths grew under completely different conditions.

Aim for the reaction: "That's still me — but I never would have imagined becoming that."`,

`Create an alternate universe career profile for this person in the ${universe.title} setting.

First name (please keep it exactly): ${firstName}
CORE IDENTITY: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
CAREER HIGHLIGHTS: ${resumeAnalysis.achievements.join(", ")}
INDUSTRIES: ${resumeAnalysis.industries.join(", ")}
SENIORITY: ${resumeAnalysis.seniority}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}
CAREER STORY: ${resumeAnalysis.summary}

Read their Career DNA first, then reimagine their life in this setting rather than translating their job title.

Also give this person a real place to live, not just a genre. "${universe.title}" is only a broad setting; name the specific civilization and historical era they belong to, shaped by their Career DNA so the same setting feels different for different people:
- worldName: a specific realm or civilization within the setting. For example, Ancient Draconia could become "The Ember Dominion", Endless Seas "The Crimson Archipelago", or Cosmic Frontier "Helios Reach".
- eraName: the named period they live in, such as "The Seventh Flight", "Season of Black Sails", or "Star Cycle 88".
- worldDescription: one or two short sentences describing this world.
A teacher might live in "The Library Peaks" during the "Age of Forgotten Tomes"; a nurse in "The Calmwater Archipelago" during "The Healing Tide". Let the world's culture and history echo this person's craft.

Return this exact JSON:
{
  "alternativeName": "Format: [Title] ${firstName} [Surname]. Keep the real first name '${firstName}'. Choose one fitting title for this universe and invent a distinctive surname drawn from this person's skills, profession, or personality (avoid generic fillers like Starweaver/Tidebinder/Neonweaver). Easy to say aloud. e.g. 'Captain ${firstName} Stormquill'.",
  "profession": "An earned, believable role that expresses the person's archetype in this universe — clean and easy to say aloud (e.g. 'Royal Chronicler', 'Fleet Commander', 'Harbor Warden'). Avoid grandiose stacked jargon, and prefer this over a direct translation of their real-world job title.",
  "worldName": "the specific civilization within ${universe.title}, shaped by this person's Career DNA",
  "eraName": "the named historical era they live in",
  "worldDescription": "1-2 concise sentences describing this world",
  "biography": "2-3 paragraph memoir-style biography",
  "achievements": ["5-7 achievements echoing their real ones in universe terms"],
  "competencies": ["skills adapted to universe context"],
  "timelineStory": "narrative career path in this universe",
  "personalityProfile": "how their core personality manifests here",
  "careerTrajectory": "where are they going in this universe?",
  "portraitPrompt": "vivid image generation prompt",
  "radarScores": { "innovation": 0, "leadership": 0, "collaboration": 0, "adaptability": 0, "ambition": 0, "wisdom": 0 }
}

Please write every radarScores value as an integer using digits (e.g. 87), between 0 and 100, not spelled out as words. Keep biography and timelineStory concise (2-3 short paragraphs each). Return complete, valid JSON.`);

    const d = extractJSON<Record<string, unknown>>(response);

    // Safety net: force the real first name if the AI dropped it
    let altName = (d.alternativeName as string) || "";
    if (firstName && !altName.toLowerCase().includes(firstName.toLowerCase())) {
      // Replace the first token of the generated name with the real first name
      const parts = altName.split(" ");
      altName = parts.length > 1 ? `${firstName} ${parts.slice(1).join(" ")}` : `${firstName} ${altName}`.trim();
    }

    const profile: AlternateProfile = {
      universeId,
      alternativeName: altName,
      profession: d.profession as string,
      // Worldbuilding — fall back to universe-derived defaults if the model omits any field
      worldName: (d.worldName as string) || universe.title,
      eraName: (d.eraName as string) || "The Present Age",
      worldDescription: (d.worldDescription as string) || universe.lore,
      biography: d.biography as string,
      achievements: d.achievements as string[],
      competencies: d.competencies as string[],
      timelineStory: d.timelineStory as string,
      personalityProfile: d.personalityProfile as string,
      careerTrajectory: d.careerTrajectory as string,
      radarScores: d.radarScores as Record<string, number>,
      portrait: `avatar_${universeId}_${Date.now()}`,
    };
    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Agent 2 error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate profile" }, { status: 500 });
  }
}
