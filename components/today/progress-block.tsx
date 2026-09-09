"use client";

import { BoltIcon, CheckCircleIcon, FireIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { computeProgressStats } from "@/lib/progress-stats";
import type { Issue } from "@/lib/types";

interface ProgressBlockProps {
  issues: Issue[];
  referenceDate: Date;
}

function StatCell({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted">
        {icon}
        <span className="truncate text-[10px] font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="text-xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <div className="text-[11px] text-muted">{hint}</div>}
    </div>
  );
}

function weekDeltaLabel(delta: number): ReactNode {
  if (delta > 0) {
    return (
      <span className="text-accent">
        +{delta} vs last week
      </span>
    );
  }
  if (delta < 0) {
    return <span>{delta} vs last week</span>;
  }
  return <span>Same as last week</span>;
}

export function ProgressBlock({ issues, referenceDate }: ProgressBlockProps) {
  const stats = computeProgressStats(issues, referenceDate);

  return (
    <div className="rounded-xl border border-border bg-surface/50 px-4 py-3.5">
      <p className="mb-3 text-xs font-medium tracking-wide text-muted uppercase">Your progress</p>

      {!stats.hasCompletions ? (
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <BoltIcon aria-hidden className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Ready when you are</p>
            <p className="mt-0.5 text-xs text-muted">
              Complete your first task to start a streak and track weekly momentum.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <StatCell
            icon={<FireIcon aria-hidden className="size-3.5" />}
            label="Streak"
            value={stats.streak > 0 ? `${stats.streak}d` : "—"}
            hint={stats.streak > 0 ? "Days in a row" : "Start today"}
          />
          <StatCell
            icon={<CheckCircleIcon aria-hidden className="size-3.5" />}
            label="Today"
            value={String(stats.completedToday)}
            hint={stats.completedToday === 0 ? "None yet" : "Tasks done"}
          />
          <StatCell
            icon={<BoltIcon aria-hidden className="size-3.5" />}
            label="This week"
            value={String(stats.completedThisWeek)}
            hint={weekDeltaLabel(stats.weekDelta)}
          />
        </div>
      )}
    </div>
  );
}
