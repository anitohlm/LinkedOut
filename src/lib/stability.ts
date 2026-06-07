/**
 * Timeline Stability — the central gameplay mechanic.
 * Every major decision shifts stability, which changes how the whole multiverse behaves.
 */

export type StabilityStatus = "stable" | "unstable" | "critical" | "collapse";

export interface StabilityTier {
  min: number;
  max: number;
  status: StabilityStatus;
  label: string;
  effect: string;
  color: string;
}

// Ordered high → low — narrative ranges, never shown as formulas to the user.
export const STABILITY_TIERS: StabilityTier[] = [
  { min: 100, max: 100, status: "stable",   label: "Perfect Alignment",     effect: "Your future self remembers this path exactly.",            color: "#4ecdc4" },
  { min: 80,  max: 99,  status: "stable",   label: "Recognizable Future",   effect: "Minor divergences exist, but the future still holds.",     color: "#7ee8e1" },
  { min: 60,  max: 79,  status: "unstable", label: "Faint Inconsistencies", effect: "Your future self is starting to notice things that don't fit.", color: "#9d91ff" },
  { min: 40,  max: 59,  status: "unstable", label: "Timeline Drift",        effect: "Significant drift. Memories no longer line up.",           color: "#e8c97e" },
  { min: 20,  max: 39,  status: "critical", label: "Unstable Reality",      effect: "Reality is coming loose. The Shadow stirs.",               color: "#f0a050" },
  { min: 0,   max: 19,  status: "collapse", label: "Collapse Imminent",     effect: "Timeline collapse is near. Nothing is certain.",           color: "#f07070" },
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

/** 0 (no corruption) → 1 (max corruption). Kicks in below 60%. */
export function corruptionLevel(stability: number): number {
  const s = clamp(stability);
  if (s >= 60) return 0;
  return Math.min(1, (60 - s) / 60);
}

/**
 * Hidden Shadow Interception Risk — NOT a single threshold.
 * The Shadow is drawn to instability and to interesting people. Even a
 * perfectly stable timeline carries a faint baseline ("it has always been watching").
 * Never surfaced to the user as a number.
 */
export function interceptionRisk(opts: {
  stability: number;
  curiosity: number;     // hidden Shadow Curiosity score
  risky?: boolean;       // the choice/message that just happened was risky/divergent
  vulnerable?: boolean;  // a fear/regret/ambition was just revealed
}): number {
  const s = clamp(opts.stability);
  const base = 0.03;                                       // never fully safe
  const instability = ((100 - s) / 100) * 0.45;           // up to +0.45 near collapse
  const curiosity = Math.min(0.35, Math.max(0, opts.curiosity) * 0.015); // ramps, capped
  const riskBonus = opts.risky ? 0.12 : 0;
  const vulnBonus = opts.vulnerable ? 0.10 : 0;
  return Math.min(0.9, base + instability + curiosity + riskBonus + vulnBonus);
}

/**
 * How much a given interaction feeds the Shadow's curiosity.
 * The Shadow is drawn to people who reveal themselves and who push back.
 */
export function curiosityGain(opts: {
  revealedSelf?: boolean;   // fear / dream / ambition / regret surfaced
  risky?: boolean;          // a bold / divergent choice
  challenged?: boolean;     // pushed back on / contradicted a future self
  surprising?: boolean;     // an unexpected decision
}): number {
  let g = 0.5; // any engagement feeds it a little
  if (opts.revealedSelf) g += 2;
  if (opts.risky) g += 1.5;
  if (opts.challenged) g += 2;
  if (opts.surprising) g += 1.5;
  return g;
}

/** A behavioral instruction injected into agent prompts so they react to instability. */
export function stabilityBehaviorNote(stability: number, speaker: "future" | "council"): string {
  const tier = getTier(stability);
  const who = speaker === "future" ? "You are their Future Self." : "You are one of their selves at the Council.";
  switch (tier.status) {
    case "stable":
      return `\n\nTIMELINE STATUS: ${tier.label} (${stability}%). The timeline is steady. Speak normally — clear, grounded, sure of your memories.`;
    case "unstable":
      return `\n\nTIMELINE STATUS: ${tier.label} (${stability}%). ${who} Your memories are starting to blur. Occasionally contradict a small detail, or pause as if a memory doesn't line up. Drop a line like "...that's strange, I don't remember it that way" once if it fits.`;
    case "critical":
      return `\n\nTIMELINE STATUS: ${tier.label} (${stability}%). ${who} The timeline feels unsteady. Be a little unsettled. You might note that "something changed" or "this isn't how I remember it." Your certainty is wavering.`;
    case "collapse":
      return `\n\nTIMELINE STATUS: ${tier.label} (${stability}%). ${who} The timeline is very unstable. Speak in short, slightly disjointed sentences, as if memories are blurring together. Stay hopeful and warm even amid the confusion.`;
  }
}
