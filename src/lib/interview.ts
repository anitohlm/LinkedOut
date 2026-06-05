/**
 * Future Self Interview System
 * Future Selves occasionally ask cinematic multiple-choice questions.
 * Answers build a profile, grow the relationship, and shift timeline stability.
 */

import { UniverseType } from "@/types";

export interface InterviewOption {
  id: string;
  label: string;
  value: string;   // stored in the answer profile
  rel: number;     // relationship points gained
  stab: number;    // timeline stability delta
}

export interface InterviewQuestion {
  id: string;
  dimension: string;          // fear / dream / value / riskStyle / leadership ...
  prompt: string;
  options: InterviewOption[];
}

// ── Relationship stages ──────────────────────────────────────────────
export const RELATIONSHIP_STAGES = [
  { name: "Stranger",            min: 0 },
  { name: "Curious Observer",    min: 3 },
  { name: "Ally",                min: 7 },
  { name: "Trusted Self",        min: 12 },
  { name: "Temporal Confidant",  min: 18 },
];

export function getStage(score: number) {
  let idx = 0;
  for (let i = 0; i < RELATIONSHIP_STAGES.length; i++) {
    if (score >= RELATIONSHIP_STAGES[i].min) idx = i;
  }
  const stage = RELATIONSHIP_STAGES[idx];
  const next = RELATIONSHIP_STAGES[idx + 1];
  const progress = next ? Math.min(1, (score - stage.min) / (next.min - stage.min)) : 1;
  return { ...stage, index: idx, next, progress };
}

// ── Universal questions (asked in every universe) ────────────────────
const UNIVERSAL: InterviewQuestion[] = [
  {
    id: "u-fear", dimension: "fear",
    prompt: "When you imagine your future, what scares you most?",
    options: [
      { id: "a", label: "Failure", value: "failure", rel: 1, stab: 3 },
      { id: "b", label: "Wasting my potential", value: "wasting_potential", rel: 2, stab: 5 },
      { id: "c", label: "Being stuck", value: "stuck", rel: 1, stab: 0 },
      { id: "d", label: "I don't know", value: "unsure", rel: 1, stab: -5 },
    ],
  },
  {
    id: "u-dream", dimension: "dream",
    prompt: "If nothing could stop you — no money, no fear — what would you build?",
    options: [
      { id: "a", label: "Something the world remembers", value: "legacy", rel: 2, stab: 5 },
      { id: "b", label: "A life that's entirely my own", value: "creative_freedom", rel: 2, stab: 3 },
      { id: "c", label: "A safe place for the people I love", value: "security", rel: 1, stab: 3 },
      { id: "d", label: "Honestly? I'd just want peace", value: "peace", rel: 1, stab: 0 },
    ],
  },
  {
    id: "u-value", dimension: "value",
    prompt: "When a choice is hard and no one's watching — what do you trust?",
    options: [
      { id: "a", label: "My independence", value: "independence", rel: 2, stab: 3 },
      { id: "b", label: "What's right, even when it costs me", value: "integrity", rel: 2, stab: 5 },
      { id: "c", label: "The people I answer to", value: "loyalty", rel: 1, stab: 3 },
      { id: "d", label: "Whatever gets me ahead", value: "ambition", rel: 1, stab: -5 },
    ],
  },
  {
    id: "u-risk", dimension: "riskStyle",
    prompt: "There's a leap in front of you. No guarantees. What do you do?",
    options: [
      { id: "a", label: "Jump. Figure it out mid-air", value: "leap", rel: 2, stab: -5 },
      { id: "b", label: "Study it. Then jump", value: "calculated", rel: 2, stab: 5 },
      { id: "c", label: "Overthink it until the moment passes", value: "overthink", rel: 1, stab: -3 },
      { id: "d", label: "Wait for someone to go first", value: "follow", rel: 1, stab: 0 },
    ],
  },
];

// ── Universe-specific questions ──────────────────────────────────────
const BY_UNIVERSE: Record<UniverseType, InterviewQuestion[]> = {
  galactic: [
    { id: "g-lead", dimension: "leadership", prompt: "I command fleets now. But tell me — do you want to lead, or to be free of it?",
      options: [
        { id: "a", label: "I want the weight. Give me the helm", value: "born_leader", rel: 2, stab: 5 },
        { id: "b", label: "I lead only when no one else will", value: "reluctant_leader", rel: 2, stab: 3 },
        { id: "c", label: "I'd rather build than command", value: "builder", rel: 1, stab: 0 },
      ] },
    { id: "g-legacy", dimension: "legacy", prompt: "When the stars forget my name, what should remain?",
      options: [
        { id: "a", label: "The systems I protected", value: "protector", rel: 2, stab: 5 },
        { id: "b", label: "The people I lifted up", value: "mentor", rel: 2, stab: 3 },
        { id: "c", label: "Nothing. I did it for the doing", value: "selfless", rel: 1, stab: -3 },
      ] },
  ],
  pirate: [
    { id: "p-free", dimension: "freedom", prompt: "Out here, freedom costs everything. Would you still pay?",
      options: [
        { id: "a", label: "Every coin. Every time", value: "freedom_absolute", rel: 2, stab: -5 },
        { id: "b", label: "Freedom with a crew to share it", value: "freedom_shared", rel: 2, stab: 3 },
        { id: "c", label: "I'd trade some of it for safe harbor", value: "freedom_traded", rel: 1, stab: 5 },
      ] },
    { id: "p-risk", dimension: "adventure", prompt: "The map ends and the sea keeps going. Do we sail on?",
      options: [
        { id: "a", label: "Always. The edge is where it's real", value: "thrill_seeker", rel: 2, stab: -5 },
        { id: "b", label: "If the crew's ready, we go", value: "measured_bold", rel: 2, stab: 3 },
        { id: "c", label: "We chart it first. No blind waters", value: "cautious", rel: 1, stab: 5 },
      ] },
  ],
  vampire: [
    { id: "v-id", dimension: "identity", prompt: "After centuries, I barely remember who I was. Do you know who you are?",
      options: [
        { id: "a", label: "I'm still becoming them", value: "evolving", rel: 2, stab: 3 },
        { id: "b", label: "I know exactly who I am", value: "certain", rel: 2, stab: 5 },
        { id: "c", label: "I'm whoever the moment needs", value: "fluid", rel: 1, stab: -5 },
      ] },
    { id: "v-lonely", dimension: "loneliness", prompt: "Immortality is a long way to walk alone. Does solitude frighten you?",
      options: [
        { id: "a", label: "Yes. I need people near me", value: "needs_others", rel: 2, stab: 3 },
        { id: "b", label: "No. I've made peace with my own company", value: "self_sufficient", rel: 2, stab: 5 },
        { id: "c", label: "I've never let anyone close enough to know", value: "guarded", rel: 1, stab: -5 },
      ] },
  ],
  dragon: [
    { id: "d-wisdom", dimension: "wisdom", prompt: "I've hoarded centuries of knowing. Tell me — does patience come easy to you?",
      options: [
        { id: "a", label: "I can wait as long as it takes", value: "patient", rel: 2, stab: 5 },
        { id: "b", label: "I'm learning to. Slowly", value: "learning_patience", rel: 2, stab: 3 },
        { id: "c", label: "No. I want it now", value: "impatient", rel: 1, stab: -5 },
      ] },
    { id: "d-sacrifice", dimension: "sacrifice", prompt: "Power always asks for something. What would you never give up?",
      options: [
        { id: "a", label: "The people who made me", value: "roots", rel: 2, stab: 5 },
        { id: "b", label: "My principles", value: "principles", rel: 2, stab: 3 },
        { id: "c", label: "Honestly? I'd give up almost anything to win", value: "ruthless", rel: 1, stab: -10 },
      ] },
  ],
  medieval: [
    { id: "m-honor", dimension: "honor", prompt: "In the court, honor is currency. Would you keep yours when it's expensive?",
      options: [
        { id: "a", label: "Always. It's all I truly own", value: "honorable", rel: 2, stab: 5 },
        { id: "b", label: "I'd bend, but never break it", value: "pragmatic_honor", rel: 2, stab: 3 },
        { id: "c", label: "Honor doesn't feed anyone", value: "survivalist", rel: 1, stab: -5 },
      ] },
    { id: "m-duty", dimension: "duty", prompt: "Duty and desire pull opposite ways. Which hand do you follow?",
      options: [
        { id: "a", label: "Duty. Always duty", value: "dutiful", rel: 2, stab: 5 },
        { id: "b", label: "My desire — life is too short", value: "self_directed", rel: 2, stab: -5 },
        { id: "c", label: "I try to serve both", value: "balanced", rel: 1, stab: 3 },
      ] },
  ],
  cyberpunk: [
    { id: "c-amb", dimension: "ambition", prompt: "In the sprawl, you climb or you're crushed. How high do you want to go?",
      options: [
        { id: "a", label: "To the top. No ceiling", value: "limitless", rel: 2, stab: -5 },
        { id: "b", label: "High enough to be free", value: "freedom_driven", rel: 2, stab: 3 },
        { id: "c", label: "Just high enough to be safe", value: "modest", rel: 1, stab: 5 },
      ] },
    { id: "c-rebel", dimension: "rebellion", prompt: "The system wants you obedient. Do you break it, or work it?",
      options: [
        { id: "a", label: "Burn it down", value: "rebel", rel: 2, stab: -10 },
        { id: "b", label: "Hack it from the inside", value: "infiltrator", rel: 2, stab: 3 },
        { id: "c", label: "Play by its rules to win", value: "conformist", rel: 1, stab: 5 },
      ] },
  ],
};

/** Pick the next unasked question for a universe (mixes universal + universe-specific). */
export function getNextQuestion(universeId: UniverseType, askedIds: string[]): InterviewQuestion | null {
  const pool = [...UNIVERSAL, ...(BY_UNIVERSE[universeId] || [])].filter(q => !askedIds.includes(q.id));
  if (!pool.length) return null;
  // Alternate: prefer a universe-specific question if available, else universal
  const universeSpecific = pool.filter(q => (BY_UNIVERSE[universeId] || []).some(u => u.id === q.id));
  const source = universeSpecific.length && askedIds.length % 2 === 1 ? universeSpecific : pool;
  return source[Math.floor(Math.random() * source.length)];
}

/** Human-readable recap of stored answers, for prompting the Future Self. */
export function answersRecap(answers: Record<string, string>): string {
  const map: Record<string, string> = {
    fear: "fears", dream: "dreams of", value: "values", riskStyle: "approaches risk by",
    leadership: "on leadership", legacy: "wants their legacy to be", freedom: "sees freedom as",
    adventure: "on adventure", identity: "on their identity", loneliness: "on solitude",
    wisdom: "on patience", sacrifice: "won't sacrifice", honor: "on honor", duty: "on duty",
    ambition: "on ambition", rebellion: "on the system",
  };
  return Object.entries(answers)
    .map(([dim, val]) => `- ${map[dim] || dim}: ${val.replace(/_/g, " ")}`)
    .join("\n");
}
