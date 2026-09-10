import type { IssueScope, Priority, Status } from "./types";

export const STATUS_LABELS: Record<Status, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "No priority",
};

export const STATUS_CHIP: Record<
  Status,
  { color: "default" | "accent" | "success" | "warning" | "danger"; label: string }
> = {
  backlog: { color: "default", label: "Backlog" },
  todo: { color: "accent", label: "Todo" },
  in_progress: { color: "warning", label: "In Progress" },
  done: { color: "success", label: "Done" },
};

/** ClickUp-style status dot colors (Tailwind 300 shades) */
export const STATUS_DOT: Record<Status, string> = {
  backlog: "#d1d5db", // gray-300
  todo: "#93c5fd", // blue-300
  in_progress: "#fcd34d", // amber-300
  done: "#6ee7b7", // emerald-300
};

export const SCOPE_LABELS: Record<IssueScope, string> = {
  work: "Work",
  personal: "Personal",
};

/** Life-area accent colors (Tailwind 300 shades) */
export const SCOPE_DOT: Record<IssueScope, string> = {
  work: "#93c5fd", // blue-300
  personal: "#f9a8d4", // pink-300
};

export const CALENDAR_START_HOUR = 7;
export const CALENDAR_END_HOUR = 21;
export const HOUR_HEIGHT = 64;
