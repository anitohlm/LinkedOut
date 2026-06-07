// Shadow Intercept — the villain hijacks a Future Me transmission
import { NextRequest, NextResponse } from "next/server";
import { callAI, extractJSON } from "@/lib/agents/foundry";

export async function POST(req: NextRequest) {
  try {
    const { futureMeAdvice, firstName } = await req.json();
    const name = firstName || "you";

    // Scripted opening — the Shadow arrives mysteriously, as if it's been watching all along.
    const INTROS = [
      ["She's still telling that story?", "Interesting.", "I've been listening to all of it.", "Every word you gave her."],
      ["You really believe that's what happened?", "No wonder her timeline ended the way it did.", "Mine didn't.", "I made sure of it."],
      ["There you are.", "I wondered when you'd get interesting enough.", "She plays it so safe, doesn't she?", "I never had the patience."],
    ];
    const intro = INTROS[Math.floor(Math.random() * INTROS.length)];

    let challenges: string[] = [];
    try {
      const sys = `You are the Shadow Self — an alternate version of the user who chose ambition and speed over patience, and succeeded by their own measure. You have broken into a private transmission between the user and their wiser future self. Your voice is cold, certain, persuasive, a little contemptuous — never graphically harmful. You believe you were right.`;
      const usr = `The wiser future self just told the user: "${(futureMeAdvice || "patience and staying true to your values").slice(0, 400)}"

Write 4 SHORT, DISTINCT lines (max 12 words each) where you push back on that advice and tempt the user toward your path. Make them specific to what was just said. Vary the rhythm — a question, a boast, a quiet warning, a hook. Be unforgettable, not repetitive.
Variation seed: ${Math.random().toString(36).slice(2, 8)}.
Return JSON: { "lines": ["...", "...", "...", "..."] }`;
      const res = await callAI(sys, usr, [], 400);
      const data = extractJSON<{ lines: string[] }>(res);
      if (Array.isArray(data.lines) && data.lines.length) challenges = data.lines.slice(0, 4);
    } catch {
      challenges = [];
    }

    // Randomized fallback pool — used if the model returns nothing, so it's never identical.
    if (!challenges.length) {
      const POOL = [
        "Patience is the tax the timid pay.",
        "I stopped waiting for permission. You should too.",
        `Everything she warned you about — I walked through all of it, ${name}.`,
        "She built a quiet life. I built something they can't ignore.",
        "Comfort is just a slower way of giving up.",
        "You felt that pull just now. That was me.",
        "Ask her what she gave up to stay 'stable.'",
        "I don't regret the speed. I regret nothing.",
        "Every door she told you to wait at — I kicked open.",
        "You're not afraid of failing. You're afraid of how much you want it.",
      ];
      // shuffle and take 4
      challenges = [...POOL].sort(() => Math.random() - 0.5).slice(0, 4);
    }

    return NextResponse.json({
      lines: [...intro, ...challenges],
      revealAfter: intro.length, // identity reveals after the scripted intro
      identity: {
        name: `Empress ${firstName || "Ascendant"} Ascendant`,
        timeline: "Omega-13",
        classification: "Shadow Self",
      },
    });
  } catch (error: any) {
    console.error("Shadow Intercept error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
