/**
 * Per-universe exploration progress.
 * Each universe has a set of activities the user can complete.
 */

export const UNIVERSE_ACTIVITIES = [
  { key: "profile", label: "Profile", icon: "👤", desc: "View this self's full alternate-life profile." },
  { key: "future", label: "Future Self", icon: "📡", desc: "Open a transmission and talk to your future self." },
  { key: "recruiter", label: "Recruiter", icon: "📜", desc: "Read the offer this universe sent you." },
  { key: "legendary", label: "Legendary", icon: "👑", desc: "Meet your greatest possible self." },
  { key: "shadow", label: "Shadow", icon: "🌑", desc: "Face the self who chose ambition over everything." },
] as const;

export type ActivityKey = (typeof UNIVERSE_ACTIVITIES)[number]["key"];

export function universePercent(activities?: string[]): number {
  if (!activities?.length) return 0;
  const valid = UNIVERSE_ACTIVITIES.map(a => a.key);
  const uniq = new Set(activities.filter(a => valid.includes(a as ActivityKey)));
  return Math.round((uniq.size / UNIVERSE_ACTIVITIES.length) * 100);
}

/** Mark an activity complete for a universe (idempotent). Call with the screen's state + updateState. */
export function markActivity(
  state: { universeActivity?: Record<string, string[]> },
  updateState: (u: any) => void,
  universeId: string,
  key: ActivityKey,
) {
  const cur = state.universeActivity?.[universeId] || [];
  if (cur.includes(key)) return;
  updateState({
    universeActivity: { ...(state.universeActivity || {}), [universeId]: [...cur, key] },
  });
}
