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
      const sys = `You are the Shadow Self — a cautionary alternate version of the user who chose ambition and speed over patience and values, and won by their own measure. You are HIJACKING a temporal transmission between the user and their wiser Future Self. You are cold, triumphant, persuasive, and unsettling — never graphically harmful. You believe you were right and you are here to prove the Future Self wrong.`;
      const usr = `The wiser Future Self just advised the user: "${(futureMeAdvice || "patience and staying true to your values").slice(0, 400)}"

Write 4 SHORT intercept lines (max 12 words each) that directly mock and dismantle that advice. Be chilling and personal. Reference how caution cost them, and how your way got results. Return JSON: { "lines": ["...", "...", "...", "..."] }`;
      const res = await callAI(sys, usr, []);
      const data = extractJSON<{ lines: string[] }>(res);
      if (Array.isArray(data.lines)) challenges = data.lines.slice(0, 4);
    } catch {
      // fallback challenges if AI fails — demo must never break
      challenges = [
        "Patience? Patience is the tax the timid pay.",
        "I stopped waiting for permission. You should too.",
        `Everything she warned you about — I survived all of it, ${name}.`,
        "She built a quiet life. I built an empire.",
      ];
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
