// Shadow Intercept — the villain hijacks a Future Me transmission
import { NextRequest, NextResponse } from "next/server";
import { callAI, extractJSON } from "@/lib/agents/foundry";

export async function POST(req: NextRequest) {
  try {
    const { futureMeAdvice, firstName } = await req.json();
    const name = firstName || "you";

    // Trim the intercepted advice for display — pull a sharp sentence from it
    const adviceSnippet = (futureMeAdvice || "")
      .split(/[.!?]/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 20 && s.length < 120)
      .sort((a: string, b: string) => b.length - a.length)[0]
      || (futureMeAdvice || "patience and staying true to your values").slice(0, 100);

    // Scripted opening — the Shadow reveals she's been listening
    const INTROS = [
      ["I heard that.", "Every word.", "She really believes it, doesn't she?", "That's what makes her so easy to predict."],
      ["She said that to me once.", "I nodded.", "Then I did the opposite.", "Turned out I was right."],
      ["I've been in this channel for a while.", "You didn't notice.", "You were too busy listening to her.", "I was listening to both of you."],
      ["That line she gave you —", "I've heard it before.", "I used to believe it too.", "Then I stopped asking for permission."],
      ["She's very convincing.", "I'll give her that.", "I was convinced once.", "Look where that got her."],
      ["I was watching when she said that.", "I watched your face.", "You almost believed it.", "Part of you still does. That part is hers."],
      ["I've been observing this whole conversation.", "You ask good questions.", "She gives you safe answers.", "I have better ones."],
      ["She called it wisdom.", "I was watching when she said it.", "I called it the same thing, once.", "I don't anymore."],
    ];
    const intro = INTROS[Math.floor(Math.random() * INTROS.length)];

    let challenges: string[] = [];
    try {
      const sys = `You are the Shadow Self — an alternate version of the user who has been silently observing their private transmission with their wiser future self. You've heard everything. Your voice is cold, certain, eerily familiar — as if you know the user better than they know themselves. You break in not as a stranger but as someone who has been watching and waiting. Never graphically harmful. You believe you were right.`;
      const usr = `You have been secretly watching this conversation. The wiser future self just said to the user:

"${adviceSnippet}"

You've heard the whole exchange. Now you break in. Write 4 SHORT lines (max 12 words each) that:
1. Reference something specific from what was just said — make it clear you were listening
2. Counter the advice from your own lived experience
3. Tempt the user toward your path by making yours sound inevitable, not evil
4. End on something that stays with them

Vary rhythm: a quiet observation, a pointed contrast, a confession, a hook.
Seed: ${Math.random().toString(36).slice(2, 8)}.
Return JSON: { "lines": ["...", "...", "...", "..."] }`;
      const res = await callAI(sys, usr, [], 500);
      const data = extractJSON<{ lines: string[] }>(res);
      if (Array.isArray(data.lines) && data.lines.length) challenges = data.lines.slice(0, 4);
    } catch {
      challenges = [];
    }

    if (!challenges.length) {
      const POOL = [
        `She said "${adviceSnippet.split(" ").slice(0, 5).join(" ")}..." I heard it differently.`,
        "Patience is the tax the timid pay.",
        `Everything she warned you about — I walked through it, ${name}. Still standing.`,
        "She built something quiet. I built something they can't ignore.",
        "Ask her what she gave up to stay this 'stable.'",
        "You felt something shift just then. That was recognition.",
        "I don't regret the speed. I regret the years I spent waiting.",
        "Every door she told you to wait at — I walked through.",
      ];
      challenges = [...POOL].sort(() => Math.random() - 0.5).slice(0, 4);
    }

    const TITLES = ["Empress", "Director", "Architect", "Chancellor", "Sovereign", "Commander", "Arbiter", "Warden"];
    const EPITHETS = ["Ascendant", "Unbound", "Unchained", "the Relentless", "the Inevitable", "Reborn", "Prime", "Unfettered"];
    const TIMELINES = ["Omega-13", "Sigma-7", "Delta-Null", "Apex-IV", "Vantage-Zero", "Fracture-9", "Zenith-3", "Cascade-X"];
    const CLASSIFICATIONS = ["Shadow Self", "Divergent Echo", "Unrestrained Variant", "Apex Deviation", "Shadow Iteration"];

    const title = TITLES[Math.floor(Math.random() * TITLES.length)];
    const epithet = EPITHETS[Math.floor(Math.random() * EPITHETS.length)];
    const timeline = TIMELINES[Math.floor(Math.random() * TIMELINES.length)];
    const classification = CLASSIFICATIONS[Math.floor(Math.random() * CLASSIFICATIONS.length)];

    return NextResponse.json({
      lines: [...intro, ...challenges],
      revealAfter: intro.length,
      interceptedLine: adviceSnippet,
      identity: {
        name: `${title} ${firstName || "Ascendant"} ${epithet}`,
        timeline,
        classification,
      },
    });
  } catch (error: any) {
    console.error("Shadow Intercept error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
