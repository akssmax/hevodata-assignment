import type { ReactNode } from "react";
import {
  IconBoard,
  IconCalendar,
  IconList,
  IconSwatch,
  IconThinking,
  IconToday,
} from "@/components/icons";

export type NavItemConfig = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
};

export const PRIMARY_NAV: NavItemConfig[] = [
  { href: "/", label: "Today", icon: IconToday },
  { href: "/board", label: "Board", icon: IconBoard },
  { href: "/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/issues", label: "Issues", icon: IconList },
];

export const SECONDARY_NAV: NavItemConfig[] = [
  { href: "/design-system", label: "Design system", icon: IconSwatch },
  { href: "/design-thinking", label: "Design thinking", icon: IconThinking },
];

export const NAV_TITLES: Record<string, string> = {
  "/": "Today",
  "/board": "Board",
  "/calendar": "Calendar",
  "/issues": "Issues",
  "/design-system": "Design system",
  "/design-thinking": "Design thinking",
};
