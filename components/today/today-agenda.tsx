"use client";

import { Chip, Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, Popover as AriaPopover } from "react-aria-components";
import { EmptyState } from "@/components/empty-state";
import { IconCalendar, IconInbox } from "@/components/icons";
import { IssueCard } from "@/components/issue/issue-card";
import { MeetingJoinLink } from "@/components/issue/meeting-join";
import { PriorityIcon } from "@/components/issue/priority-icon";
import { StatusChip } from "@/components/issue/status-chip";
import { ScopeBadge } from "@/components/issue/scope-badge";
import { ScopeTabs } from "@/components/scope/scope-tabs";
import { ProgressBlock } from "@/components/today/progress-block";
import { useSearch, useWorkspace } from "@/components/workspace-provider";
import { SCOPE_DOT } from "@/lib/constants";
import { useIssues } from "@/hooks/use-issues";
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR } from "@/lib/constants";
import { formatTimeRange, minutesSinceStart, startOfDay, toDateKey } from "@/lib/dates";
import { getPersona } from "@/lib/personas";
import type { Issue } from "@/lib/types";

const STRIP_START = CALENDAR_START_HOUR;
const STRIP_END = CALENDAR_END_HOUR;
const STRIP_HOURS = STRIP_END - STRIP_START;

function DayStripBlockDetails({ issue }: { issue: Issue }) {
  const isEvent = issue.kind === "event";

  return (
    <div className="flex max-w-[16rem] flex-col gap-2 text-left">
      <div className="flex flex-wrap items-center gap-2">
        <ScopeBadge scope={issue.scope} />
        <span className="font-mono text-xs text-muted">{issue.identifier}</span>
        <StatusChip status={issue.status} size="sm" />
      </div>
      <p className="text-sm leading-snug font-medium">{issue.title}</p>
      <p className="text-xs text-muted">
        {formatTimeRange(issue.startAt, issue.endAt)}
        {isEvent ? " · Meeting" : " · Focus block"}
      </p>
      {issue.description.trim() && (
        <p className="line-clamp-3 text-xs leading-relaxed text-muted">{issue.description}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <PriorityIcon priority={issue.priority} />
        {isEvent && issue.meetingUrl && <MeetingJoinLink issue={issue} variant="inline" />}
      </div>
    </div>
  );
}

function DayStripBlock({
  issue,
  onOpen,
}: {
  issue: Issue;
  onOpen: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  if (!issue.startAt || !issue.endAt) return null;

  const startMin = minutesSinceStart(issue.startAt, STRIP_START);
  const durationMin =
    (new Date(issue.endAt).getTime() - new Date(issue.startAt).getTime()) / 60000;
  const left = Math.max(0, (startMin / (STRIP_HOURS * 60)) * 100);
  const width = Math.max(3, (durationMin / (STRIP_HOURS * 60)) * 100);
  const isEvent = issue.kind === "event";
  const scopeColor = SCOPE_DOT[issue.scope];
  const timeRange = formatTimeRange(issue.startAt, issue.endAt);

  function showPopover() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function openIssue() {
    setOpen(false);
    onOpen(issue.id);
  }

  function handleClick() {
    if (!canHover && !open) {
      showPopover();
      return;
    }
    openIssue();
  }

  return (
    <div
      className="absolute top-2 bottom-2 min-w-11"
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-label={`${issue.title}, ${timeRange}`}
        className={`flex h-full min-h-11 w-full cursor-pointer flex-col justify-center gap-0.5 overflow-hidden rounded-md border-2 px-2 text-left transition-colors ${
          isEvent
            ? "bg-indigo-300/30 hover:bg-indigo-300/45"
            : "bg-emerald-300/15 hover:bg-emerald-300/30"
        }`}
        style={{ borderColor: `${scopeColor}99`, touchAction: "manipulation" }}
        onMouseEnter={canHover ? showPopover : undefined}
        onMouseLeave={canHover ? scheduleClose : undefined}
        onClick={handleClick}
      >
        <span className="flex flex-col justify-center gap-0.5 overflow-hidden">
          <span className="truncate text-xs leading-tight font-medium text-foreground">
            {issue.title}
          </span>
          <span className="truncate text-xs leading-tight text-foreground/60">{timeRange}</span>
        </span>
      </button>

      <AriaPopover
        triggerRef={triggerRef}
        isOpen={open}
        isNonModal
        offset={10}
        placement="top"
        className="w-72 rounded-xl border border-border bg-surface p-3 shadow-lg outline-none"
        onOpenChange={(next) => {
          if (canHover) return;
          setOpen(next);
        }}
        onMouseEnter={canHover ? showPopover : undefined}
        onMouseLeave={canHover ? scheduleClose : undefined}
      >
        <Dialog className="outline-none">
          <DayStripBlockDetails issue={issue} />
        </Dialog>
      </AriaPopover>
    </div>
  );
}

function isOverdue(issue: Issue, today: string) {
  return Boolean(issue.dueDate && issue.dueDate < today && issue.status !== "done");
}

function isScheduledToday(issue: Issue, todayKey: string) {
  return Boolean(issue.startAt && toDateKey(new Date(issue.startAt!)) === todayKey);
}

function isTaskDueToday(issue: Issue, todayKey: string) {
  if (issue.kind !== "task" || issue.status === "done" || issue.status === "backlog") return false;
  if (issue.startAt) return false;
  if (isOverdue(issue, todayKey)) return false;
  if (issue.dueDate === todayKey) return true;
  return issue.status === "todo" || issue.status === "in_progress";
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const section = {
  hidden: { opacity: 0, y: 12 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.06, duration: 0.3, ease: "easeOut" as const },
  }),
};

function DayStrip({
  scheduled,
  onOpen,
  showNow,
}: {
  scheduled: Issue[];
  onOpen: (id: string) => void;
  showNow: boolean;
}) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes() - STRIP_START * 60;
  const nowPct = Math.min(100, Math.max(0, (nowMinutes / (STRIP_HOURS * 60)) * 100));
  const hourTicks = Array.from({ length: STRIP_HOURS + 1 }, (_, i) => STRIP_START + i);

  return (
    <div className="rounded-xl border border-border bg-surface/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          Day structure
        </p>
        <p className="text-xs text-muted">
          {STRIP_START}:00 – {STRIP_END}:00
        </p>
      </div>
      <div className="relative h-24 rounded-lg bg-default/40">
        {hourTicks.map((hour) => (
          <div
            key={hour}
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-border/50"
            style={{ left: `${((hour - STRIP_START) / STRIP_HOURS) * 100}%` }}
          />
        ))}
        {scheduled.map((issue) => (
          <DayStripBlock key={issue.id} issue={issue} onOpen={onOpen} />
        ))}
        {showNow && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-danger"
            style={{ left: `${nowPct}%` }}
          />
        )}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        {hourTicks
          .filter((hour) => hour % 2 === 0)
          .map((hour) => (
            <span key={hour}>{hour}:00</span>
          ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-indigo-300/70" /> Meetings & events
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-emerald-300/60" /> Focus blocks
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: SCOPE_DOT.work }} /> Work
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: SCOPE_DOT.personal }} /> Personal
        </span>
      </div>
    </div>
  );
}

export function TodayAgenda() {
  const { search } = useSearch();
  const { openIssue, openCreate, activePersonaId, activeScope } = useWorkspace();
  const issues = useIssues(activePersonaId, search, activeScope);
  const persona = getPersona(activePersonaId);
  const today = startOfDay();
  const todayKey = toDateKey(today);

  const { attention, scheduled, meetings, tasks } = useMemo(() => {
    const filtered = issues ?? [];
    const overdue = filtered.filter((issue) => isOverdue(issue, todayKey));
    const urgentToday = filtered.filter(
      (issue) =>
        !isOverdue(issue, todayKey) &&
        issue.priority === "urgent" &&
        issue.status !== "done" &&
        issue.dueDate === todayKey,
    );
    const attentionItems = [...overdue, ...urgentToday];
    const scheduledItems = filtered
      .filter((issue) => isScheduledToday(issue, todayKey))
      .sort((a, b) => (a.startAt ?? "").localeCompare(b.startAt ?? ""));
    const meetingItems = scheduledItems.filter((issue) => issue.kind === "event");
    const taskItems = filtered.filter((issue) => isTaskDueToday(issue, todayKey));
    return {
      attention: attentionItems,
      scheduled: scheduledItems,
      meetings: meetingItems,
      tasks: taskItems,
    };
  }, [issues, todayKey]);

  if (issues === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <motion.div variants={section} initial="hidden" animate="show" custom={0}>
        <p className="text-xs tracking-wide text-muted uppercase">
          {today.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="min-w-0 text-2xl font-semibold tracking-tight">
            {greeting()}, {persona.firstName}
          </h2>
          <ScopeTabs />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip size="sm" variant="soft" color="accent">
            {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}
          </Chip>
          <Chip size="sm" variant="soft">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} to do
          </Chip>
          {attention.length > 0 && (
            <Chip size="sm" variant="soft" color="danger">
              {attention.length} need{attention.length === 1 ? "s" : ""} attention
            </Chip>
          )}
        </div>
      </motion.div>

      <motion.div variants={section} initial="hidden" animate="show" custom={1}>
        <ProgressBlock issues={issues} referenceDate={today} />
      </motion.div>

      <motion.div variants={section} initial="hidden" animate="show" custom={2}>
        <DayStrip scheduled={scheduled} onOpen={openIssue} showNow />
      </motion.div>

      {attention.length > 0 && (
        <motion.section
          variants={section}
          initial="hidden"
          animate="show"
          custom={3}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Needs attention</h3>
            <Chip color="danger" size="sm" variant="soft">
              {attention.length}
            </Chip>
          </div>
          <div className="flex flex-col gap-2">
            {attention.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onOpen={openIssue} />
            ))}
          </div>
        </motion.section>
      )}

      <motion.section
        variants={section}
        initial="hidden"
        animate="show"
        custom={4}
        className="flex flex-col gap-3"
      >
        <h3 className="text-sm font-medium">Today&apos;s schedule</h3>
        {scheduled.length === 0 ? (
          <EmptyState
            icon={<IconCalendar className="size-5" />}
            title={
              activeScope === "personal"
                ? "No personal items scheduled today"
                : activeScope === "work"
                  ? "Nothing time-blocked for work today"
                  : "Nothing time-blocked today"
            }
            description="Click a calendar slot or create an event to structure your day."
            actionLabel="Block time"
            onAction={() =>
              openCreate({
                kind: "event",
                status: "todo",
                scope: activeScope === "personal" ? "personal" : "work",
              })
            }
          />
        ) : (
          <div className="flex flex-col">
            {scheduled.map((issue, index) => {
              const isEvent = issue.kind === "event";
              const isLast = index === scheduled.length - 1;
              const markerColor = isEvent ? "#a5b4fc" : "#6ee7b7";
              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => openIssue(issue.id)}
                  className="group flex w-full gap-4 pb-4 text-left last:pb-0"
                >
                  <div
                    aria-hidden
                    className="flex w-5 shrink-0 flex-col items-center self-stretch"
                  >
                    <div className="flex h-4 shrink-0 items-center justify-center pt-2.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full ring-[3px] ring-background"
                        style={{
                          backgroundColor: markerColor,
                          boxShadow: `0 0 10px ${markerColor}55`,
                        }}
                      />
                    </div>
                    {!isLast && (
                      <div className="mt-1 w-0.5 flex-1 rounded-full bg-gradient-to-b from-accent/40 via-accent/20 to-accent/8" />
                    )}
                  </div>
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 600, damping: 35 }}
                    className="min-w-0 flex-1 rounded-lg border border-l-2 border-border bg-surface/60 px-3 py-2.5 transition-colors hover:border-accent/40 hover:bg-surface"
                    style={{ borderLeftColor: SCOPE_DOT[issue.scope] }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted">
                          {formatTimeRange(issue.startAt, issue.endAt)}
                          {isEvent ? " · Meeting" : ""}
                        </p>
                        <p className="mt-0.5 text-sm font-medium">{issue.title}</p>
                      </div>
                      {isEvent && issue.meetingUrl && <MeetingJoinLink issue={issue} />}
                    </div>
                  </motion.span>
                </button>
              );
            })}
          </div>
        )}
      </motion.section>

      <motion.section
        variants={section}
        initial="hidden"
        animate="show"
        custom={5}
        className="flex flex-col gap-3"
      >
        <h3 className="text-sm font-medium">Tasks to complete</h3>
        {tasks.length === 0 ? (
          <EmptyState
            icon={<IconInbox className="size-5" />}
            title={
              activeScope === "personal"
                ? "No personal tasks for today"
                : activeScope === "work"
                  ? "All clear on work tasks"
                  : "All clear"
            }
            description="No open tasks waiting for today. Enjoy the focus time."
            actionLabel="New task"
            onAction={() =>
              openCreate({
                kind: "task",
                status: "todo",
                scope: activeScope === "personal" ? "personal" : "work",
              })
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onOpen={openIssue} />
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
