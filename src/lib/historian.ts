/**
 * The Multiversal Historian
 *
 * Every log entry must answer: "What actually happened?"
 * The Historian records facts, not atmosphere.
 * Rare reflective observations appear only after enough real events accumulate.
 */

import { AppState } from "@/types";

// ── Legacy event type (kept for backward-compat) ─────────────────────
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

// ── Universe core lessons ─────────────────────────────────────────────
export const UNIVERSE_LESSONS: Record<string, string> = {
  medieval:  "Duty",
  cyberpunk: "Innovation",
  pirate:    "Freedom",
  dragon:    "Wisdom",
  galactic:  "Exploration",
  vampire:   "Legacy",
};

// ── Specific entry builders ───────────────────────────────────────────
// Each function returns a precise, grounded sentence about what happened.

export const H = {
  universeEntered(universeName: string, stabilityGain: number): string {
    const lesson = Object.entries(UNIVERSE_LESSONS)
      .find(([, v]) => v === universeName)?.[1];
    return `${universeName} entered for the first time. Timeline Anchor acquired. Stability +${stabilityGain}%.${lesson ? ` Core lesson: ${lesson}.` : ""}`;
  },

  transmissionOpened(selfName: string, selfTitle: string, year: number, universeName: string): string {
    return `Transmission established with ${selfName}, ${selfTitle} of ${universeName}, year ${year}.`;
  },

  transmissionAligned(selfName: string, stabilityGain: number): string {
    return `A substantive exchange with ${selfName} briefly aligned the possible futures. Stability +${stabilityGain}%.`;
  },

  bondAdvanced(selfName: string, fromStage: string, toStage: string): string {
    return `Bond with ${selfName} advanced: "${fromStage}" → "${toStage}".`;
  },

  shadowAppeared(selfName: string, stabilityLoss: number): string {
    return `The Shadow interrupted the transmission from ${selfName}. Stability −${stabilityLoss}%.`;
  },

  shadowResisted(selfName: string, stabilityGain: number): string {
    return `The Shadow's intervention was rejected. Connection with ${selfName} restored. Stability +${stabilityGain}%.`;
  },

  stabilityTierCrossed(tierLabel: string, stability: number, direction: "rose" | "fell"): string {
    return direction === "rose"
      ? `Timeline Stability entered ${tierLabel} (${stability}%).`
      : `Timeline Stability dropped to ${tierLabel} (${stability}%).`;
  },

  stabilityCollapsed(stability: number): string {
    return `Timeline Collapse reached (${stability}%). The record enters fractured state. New paths emerge.`;
  },

  stabilityHarmonized(stability: number): string {
    return `Full harmonic alignment achieved (${stability}%). All futures briefly sing the same note.`;
  },

  councilConvened(memberNames: string[]): string {
    const list = memberNames.length <= 4
      ? memberNames.join(", ")
      : memberNames.slice(0, 4).join(", ") + ` and ${memberNames.length - 4} others`;
    return `The Council of Selves convened. Present: ${list}.`;
  },

  councilResolved(universeName: string, stabilityGain: number, newStability: number): string {
    return `Council resolution: ${universeName} chosen as primary timeline. Stability +${stabilityGain}% (now ${newStability}%).`;
  },

  butterflyAsked(decision: string, stabilityLoss: number): string {
    const trimmed = decision.length > 80 ? decision.slice(0, 80).trimEnd() + "…" : decision;
    return `Butterfly Effect: "${trimmed}" — four alternate timelines mapped. Timeline Drift: −${Math.abs(stabilityLoss)}%.`;
  },

  recruiterDecision(faction: string, title: string, choice: "accepted" | "negotiated" | "declined", stabilityDelta?: number): string {
    const base = `${faction} offered the position of ${title}. The subject ${choice}.`;
    if (choice === "accepted" && stabilityDelta !== undefined) {
      return `${base} Stability −${Math.abs(stabilityDelta)}% (accepting a role in a foreign timeline).`;
    }
    return base;
  },

  titleEarned(title: string): string {
    return `New title recorded: ${title}.`;
  },

  chronicleGenerated(editionNum: number, title: string): string {
    const roman = toRoman(editionNum);
    return `Chronicle Edition ${roman} — "${title}" — committed to the Archive.`;
  },
};

// ── Reflective observations (rare, grounded in actual counts) ─────────
// Called internally by logEntry — never generated on their own.

const REFLECTIONS: Array<(log: HistorianLogEntry[], state: AppState) => string> = [
  (log) =>
    `${log.length} events recorded. The choices differ. The questions do not.`,
  (log, state) => {
    const explored = state.explored?.length ?? 0;
    return `${explored} universe${explored !== 1 ? "s" : ""} explored. ${log.length} events in the record. The subject is beginning to recognize themselves.`;
  },
  (log) =>
    `After ${log.length} entries, one pattern persists: the subject keeps asking.`,
  (log) =>
    `The record stands at ${log.length} events. The subject remains consistent across all of them.`,
  (log, _state) => {
    const transmissions = log.filter(e => e.text.startsWith("Transmission established")).length;
    return transmissions > 1
      ? `${transmissions} transmissions completed. Each future self remembers a slightly different version of today.`
      : `${log.length} events recorded. The archive grows heavier.`;
  },
];

// ── Core logging helper ───────────────────────────────────────────────

export interface HistorianLogEntry {
  text: string;
  ts: number;
}

/**
 * Log a specific, grounded historian entry.
 * Optionally shows the floating observation toast.
 * Rarely appends a reflective observation (1-in-12, after 5+ entries).
 */
export function logEntry(
  text: string,
  state: AppState,
  updateState: (u: Partial<AppState & { pendingObservation?: string | null }>) => void,
  opts?: { toast?: boolean; extra?: Record<string, unknown> }
): void {
  const existing = state.historianLog || [];
  const entry: HistorianLogEntry = { text, ts: Date.now() };
  let newLog: HistorianLogEntry[] = [...existing, entry];

  const updates: Record<string, unknown> = { historianLog: newLog };
  if (opts?.toast) updates.pendingObservation = text;

  // Rare reflective observation — only after 5+ real entries, ~1-in-12 chance
  if (newLog.length >= 5 && Math.random() < 0.083) {
    const fn = REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)];
    const reflection = fn(newLog, state);
    newLog = [...newLog, { text: reflection, ts: Date.now() + 1 }];
    updates.historianLog = newLog;
    updates.pendingObservation = reflection;
  }

  // Merge any extra state updates (e.g. timelineState, stabilityMessage) in one call
  if (opts?.extra) Object.assign(updates, opts.extra);

  updateState(updates as any);
}

/**
 * Remove spurious duplicate entries left over from before the resume/milestone
 * fixes. The one-time "all six mapped" milestone is deduped globally; otherwise
 * consecutive identical entries are collapsed (e.g. repeated tier-crossing lines
 * produced by old hydration bugs). Safe to run on every save load.
 */
export function dedupeHistorianLog(log: HistorianLogEntry[]): HistorianLogEntry[] {
  if (!Array.isArray(log)) return log;
  const MILESTONE = "All six timelines have been mapped. The multiverse is now fully charted.";
  let milestoneSeen = false;
  const out: HistorianLogEntry[] = [];
  for (const entry of log) {
    if (!entry || typeof entry.text !== "string") continue;
    if (entry.text === MILESTONE) {
      if (milestoneSeen) continue;
      milestoneSeen = true;
    }
    if (out.length && out[out.length - 1].text === entry.text) continue;
    out.push(entry);
  }
  return out;
}

// ── Legacy compatibility ──────────────────────────────────────────────
// These are the old pre-written lines, kept only for the few remaining
// call sites that haven't been migrated to specific entries.

const LEGACY_LINES: Record<HistorianEvent, string[]> = {
  "multiverse-born": [
    "Six alternate selves now stand apart in the record. The divergence is complete.",
  ],
  "first-transmission": [
    "First temporal link established. The subject has begun speaking across time.",
  ],
  "stability-rose":   ["Timeline Stability increased."],
  "stability-fell":   ["Timeline Stability decreased."],
  "timeline-critical": ["Timeline Stability is critical. The Shadow grows more active."],
  "divergence-approaching": [
    "The Council of Selves is convening. All explored futures are present.",
  ],
  "intercept-survived": [
    "Shadow intercept survived. The subject returned to the primary transmission.",
  ],
  "anomaly": [
    "Temporal anomaly detected in the record.",
  ],
  "final-choice": [
    "A primary timeline has been chosen. The chronicle will reflect this selection.",
  ],
  "recruiter-accepted": [
    "A cross-timeline offer was accepted.",
  ],
  "recruiter-negotiated": [
    "A cross-timeline offer was negotiated.",
  ],
  "recruiter-declined": [
    "A cross-timeline offer was declined.",
  ],
  "title-earned": [
    "A new title has entered the record.",
  ],
};

/** @deprecated Use logEntry() + H builders for specific entries. */
export function historianLine(event: HistorianEvent, name = "they"): string {
  const pool = LEGACY_LINES[event];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick.replace(/\{name\}/g, name);
}

// ── Utilities ─────────────────────────────────────────────────────────

function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
    [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"],
  ];
  if (n <= 0) return String(n);
  let result = "";
  for (const [val, sym] of map) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}
