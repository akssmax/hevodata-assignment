import { addDays, startOfDay, startOfWeek, toDateKey } from "./dates";
import type { Issue } from "./types";

function completionDateKey(issue: Issue): string | null {
  if (issue.status !== "done" || issue.kind !== "task") return null;
  return toDateKey(new Date(issue.updatedAt));
}

function doneTasks(issues: Issue[]): Issue[] {
  return issues.filter((issue) => issue.status === "done" && issue.kind === "task");
}

function completionDates(issues: Issue[]): Set<string> {
  const dates = new Set<string>();
  for (const issue of doneTasks(issues)) {
    const key = completionDateKey(issue);
    if (key) dates.add(key);
  }
  return dates;
}

export function countCompletionsOnDate(issues: Issue[], date: Date): number {
  const key = toDateKey(date);
  return doneTasks(issues).filter((issue) => completionDateKey(issue) === key).length;
}

export function countCompletionsInWeek(issues: Issue[], weekStart: Date): number {
  const startKey = toDateKey(weekStart);
  const endKey = toDateKey(addDays(weekStart, 6));
  return doneTasks(issues).filter((issue) => {
    const key = completionDateKey(issue);
    return key && key >= startKey && key <= endKey;
  }).length;
}

export function computeStreak(issues: Issue[], referenceDate: Date): number {
  const dates = completionDates(issues);
  if (dates.size === 0) return 0;

  const today = startOfDay();
  let cursor = startOfDay(referenceDate);
  const refKey = toDateKey(cursor);
  const todayKey = toDateKey(today);

  if (refKey === todayKey && !dates.has(refKey)) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (dates.has(toDateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export interface ProgressStats {
  hasCompletions: boolean;
  streak: number;
  completedToday: number;
  completedThisWeek: number;
  completedLastWeek: number;
  weekDelta: number;
}

export function computeProgressStats(issues: Issue[], referenceDate: Date): ProgressStats {
  const done = doneTasks(issues);
  const weekStart = startOfWeek(referenceDate);
  const lastWeekStart = addDays(weekStart, -7);
  const completedThisWeek = countCompletionsInWeek(issues, weekStart);
  const completedLastWeek = countCompletionsInWeek(issues, lastWeekStart);

  return {
    hasCompletions: done.length > 0,
    streak: computeStreak(issues, referenceDate),
    completedToday: countCompletionsOnDate(issues, referenceDate),
    completedThisWeek,
    completedLastWeek,
    weekDelta: completedThisWeek - completedLastWeek,
  };
}
