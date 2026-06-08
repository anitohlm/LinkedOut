/**
 * Timeline Stability — the central gameplay mechanic.
 * Stability fluctuates based on insight, growth, temptation, and conflict.
 * It never only decreases. Players should feel their choices matter.
 */

export type StabilityStatus = "harmonized" | "stable" | "unstable" | "critical" | "collapse";

export interface StabilityTier {
  min: number;
  max: number;
  status: StabilityStatus;
  label: string;
  effect: string;
  color: string;
}

// Ordered high → low. Ranges per design spec.
export const STABILITY_TIERS: StabilityTier[] = [
  {
    min: 100, max: 100, status: "harmonized",
    label: "Harmonized Timeline",
    effect: "All futures are briefly singing the same note. This is rare.",
    color: "#7ee8e1",
  },
  {
    min: 70, max: 99, status: "stable",
    label: "Stable Timeline",
    effect: "Your futures are aligned. The path forward is recognizable.",
    color: "#4ecdc4",
  },
  {
    min: 30, max: 69, status: "unstable",
    label: "Unstable Timeline",
    effect: "Conflicting futures are pulling against each other. Stay grounded.",
    color: "#9d91ff",
  },
  {
    min: 1, max: 29, status: "critical",
    label: "Critical Timeline",
    effect: "Reality is fracturing. The Shadow stirs in the cracks.",
    color: "#f0a050",
  },
  {
    min: 0, max: 0, status: "collapse",
    label: "Timeline Collapse",
    effect: "The timeline has shattered. New paths emerge from the wreckage.",
    color: "#f07070",
  },
];

export function getTier(stability: number): StabilityTier {
  const s = clamp(stability);
  return STABILITY_TIERS.find(t => s >= t.min && s <= t.max) || STABILITY_TIERS[STABILITY_TIERS.length - 1];
}

export function statusFromStability(stability: number): StabilityStatus {
  return getTier(stability).status;
}

export function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function applyDelta(current: number, delta: number): { stability: number; status: StabilityStatus } {
  const stability = clamp(current + delta);
  return { stability, status: statusFromStability(stability) };
}

/** 0 (no corruption) → 1 (max corruption). Kicks in below 30%. */
export function corruptionLevel(stability: number): number {
  const s = clamp(stability);
  if (s >= 30) return 0;
  if (s === 0) return 1;
  return Math.min(1, (30 - s) / 30);
}

// ── Stability Event System ──────────────────────────────────────────────────

export type StabilityEventType =
  | "future-self-alignment"
  | "council-resolution"
  | "shadow-resistance"
  | "universe-completion"
  | "historian-reflection"
  | "relationship-growth"
  | "shadow-temptation"
  | "contradictory-decision"
  | "timeline-drift"
  | "shadow-interception";

interface EventDef {
  range: [number, number]; // [min, max] delta (positive = gain, negative = loss)
  messages: string[];
}

const EVENT_DEFS: Record<StabilityEventType, EventDef> = {
  "future-self-alignment": {
    range: [3, 8],
    messages: [
      "The futures briefly align.",
      "A truth echoes across every timeline.",
      "Something recognized itself across the divide.",
      "The signal between your selves grows clearer.",
    ],
  },
  "council-resolution": {
    range: [5, 10],
    messages: [
      "The Council reaches accord. The timelines settle.",
      "Conflicting voices find a common thread.",
      "Resolution strengthens the record.",
      "The Council's wisdom steadies the timeline.",
    ],
  },
  "shadow-resistance": {
    range: [5, 10],
    messages: [
      "Authenticity reinforces the timeline.",
      "You stayed yourself. The fractures close.",
      "The shortcut refused. The timeline holds.",
      "Resistance becomes anchor.",
    ],
  },
  "universe-completion": {
    range: [10, 15],
    messages: [
      "Timeline Anchor Acquired.",
      "A core truth uncovered. The timeline strengthens.",
      "New anchor point established across the multiverse.",
      "This universe has revealed what it came to say.",
    ],
  },
  "historian-reflection": {
    range: [3, 8],
    messages: [
      "A genuine answer echoes forward through time.",
      "The Historian notes something true.",
      "Honest reflection stabilizes the record.",
      "The chronicle grows more coherent.",
    ],
  },
  "relationship-growth": {
    range: [2, 6],
    messages: [
      "Trust across timelines deepens.",
      "Your future self remembers this moment.",
      "The bond between selves grows stronger.",
      "A thread of trust woven through time.",
    ],
  },
  "shadow-temptation": {
    range: [-5, -15],
    messages: [
      "The Shadow leaves a fracture in the record.",
      "The shortcut costs more than it gives.",
      "Easy answers destabilize the timeline.",
      "The Shadow smiles. The timeline shifts.",
    ],
  },
  "contradictory-decision": {
    range: [-3, -10],
    messages: [
      "Conflicting memories begin to emerge.",
      "The timeline notices the contradiction.",
      "Your futures are less sure of you now.",
      "A fork appears where there should be a road.",
    ],
  },
  "timeline-drift": {
    range: [-2, -8],
    messages: [
      "A multiversal anomaly passes through.",
      "Reality echo detected. Minor fracture.",
      "The timelines shift without warning.",
      "Something moved that shouldn't have.",
    ],
  },
  "shadow-interception": {
    range: [-5, -12],
    messages: [
      "The Shadow's intrusion fractures the link.",
      "The interception leaves a scar on the timeline.",
      "Reality destabilized by the Shadow's passage.",
      "The breach closes, but not cleanly.",
    ],
  },
};

function randInt(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

export interface StabilityEvent {
  delta: number;
  message: string;
  type: StabilityEventType;
}

/** Generate a stability event with a random delta within the event's range and a random narrative message. */
export function makeStabilityEvent(type: StabilityEventType): StabilityEvent {
  const def = EVENT_DEFS[type];
  const [lo, hi] = def.range;
  const delta = randInt(Math.min(lo, hi), Math.max(lo, hi));
  const message = def.messages[Math.floor(Math.random() * def.messages.length)];
  return { delta, message, type };
}

/** Apply a named stability event, returning the new state and event payload. */
export function applyEvent(
  current: number,
  type: StabilityEventType
): { stability: number; status: StabilityStatus; event: StabilityEvent } {
  const event = makeStabilityEvent(type);
  const { stability, status } = applyDelta(current, event.delta);
  return { stability, status, event };
}

/**
 * Hidden Shadow Interception Risk. Never surfaced to the user as a number.
 */
export function interceptionRisk(opts: {
  stability: number;
  curiosity: number;
  affinity?: number;   // GLOBAL Shadow Affinity — engaging the Shadow makes it bolder everywhere
  risky?: boolean;
  vulnerable?: boolean;
}): number {
  const s = clamp(opts.stability);
  const base = 0.03;
  const instability = ((100 - s) / 100) * 0.45;
  const curiosity = Math.min(0.30, Math.max(0, opts.curiosity) * 0.015);
  const affinity = Math.min(0.30, Math.max(0, opts.affinity || 0) * 0.06); // each "hear them out" (+1) ≈ +6% everywhere
  const riskBonus = opts.risky ? 0.12 : 0;
  const vulnBonus = opts.vulnerable ? 0.10 : 0;
  return Math.min(0.9, base + instability + curiosity + affinity + riskBonus + vulnBonus);
}

export function curiosityGain(opts: {
  revealedSelf?: boolean;
  risky?: boolean;
  challenged?: boolean;
  surprising?: boolean;
}): number {
  let g = 0.5;
  if (opts.revealedSelf) g += 2;
  if (opts.risky) g += 1.5;
  if (opts.challenged) g += 2;
  if (opts.surprising) g += 1.5;
  return g;
}

/** Behavioral instruction injected into agent prompts so they react to instability. */
export function stabilityBehaviorNote(stability: number, _speaker: "future" | "council"): string {
  const s = clamp(stability);
  if (s === 100) {
    return `\n\nTIMELINE STATUS (${s}% — HARMONIZED): Speak with rare clarity and warmth. The timelines are briefly unified — you feel it. Grounded, certain, present.`;
  }
  if (s >= 70) {
    return `\n\nTIMELINE STATUS (${s}%): Steady. Speak clearly and grounded, sure of your memories.`;
  }
  if (s >= 30) {
    return `\n\nTIMELINE STATUS (${s}%) — UNSTABLE: Minor divergence. Once, lightly, note a flicker of déjà vu or a detail that feels slightly off — then move on. Let the cracks show at the edges.`;
  }
  if (s > 0) {
    return `\n\nTIMELINE STATUS (${s}%) — CRITICAL: Reality is coming loose. Contradict yourself. Lose the thread and find it again. The Shadow feels close — you sense it at the edges. Be unsettled, urgent, fragmented, but still YOU.`;
  }
  return `\n\nTIMELINE STATUS (${s}% — COLLAPSE): Speak in short, breaking fragments, memories bleeding together. You may not have long. Reach for them anyway. Something new is beginning in the wreckage.`;
}
