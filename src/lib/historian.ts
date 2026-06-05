/**
 * Agent 8: The Multiversal Historian
 * Exists outside all timelines. Observes, never participates.
 * Emits ancient, omniscient, reflective narration as the story unfolds.
 */

export type HistorianEvent =
  | "multiverse-born"
  | "first-transmission"
  | "stability-rose"
  | "stability-fell"
  | "timeline-critical"
  | "divergence-approaching"
  | "intercept-survived"
  | "final-choice";

const LINES: Record<HistorianEvent, string[]> = {
  "multiverse-born": [
    "Six reflections of a single soul now stand apart. I have witnessed this moment in ten thousand lives — and never twice the same.",
    "The divergence has bloomed. Where there was one {name}, there are now many. Let the record begin.",
  ],
  "first-transmission": [
    "A voice reaches backward through time. Few ever answer themselves. Fewer still listen.",
    "The first transmission opens. Note it: the past has begun speaking to the future — and the future remembers.",
  ],
  "stability-rose": [
    "Timeline Stability has increased. The threads draw taut. The story holds its shape.",
    "The currents calm. {name} drifts closer to a self they could truly become.",
  ],
  "stability-fell": [
    "Timeline Stability has decreased. The threads loosen, and possibilities multiply — as do their dangers.",
    "A choice has rippled outward. The timeline frays at its edges. I have watched lesser divergences end worlds.",
  ],
  "timeline-critical": [
    "The timeline grows perilously thin. At this depth the Shadow stirs, and memory itself turns uncertain.",
    "Recorded for the ages: the timeline nears collapse. What is chosen now will echo the loudest.",
  ],
  "divergence-approaching": [
    "The user approaches a divergence point. Every road walked converges here, at the Council. Beyond it, only one remains.",
    "All selves are gathered. I have seen a thousand councils. They are always the last quiet moment before a life is chosen.",
  ],
  "intercept-survived": [
    "The Shadow reached through and was refused. Such crossings always leave a mark upon the record.",
    "A darker self spoke, and {name} did not yield. I note it, as I note all things that almost were.",
  ],
  "final-choice": [
    "A future has been chosen. The others dim, becoming what-might-have-been. I will keep them, as I keep all things.",
    "The chronicle closes. One life steps forward; the rest return to the silence between timelines. So it has always been.",
  ],
};

export function historianLine(event: HistorianEvent, name = "they"): string {
  const pool = LINES[event];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick.replace(/\{name\}/g, name);
}
