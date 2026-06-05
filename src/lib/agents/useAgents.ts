/**
 * Client-side agent caller hooks.
 * Each function calls the corresponding API route and returns typed data.
 */

import { ResumeAnalysis, UniverseType, AlternateProfile, FutureSelf, MultiverseInvitation } from "@/types";
import { HistorianEntry } from "./orchestrator";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Agent 1
export const analyzeResume = (resumeText: string) =>
  post<ResumeAnalysis>("/api/analyze-resume", { resumeText });

// Agent 2
export const generateProfile = (resumeAnalysis: ResumeAnalysis, universeId: UniverseType) =>
  post<AlternateProfile>("/api/generate-profile", { resumeAnalysis, universeId });

// Agent 3 setup
export const generateFutureSelf = (
  resumeAnalysis: ResumeAnalysis,
  universeId: UniverseType,
  alternativeName: string,
  alternativeTitle?: string
) => post<FutureSelf>("/api/generate-future-self", { resumeAnalysis, universeId, alternativeName, alternativeTitle });

// Agent 3 conversation
export const sendFutureTransmission = (payload: {
  userMessage: string;
  futureSelf: FutureSelf;
  resumeAnalysis: ResumeAnalysis;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  timelineStability?: number;
  interviewAnswers?: string;
  relationshipStage?: string;
  stabilityShift?: number;
  answeredQuestion?: string;
}) => post<{ message: string; isVillainIntercept: boolean; stabilityDelta: number }>(
  "/api/future-transmission",
  payload
);

// Agent 4
export const generateRecruiter = (profile: AlternateProfile, universeId: UniverseType) =>
  post<MultiverseInvitation & Record<string, unknown>>("/api/generate-recruiter", { profile, universeId });

// Agent 5
export const generateLegendarySelf = (resumeAnalysis: ResumeAnalysis) =>
  post<Record<string, unknown>>("/api/generate-legendary", { resumeAnalysis });

// Agent 6
export const generateVillainSelf = (resumeAnalysis: ResumeAnalysis) =>
  post<Record<string, unknown>>("/api/generate-villain", { resumeAnalysis });

// Agent 7
export const generateButterflyEffect = (decision: string, resumeAnalysis: ResumeAnalysis) =>
  post<{ timelines: unknown[]; stabilityDelta: number }>("/api/butterfly-effect", { decision, resumeAnalysis });

// Shadow Intercept content
export const getShadowIntercept = (payload: { futureMeAdvice: string; firstName: string }) =>
  post<{ lines: string[]; revealAfter: number; identity: { name: string; timeline: string; classification: string } }>(
    "/api/shadow-intercept",
    payload
  );

// Agent 9
export const generateChronicle = (payload: {
  resumeAnalysis: ResumeAnalysis;
  historianLog: HistorianEntry[];
  finalChoice: UniverseType;
  allCharacterNames: Partial<Record<UniverseType, string>>;
}) => post<Record<string, unknown>>("/api/generate-chronicle", payload);

// Agent 10
export const sendCouncilMessage = (payload: {
  userMessage: string;
  speaker: unknown;
  allMembers: Array<{ name: string; universe: string; title: string }>;
  conversationHistory: Array<{ role: string; content: string; speaker?: string }>;
  isClosing?: boolean;
  sharedMemory?: string;
  timelineStability?: number;
}) => post<{ message: string; speakerName: string; speakerTitle: string; universeId: UniverseType; isClosing: boolean }>(
  "/api/council-response",
  payload
);
