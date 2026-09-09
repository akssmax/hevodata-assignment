"use client";

import { Chip, Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/empty-state";
import { IconCalendar, IconInbox } from "@/components/icons";
import { IssueCard } from "@/components/issue/issue-card";
import { useWorkspace } from "@/components/workspace-provider";
import { useIssues } from "@/hooks/use-issues";
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR } from "@/lib/constants";
import { formatTimeRange, minutesSinceStart, startOfDay, toDateKey } from "@/lib/dates";
import { getPersona } from "@/lib/personas";
import type { Issue } from "@/lib/types";

const STRIP_START = CALENDAR_START_HOUR;
const STRIP_END = CALENDAR_END_HOUR;
const STRIP_HOURS = STRIP_END - STRIP_START;

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
}: {
  scheduled: Issue[];
  onOpen: (id: string) => void;
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
        <p className="text-[11px] text-muted">
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
        {scheduled.map((issue) => {
          if (!issue.startAt || !issue.endAt) return null;
          const startMin = minutesSinceStart(issue.startAt, STRIP_START);
          const durationMin =
            (new Date(issue.endAt).getTime() - new Date(issue.startAt).getTime()) / 60000;
          const left = Math.max(0, (startMin / (STRIP_HOURS * 60)) * 100);
          const width = Math.max(3, (durationMin / (STRIP_HOURS * 60)) * 100);
          const isEvent = issue.kind === "event";
          return (
            <motion.button
              key={issue.id}
              type="button"
              title={`${issue.title} · ${formatTimeRange(issue.startAt, issue.endAt)}`}
              onClick={() => onOpen(issue.id)}
              className={`absolute top-2 bottom-2 flex flex-col justify-center gap-0.5 overflow-hidden rounded-md border px-2 text-left ${
                isEvent
                  ? "border-indigo-300/50 bg-indigo-300/30 hover:bg-indigo-300/45"
                  : "border-emerald-300/40 bg-emerald-300/15 hover:bg-emerald-300/30"
              }`}
              style={{ left: `${left}%`, width: `${width}%` }}
              whileHover={{ scaleY: 1.06 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span className="truncate text-[11px] leading-tight font-medium text-foreground">
                {issue.title}
              </span>
              <span className="truncate text-[10px] leading-tight text-foreground/60">
                {formatTimeRange(issue.startAt, issue.endAt)}
              </span>
            </motion.button>
          );
        })}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-danger"
          style={{ left: `${nowPct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted">
        {hourTicks
          .filter((hour) => hour % 2 === 0)
          .map((hour) => (
            <span key={hour}>{hour}:00</span>
          ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-indigo-300/70" /> Meetings & events
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-emerald-300/60" /> Focus blocks
        </span>
      </div>
    </div>
  );
}

export function TodayAgenda() {
  const { search, openIssue, openCreate, activePersonaId } = useWorkspace();
  const issues = useIssues(activePersonaId);
  const persona = getPersona(activePersonaId);
  const today = startOfDay();

  if (issues === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const todayKey = toDateKey(today);
  const filtered = issues.filter((issue) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      issue.title.toLowerCase().includes(q) ||
      issue.identifier.toLowerCase().includes(q) ||
      issue.description.toLowerCase().includes(q)
    );
  });

  const overdue = filtered.filter((issue) => isOverdue(issue, todayKey));
  const urgentToday = filtered.filter(
    (issue) =>
      !isOverdue(issue, todayKey) &&
      issue.priority === "urgent" &&
      issue.status !== "done" &&
      issue.dueDate === todayKey,
  );
  const attention = [...overdue, ...urgentToday];
  const scheduled = filtered
    .filter((issue) => isScheduledToday(issue, todayKey))
    .sort((a, b) => (a.startAt ?? "").localeCompare(b.startAt ?? ""));
  const meetings = scheduled.filter((issue) => issue.kind === "event");
  const tasks = filtered.filter((issue) => isTaskDueToday(issue, todayKey));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <motion.div variants={section} initial="hidden" animate="show" custom={0}>
        <p className="text-xs tracking-wide text-muted uppercase">
          {today.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          {greeting()}, {persona.firstName}
        </h2>
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
        <DayStrip scheduled={scheduled} onOpen={openIssue} />
      </motion.div>

      {attention.length > 0 && (
        <motion.section
          variants={section}
          initial="hidden"
          animate="show"
          custom={2}
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
        custom={3}
        className="flex flex-col gap-3"
      >
        <h3 className="text-sm font-medium">Today&apos;s schedule</h3>
        {scheduled.length === 0 ? (
          <EmptyState
            icon={<IconCalendar className="size-5" />}
            title="Nothing time-blocked today"
            description="Click a calendar slot or create an event to structure your day."
            actionLabel="Block time"
            onAction={() => openCreate({ kind: "event", status: "todo" })}
          />
        ) : (
          <div className="relative">
            <span
              aria-hidden
              className="absolute top-1 bottom-1 left-[7px] w-px bg-gradient-to-b from-accent/60 via-accent/25 to-accent/5"
            />
            {scheduled.map((issue) => {
              const dotColor = issue.kind === "event" ? "#a5b4fc" : "#6ee7b7";
              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => openIssue(issue.id)}
                  className="relative mb-3 block w-full pl-6 text-left last:mb-0"
                >
                  <span
                    aria-hidden
                    className="absolute top-3.5 left-[2px] size-2.5 rounded-full ring-4 ring-background"
                    style={{
                      backgroundColor: dotColor,
                      boxShadow: `0 0 8px ${dotColor}66`,
                    }}
                  />
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 600, damping: 35 }}
                    className="block rounded-lg border border-border bg-surface/60 px-3 py-2.5 transition-colors hover:border-accent/40 hover:bg-surface"
                  >
                    <p className="text-[11px] text-muted">
                      {formatTimeRange(issue.startAt, issue.endAt)}
                      {issue.kind === "event" ? " · Meeting" : ""}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{issue.title}</p>
                    <p className="font-mono text-[11px] text-muted">{issue.identifier}</p>
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
        custom={4}
        className="flex flex-col gap-3"
      >
        <h3 className="text-sm font-medium">Tasks to complete</h3>
        {tasks.length === 0 ? (
          <EmptyState
            icon={<IconInbox className="size-5" />}
            title="All clear"
            description="No open tasks waiting for today. Enjoy the focus time."
            actionLabel="New task"
            onAction={() => openCreate({ kind: "task", status: "todo" })}
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
