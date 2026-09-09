import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  ListBulletIcon,
  PlusIcon,
  Squares2X2Icon,
  SunIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";

type IconProps = { className?: string };

export function IconToday({ className }: IconProps) {
  return <SunIcon aria-hidden className={className} />;
}

export function IconInbox({ className }: IconProps) {
  return <InboxIcon aria-hidden className={className} />;
}

export function IconBoard({ className }: IconProps) {
  return <Squares2X2Icon aria-hidden className={className} />;
}

export function IconCalendar({ className }: IconProps) {
  return <CalendarDaysIcon aria-hidden className={className} />;
}

export function IconList({ className }: IconProps) {
  return <ListBulletIcon aria-hidden className={className} />;
}

export function IconPlus({ className }: IconProps) {
  return <PlusIcon aria-hidden className={className} />;
}

export function IconChevron({ className }: IconProps) {
  return <ChevronLeftIcon aria-hidden className={className} />;
}

export function IconChevronRight({ className }: IconProps) {
  return <ChevronRightIcon aria-hidden className={className} />;
}

export function IconSwatch({ className }: IconProps) {
  return <SwatchIcon aria-hidden className={className} />;
}

/** Dayline wordmark for sidebar header. */
export function Logo({
  collapsed,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  const hover = { scale: collapsed ? 1.04 : 1.01 };
  const transition = { type: "spring" as const, stiffness: 400, damping: 25 };

  if (collapsed) {
    return (
      <motion.span
        whileHover={hover}
        transition={transition}
        aria-label="Dayline"
        className={`inline-flex shrink-0 cursor-default items-baseline text-[15px] font-semibold leading-none tracking-tight ${className ?? ""}`}
      >
        <span className="text-accent">d</span>
        <span className="text-accent/75">.</span>
      </motion.span>
    );
  }

  return (
    <motion.span
      whileHover={hover}
      transition={transition}
      aria-label="Dayline"
      className={`inline-flex shrink-0 cursor-default text-sm font-semibold leading-none tracking-tight ${className ?? ""}`}
    >
      <span className="text-foreground">day</span>
      <span className="text-accent">line</span>
    </motion.span>
  );
}

/** Google Meet mark — colored camera tile. */
export function IconGoogleMeet({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M6.5 5h7.75A2.75 2.75 0 0 1 17 7.75v8.5A2.75 2.75 0 0 1 14.25 19H6.5A2.75 2.75 0 0 1 3.75 16.25v-8.5A2.75 2.75 0 0 1 6.5 5Z"
        fill="#00832D"
      />
      <path d="M17 8.5 21 6v12l-4-2.5V8.5Z" fill="#0066DA" />
      <path
        d="M8.25 9.5h4.25v5H8.25a.75.75 0 0 1-.75-.75v-3.5c0-.414.336-.75.75-.75Z"
        fill="#fff"
      />
    </svg>
  );
}

/** Microsoft Teams mark — purple T on rounded square. */
export function IconMicrosoftTeams({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="14" height="14" rx="2.5" fill="#5059C9" />
      <path
        d="M8.5 9.25h3.25v5.5H8.5V9.25Zm5.5 0H17v5.5h-3V9.25Z"
        fill="#fff"
      />
      <circle cx="18.5" cy="7.5" r="2.75" fill="#7B83EB" />
      <rect x="15.75" y="10.5" width="5.5" height="7" rx="1.25" fill="#7B83EB" />
    </svg>
  );
}

export function PriorityBars({
  level,
  className,
}: {
  level: 0 | 1 | 2 | 3 | 4;
  className?: string;
}) {
  const colors = ["#6b7280", "#60a5fa", "#facc15", "#fb923c", "#f87171"];
  const color = colors[level];
  return (
    <svg className={className} viewBox="0 0 16 16" fill={color}>
      <rect x="1" y="10" width="3" height="5" rx="0.6" opacity={level >= 1 ? 1 : 0.25} />
      <rect x="6" y="6" width="3" height="9" rx="0.6" opacity={level >= 2 ? 1 : 0.25} />
      <rect x="11" y="2" width="3" height="13" rx="0.6" opacity={level >= 3 ? 1 : 0.25} />
    </svg>
  );
}
