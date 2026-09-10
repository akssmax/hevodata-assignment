"use client";

import { Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { memo } from "react";
import { IconCalendar } from "@/components/icons";
import { PriorityIcon } from "@/components/issue/priority-icon";
import { ScopeIcon, scopeBorderStyle } from "@/components/issue/scope-badge";
import { formatTimeRange, toDateKey } from "@/lib/dates";
import type { Issue } from "@/lib/types";

export const IssueCard = memo(function IssueCard({
  issue,
  onOpen,
  draggable = false,
}: {
  issue: Issue;
  onOpen: (id: string) => void;
  /** Grab cursor for Kanban drag handles; default is a normal click pointer. */
  draggable?: boolean;
}) {
  const time = formatTimeRange(issue.startAt, issue.endAt);
  const overdue = Boolean(
    issue.dueDate && issue.dueDate < toDateKey(new Date()) && issue.status !== "done",
  );

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(issue.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(issue.id);
        }
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      className={`w-full rounded-lg border border-l-2 border-border/70 bg-surface px-3 py-2.5 text-left shadow-sm transition-colors hover:border-border hover:bg-surface ${
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      }`}
      style={scopeBorderStyle(issue.scope)}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <PriorityIcon priority={issue.priority} />
        <ScopeIcon scope={issue.scope} />
        <span className="font-mono text-xs text-muted">{issue.identifier}</span>
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
    </motion.div>
  );
});
