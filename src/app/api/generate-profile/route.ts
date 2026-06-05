// Agent 2: Multiverse Character Builder
import { NextRequest, NextResponse } from "next/server";
import { AlternateProfile, ResumeAnalysis, UniverseType } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { buildCharacterPrompt } from "@/lib/agents/prompts";
import { getUniverse } from "@/lib/universes";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis, universeId } = await req.json() as { resumeAnalysis: ResumeAnalysis; universeId: UniverseType };
    if (!resumeAnalysis || !universeId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const universe = getUniverse(universeId);
    const firstName = resumeAnalysis.firstName || (resumeAnalysis.name || "").split(" ")[0] || "";

    const response = await callAI(buildCharacterPrompt(universeId), `Create an alternate universe career profile for this person in the ${universe.title} setting.

REAL FIRST NAME (MUST be kept exactly): ${firstName}
CORE IDENTITY: ${resumeAnalysis.timelineSignature}
SKILLS: ${resumeAnalysis.skills.join(", ")}
CAREER HIGHLIGHTS: ${resumeAnalysis.achievements.join(", ")}
INDUSTRIES: ${resumeAnalysis.industries.join(", ")}
SENIORITY: ${resumeAnalysis.seniority}
PERSONALITY: ${resumeAnalysis.personalityIndicators.join(", ")}
CAREER STORY: ${resumeAnalysis.summary}

Return this exact JSON:
{
  "alternativeName": "MUST start with the real first name '${firstName}', followed by a NEW themed surname/epithet for this universe",
  "profession": "their title/role",
  "biography": "2-3 paragraph memoir-style biography",
  "achievements": ["5-7 achievements echoing their real ones in universe terms"],
  "competencies": ["skills adapted to universe context"],
  "timelineStory": "narrative career path in this universe",
  "personalityProfile": "how their core personality manifests here",
  "careerTrajectory": "where are they going in this universe?",
  "portraitPrompt": "vivid image generation prompt",
  "radarScores": { "innovation": 0, "leadership": 0, "collaboration": 0, "adaptability": 0, "ambition": 0, "wisdom": 0 }
}

IMPORTANT: every radarScores value MUST be an integer written with digits (e.g. 87), between 0 and 100. Never spell numbers as words. Output valid JSON only.`);

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
