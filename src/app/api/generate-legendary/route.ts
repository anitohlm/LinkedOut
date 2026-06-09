// Agent 5: Legendary Self — universe-native
import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysis, UniverseType } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { getUniverse } from "@/lib/universes";
import { nameConvention, universeSuccess } from "@/lib/universeNaming";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis, universeId, profile } = await req.json() as {
      resumeAnalysis: ResumeAnalysis; universeId?: UniverseType; profile?: any;
    };
    if (!resumeAnalysis) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const firstName = resumeAnalysis.firstName || (resumeAnalysis.name || "").split(" ")[0] || "";
    const u = universeId ? getUniverse(universeId) : null;

    const universeBlock = u ? `
This person is a citizen of ${u.title} — not a promoted version of their real job.
Universe: ${u.title} — ${u.lore}
${profile?.worldName ? `World: ${profile.worldName}${profile.eraName ? ` · ${profile.eraName}` : ""}.` : ""}
What ultimate success looks like here: ${universeSuccess(universeId!)}
Naming: ${nameConvention(universeId!, firstName)}

Guidance:
- Rather than scaling up their current role (e.g. "Master Architect" from "Architect"), reimagine their Career DNA through this universe's culture into a different life — a mythic figure native to this world.
- The title and name should make the universe recognizable on their own, without the label.
- Make them feel mythic and admired by their world, with one unforgettable defining achievement.` : "";

    const sys = "You are a mythic biographer who reimagines a person's Career DNA as a legendary figure native to a specific universe. Return valid JSON only.";
    const usr = `Generate the LEGENDARY SELF — the highest possible expression of this person, as a citizen of ${u?.title || "their world"}.

CAREER DNA: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
ACHIEVEMENTS: ${resumeAnalysis.achievements.join(", ")}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}
PRONOUNS: ${resumeAnalysis.pronouns || "they/them"} — use throughout; any title must match (never a contradicting gendered title).
${universeBlock}

Return JSON:
{
  "title": "their legendary NAME + title, native to this universe (e.g. 'Lord ${firstName} Storyforge, Keeper of the Thousand Tales'). Recognizable as this universe on sight.",
  "organization": "the order/realm/faction they lead or embody in this universe",
  "era": "the named age they are remembered for",
  "scores": { "legacy": 95, "influence": 90, "heroism": 92 },
  "achievements": ["5-7 mythic achievements expressed in this universe's terms"],
  "historicalImpact": "2-3 sentences: what changed in this world because of them",
  "inspirationalNarrative": "3-4 paragraphs, cinematic, in-world. The pinnacle of their Career DNA realized in this universe.",
  "definingQuote": "a line they're remembered for, in this universe's voice",
  "mythicPortrait": "image generation prompt"
}
Scores are integers 0-100 (digits). Output COMPLETE valid JSON.`;

    let response: string;
    try { response = await callAI(sys, usr); }
    catch { response = await callAI(sys, usr); } // Prompt Shield is non-deterministic — one retry usually clears it

    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Agent 5 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
