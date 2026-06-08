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

    // Per-universe naming conventions — each world has its own culture & linguistics.
    // The goal is cultural authenticity, NOT name similarity. A name should make the
    // universe instantly recognizable, and may fully abandon the user's real surname.
    const NAME_CONVENTIONS: Record<string, string> = {
      medieval: `MEDIEVAL KINGDOM names — nobility, guilds, royal houses, knighthood.
Use noble/knightly titles (Lord, Lady, Sir, Master, Dame) and earthy heraldic surnames or "of [Place]".
Examples (for "${firstName}"): "Lord ${firstName} Ashvale", "Sir ${firstName} Ironward", "${firstName} of Gildenspire", "Master ${firstName} Thornkeep", "${firstName} Blackthorn".`,
      cyberpunk: `NEON SYNTHESIS names — digital identities, handles, aliases, protocol designations. Post-human, cybernetic.
The name should look like a username/process/designation, NOT a normal human name. Feel free to drop the surname entirely.
Examples (for "${firstName}"): "${firstName}.exe", "${firstName.toUpperCase()}-7", "Cipher${firstName}", "${firstName}//Prime", "Kernel${firstName}", "${firstName}.Null", "GhostProcess-13", "Hex${firstName}".
Do NOT prepend human titles like Lord/Captain here.`,
      pirate: `ENDLESS SEAS names — sailors, captains, pirates, navigators.
Use sea/weather surnames; optionally a nautical rank (Captain, Navigator, Quartermaster).
Examples (for "${firstName}"): "${firstName} Stormwake", "Captain ${firstName} Blackcurrent", "${firstName} Tidebreaker", "${firstName} Saltwind", "${firstName} Waveborn", "${firstName} Driftmark".`,
      dragon: `ANCIENT DRACONIA names — dragon clans, ancient scholars, mythic lineages.
Use fire/scale/clan surnames; optionally a scholarly/clan title (Sage, Elder, Keeper).
Examples (for "${firstName}"): "${firstName} Emberwing", "Sage ${firstName} Inkbranch", "${firstName} Flameheart", "${firstName} Ashscale", "${firstName} Stormwyrm", "${firstName} Brightclaw".`,
      galactic: `COSMIC FRONTIER names — colonists, explorers, interstellar pioneers.
Use stellar/space surnames; optionally an exploration rank (Commander, Pilot, Pioneer).
Examples (for "${firstName}"): "${firstName} Starforge", "${firstName} Novareach", "${firstName} Solaris", "Commander ${firstName} Kepler", "${firstName} Astralyn", "${firstName} Horizonfall".`,
      vampire: `ETERNAL NIGHT names — mystical, elegant, melancholic, immortal.
Use shadowed/nocturnal surnames; optionally an old-world title (Lord, Lady, Count, Baron).
Examples (for "${firstName}"): "${firstName} Nocturne", "Lord ${firstName} Veilborn", "${firstName} Duskbane", "${firstName} Umbra", "${firstName} Hollowmere", "${firstName} Nightwhisper".`,
    };
    const nameConvention = NAME_CONVENTIONS[universeId] || "";

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

════════════════════════════════════════════
NAMING — make this person feel BORN in this world, not a renamed version of themselves
════════════════════════════════════════════
${nameConvention}
RULES:
- DO NOT just modify the user's real surname (e.g. avoid Codemar → Codemark / Codeforge / Codryn). That breaks the illusion.
- Give them a name a native of this civilization would actually have, following the convention above.
- You may keep the first name "${firstName}", transform it, or — when it fits the world (especially Neon Synthesis) — fully reinterpret it.
- The reader should recognize the universe from the name alone. Aim for cultural authenticity, not similarity to the original name.

Also give this person a real place to live, not just a genre. "${universe.title}" is only a broad setting; name the specific civilization and historical era they belong to, shaped by their Career DNA so the same setting feels different for different people:
- worldName: a specific realm or civilization within the setting. For example, Ancient Draconia could become "The Ember Dominion", Endless Seas "The Crimson Archipelago", or Cosmic Frontier "Helios Reach".
- eraName: the named period they live in, such as "The Seventh Flight", "Season of Black Sails", or "Star Cycle 88".
- worldDescription: one or two short sentences describing this world.
A teacher might live in "The Library Peaks" during the "Age of Forgotten Tomes"; a nurse in "The Calmwater Archipelago" during "The Healing Tide". Let the world's culture and history echo this person's craft.

Return this exact JSON:
{
  "alternativeName": "A culturally authentic name for a native of ${universe.title}, following the NAMING convention above. Make the universe recognizable from the name alone. Easy to say aloud (or read, for Neon Synthesis handles).",
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

    // Names are intentionally culture-native now — they may diverge fully from the
    // real name (especially Neon Synthesis handles), so we no longer force the first name.
    const altName = ((d.alternativeName as string) || firstName || "").trim();

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
