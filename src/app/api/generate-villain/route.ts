// Agent 6: Shadow Self — universe-native, tragic (not evil)
import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysis, UniverseType } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { getUniverse } from "@/lib/universes";
import { nameConvention, universeFailure } from "@/lib/universeNaming";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis, universeId, profile } = await req.json() as {
      resumeAnalysis: ResumeAnalysis; universeId?: UniverseType; profile?: any;
    };
    if (!resumeAnalysis) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const firstName = resumeAnalysis.firstName || (resumeAnalysis.name || "").split(" ")[0] || "";
    const u = universeId ? getUniverse(universeId) : null;

    const universeBlock = u ? `
════════════════════════════════════════════
THIS IS A CITIZEN OF ${u.title.toUpperCase()} — NOT A "FAILED" VERSION OF THEIR JOB
════════════════════════════════════════════
Universe: ${u.title} — ${u.lore}
${profile?.worldName ? `World: ${profile.worldName}${profile.eraName ? ` · ${profile.eraName}` : ""}.` : ""}
What ULTIMATE FAILURE looks like here: ${universeFailure(universeId!)}
NAMING: ${nameConvention(universeId!, firstName)}

RULES:
- DO NOT scale down their current role (e.g. "Failed Architect"). That is forbidden.
- This is a TRAGIC self, not a villain — someone whose same gifts curdled through excess, obsession, fear, pride, avoidance, or sacrifice.
- Reinterpret their Career DNA through THIS universe into a DIFFERENT, believable, emotionally powerful life.
- The name must make the universe instantly recognizable WITHOUT the label (often a haunting "The [X]" manifestation, e.g. "The Ash Scholar", "Ghost Process 771").` : "";

    const response = await callAI(
      "You are a tragic biographer who reveals the shadow a person's Career DNA could become within a specific universe. Tragic, not evil. Return valid JSON only.",
`Generate the SHADOW SELF — a tragic, distorted expression of this person, as a citizen of ${u?.title || "their world"}.

CAREER DNA: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
ACHIEVEMENTS: ${resumeAnalysis.achievements.join(", ")}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}
PRONOUNS: ${resumeAnalysis.pronouns || "they/them"} — use throughout; any title must match (never a contradicting gendered title).
${universeBlock}

Return JSON. notoriety, wealth, threatLevel are plain integers 0-100:
{
  "name": "their shadow NAME, native to this universe (recognizable as this world on sight)",
  "title": "their tragic title/epithet in this universe",
  "notoriety": 70, "wealth": 40, "threatLevel": 55,
  "originStory": "2-3 paragraphs: how the same gifts curdled — through excess, obsession, fear, pride, avoidance, or sacrifice. Specific to this universe.",
  "philosophy": "the belief that justifies their fall (sympathetic, not cartoonish)",
  "riseToPowar": "how they rose then lost themselves, in this universe's terms",
  "moralCompromises": ["4-6 gradual compromises, each understandable in context"],
  "alternateWorldview": "first-person — how they see the world now",
  "headlines": ["4 in-world archive lines about them, native to this universe"],
  "warningMessage": "a reflective warning to the user — tragic, personal",
  "portrait": "image generation prompt"
}
Output COMPLETE valid JSON.`);

    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Agent 6 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
