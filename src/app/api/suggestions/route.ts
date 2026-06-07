// Inspiration suggestions — contextual thought-starters for free-text replies
import { NextRequest, NextResponse } from "next/server";
import { callAI, extractJSON } from "@/lib/agents/foundry";

const THEMES: Record<string, string> = {
  galactic: "purpose, leadership, responsibility, legacy",
  cyberpunk: "ambition, success, innovation, self-determination",
  pirate: "freedom, adventure, risk, independence",
  dragon: "wisdom, growth, patience, sacrifice",
  medieval: "honor, duty, character, service",
  vampire: "belonging, identity, memory, connection",
  legendary: "fulfillment, peace, earned greatness, clarity",
  shadow: "temptation, regret, power, unfulfilled ambition",
};

export async function POST(req: NextRequest) {
  try {
    const { question, universeKey, speakerName, mode, resumeSummary, skills, answersRecap, relationshipStage, stability, recentIntercept } = await req.json();

    const themes = THEMES[universeKey] || "purpose, fear, freedom, belonging";
    const isCouncil = mode === "council";

    // After a Shadow interception, offer replies that react to the intrusion.
    if (recentIntercept) {
      try {
        const sys = `You write SHORT first-person lines a user might say right after a sinister alternate version of themselves (the "Shadow Self") hijacked their conversation and then vanished. The user is rattled. Tone options: wary, defiant, shaken, curious, or quietly tempted. First person. Max 8 words. No therapy-speak. Return ONLY JSON: { "suggestions": ["...","...","...","..."] }`;
        const usr = `The Shadow broke into the transmission, taunted them, and left. Their future self ("${speakerName}") is now back online.
Generate 4 varied replies the user might give — some defiant, one curious about the Shadow, one shaken, maybe one half-tempted. Seed: ${Math.random().toString(36).slice(2, 8)}.`;
        const res = await callAI(sys, usr, [], 300);
        const data = extractJSON<{ suggestions: string[] }>(res);
        const s = (data.suggestions || []).filter(Boolean).slice(0, 5);
        if (s.length) return NextResponse.json({ suggestions: s });
      } catch {}
      const POOL = [
        "Who was that?", "Don't listen to her.", "Part of me agreed with her.",
        "Was that... me?", "What did she mean by that?", "I'm not becoming that.",
        "She sounded so sure of herself.", "Why does she scare me?",
      ];
      return NextResponse.json({ suggestions: [...POOL].sort(() => Math.random() - 0.5).slice(0, 4) });
    }

    const sys = `You write SHORT first-person thought-starters that a user might choose to say in reply to a reflective question. They overcome blank-page anxiety. The user can ignore, edit, or replace them.

These must feel like the user almost typed them — emotionally intelligent, personal, plausible. The ideal reaction is "Damn, I was about to type exactly that."

HARD RULES:
- First person ("I want...", "I'm afraid...", "Maybe I've...").
- Concise: ${isCouncil ? "1-3 words each (single concepts)" : "max 8 words each"}.
- Reflect the speaking character's worldview/themes.
- NO therapy-speak, NO generic chatbot phrases, NO life-coach tone.
- Make them varied and fresh — not interchangeable.
Return ONLY valid JSON: { "suggestions": ["...", "...", "...", "...", "..."] }`;

    const usr = `The character "${speakerName}" (themes: ${themes}) just asked the user:
"${(question || "").slice(0, 300)}"

${isCouncil ? "This is the Council of Selves — generate suggestions reflecting COMPETING philosophies (e.g. Comfort / Freedom / Security / Purpose / Nothing)." : ""}

About the user:
- Essence: ${(resumeSummary || "a thoughtful professional at a crossroads").slice(0, 300)}
- Skills: ${(skills || []).slice(0, 8).join(", ")}
${answersRecap ? `- What they've already revealed:\n${answersRecap}` : ""}
${relationshipStage ? `- Relationship with this character: ${relationshipStage}` : ""}
${typeof stability === "number" ? `- Timeline feels ${stability >= 60 ? "steady" : "unstable"}.` : ""}

Generate ${isCouncil ? "5 short" : "4"} thought-starters they might genuinely choose. Seed: ${Math.random().toString(36).slice(2, 8)}.`;

    const res = await callAI(sys, usr, [], 400);
    const data = extractJSON<{ suggestions: string[] }>(res);
    const suggestions = (data.suggestions || []).filter(Boolean).slice(0, 5);
    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error("Suggestions error:", error);
    // Graceful fallback — never block the user
    return NextResponse.json({
      suggestions: ["I want more than this", "I'm afraid I'm wasting my potential", "I keep playing it safe", "I don't know what I want yet"],
    });
  }
}
