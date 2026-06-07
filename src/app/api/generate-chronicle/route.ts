// Agent 9: Chronicle Generator
import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysis, UniverseType } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";
import { CHRONICLE_PROMPT } from "@/lib/agents/prompts";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis, historianLog, finalChoice, allCharacterNames } = await req.json() as {
      resumeAnalysis: ResumeAnalysis; historianLog: any[]; finalChoice: UniverseType; allCharacterNames: Record<string, string>;
    };
    if (!resumeAnalysis || !finalChoice) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const logSummary = historianLog.slice(0, 20).map((e: any) => `[${e.type}]: ${e.summary}`).join("\n");
    const characters = Object.entries(allCharacterNames).map(([u, n]) => `${u}: ${n}`).join(", ");

    const response = await callAI(CHRONICLE_PROMPT, `Generate the personalized novella.

IDENTITY: ${resumeAnalysis.timelineSignature}
ALTERNATE SELVES: ${characters}
FINAL CHOICE: ${finalChoice}
JOURNEY: ${logSummary || "A journey through the multiverse."}

Return JSON: { "title", "prologue", "chapters": [{ "number", "title", "content" }], "epilogue" }. Keep each chapter to 2-3 short paragraphs so the whole novella fits. Output COMPLETE valid JSON only.`, [], 4000);

    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Agent 9 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
