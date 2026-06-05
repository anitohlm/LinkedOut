/**
 * Agent 0: Timeline Orchestrator
 * Master coordinator — maintains shared multiverse context passed to all agents.
 */

import { ResumeAnalysis, UniverseType, AlternateProfile, FutureSelf, Conversation } from "@/types";

export interface MultiverseContext {
  timelineSignature: string;
  resumeAnalysis: ResumeAnalysis;
  selectedUniverses: UniverseType[];
  profiles: Partial<Record<UniverseType, AlternateProfile>>;
  futureSelves: Partial<Record<UniverseType, FutureSelf>>;
  conversations: Partial<Record<UniverseType, Conversation>>;
  timelineStability: number;
  butterflyDecisions: ButterflyDecisionLog[];
  historianLog: HistorianEntry[];
  finalChoice: UniverseType | null;
}

export interface ButterflyDecisionLog {
  decision: string;
  timestamp: number;
  stabilityDelta: number;
  affectedUniverses: UniverseType[];
}

export interface HistorianEntry {
  type: "conversation" | "choice" | "butterfly" | "villain_intercept" | "council" | "revelation";
  universeId?: UniverseType;
  summary: string;
  timestamp: number;
}

export function createContext(
  resumeAnalysis: ResumeAnalysis
): MultiverseContext {
  return {
    timelineSignature: resumeAnalysis.timelineSignature,
    resumeAnalysis,
    selectedUniverses: [],
    profiles: {},
    futureSelves: {},
    conversations: {},
    timelineStability: 100,
    butterflyDecisions: [],
    historianLog: [],
    finalChoice: null,
  };
}

export function recordHistorianEntry(
  ctx: MultiverseContext,
  entry: Omit<HistorianEntry, "timestamp">
): MultiverseContext {
  return {
    ...ctx,
    historianLog: [...ctx.historianLog, { ...entry, timestamp: Date.now() }],
  };
}

export function applyStabilityDelta(
  ctx: MultiverseContext,
  delta: number
): MultiverseContext {
  const newStability = Math.max(0, Math.min(100, ctx.timelineStability + delta));
  return { ...ctx, timelineStability: newStability };
}

export function getStabilityStatus(
  stability: number
): "stable" | "unstable" | "critical" | "collapse" {
  if (stability >= 70) return "stable";
  if (stability >= 40) return "unstable";
  if (stability >= 15) return "critical";
  return "collapse";
}

// Shared context injected into all agent prompts
export function buildSharedContextBlock(ctx: MultiverseContext): string {
  return `
SHARED MULTIVERSE CONTEXT (maintained by Timeline Orchestrator):
Timeline Signature: ${ctx.timelineSignature}
Timeline Stability: ${ctx.timelineStability}% (${getStabilityStatus(ctx.timelineStability)})
Active Universes: ${ctx.selectedUniverses.join(", ") || "none yet"}
Butterfly Decisions Made: ${ctx.butterflyDecisions.length}
`.trim();
}
