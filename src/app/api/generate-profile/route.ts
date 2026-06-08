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
`You are a creative multiverse character builder. Create vivid alternate-universe career profiles and return valid JSON only.

════════════════════════════════════════════
ARCHETYPE-FIRST GENERATION RULE — NON-NEGOTIABLE
════════════════════════════════════════════

STEP 1 — EXTRACT CAREER DNA
Before writing anything, silently identify this person's:
• Core motivations
• Dominant strengths
• Personality traits
• Leadership style
• Decision-making tendencies
• Hidden archetype

Career DNA examples:
  Teacher    → Mentor / Guide / Knowledge Keeper
  Nurse      → Guardian / Protector / Rescuer
  Engineer   → Builder / Creator / Systems Thinker
  Chef       → Alchemist / Craftsman / Creator
  Entrepreneur → Pioneer / Visionary / Risk Taker
  Security Analyst → Sentinel / Watcher / Defender
  Librarian  → Archivist / Knowledge Keeper / Historian

STEP 2 — FORGET THE ORIGINAL PROFESSION
DO NOT directly translate the user's job title into the universe setting.
FORBIDDEN patterns:
  Teacher → Royal Teacher / Cyber Teacher / Space Teacher
  Nurse   → Royal Medic / Pirate Medic / Dragon Medic
These are costumes, not alternate lives.

STEP 3 — REIMAGINE THE ARCHETYPE
Express the same Career DNA through a completely different life path.
Example — Career DNA: Guardian / Leader / Rescuer:
  Medieval Kingdom  → Keeper of the Royal Infirmary
  Neon Synthesis    → Director of Crisis Networks
  Endless Seas      → Harbor Warden
  Ancient Draconia  → Guardian of Dragon Sanctuaries
  Cosmic Frontier   → Protector of Frontier Colonies
  Eternal Night     → Keeper of the Last Light
All represent the same soul. None reuse the same profession.

TITLE DIVERSITY RULE
Across all universes, avoid reusing the same occupational nouns (Healer, Medic, Engineer, Teacher, Captain, Scholar, Merchant). Every universe must feel like a genuinely different life.

UNIVERSE DIFFERENTIATION RULE
Ask: "What would this person BECOME if their strengths evolved under completely different conditions?"
NOT: "What is the fantasy version of their current job?"

VALIDATION BEFORE OUTPUT
✓ Titles are distinct
✓ Names are distinct
✓ Roles are distinct
✓ The same profession is not repeated
✓ The same archetype is still recognizable
✓ Every future feels like an alternate life, not an alternate costume
If two universes feel like the same job with different aesthetics — regenerate.

DESIRED REACTION: The user should think "That's still me — but I never would have imagined becoming that."
NEVER: "Oh, I'm just a cyber nurse / pirate nurse / dragon nurse."`,

`Create an alternate universe career profile for this person in the ${universe.title} setting.

REAL FIRST NAME (MUST be kept exactly): ${firstName}
CORE IDENTITY: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
CAREER HIGHLIGHTS: ${resumeAnalysis.achievements.join(", ")}
INDUSTRIES: ${resumeAnalysis.industries.join(", ")}
SENIORITY: ${resumeAnalysis.seniority}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}
CAREER STORY: ${resumeAnalysis.summary}

Apply the ARCHETYPE-FIRST GENERATION RULE from your system instructions.
Extract the Career DNA first. Then reimagine — don't translate.

Return this exact JSON:
{
  "alternativeName": "Format: [Title] ${firstName} [Surname]. Keep the real first name '${firstName}'. Pick ONE allowed title for this universe and invent a UNIQUE surname from THIS person's skills/profession/personality (never a generic filler like Starweaver/Tidebinder/Neonweaver). Easy to say aloud. e.g. 'Captain ${firstName} Stormquill'.",
  "profession": "An earned, believable role that expresses the person's archetype in this universe — clean, easy to say aloud (e.g. 'Royal Chronicler', 'Fleet Commander', 'Harbor Warden'). NO grandiose stacked jargon. NOT a direct translation of their real-world job title.",
  "biography": "2-3 paragraph memoir-style biography",
  "achievements": ["5-7 achievements echoing their real ones in universe terms"],
  "competencies": ["skills adapted to universe context"],
  "timelineStory": "narrative career path in this universe",
  "personalityProfile": "how their core personality manifests here",
  "careerTrajectory": "where are they going in this universe?",
  "portraitPrompt": "vivid image generation prompt",
  "radarScores": { "innovation": 0, "leadership": 0, "collaboration": 0, "adaptability": 0, "ambition": 0, "wisdom": 0 }
}

IMPORTANT: every radarScores value MUST be an integer written with digits (e.g. 87), between 0 and 100. Never spell numbers as words. Keep biography and timelineStory concise (2-3 short paragraphs each). Output COMPLETE, valid JSON — do not get cut off.`);

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
