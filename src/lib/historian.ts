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
  | "anomaly"
  | "final-choice"
  | "recruiter-accepted"
  | "recruiter-negotiated"
  | "recruiter-declined"
  | "title-earned";

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
  "anomaly": [
    "The record stutters. A page I have not yet written already bears {name}'s name.",
    "Two versions of this moment now exist in my ledger. Only one of you remembers both.",
    "I have observed countless timelines. I have never seen one watch back. This one does.",
    "Something moves between the lines of the chronicle. It was not invited.",
    "A memory surfaces that has not happened yet. The order of things is loosening.",
    "The threads cross where they should run parallel. {name} can feel it, even now.",
  ],
  "final-choice": [
    "A future has been chosen. The others dim, becoming what-might-have-been. I will keep them, as I keep all things.",
    "The chronicle closes. One life steps forward; the rest return to the silence between timelines. So it has always been.",
  ],
  "recruiter-accepted": [
    "An offer extended across the multiverse has been accepted. {name} steps forward to meet a future they did not yet know they wanted.",
    "The parchment is signed. A new alliance is recorded in the ledger. I have seen this moment matter more than most.",
  ],
  "recruiter-negotiated": [
    "{name} did not simply say yes. They negotiated — a small act that reveals a larger character. I note it carefully.",
    "The offer was met with conditions. The record shows: {name} knows the weight of what they are worth.",
  ],
  "recruiter-declined": [
    "The offer was refused. What {name} turned away will remain in the ledger as a door that was seen and left unopened.",
    "A refusal. Not all records are acceptances. This one tells me more about {name} than many yeses would have.",
  ],
  "title-earned": [
    "A new title enters the record. It is a small thing, a word — yet titles shape the ones who carry them.",
    "The archive opens a new column: {name} is now known by something they were not before. The story has turned a page.",
  ],
};

export function historianLine(event: HistorianEvent, name = "they"): string {
  const pool = LINES[event];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick.replace(/\{name\}/g, name);
}
