import { PriorityBars } from "@/components/icons";
import type { Priority } from "@/lib/types";

const LEVEL: Record<Priority, 0 | 1 | 2 | 3 | 4> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export function PriorityIcon({ priority, className = "size-3.5" }: { priority: Priority; className?: string }) {
  if (priority === "urgent") {
    return (
      <span className="inline-flex size-3.5 items-center justify-center text-[10px] font-bold text-red-400">
        !!
      </span>
    );
  }

  return <PriorityBars className={className} level={LEVEL[priority]} />;
}
