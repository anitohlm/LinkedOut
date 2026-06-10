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
FIRST NAME — transform "${firstName}" into a medieval/archaic form. If it sounds modern, apply period phonetics:
- Add Latin/Old English endings: -ia, -or, -yn, -wyn, -eth, -ald (-ia gives feminine grace; -eth/-ald give weight)
- Replace modern sounds: J→Joh/Jeh, C→K/Ch, x→cks, ck→k, y→i, modern vowel combos → archaic equivalents
- Examples: Honey→Honoria, Sarah→Sarai, John→Jehan, Michael→Michaelis, Carlos→Karolos, Emily→Aemilia, David→Daveth, Sofia→Saoirse, James→Jamus, Anna→Anwyn
- If the name already sounds period-appropriate (e.g. Eleanor, Roland, Arthur), keep it
SURNAME — invent a fresh heraldic surname every time — do NOT reuse Ashvale, Ironward, Thornkeep, Blackthorn, or any name you've seen before. Coin new two-part compounds from: stone/wood/field/hill/brook/crest/ward/hold/gate/moor/vale/spire + forge/keep/wick/thorpe/fell/worth/cross/mill/mount/bridge.
TITLE — add a noble/knightly title that matches the user's pronouns (${resumeAnalysis.pronouns || "check pronouns"}):
  • she/her → Lady, Dame, Mistress
  • he/him → Lord, Sir, Master
  • they/them or neutral → use a gender-neutral title: Warden, Steward, High, or the role itself as a title
Format: "[Title] [TransformedFirstName] [NewSurname]" or "[Title] [TransformedFirstName] of [NewPlace]".`,
      cyberpunk: `NEON SYNTHESIS names — digital identities, handles, aliases, protocol designations. Post-human, cybernetic.
The name should look like a username/process/designation, NOT a normal human name. Feel free to drop the surname or the whole human name.
THIS TIME use the "${cyber.label}" style — e.g. ${cyber.examples.map(e => `"${e}"`).join(", ")}.
VARY the format every time — do NOT default to the "//" slash style unless it is the one named above; never always output "${firstName}//Prime".
Do NOT prepend human titles like Lord/Captain here.`,
      pirate: `ENDLESS SEAS names — the format is ALWAYS: [Rank] [First name] "[Epithet]" [Invented surname].
FOUR parts, no exceptions.
FIRST NAME — use "${firstName}" as-is. Do NOT replace it with another name.
RANK — choose the rank CLOSEST to the user's real-world profession/Career DNA. Read their actual job and skills, then match:
  • Captain — visionary leader, founder, CEO, executive, high-level strategist
  • Quartermaster — operations, logistics, project manager, COO, resource manager
  • Navigator — data analyst, researcher, strategist, cartographer, systems thinker
  • Helmsman — engineer, developer, programmer, hands-on technician who steers execution
  • Gunner — security, defense, enforcement, risk analyst, penetration tester
  • Doctor — healthcare, medicine, therapist, wellness, counselor, scientist
  • Craftsman — designer, builder, architect, maker, artisan, hardware engineer
  • Cook — chef, hospitality, food industry, event planner, nurturer
  • Musician — DJ, music producer, performer, musician, singer, composer, sound designer, artist, entertainer, creative, brand storyteller. If the user makes or performs music in any form → ALWAYS Musician, never Captain.
  • Look-out — analyst, researcher, scout, journalist, intelligence, auditor
  • Sniper — specialist, precision expert, niche consultant, sharpshooter in their field
  • Assassin — competitive strategist, disruptor, closer, high-stakes negotiator
  • Spy — intelligence, UX researcher, ethnographer, undercover ops, diplomat
  • Beast Tamer — trainer, coach, animal handler, community manager, HR specialist
  • Scholar — academic, writer, educator, librarian, historian, knowledge curator
  • Steward — finance, accountant, estate manager, compliance, administrator
  • Tailor — fashion, styling, recruiter (fits people to roles), consultant
  • Botanist — biologist, environmental scientist, farmer, sustainability, naturalist
  • Mate — generalist, early-career, versatile crew member, jack-of-all-trades
  • Cabin Boy — intern, entry-level, apprentice, newcomer to the field
Pick the rank that best maps to the user's real career. NEVER default to Captain just because it sounds heroic.
EPITHET — a quoted nickname between the first name and surname, INVENTED from scratch based on this specific person's résumé, personality, and achievements. Read their Career DNA and coin something no one has heard before — a phrase that could only belong to them. It should sound like a legend whispered on the docks: what are they known for, feared for, or celebrated for at sea? The style can be an adjective ("The Relentless"), a body-part metaphor ("Ironjaw", "Saltblood"), a nature image ("The Gale"), a skill made mythic ("Tidecaller", "The Reckoning"), or any other evocative form. NEVER pick from a fixed list — invent fresh every time.
SURNAME — INVENT a fresh sea-forged surname every time — do NOT reuse Stormwake, Tidebreaker, Saltwind, Waveborn, Driftmark, Reefborn, Crestwake, or any name you've seen before. Coin new compounds from ocean/weather/port elements: tide, wave, gale, drift, salt, foam, shoal, helm, reef, surge, wreck, port, keel + breaker, rider, born, mark, wind, song, wake, run, shore, stone, crest, blade.
EXAMPLE (for a user named Nova who is a data analyst): Navigator Nova "The Cartographer" Tidesong.`,
      dragon: `ANCIENT DRACONIA names — Valyrian/Targaryen style. Names are elongated, melodic, and built with sounds like "ae", "yr", "rh", "ny", "ae", "on", "ar", "ys", "en", "ael".
TRANSFORM the first name "${firstName}" into a Draconia-native form using these sounds — do NOT use "${firstName}" unchanged. Examples of the transformation style: Elena → Elhaena, Marcus → Maerys, James → Jaehaerys, Sofia → Syraea, David → Daevyn, Anna → Aenara, Carlos → Caerlon, Maria → Myraea.
ALWAYS use the format: "[TransformedName] of House [HouseName]"
INVENT a fresh House name every time — do NOT reuse Ashscale, Emberwing, Flameheart, Stormwyrm, Brightclaw, Inkbranch. Coin new House names from draconic/elemental roots: ember, ash, stone, iron, bone, cinder, scale, flame, sky, shadow, rune, void, blood, star + wing, claw, fang, heart, eye, born, vale, peak, rift, forge, keep, brand, fire, wyrm — but combine them in new ways each time.`,
      galactic: `COSMIC FRONTIER names — spacefaring, futuristic, sharp-consonant. The name must sound like it belongs centuries into a starfaring future.
THREE approaches — pick the one that best fits this person's vibe:
1. SLEEK FUTURE SPIN — phonetically sharpen "${firstName}" with hard consonants (X, Z, V, K, Y), keeping it recognizable but evolved: Sofia→Sofyx, Marcus→Marcxen, Elena→Elynx, James→Jaxen, David→Daxid, Chris→Chryzx, Maria→Maryxa, Alex→Alxyn, Anna→Annyx, Carlos→Karlvex.
2. FULLY COSMIC — replace entirely with a celestial/alien invention: Zephyra, Vexon, Kaelyx, Zynara, Orxan, Solvexa, Nexari, Dravox, Zaryn, Kyrex.
3. DESIGNATION HYBRID — callsign fused with cosmic surname: Axon-7, Echo Prime, Cipher, Pulse, Relay.
SURNAME — INVENT a fresh cosmic surname every time — do NOT reuse Voss, Nova, Helix, Zenith, Orion, Driftmark, Reefborn, or any prior name. Coin new ones from space/physics roots: nexar, vexis, oryn, crestix, solveig, dravon, zynex, kelvorn, arxen, quazyn.
Optionally add a rank: Commander, Director, Specialist, Architect, Prime.
RULE: Must feature hard consonants (X, Z, V, K). NEVER soft or medieval-sounding. NEVER "Nova Reefborn" style (that's pirate, not galactic).`,
      vampire: `ETERNAL NIGHT names — immortal, gothic, aristocratic, ancient.
CRITICAL: Do NOT use "${firstName}" unchanged. Transform it into its gothic/ancient variant — as if bestowed centuries ago when this person was turned. Find the Latin, Eastern European, or archaic cognate:
${firstName} → examples of the transformation style: Alex→Alaric or Aleksander | Maria→Mara or Morvaine | Sofia→Seraphel | David→Vladis or Dorian | Chris→Crisovan | James→Iacov | Anne→Anneliese | Michael→Mihaelos | Sarah→Saelara | Carlos→Carvael.
TITLE — pick one old-world title that matches the user's pronouns (${resumeAnalysis.pronouns || "check pronouns"}): she/her → Lady, Countess, or Baroness; he/him → Lord, Count, or Baron; neutral → Warden, Broker, or Keeper.
SURNAME — INVENT a fresh nocturnal surname every time — do NOT reuse Nocturne, Veilborn, Duskbane, Umbra, Hollowmere, Nightwhisper, or any name you've seen before. Coin new ones from Latin/Romanian/Gothic roots: veldrane, morthis, ashenwood, valemont, craveth, seloris, duskveil, ashenmere, noctival, solvaine.
Format: "[Title] [TransformedFirstName] [NewSurname]" — e.g. "Count Vladis Veldrane" or "Lady Seraphel Morthis".`,
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

First name: ${firstName}${universeId === "vampire" || universeId === "galactic" ? ` — TRANSFORM this per the NAMING CONVENTION below, do NOT use it unchanged` : ` (keep it exactly)`}
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
- worldName: a vivid, original name for a specific civilization or realm within ${universe.title}. Invent it like a cartographer naming a place for the first time — draw from the world's terrain, culture, dominant element, or founding myth. Every generation should feel like a different corner of the universe: vary the linguistic root (Latin, Slavic, Arabic, invented phonetics), the word structure (compound, single evocative word, place + descriptor), and the feel (harsh, melodic, ancient, strange). It should feel like a real place with its own history and geography, invented freely and never derived from the person's job.
- eraName: a named historical period within that world. Invent a fresh, specific name every time — vary the format: sometimes "The [Adjective] [Noun]" (The Scorching Veil, The Flux Convergence), sometimes "[The] Age/Era/Epoch of [Thing]" (The Age of Whispering Currents), sometimes a proper-noun event name (The Sundering, The Long Silence, The Second Bloom). Never reuse the same structure twice in a row. Has nothing to do with the person's résumé.
- worldDescription: 1-2 sentences describing what makes this civilization distinctive — its geography, political structure, dominant culture, or founding history. This must NOT reference the user's profession, skills, or industry in any way. A musician's world should not be about music; an engineer's world should not be about building. The world existed before this person arrived.

Once the world exists, ask: given this person's core strengths and personality — what would they naturally grow into HERE? Their profession is what this world made of them, not a translation of their real job.

════════════════════════════════════════════
UNIVERSE IMMERSION — achievements & skills must feel NATIVE
════════════════════════════════════════════
Every achievement and competency must be written as if by someone who has never heard of the modern world. The underlying human ability stays (leadership, pattern recognition, crisis handling, negotiation, systems thinking) — but the FORM it takes is entirely of this civilization.

BANNED in non-tech universes (Medieval, Pirate, Dragon, Vampire): web, network, breach, protocol, infrastructure, database, cloud, server, system, incident response, SLA, KPI, roadmap, sprint, deployment, cybersecurity, governance charter, training program, stakeholder, onboarding, pipeline, metrics, dashboard.

Per-universe transformation guide:
• MEDIEVAL KINGDOM — leadership → "Commanded the defence of three keeps during the Siege of Valmoor"; analysis → "Read the enemy's battle formation and repositioned the flank before the charge"; governance → "Drafted the Ironwood Accord, settling a decade of border disputes between noble houses"; skill-building → "Trained thirty squires in the art of mounted reconnaissance".
• ENDLESS SEAS — project delivery → "Navigated the Stormbreak Passage in three days, beating the trade fleet by a fortnight"; leadership → "Rallied a fractured crew through the Doldrums of Sorrow without losing a single man"; negotiation → "Brokered a truce between the Saltwind Brotherhood and the Merchant Lords of Vel Canta".
• ANCIENT DRACONIA — incident response → "Sealed the Ashrift wards before the void-wyrms breached the inner sanctum"; network security → "Wove a lattice of flame-seals across seven mountain passes, holding the border for three years"; governance → "Authored the Draconic Compact of the Seven Houses, binding rival clans under one flame-oath"; skill-building → "Mentored a cohort of young wyrm-readers in the lost art of ember-divination".
• COSMIC FRONTIER — leadership → "Led the first successful survey mission into the Vanthar Nebula, charting 14 habitable systems"; analysis → "Decoded the colonial distress pattern and rerouted the fleet before the ion storm hit"; governance → "Drafted the Frontier Charter of Rights, adopted by six independent colony stations".
• ETERNAL NIGHT — leadership → "Guided a fractured coven through the Night of Hollow Bells without a single soul lost to the Veil"; analysis → "Traced the memory-theft pattern back to its origin across four centuries of buried records"; negotiation → "Brokered a 50-year silence between the Ashborne Court and the Duskward Conclave".

Return this exact JSON:
{
  "alternativeName": "A culturally authentic name for a native of ${universe.title}, following the NAMING convention above. Make the universe recognizable from the name alone. Easy to say aloud (or read, for Neon Synthesis handles).",
  "profession": "SHORT role title only — 2 to 5 words max, no sentences, no descriptions, no dashes followed by explanations. Examples: 'Warden of the Veil', 'Sentinel Architect', 'Fleet Navigator', 'Rune Forger'. Native to this world, shaped by this person's strengths.",
  "worldName": "an original civilization/realm name within ${universe.title} — invented freely, not derived from this person's career",
  "eraName": "a specific, invented era name — vary the format each generation (e.g. 'The Scorching Veil', 'The Long Silence', 'Age of Broken Tides', 'The Second Bloom')",
  "worldDescription": "1-2 concise sentences describing what makes this civilization distinctive",
  "biography": "2-3 paragraph memoir-style biography written in the voice and language of this world — no modern vocabulary",
  "achievements": ["5-7 achievements, each a vivid in-world story event following the UNIVERSE IMMERSION guide above. No modern vocabulary. Each entry should feel like a line from this civilization's historical record."],
  "competencies": ["6-8 skills that are NATIVE PRACTICES of this world — fully reimagined, never just a universe adjective prepended to a modern skill. Each skill must be something a native practitioner of this civilization would actually be known for. BAD: 'Ember Network Security', 'Flame Incident Response', 'Pirate Cloud Management'. GOOD examples by universe — Dragon: 'Wyrm-Sign Reading', 'Flame-Seal Warding', 'Draconic Compact Drafting', 'Omen Council Leadership'; Medieval: 'Siege Tactics', 'Oath-Bond Negotiation', 'Keep Fortification', 'Battle Formation Reading'; Pirate: 'Tide & Current Reading', 'Crew Morale Command', 'Port Authority Negotiation', 'Storm Navigation'; Galactic: 'Stellar Cartography', 'Colony Logistics', 'Neural Interface Design', 'Quantum Signal Analysis'; Vampire: 'Memory Extraction', 'Court Intrigue & Shadow Counsel', 'Veil Crossing', 'Blood-Oath Binding'; Cyberpunk: 'Neural Exploit Mapping', 'Ghost Protocol Design', 'Grid Infiltration', 'Corporate Psych Profiling'."],
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
