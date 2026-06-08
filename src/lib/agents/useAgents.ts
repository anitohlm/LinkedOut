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
  alternativeTitle?: string,
  // The world established on the profile — passed in so the Future Self lives in the SAME world
  world?: { worldName?: string; eraName?: string; worldDescription?: string }
) => post<FutureSelf>("/api/generate-future-self", { resumeAnalysis, universeId, alternativeName, alternativeTitle, ...world });

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
export const generateLegendarySelf = (resumeAnalysis: ResumeAnalysis, universeId?: UniverseType, profile?: AlternateProfile) =>
  post<Record<string, unknown>>("/api/generate-legendary", { resumeAnalysis, universeId, profile });

// Agent 6
export const generateVillainSelf = (resumeAnalysis: ResumeAnalysis, universeId?: UniverseType, profile?: AlternateProfile) =>
  post<Record<string, unknown>>("/api/generate-villain", { resumeAnalysis, universeId, profile });

// Agent 7
export const generateButterflyEffect = (decision: string, resumeAnalysis: ResumeAnalysis) =>
  post<{ timelines: unknown[]; stabilityDelta: number }>("/api/butterfly-effect", { decision, resumeAnalysis });

// Inspiration suggestions for free-text replies
export const getSuggestions = (payload: {
  question: string;
  universeKey: string;
  speakerName: string;
  mode: "future" | "council";
  resumeSummary?: string;
  skills?: string[];
  answersRecap?: string;
  relationshipStage?: string;
  stability?: number;
  recentIntercept?: boolean;
}) => post<{ suggestions: string[] }>("/api/suggestions", payload);

// Shadow Intercept content — brief, universe-native manifestation
export const getShadowIntercept = (payload: { universeId: string; futureMeAdvice: string }) =>
  post<{ manifestation: { name: string; classification: string }; observation: string; question: string }>(
    "/api/shadow-intercept",
    payload
  );

// Agent 9
export const generateChronicle = (payload: {
  resumeAnalysis: ResumeAnalysis;
  historianLog: HistorianEntry[];
  finalChoice: UniverseType;
  allCharacterNames: Partial<Record<UniverseType, string>>;
  editionNumber: number;
  previousEditions?: Array<{ editionNumber: number; title: string; epilogue: string }>;
  acceptedPositions?: Array<{ universeId: string; title: string; faction: string; ts: number }>;
  activeTitle?: string;
  timelineStability?: number;
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
  pronouns?: string;
}) => post<{ message: string; speakerName: string; speakerTitle: string; universeId: UniverseType; isClosing: boolean }>(
  "/api/council-response",
  payload
);
