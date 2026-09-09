"use client";

import { Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { IconCalendar } from "@/components/icons";
import { PriorityIcon } from "@/components/issue/priority-icon";
import { formatTimeRange, toDateKey } from "@/lib/dates";
import type { Issue } from "@/lib/types";

export function IssueCard({
  issue,
  onOpen,
}: {
  issue: Issue;
  onOpen: (id: string) => void;
}) {
  const time = formatTimeRange(issue.startAt, issue.endAt);
  const overdue = Boolean(
    issue.dueDate && issue.dueDate < toDateKey(new Date()) && issue.status !== "done",
  );

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(issue.id)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      className="w-full rounded-lg border border-border bg-surface/60 px-3 py-2.5 text-left transition-colors hover:border-border/60 hover:bg-surface"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <PriorityIcon priority={issue.priority} />
        <span className="font-mono text-[11px] text-muted">{issue.identifier}</span>
        {issue.kind === "event" && <IconCalendar className="size-3 text-indigo-300" />}
      </div>
      <p className="text-[13px] leading-snug font-medium text-foreground">{issue.title}</p>
      {(time || issue.dueDate) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {time && (
            <Chip size="sm" variant="soft">
              {time}
            </Chip>
          )}
          {issue.dueDate && (
            <Chip color={overdue ? "danger" : "warning"} size="sm" variant="soft">
              {overdue ? "Overdue " : "Due "}
              {issue.dueDate}
            </Chip>
          )}
        </div>
      )}
    </motion.button>
  );
}
