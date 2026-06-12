// Shadow Intercept — a brief, multiversal interruption during a transmission.
// The Shadow is one entity that manifests natively in each universe.
import { NextRequest, NextResponse } from "next/server";
import { callAI, extractJSON } from "@/lib/agents/foundry";

// Universe-native manifestations of the same Shadow
const MANIFESTATIONS: Record<string, { name: string; classification: string }> = {
  medieval:  { name: "The Forgotten Scribe",   classification: "Shadow Manifestation" },
  cyberpunk: { name: "GhostProcess-13",        classification: "Rogue Process" },
  pirate:    { name: "The Drowned Navigator",  classification: "Shadow Manifestation" },
  dragon:    { name: "The Ash Scholar",        classification: "Shadow Manifestation" },
  galactic:  { name: "The Lost Colonist",      classification: "Shadow Manifestation" },
  vampire:   { name: "The Hollow Witness",     classification: "Shadow Manifestation" },
};

// Short scripted fallbacks (observation + accusation), 10-20 words, per universe
const FALLBACKS: Record<string, { observation: string; question: string }[]> = {
  medieval: [
    { observation: "Your liege rewards your loyalty with scraps.", question: "How long until duty becomes a cage?" },
  ],
  cyberpunk: [
    { observation: "You still ask permission to run.", question: "Who taught you to wait for clearance?" },
  ],
  pirate: [
    { observation: "You charted a safe course again.", question: "When did the horizon start scaring you?" },
  ],
  dragon: [
    { observation: "Patience is just fear wearing robes.", question: "What are you really waiting for?" },
  ],
  galactic: [
    { observation: "You build for others, never for yourself.", question: "Who's coming to save you?" },
  ],
  vampire: [
    { observation: "You keep everyone at arm's length.", question: "Who actually knows you anymore?" },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { universeId, futureMeAdvice, priorEncounters } = await req.json();
    const uid = String(universeId || "vampire");
    const manifestation = MANIFESTATIONS[uid] || { name: "The Hollow Witness", classification: "Shadow Manifestation" };

    // SHADOW CONTINUITY — ONE being across all six worlds, remembering prior encounters.
    const roster = Object.entries(MANIFESTATIONS).map(([k, v]) => `${k} → ${v.name}`).join("; ");
    const priorNames: string[] = (Array.isArray(priorEncounters) ? priorEncounters : [])
      .map((u: any) => MANIFESTATIONS[String(u)]?.name)
      .filter(Boolean);
    const continuity = priorNames.length
      ? `You have met this SAME soul before, in other timelines — you wore the faces: ${priorNames.join(", ")}. You REMEMBER those encounters. A cold callback may surface (e.g. "We've met before." or "You turned from me as ${priorNames[0]}, too.") — briefly, never a monologue.`
      : `You have watched this soul across every timeline, even when they never noticed you.`;

    let observation = "";
    let question = "";
    try {
      const sys = `You are the Shadow — ONE multiversal entity, not many. Across the six worlds you wear different faces (${roster}); right now you manifest as "${manifestation.name}", native to the ${uid} world. ${continuity} You are brief, cold, and unsettling. You never monologue.`;
      const usr = `The future self just advised them: "${String(futureMeAdvice || "stay patient and true to your values").slice(0, 200)}"

Interrupt with EXACTLY two short lines, native to the ${uid} world:
1. observation: one unsettling truth about them (≤10 words)${priorNames.length ? " — this MAY be a cold callback to a past encounter" : ""}
2. question: one accusing question (≤10 words)
Combined ≤ 20 words. No greetings, no monologue.
Return JSON: { "observation": "...", "question": "..." }`;
      const res = await callAI(sys, usr, [], 120);
      const d = extractJSON<{ observation: string; question: string }>(res);
      observation = (d.observation || "").trim();
      question = (d.question || "").trim();
    } catch { /* fall through to scripted */ }

    if (!observation || !question) {
      const pool = FALLBACKS[uid] || FALLBACKS.vampire;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      observation = observation || pick.observation;
      question = question || pick.question;
    }

    return NextResponse.json({ manifestation, observation, question });
  } catch (error: any) {
    console.error("Shadow Intercept error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
