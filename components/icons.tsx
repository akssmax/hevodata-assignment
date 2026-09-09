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

/** Dayline logo: a sun rising over a horizon line. Sun lifts on hover. */
export function Logo({ className }: { className?: string }) {
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      animate="rest"
      className={`flex size-7 shrink-0 cursor-default items-center justify-center rounded-md bg-accent ${className ?? ""}`}
    >
      <svg viewBox="0 0 20 20" className="size-4 text-accent-foreground" fill="none">
        <motion.circle
          cx="10"
          cy="11"
          r="4"
          fill="currentColor"
          variants={{ rest: { y: 2.5 }, hover: { y: -1 } }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        />
        <motion.rect
          x="3"
          y="13.5"
          height="1.6"
          rx="0.8"
          fill="currentColor"
          variants={{ rest: { width: 9, x: 5.5 }, hover: { width: 14, x: 3 } }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </svg>
    </motion.div>
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
