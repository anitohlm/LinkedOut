// Agent 9: Chronicle Generator — editions model, powered by callAI
import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysis, UniverseType } from "@/types";
import { callAI, extractJSON } from "@/lib/agents/foundry";

export async function POST(req: NextRequest) {
  try {
    const { resumeAnalysis, historianLog, finalChoice, allCharacterNames, editionNumber, previousEditions, acceptedPositions, activeTitle, timelineStability } =
      await req.json() as {
        resumeAnalysis: ResumeAnalysis;
        historianLog: any[];
        finalChoice: UniverseType;
        allCharacterNames: Record<string, string>;
        editionNumber: number;
        previousEditions?: Array<{ editionNumber: number; title: string; epilogue: string }>;
        acceptedPositions?: Array<{ universeId: string; title: string; faction: string; ts: number }>;
        activeTitle?: string;
        timelineStability?: number;
      };

    if (!resumeAnalysis || !finalChoice) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const editionLabel = `Edition ${toRoman(editionNumber)}`;
    const characters = Object.entries(allCharacterNames).map(([u, n]) => `${u}: ${n}`).join(", ");
    const logSummary = (historianLog || []).slice(-40).map((e: any) => e.text || e.summary || "").filter((s: string) => s).join("\n");

    const stabilityLabel = timelineStability == null ? null
      : timelineStability >= 80 ? "Stable"
      : timelineStability >= 55 ? "Drifting"
      : timelineStability >= 30 ? "Fractured"
      : "Near Collapse";
    const stabilityContext = stabilityLabel
      ? `TIMELINE STABILITY AT RECORDING: ${timelineStability}% — ${stabilityLabel}. Let the stability of the timeline color the tone of this edition — a stable timeline reads with clarity and confidence; a fractured one should carry tension, fragmentation, uncertainty.`
      : "";

    const positionsContext = acceptedPositions?.length
      ? `POSITIONS ACCEPTED ACROSS TIMELINES:\n${acceptedPositions.map(p => `- "${p.title}" with ${p.faction} (${p.universeId} timeline)`).join("\n")}${activeTitle ? `\nCURRENT ACTIVE TITLE: "${activeTitle}"` : ""}\nThese accepted positions represent commitments made, alliances forged, and roles taken on. Reference them as part of the subject's unfolding story.`
      : "";

    const previousContext = previousEditions?.length
      ? `PREVIOUS CHRONICLE EDITIONS:\n${previousEditions.map(e => `Edition ${toRoman(e.editionNumber)}: "${e.title}" — ${e.epilogue?.slice(0, 200)}...`).join("\n")}\n\nThis new edition should reference, contrast, or build upon what has changed since the previous edition.`
      : "";

    const systemPrompt = `You are the Multiversal Historian — a documentarian, not a storyteller of endings. You record history as it unfolds. A chronicle is never finished; it is only a snapshot of a moment in an ongoing saga. Never use the words "final", "end", "conclusion", or "completed journey". Instead describe each chronicle as a preserved volume, a recorded edition, a chapter in an ongoing saga. Return valid JSON only.`;

    const userPrompt = `Record ${editionLabel} of the Chronicle.

IDENTITY: ${resumeAnalysis.timelineSignature}
ALTERNATE SELVES ENCOUNTERED: ${characters}
PRIMARY TIMELINE CHOSEN: ${finalChoice}
RECENT MEMORIES & EVENTS:
${logSummary || "A journey through the multiverse continues."}
${stabilityContext}
${positionsContext}
${previousContext}

Return JSON: { "title", "prologue", "chapters": [{ "number", "title", "content" }], "epilogue" }
- The title should reflect this edition (e.g. include "${editionLabel}" or reference the evolution since the last edition)
- The prologue sets the stage for this moment in the ongoing saga
- 2-3 chapters of 2-3 short paragraphs each
- The epilogue closes this edition but hints that the journey continues — the multiverse remains open
- Never describe this as the end or a final chapter
Output COMPLETE valid JSON only.`;

    const response = await callAI(systemPrompt, userPrompt, [], 3000);
    return NextResponse.json(extractJSON(response));
  } catch (error: any) {
    console.error("Chronicle error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function toRoman(n: number): string {
  const romans = ["","I","II","III","IV","V","VI","VII","VIII","IX","X"];
  return romans[n] ?? String(n);
}
