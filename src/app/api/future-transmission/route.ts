// Agent 3: Future Me — ongoing conversation
import { NextRequest, NextResponse } from "next/server";
import { FutureSelf, ResumeAnalysis } from "@/types";
import { callAI } from "@/lib/agents/foundry";
import { buildFutureMeSystemPrompt } from "@/lib/agents/prompts";
import { getUniverse } from "@/lib/universes";

export async function POST(req: NextRequest) {
  try {
    const { userMessage, futureSelf, resumeAnalysis, conversationHistory, timelineStability } =
      await req.json() as {
        userMessage: string;
        futureSelf: FutureSelf;
        resumeAnalysis: ResumeAnalysis;
        conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
        timelineStability?: number;
      };

    if (!userMessage || !futureSelf) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const universe = getUniverse(futureSelf.universeId);
    const stability = timelineStability ?? 100;
    const messageCount = conversationHistory.length;

    const systemPrompt = buildFutureMeSystemPrompt(
      futureSelf.name, futureSelf.year, universe.title,
      futureSelf.personality, futureSelf.philosophy,
      futureSelf.achievements, futureSelf.regrets,
      futureSelf.lessons, futureSelf.memories,
      resumeAnalysis.skills, universe.lore, universe.terminology
    );

    const depthNote = messageCount < 3
      ? "\n\nEARLY: Be somewhat mysterious. Don't reveal everything. Let them earn your trust."
      : messageCount < 8
      ? "\n\nMID: Trust is building. Share a regret or memory unprompted."
      : "\n\nDEEP: Full trust. Speak freely. Reveal hidden truths.";

    const response = await callAI(
      systemPrompt + depthNote,
      userMessage,
      conversationHistory
    );

    const isVillainIntercept = stability < 35 && Math.random() < 0.2;
    return NextResponse.json({
      message: response,
      isVillainIntercept,
      stabilityDelta: isVillainIntercept ? -8 : 0,
    });
  } catch (error: any) {
    console.error("Agent 3 transmission error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
  }
}
