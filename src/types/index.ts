/**
 * LinkedOut Core Types
 * Defines the data structures for the multiverse narrative experience
 */

// Resume Analysis
export interface ResumeAnalysis {
  name: string;
  firstName: string;
  skills: string[];
  competencies: string[];
  achievements: string[];
  industries: string[];
  seniority: "junior" | "mid" | "senior" | "lead" | "executive";
  personalityIndicators: string[];
  timelineSignature: string;
  summary: string;
}

// Universe Configuration
export type UniverseType =
  | "medieval"
  | "cyberpunk"
  | "pirate"
  | "dragon"
  | "galactic"
  | "vampire";

export interface UniverseConfig {
  id: UniverseType;
  title: string;
  emoji: string;
  color: string;
  lore: string;
  recruiterFaction: string;
  personalityArchetypes: string[];
  terminology: Record<string, string>;
  gradientFrom: string;
  gradientTo: string;
}

// Alternate Profile
export interface AlternateProfile {
  universeId: UniverseType;
  alternativeName: string;
  portrait: string;
  profession: string;
  biography: string;
  achievements: string[];
  competencies: string[];
  timelineStory: string;
  personalityProfile: string;
  careerTrajectory: string;
  radarScores: Record<string, number>;
}

// Future Self
export interface FutureSelf {
  id: string;
  universeId: UniverseType;
  name: string;
  title: string;
  year: number;
  personality: string;
  philosophy: string;
  memories: string[];
  achievements: string[];
  regrets: string[];
  lessons: string[];
  portrait: string;
}

// Conversation
export interface ConversationMessage {
  id: string;
  role: "user" | "future-self";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  universeId: UniverseType;
  futureSelfId: string;
  messages: ConversationMessage[];
  relationshipScore: number;
  relationshipStage:
    | "stranger"
    | "curious-observer"
    | "ally"
    | "trusted-self"
    | "temporal-confidant";
  timelineStability: number;
  lastUpdated: number;
}

// Legendary Self
export interface LegendarySelf {
  title: string;
  achievements: string[];
  historicalImpact: string;
  inspirationalNarrative: string;
  mythicPortrait: string;
}

// Villain Self
export interface VillainSelf {
  originStory: string;
  moralCompromises: string[];
  philosophy: string;
  riseToPowar: string;
  alternateWorldview: string;
  portrait: string;
  name: string;
}

// Timeline State
export interface TimelineState {
  stability: number; // 0-100
  status: "stable" | "unstable" | "critical" | "collapse";
}

// Butterfly Effect Decision
export interface ButterflyDecision {
  id: string;
  originalDecision: string;
  modifiedDecision: string;
  impactDescription: string;
  stabilityChange: number;
}

// Multiverse Invitation
export interface MultiverseInvitation {
  id: string;
  universeId: UniverseType;
  factionName: string;
  opportunityTitle: string;
  description: string;
  options: {
    accept: string;
    negotiate: string;
    decline: string;
  };
}

// Share Card
export interface ShareCard {
  universeId: UniverseType;
  futureSelfName: string;
  quote: string;
  legendaryTitle: string;
  villainTitle: string;
  councilVerdict: string;
  portrait: string;
}

// Application Screen States
export type AppScreenState =
  | "landing"
  | "upload-resume"
  | "timeline-scan"
  | "multiverse-calibration"
  | "universe-discovery"
  | "identity-reconstruction"
  | "profile"
  | "future-transmission"
  | "butterfly-effect"
  | "multiverse-invitations"
  | "legendary-self"
  | "villain-self"
  | "council-of-selves"
  | "chronicle"
  | "share-card";

// Global App State
export interface AppState {
  currentScreen: AppScreenState;
  resumeFile: File | null;
  resumeText: string | null;
  resumeAnalysis: ResumeAnalysis | null;
  selectedUniverse: UniverseType | null;
  allProfiles: Record<UniverseType, AlternateProfile>;
  allFutureSelves: Record<UniverseType, FutureSelf>;
  conversations: Record<UniverseType, Conversation>;
  timelineState: TimelineState;
  legendarySelves: Record<UniverseType, LegendarySelf>;
  villainSelves: Record<UniverseType, VillainSelf>;
  butterFlyDecisions: ButterflyDecision[];
  invitations: MultiverseInvitation[];
  shareCard: ShareCard | null;
}
