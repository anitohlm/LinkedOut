// Agent 7: Butterfly Effect
import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysis } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { BUTTERFLY_EFFECT_PROMPT } from "@/lib/agents/prompts";

export async function POST(req: NextRequest) {
  try {
    const { decision, resumeAnalysis } = await req.json() as { decision: string; resumeAnalysis: ResumeAnalysis };
    if (!decision || !resumeAnalysis) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const userMessage = `Generate 4 alternate timelines for this changed decision.

DECISION: "${decision}"

PERSON'S ESSENCE:
Timeline Signature: ${resumeAnalysis.timelineSignature}
Core Archetypes: ${(resumeAnalysis.coreArchetypes ?? []).join(", ") || "not specified"}
Skills: ${resumeAnalysis.skills.join(", ")}
Personality: ${resumeAnalysis.personalityIndicators.join(", ")}

REQUIRED JSON FORMAT — output ALL 4 timelines, complete and valid:
{
  "timelines": [
    {
      "letter": "A",
      "type": "realistic",
      "codename": "The Quiet Roots",
      "butterflyImpactScore": 35,
      "title": "What they became in one sentence",
      "worldDescription": "2-3 sentences: how the world itself changed or evolved because of this person's path. The world changes too, not just the person.",
      "personalEvolution": [
        { "age": 28, "role": "Who they were at 28 — evocative, specific" },
        { "age": 42, "role": "Who they became at 42 — the turning point" },
        { "age": 62, "role": "Who they ended up as — legacy and cost" }
      ],
      "summary": "2-3 sentence narrative of this life. Personal. Cinematic. Not a job description.",
      "gains": ["3-5 specific gains"],
      "losses": ["3-5 specific sacrifices — be honest, no perfect futures"],
      "rippleEffects": [
        "Consequence 1 affecting another person or group",
        "Consequence 2",
        "Consequence 3"
      ],
      "legendaryOutcome": "One mythic sentence: the highest possible expression of this path.",
      "shadowOutcome": "One tragic sentence: the hidden cost — specific, not generic.",
      "milestones": [
        "Age 28: First specific milestone",
        "Age 35: Second milestone",
        "Age 52: Third milestone"
      ]
    }
  ],
  "stabilityDelta": -15
}

RULES:
- timeline A = realistic (impact 20-45), B = optimistic (impact 40-65), C = quiet/personal (impact 25-50), D = wildcard (impact 75-100, world may operate differently)
- At least one timeline must score above 80 on butterflyImpactScore
- No two timelines share the same profession, industry, or life context
- Every timeline has real losses — no perfect futures
- The wildcard (D) must surprise — give it a striking codename and an unexpected world shift
- Output COMPLETE valid JSON only — all 4 timelines fully formed`;

    const response = await callAI(BUTTERFLY_EFFECT_PROMPT, userMessage, [], 4000);

    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Agent 7 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
