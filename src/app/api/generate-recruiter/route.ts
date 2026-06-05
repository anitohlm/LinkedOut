// Agent 4: Multiverse Recruiter
import { NextRequest, NextResponse } from "next/server";
import { AlternateProfile, MultiverseInvitation, UniverseType } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { buildRecruiterPrompt } from "@/lib/agents/prompts";

export async function POST(req: NextRequest) {
  try {
    const { profile, universeId } = await req.json() as { profile: AlternateProfile; universeId: UniverseType };
    if (!profile || !universeId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const response = await callAI(buildRecruiterPrompt(universeId), `Generate a recruitment invitation for this character.

CHARACTER: ${profile.alternativeName}
TITLE: ${profile.profession}
ACHIEVEMENTS: ${profile.achievements.join("; ")}
PERSONALITY: ${profile.personalityProfile}

Return this exact JSON:
{
  "factionName": "the specific organization making this offer",
  "opportunityTitle": "the role being offered",
  "salutation": "personal opening line",
  "body": "3-4 paragraphs. Real person from this universe. Specific and compelling.",
  "benefits": [
    {"icon": "emoji", "text": "benefit in universe language"},
    {"icon": "emoji", "text": "benefit"},
    {"icon": "emoji", "text": "benefit"},
    {"icon": "emoji", "text": "compensation in universe currency"}
  ],
  "sign": "sender name and title",
  "options": {
    "accept": "what happens if they accept",
    "negotiate": "what happens if they negotiate",
    "decline": "what happens if they decline"
  }
}`);

    const d = extractJSON<Record<string, unknown>>(response);
    const invitation: MultiverseInvitation & Record<string, unknown> = {
      id: `inv_${universeId}_${Date.now()}`,
      universeId,
      factionName: d.factionName as string,
      opportunityTitle: d.opportunityTitle as string,
      description: d.body as string,
      options: d.options as { accept: string; negotiate: string; decline: string },
      salutation: d.salutation,
      benefits: d.benefits,
      sign: d.sign,
    };
    return NextResponse.json(invitation);
  } catch (error: any) {
    console.error("Agent 4 error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate invitation" }, { status: 500 });
  }
}
