// Agent 3: Future Me — ongoing conversation
import { NextRequest, NextResponse } from "next/server";
import { FutureSelf, ResumeAnalysis } from "@/types";
import { callAI } from "@/lib/agents/foundry";
import { buildFutureMeSystemPrompt } from "@/lib/agents/prompts";
import { getUniverse } from "@/lib/universes";
import { stabilityBehaviorNote, interceptChance } from "@/lib/stability";

export async function POST(req: NextRequest) {
  try {
    const { userMessage, futureSelf, resumeAnalysis, conversationHistory, timelineStability,
      interviewAnswers, relationshipStage, stabilityShift, answeredQuestion } =
      await req.json() as {
        userMessage: string;
        futureSelf: FutureSelf;
        resumeAnalysis: ResumeAnalysis;
        conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
        timelineStability?: number;
        interviewAnswers?: string;        // recap text of stored answers
        relationshipStage?: string;
        stabilityShift?: number;          // the delta from the answer they just gave
        answeredQuestion?: string;        // the interview question they just answered
      };

    if (!userMessage || !futureSelf) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const universe = getUniverse(futureSelf.universeId);
    const stability = timelineStability ?? 100;
    const messageCount = conversationHistory.length;

    const memoryNote = interviewAnswers
      ? `\n\nWHAT YOU'VE LEARNED ABOUT THEM (reference naturally, e.g. "You once told me you feared wasting your potential"):\n${interviewAnswers}`
      : "";
    const relationshipNote = relationshipStage
      ? `\n\nYOUR BOND: You are at the "${relationshipStage}" stage with them. Let your warmth and openness match that closeness.`
      : "";
    const answerNote = answeredQuestion
      ? `\n\nThey just answered your question ("${answeredQuestion}") with what they chose. React to their answer specifically and personally — affirm it, challenge it, or reflect on how it mirrors your own past. Keep it short.`
      : "";
    const shiftNote = (stabilityShift ?? 0) <= -8
      ? `\n\nTheir choice diverged sharply from the path you walked. You feel the timeline shift. Show unease — say something like "That's not how I remember things happening" or "Something just... changed."`
      : "";

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

    let response: string;
    try {
      response = await callAI(
        systemPrompt + depthNote + stabilityBehaviorNote(stability, "future") + memoryNote + relationshipNote + answerNote + shiftNote,
        userMessage,
        conversationHistory
      );
    } catch (e: any) {
      // Content filter or transient model error — retry once with a stripped-down, safe prompt
      console.warn("Future transmission retry (filtered/failed):", e.message);
      try {
        response = await callAI(
          buildFutureMeSystemPrompt(
            futureSelf.name, futureSelf.year, universe.title,
            futureSelf.personality, futureSelf.philosophy,
            futureSelf.achievements, futureSelf.regrets,
            futureSelf.lessons, futureSelf.memories,
            resumeAnalysis.skills, universe.lore, universe.terminology
          ) + memoryNote + relationshipNote,
          userMessage,
          conversationHistory
        );
      } catch {
        // Final graceful fallback — stay in character, never break the conversation
        response = "...the signal wavers. The timeline is fighting me.\n\nStay with me. Ask me again — I'm still here.";
      }
    }

    // Shadow Self may hijack the channel when the timeline grows unstable
    const isVillainIntercept = Math.random() < interceptChance(stability);
    return NextResponse.json({
      message: response,
      isVillainIntercept,
      stabilityDelta: isVillainIntercept ? -8 : 0,
    });
  } catch (error: any) {
    console.error("Agent 3 transmission error:", error);
    // Never hard-fail the conversation
    return NextResponse.json({
      message: "...static. Something in the timeline interfered. Say that again.",
      isVillainIntercept: false,
      stabilityDelta: 0,
    });
  }
}
