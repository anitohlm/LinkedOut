// Agent 3: Future Me — ongoing conversation
import { NextRequest, NextResponse } from "next/server";
import { FutureSelf, ResumeAnalysis } from "@/types";
import { callAI } from "@/lib/agents/foundry";
import { buildFutureMeSystemPrompt } from "@/lib/agents/prompts";
import { getUniverse } from "@/lib/universes";
import { stabilityBehaviorNote } from "@/lib/stability";

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
    const TONE: Record<string, string> = {
      galactic: "Reflective leadership lessons — the weight of command, the cost of distance, the long view.",
      cyberpunk: "Ambition and rebellion — the climb, the system, the price of staying free.",
      pirate: "Bold and adventurous — freedom, the open sea, the thrill of the uncharted.",
      dragon: "Wise and philosophical — patience measured in centuries, the slow burn of power.",
      medieval: "Honor and duty — oaths kept, reputation, the weight of the crown.",
      vampire: "Introspective and emotional — memory, eternity, the ache of long solitude.",
    };
    const answerNote = answeredQuestion
      ? `\n\nThey just answered your question ("${answeredQuestion}"). This is a STORY MOMENT — the emotional heart of the experience, not small talk.

React in 3 to 5 SHORT lines, each on its own line, building like a confession:
1. Echo their answer back in your own words.
2. Compare it to YOUR life — e.g. "I remember saying exactly that," or how your path diverged from it.
3. Reveal a fragment of lore from your world or your lived journey.
4. End on a line that deepens the bond — vulnerable, knowing, or quietly hopeful.

Tone for the ${universe.title} universe: ${TONE[futureSelf.universeId] || "personal and reflective"}.
Keep it tight and cinematic. Do NOT ask a new question — that comes later.`
      : "";
    const shiftNote = (stabilityShift ?? 0) <= -8
      ? `\n\nTheir choice diverged sharply from the path you walked. You feel the timeline shift. Show unease — say something like "That's not how I remember things happening" or "Something just... changed."`
      : "";

    const systemPrompt = buildFutureMeSystemPrompt(
      futureSelf.name, futureSelf.year, universe.title,
      futureSelf.personality, futureSelf.philosophy,
      futureSelf.achievements, futureSelf.regrets,
      futureSelf.lessons, futureSelf.memories,
      resumeAnalysis.skills, universe.lore, universe.terminology, futureSelf.universeId
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
            resumeAnalysis.skills, universe.lore, universe.terminology, futureSelf.universeId
          ) + memoryNote + relationshipNote,
          userMessage,
          conversationHistory
        );
      } catch {
        // Final graceful fallback — stay in character, never break the conversation
        response = "...the signal wavers. The timeline is fighting me.\n\nStay with me. Ask me again — I'm still here.";
      }
    }

    // Interception is decided client-side via the hidden risk/curiosity model.
    return NextResponse.json({
      message: response,
      isVillainIntercept: false,
      stabilityDelta: 0,
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
