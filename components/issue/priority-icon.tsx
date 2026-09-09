"use client";

import { Tooltip } from "@heroui/react";
import { PriorityBars } from "@/components/icons";
import { PRIORITY_LABELS } from "@/lib/constants";
import type { Priority } from "@/lib/types";

const LEVEL: Record<Priority, 0 | 1 | 2 | 3 | 4> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export function PriorityIcon({
  priority,
  className = "size-3.5",
}: {
  priority: Priority;
  className?: string;
}) {
  const label = PRIORITY_LABELS[priority];

  const icon =
    priority === "urgent" ? (
      <span className="inline-flex size-3.5 items-center justify-center text-xs font-bold text-red-400">
        !!
      </span>
    ) : (
      <PriorityBars className={className} level={LEVEL[priority]} />
    );

  return (
    <Tooltip>
      <Tooltip.Trigger aria-label={label} className="inline-flex">
        {icon}
      </Tooltip.Trigger>
      <Tooltip.Content placement="top">{label}</Tooltip.Content>
    </Tooltip>
  );
}
