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

    // Neon Synthesis handle styles — pick one at RANDOM per generation so the cyberpunk name
    // isn't always [FirstName]//Prime. Each style steers the model toward a different format.
    const CYBER_STYLES: { label: string; examples: string[] }[] = [
      { label: "dotted suffix", examples: [`${firstName}.exe`, `${firstName}.Protocol`, `${firstName}.Null`] },
      { label: "numeric tag", examples: [`${firstName}_7`, `${firstName.toUpperCase()}-9`, `${firstName}_v2`] },
      { label: "system prefix", examples: [`Cipher${firstName}`, `Kernel${firstName}`, `Hex${firstName}`, `Ghost${firstName}`] },
      { label: "slash designation", examples: [`${firstName}//Prime`, `${firstName}//Root`] },
      { label: "process / daemon id", examples: [`GhostProcess-13`, `${firstName}-Daemon`, `Proc_${firstName}`] },
      { label: "pure callsign (drop the human name)", examples: ["NullVector", "The Lattice Architect", "Voidcaller", "Echo of the Grid"] },
    ];
    const cyber = CYBER_STYLES[Math.floor(Math.random() * CYBER_STYLES.length)];

    // Per-universe naming conventions — each world has its own culture & linguistics.
    // The goal is cultural authenticity, NOT name similarity. A name should make the
    // universe instantly recognizable, and may fully abandon the user's real surname.
    const NAME_CONVENTIONS: Record<string, string> = {
      medieval: `MEDIEVAL KINGDOM names — nobility, guilds, royal houses, knighthood.
Use noble/knightly titles (Lord, Lady, Sir, Master, Dame) and earthy heraldic surnames or "of [Place]".
INVENT a fresh heraldic surname every time — do NOT reuse Ashvale, Ironward, Thornkeep, Blackthorn, or any name you've seen before. Coin new two-part compounds from natural/feudal elements: stone, wood, field, hill, brook, crest, ward, hold, gate, moor, vale, spire + forge, keep, wick, thorpe, fell, worth, cross, mill, mount, bridge.
Format: "[Title] ${firstName} [NewSurname]" or "${firstName} of [NewPlace]".`,
      cyberpunk: `NEON SYNTHESIS names — digital identities, handles, aliases, protocol designations. Post-human, cybernetic.
The name should look like a username/process/designation, NOT a normal human name. Feel free to drop the surname or the whole human name.
THIS TIME use the "${cyber.label}" style — e.g. ${cyber.examples.map(e => `"${e}"`).join(", ")}.
VARY the format every time — do NOT default to the "//" slash style unless it is the one named above; never always output "${firstName}//Prime".
Do NOT prepend human titles like Lord/Captain here.`,
      pirate: `ENDLESS SEAS names — sailors, captains, pirates, navigators.
Use sea/weather surnames; optionally a nautical rank (Captain, Navigator, Quartermaster).
INVENT a fresh nautical surname every time — do NOT reuse Stormwake, Tidebreaker, Saltwind, Waveborn, Driftmark, Blackcurrent, or any name you've seen before. Coin new compounds from ocean/weather elements: tide, wave, gale, drift, salt, foam, squall, shoal, helm, keel, mast, port, reef, surge, wreck + breaker, rider, chaser, born, mark, wind, sworn, bound, song, strike, wake, run.
Format: "[Rank] ${firstName} [NewSurname]" or "${firstName} [NewSurname]".`,
      dragon: `ANCIENT DRACONIA names — Valyrian/Targaryen style. Names are elongated, melodic, and built with sounds like "ae", "yr", "rh", "ny", "ae", "on", "ar", "ys", "en", "ael".
TRANSFORM the first name "${firstName}" into a Draconia-native form using these sounds — do NOT use "${firstName}" unchanged. Examples of the transformation style: Elena → Elhaena, Marcus → Maerys, James → Jaehaerys, Sofia → Syraea, David → Daevyn, Anna → Aenara, Carlos → Caerlon, Maria → Myraea.
ALWAYS use the format: "[TransformedName] of House [HouseName]"
INVENT a fresh House name every time — do NOT reuse Ashscale, Emberwing, Flameheart, Stormwyrm, Brightclaw, Inkbranch. Coin new House names from draconic/elemental roots: ember, ash, stone, iron, bone, cinder, scale, flame, sky, shadow, rune, void, blood, star + wing, claw, fang, heart, eye, born, vale, peak, rift, forge, keep, brand, fire, wyrm — but combine them in new ways each time.`,
      galactic: `COSMIC FRONTIER names — colonists, explorers, interstellar pioneers.
Use stellar/space surnames; optionally an exploration rank (Commander, Pilot, Pioneer).
INVENT a fresh stellar surname every time — do NOT reuse Starforge, Novareach, Solaris, Kepler, Astralyn, Horizonfall, or any name you've seen before. Coin new compounds from space/celestial elements: nova, pulsar, void, orbit, helix, drift, arc, flux, quasar, nebula, ion, zenith, apex, sol, lux + reach, fall, born, ward, mark, forge, field, runner, seeker, sworn, drift, scan, jump, chart, run.
Format: "[Rank] ${firstName} [NewSurname]" or "${firstName} [NewSurname]".`,
      vampire: `ETERNAL NIGHT names — mystical, elegant, melancholic, immortal.
Use shadowed/nocturnal surnames; optionally an old-world title (Lord, Lady, Count, Baron, Countess).
INVENT a fresh nocturnal surname every time — do NOT reuse Nocturne, Veilborn, Duskbane, Umbra, Hollowmere, Nightwhisper, or any name you've seen before. Coin new compounds from darkness/gothic elements: veil, dusk, dawn, shade, ash, mist, crypt, grave, hollow, shadow, sable, blood, raven, ivory, silver + born, mere, bane, fall, song, thorn, keep, blade, light, wick, vale, mark, borne, stone, croft.
Format: "[Title] ${firstName} [NewSurname]" or "${firstName} [NewSurname]".`,
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

════════════════════════════════════════════
WORLD — invent first, career second
════════════════════════════════════════════
The world is INDEPENDENT of the person's career. Invent it like a world-builder, not a career counsellor:
- worldName: a vivid, original name for a specific civilization or realm within ${universe.title}. It should feel like a real place with its own history, geography, and culture — invented freely, not derived from the person's job. No two generations should produce the same name.
- eraName: a named historical period within that world — a time of upheaval, flourishing, discovery, or decline. Invented freely; has nothing to do with the person's résumé.
- worldDescription: 1-2 sentences describing what makes this civilization distinctive.

Once the world exists, ask: given this person's core strengths and personality — what would they naturally grow into HERE? Their profession is what this world made of them, not a translation of their real job.

Return this exact JSON:
{
  "alternativeName": "A culturally authentic name for a native of ${universe.title}, following the NAMING convention above. Make the universe recognizable from the name alone. Easy to say aloud (or read, for Neon Synthesis handles).",
  "profession": "The role this person grew into within this specific world — shaped by both their core strengths AND what this civilization values and needs. Not a re-skin of their real job. A role that feels native to worldName.",
  "worldName": "an original civilization/realm name within ${universe.title} — invented freely, not derived from this person's career",
  "eraName": "a named historical period in this world — invented freely",
  "worldDescription": "1-2 concise sentences describing what makes this civilization distinctive",
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
