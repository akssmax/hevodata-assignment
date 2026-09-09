"use client";

import { Button, Chip, Spinner } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { IconCalendar, IconChevron, IconChevronRight } from "@/components/icons";
import { useWorkspace } from "@/components/workspace-provider";
import { useIssues } from "@/hooks/use-issues";
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, HOUR_HEIGHT } from "@/lib/constants";
import {
  addDays,
  formatDayLabel,
  formatTimeRange,
  formatWeekRange,
  isSameDay,
  minutesSinceStart,
  startOfWeek,
  toDateKey,
} from "@/lib/dates";
import type { Issue } from "@/lib/types";

const HOURS = Array.from(
  { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
  (_, index) => CALENDAR_START_HOUR + index,
);

function blockStyle(issue: Issue) {
  if (!issue.startAt || !issue.endAt) return null;
  const top = (minutesSinceStart(issue.startAt, CALENDAR_START_HOUR) / 60) * HOUR_HEIGHT;
  const duration =
    (new Date(issue.endAt).getTime() - new Date(issue.startAt).getTime()) / 3600000;
  const height = Math.max(duration * HOUR_HEIGHT, 28);
  return { top, height };
}

export function WeekCalendar() {
  const { search, openIssue, openCreate, activePersonaId } = useWorkspace();
  const issues = useIssues(activePersonaId, search);
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const todayKey = toDateKey(new Date());

  if (issues === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  function onGridClick(day: Date, event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const hourFloat = CALENDAR_START_HOUR + y / HOUR_HEIGHT;
    const hour = Math.min(CALENDAR_END_HOUR - 1, Math.max(CALENDAR_START_HOUR, Math.floor(hourFloat)));
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1, 0, 0, 0);
    openCreate({
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      status: "todo",
      kind: "event",
    });
  }

  const weekHasBlocks = days.some((day) =>
    (issues ?? []).some((issue) => issue.startAt && isSameDay(issue.startAt, day)),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <Button isIconOnly aria-label="Previous week" size="sm" variant="tertiary" onPress={() => setWeekStart(addDays(weekStart, -7))}>
            <IconChevron className="size-4" />
          </Button>
          <Button isIconOnly aria-label="Next week" size="sm" variant="tertiary" onPress={() => setWeekStart(addDays(weekStart, 7))}>
            <IconChevronRight className="size-4" />
          </Button>
          <Button size="sm" variant="secondary" onPress={() => setWeekStart(startOfWeek())}>
            Today
          </Button>
          <p className="ml-2 text-sm font-medium">{formatWeekRange(weekStart)}</p>
        </div>
        <p className="text-xs text-muted">Click an empty slot to time-block a new issue</p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {!weekHasBlocks && (
          <div className="px-5 pt-6">
            <EmptyState
              icon={<IconCalendar className="size-5" />}
              title="Nothing scheduled this week"
              description="Click any empty slot below to time-block a task or add a meeting."
              actionLabel="New event"
              onAction={() => openCreate({ kind: "event", status: "todo" })}
            />
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={toDateKey(weekStart)}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="grid min-w-[860px] grid-cols-[64px_repeat(7,minmax(0,1fr))] border-t border-border"
          >
            <div />
            {days.map((day) => {
              const key = toDateKey(day);
              return (
                <div
                  key={key}
                  className={`border-l border-border px-2 py-2 text-center text-xs ${
                    key === todayKey ? "text-accent" : "text-muted"
                  }`}
                >
                  {formatDayLabel(day)}
                </div>
              );
            })}

            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="pr-2 text-right text-[11px] text-muted"
                  style={{ height: HOUR_HEIGHT }}
                >
                  {hour}:00
                </div>
              ))}
            </div>

            {days.map((day) => {
              const dayIssues = (issues ?? []).filter(
                (issue) => issue.startAt && isSameDay(issue.startAt, day),
              );
              return (
                <div
                  key={toDateKey(day)}
                  className="relative cursor-pointer border-l border-border"
                  style={{ height: HOURS.length * HOUR_HEIGHT }}
                  onClick={(event) => onGridClick(day, event)}
                >
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="border-t border-border/60"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}
                  {dayIssues.map((issue) => {
                    const style = blockStyle(issue);
                    if (!style) return null;
                    const isEvent = issue.kind === "event";
                    return (
                      <motion.button
                        key={issue.id}
                        type="button"
                        style={{ top: style.top, height: style.height }}
                        className={`absolute right-1 left-1 overflow-hidden rounded-md border px-1.5 py-1 text-left ${
                          isEvent
                            ? "border-indigo-300/40 bg-indigo-300/20"
                            : "border-emerald-300/40 bg-emerald-300/15"
                        }`}
                        whileHover={{ scale: 1.03, boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          openIssue(issue.id);
                        }}
                      >
                        <p className="truncate text-[11px] font-medium">{issue.title}</p>
                        <p className="truncate text-[10px] text-muted">
                          {formatTimeRange(issue.startAt, issue.endAt)}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
        <Chip size="sm" variant="soft">
          {(issues ?? []).filter((issue) => issue.startAt).length} scheduled
        </Chip>
        <Chip size="sm" variant="soft">
          {(issues ?? []).filter((issue) => !issue.startAt && issue.status !== "done").length} unscheduled
        </Chip>
      </div>
    </div>
  );
}
