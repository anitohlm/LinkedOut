/**
 * Per-universe exploration progress.
 * Each universe has a set of activities the user can complete.
 */

export const UNIVERSE_ACTIVITIES = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "future", label: "Future Self", icon: "📡" },
  { key: "recruiter", label: "Recruiter", icon: "📜" },
  { key: "legendary", label: "Legendary", icon: "👑" },
  { key: "shadow", label: "Shadow", icon: "🌑" },
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
