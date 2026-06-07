/**
 * Future Self Interview System
 * Each of the six Future Selves interrogates a DIFFERENT dimension of the user.
 * No shared/universal questions — six futures, six lenses on the same person.
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
  dimension: string;
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

/**
 * Per-universe question banks. Each set explores that universe's unique
 * focus areas and deliberately avoids the others' themes.
 */
const BY_UNIVERSE: Record<UniverseType, InterviewQuestion[]> = {
  // Galactic — creation, innovation, leadership, responsibility, legacy
  galactic: [
    { id: "g-build", dimension: "creation", prompt: "Forget achieving for a second. What do you actually want to build?",
      options: [
        { id: "a", label: "Something people rely on after I'm gone", value: "lasting_systems", rel: 2, stab: 5 },
        { id: "b", label: "A team that outgrows me", value: "builder_of_people", rel: 2, stab: 3 },
        { id: "c", label: "Honestly? I just want it to work", value: "pragmatist", rel: 1, stab: 0 },
      ] },
    { id: "g-resp", dimension: "responsibility", prompt: "When something you made fails — whose fault do you make it?",
      options: [
        { id: "a", label: "Mine. I built it, I own it", value: "owns_it", rel: 2, stab: 5 },
        { id: "b", label: "The circumstances, usually", value: "deflects", rel: 1, stab: -5 },
        { id: "c", label: "I dissect it before I blame anyone", value: "analyst", rel: 2, stab: 3 },
      ] },
    { id: "g-lead", dimension: "leadership", prompt: "If you led — would people follow you, or just obey you?",
      options: [
        { id: "a", label: "Follow. I'd earn it", value: "earns_loyalty", rel: 2, stab: 5 },
        { id: "b", label: "I'd rather build than command", value: "maker_not_leader", rel: 1, stab: 0 },
        { id: "c", label: "I don't know if I want either", value: "uncertain_command", rel: 1, stab: -3 },
      ] },
    { id: "g-legacy", dimension: "legacy", prompt: "What do you want still standing long after you've stopped?",
      options: [
        { id: "a", label: "Something that mattered to people", value: "human_legacy", rel: 2, stab: 5 },
        { id: "b", label: "Proof that I was here", value: "monument", rel: 1, stab: 3 },
        { id: "c", label: "I've never let myself think that far", value: "unconsidered", rel: 1, stab: -3 },
      ] },
  ],

  // Pirate — freedom, risk, adventure, independence, courage
  pirate: [
    { id: "p-cage", dimension: "freedom", prompt: "What cage have you decorated so nicely you forgot it's a cage?",
      options: [
        { id: "a", label: "My routine. It's comfortable and it's killing me", value: "gilded_routine", rel: 2, stab: -5 },
        { id: "b", label: "Other people's expectations", value: "expectation_cage", rel: 2, stab: 3 },
        { id: "c", label: "Nothing — I'm freer than I look", value: "already_free", rel: 1, stab: 5 },
      ] },
    { id: "p-bet", dimension: "risk", prompt: "What's the bet you keep refusing to place?",
      options: [
        { id: "a", label: "Betting everything on myself", value: "all_in_self", rel: 2, stab: -5 },
        { id: "b", label: "Walking away from something safe", value: "leave_safety", rel: 2, stab: -3 },
        { id: "c", label: "I place my bets — carefully", value: "calculated_risk", rel: 1, stab: 5 },
      ] },
    { id: "p-scare", dimension: "courage", prompt: "When did you last do something that scared you on purpose?",
      options: [
        { id: "a", label: "Recently. I chase that feeling", value: "thrill_chaser", rel: 2, stab: -3 },
        { id: "b", label: "Too long ago. I noticed", value: "gone_soft", rel: 2, stab: 3 },
        { id: "c", label: "I avoid the things that scare me", value: "fear_avoidant", rel: 1, stab: 0 },
      ] },
    { id: "p-permission", dimension: "independence", prompt: "Whose permission are you still, quietly, waiting on?",
      options: [
        { id: "a", label: "Nobody's. I move when I decide", value: "self_directed", rel: 2, stab: 5 },
        { id: "b", label: "Someone whose approval I can't shake", value: "approval_bound", rel: 2, stab: -3 },
        { id: "c", label: "My own, honestly", value: "self_doubt", rel: 1, stab: 0 },
      ] },
  ],

  // Vampire — identity, connection, loneliness, belonging, memory, emotional truth
  vampire: [
    { id: "v-noone", dimension: "identity", prompt: "Who are you when no one needs anything from you?",
      options: [
        { id: "a", label: "Still myself. I know who that is", value: "self_known", rel: 2, stab: 5 },
        { id: "b", label: "I'm honestly not sure anymore", value: "self_lost", rel: 2, stab: -5 },
        { id: "c", label: "Quieter. Smaller. More real", value: "private_self", rel: 2, stab: 3 },
      ] },
    { id: "v-unsaid", dimension: "memory", prompt: "What did you never say to someone who isn't here to hear it now?",
      options: [
        { id: "a", label: "That I'm sorry", value: "unspoken_apology", rel: 2, stab: 3 },
        { id: "b", label: "That I loved them", value: "unspoken_love", rel: 2, stab: 3 },
        { id: "c", label: "I'd rather not open that", value: "guarded_grief", rel: 1, stab: -3 },
      ] },
    { id: "v-belong", dimension: "belonging", prompt: "Where — or with whom — do you actually feel like you belong?",
      options: [
        { id: "a", label: "A few people who really know me", value: "chosen_few", rel: 2, stab: 5 },
        { id: "b", label: "Nowhere, fully. I drift", value: "rootless", rel: 2, stab: -5 },
        { id: "c", label: "I'm still looking", value: "searching", rel: 1, stab: 0 },
      ] },
    { id: "v-mask", dimension: "truth", prompt: "What truth about yourself do you keep beautifully dressed up?",
      options: [
        { id: "a", label: "That I'm lonelier than I let on", value: "hidden_loneliness", rel: 2, stab: 3 },
        { id: "b", label: "That I'm afraid of being truly seen", value: "fear_of_seen", rel: 2, stab: 3 },
        { id: "c", label: "I don't hide. What you see is real", value: "unmasked", rel: 1, stab: 5 },
      ] },
  ],

  // Dragon — wisdom, patience, meaning, growth, perspective, long-term thinking
  dragon: [
    { id: "d-rush", dimension: "patience", prompt: "What are you rushing that deserves to be slow?",
      options: [
        { id: "a", label: "Everything. I can't sit still", value: "restless", rel: 2, stab: -5 },
        { id: "b", label: "My own growth — I want it now", value: "impatient_growth", rel: 2, stab: -3 },
        { id: "c", label: "I've learned to let things ripen", value: "patient", rel: 2, stab: 5 },
      ] },
    { id: "d-small", dimension: "perspective", prompt: "In ten years, what about today will look small?",
      options: [
        { id: "a", label: "Almost everything I'm panicking over", value: "wide_view", rel: 2, stab: 5 },
        { id: "b", label: "The opinions I'm bending myself around", value: "approval_fade", rel: 2, stab: 3 },
        { id: "c", label: "I can't see past this week", value: "narrow_view", rel: 1, stab: -3 },
      ] },
    { id: "d-becoming", dimension: "growth", prompt: "Never mind what you've achieved. What are you still becoming?",
      options: [
        { id: "a", label: "Someone steadier than I was", value: "becoming_steady", rel: 2, stab: 5 },
        { id: "b", label: "I'm not sure I'm growing at all", value: "stalled", rel: 2, stab: -3 },
        { id: "c", label: "More myself, slowly", value: "becoming_self", rel: 2, stab: 3 },
      ] },
    { id: "d-meaning", dimension: "meaning", prompt: "What gives your effort meaning when no one is clapping?",
      options: [
        { id: "a", label: "Knowing it's the right thing to make", value: "intrinsic", rel: 2, stab: 5 },
        { id: "b", label: "Honestly, the clapping matters to me", value: "external_meaning", rel: 1, stab: -3 },
        { id: "c", label: "I'm still searching for that answer", value: "seeking_meaning", rel: 1, stab: 0 },
      ] },
  ],

  // Medieval — honor, integrity, responsibility, service, sacrifice, character
  medieval: [
    { id: "m-cost", dimension: "integrity", prompt: "What would you do right even if it cost you everything?",
      options: [
        { id: "a", label: "Tell the truth. Always", value: "truthful", rel: 2, stab: 5 },
        { id: "b", label: "Protect the people who trust me", value: "protector", rel: 2, stab: 5 },
        { id: "c", label: "I'd like to think I would — I'm not certain", value: "untested", rel: 1, stab: -3 },
      ] },
    { id: "m-rely", dimension: "service", prompt: "Who relies on you — and do they know they truly can?",
      options: [
        { id: "a", label: "Many, and yes — I show up", value: "dependable", rel: 2, stab: 5 },
        { id: "b", label: "People do, and it's heavy", value: "burdened", rel: 2, stab: 3 },
        { id: "c", label: "I keep people at arm's length", value: "distant", rel: 1, stab: -3 },
      ] },
    { id: "m-sacrifice", dimension: "sacrifice", prompt: "What have you given up quietly, without telling anyone?",
      options: [
        { id: "a", label: "A dream, so others could have theirs", value: "self_sacrifice", rel: 2, stab: 3 },
        { id: "b", label: "My own peace, to keep the peace", value: "peacekeeper", rel: 2, stab: 3 },
        { id: "c", label: "I haven't — and I feel guilty about that", value: "withheld", rel: 1, stab: 0 },
      ] },
    { id: "m-watching", dimension: "character", prompt: "When absolutely no one is watching — who are you?",
      options: [
        { id: "a", label: "The same person I am in the light", value: "consistent", rel: 2, stab: 5 },
        { id: "b", label: "Softer. More tired than I admit", value: "weary", rel: 2, stab: 3 },
        { id: "c", label: "Someone I'm not proud of, sometimes", value: "conflicted", rel: 2, stab: -3 },
      ] },
  ],

  // Cyberpunk — ambition, achievement, innovation, ownership, control, future potential
  cyberpunk: [
    { id: "c-want", dimension: "ambition", prompt: "What do you want that you're a little embarrassed to admit?",
      options: [
        { id: "a", label: "To be the best. Openly", value: "wants_the_top", rel: 2, stab: 3 },
        { id: "b", label: "To never need anyone's approval again", value: "wants_autonomy", rel: 2, stab: 3 },
        { id: "c", label: "More than I currently let myself chase", value: "suppressed_want", rel: 2, stab: -3 },
      ] },
    { id: "c-owns", dimension: "ownership", prompt: "Who owns your time right now — and is it you?",
      options: [
        { id: "a", label: "Me. I call the shots", value: "owns_time", rel: 2, stab: 5 },
        { id: "b", label: "My job. Completely", value: "owned_by_work", rel: 2, stab: -5 },
        { id: "c", label: "I'm renting it back from other people", value: "renting_time", rel: 1, stab: -3 },
      ] },
    { id: "c-no", dimension: "innovation", prompt: "What would you build if no one could tell you no?",
      options: [
        { id: "a", label: "Something nobody's tried yet", value: "frontier_builder", rel: 2, stab: 3 },
        { id: "b", label: "My own thing, from scratch", value: "founder", rel: 2, stab: 3 },
        { id: "c", label: "I'd freeze. I'm not used to no limits", value: "limit_dependent", rel: 1, stab: -3 },
      ] },
    { id: "c-fast", dimension: "potential", prompt: "Are you moving fast enough for the person you intend to become?",
      options: [
        { id: "a", label: "No. And it eats at me", value: "behind_pace", rel: 2, stab: -5 },
        { id: "b", label: "Yes — I'm exactly on schedule", value: "on_pace", rel: 2, stab: 5 },
        { id: "c", label: "I don't even know who that person is yet", value: "undefined_future", rel: 1, stab: 0 },
      ] },
  ],
};

/** Pick the next unasked question for a universe (each universe has its own topic memory). */
export function getNextQuestion(universeId: UniverseType, askedIds: string[]): InterviewQuestion | null {
  const pool = (BY_UNIVERSE[universeId] || []).filter(q => !askedIds.includes(q.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Human-readable recap of stored answers, for prompting the Future Self. */
export function answersRecap(answers: Record<string, string>): string {
  return Object.entries(answers)
    .map(([dim, val]) => `- ${dim}: ${val.replace(/_/g, " ")}`)
    .join("\n");
}
