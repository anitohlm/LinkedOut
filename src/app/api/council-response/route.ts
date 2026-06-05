// Agent 10: Council of Selves
import { NextRequest, NextResponse } from "next/server";
import { UniverseType } from "@/types";
import { callAI } from "@/lib/agents/foundry";
import { buildCouncilPrompt } from "@/lib/agents/prompts";

export async function POST(req: NextRequest) {
  try {
    const { userMessage, speaker, allMembers, conversationHistory, isClosing, sharedMemory } = await req.json();
    if (!userMessage || !speaker) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const closingNote = isClosing ? "\n\nCLOSING: Pose the final question in YOUR voice: 'Which future are you willing to become?'" : "";
    const memoryNote = sharedMemory
      ? `\n\nWHAT YOU REMEMBER — earlier private transmissions between you and them. Reference these naturally if relevant; they prove you remember your conversations:\n${sharedMemory}`
      : "";
    const systemPrompt = buildCouncilPrompt(
      speaker.futureSelf.name, speaker.futureSelf.universeId,
      speaker.futureSelf.personality, speaker.futureSelf.philosophy, allMembers
    ) + memoryNote + closingNote;

    const history = conversationHistory.slice(-8).map((m: any) => ({
      role: m.role === "future-self" ? "assistant" : m.role as "user" | "assistant",
      content: m.speaker ? `[${m.speaker}]: ${m.content}` : m.content,
    }));

    const response = await callAI(systemPrompt, userMessage, history);

    return NextResponse.json({
      message: response,
      speakerName: speaker.futureSelf.name,
      speakerTitle: speaker.futureSelf.title,
      universeId: speaker.universeId as UniverseType,
      isClosing: isClosing || false,
    });
  } catch (error: any) {
    console.error("Agent 10 error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
