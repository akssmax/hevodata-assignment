"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type Over,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Chip, Spinner } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { IssueCard } from "@/components/issue/issue-card";
import { ScopeTabs } from "@/components/scope/scope-tabs";
import { useSearch, useWorkspace } from "@/components/workspace-provider";
import { groupByStatus, useIssues } from "@/hooks/use-issues";
import { STATUS_DOT, STATUS_LABELS } from "@/lib/constants";
import { moveIssue } from "@/lib/issue-service";
import { STATUSES, type Issue, type Status } from "@/lib/types";

const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return rectIntersection(args);
};

function resolveOverStatus(over: Over, issues: Issue[]): Status | null {
  const data = over.data.current;
  if (data?.type === "column" && STATUSES.includes(data.status as Status)) {
    return data.status as Status;
  }
  if (data?.type === "issue") {
    return (data.issue as Issue).status;
  }
  const issue = issues.find((item) => item.id === over.id);
  if (issue) return issue.status;
  if (STATUSES.includes(over.id as Status)) return over.id as Status;
  return null;
}

function DraggableIssue({ issue, onOpen }: { issue: Issue; onOpen: (id: string) => void }) {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: issue.id,
    data: { type: "issue", issue },
  });
  const { setNodeRef: setDropRef } = useDroppable({
    id: issue.id,
    data: { type: "issue", issue },
  });

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef],
  );

  // Stable identity keeps IssueCard's memoization intact across drag state changes.
  const handleOpen = useCallback(
    (id: string) => {
      if (isDragging) return;
      onOpen(id);
    },
    [isDragging, onOpen],
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        touchAction: "none",
        opacity: isDragging ? 0.35 : 1,
        pointerEvents: isDragging ? "none" : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      <IssueCard draggable issue={issue} onOpen={handleOpen} />
    </div>
  );
}

function Column({
  status,
  issues,
  onOpen,
  stacked = false,
}: {
  status: Status;
  issues: Issue[];
  onOpen: (id: string) => void;
  stacked?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  return (
    <section
      ref={setNodeRef}
      className={`flex flex-col rounded-xl p-3 transition-colors ${
        stacked ? "w-full" : "w-72 shrink-0"
      } ${isOver ? "bg-accent/10" : "bg-default/40"}`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-[13px] font-medium">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: STATUS_DOT[status] }}
          />
          {STATUS_LABELS[status]}
        </h2>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={issues.length}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
          >
            <Chip size="sm" variant="soft">
              {issues.length}
            </Chip>
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex min-h-24 flex-1 flex-col gap-2">
        {issues.map((issue) => (
          <DraggableIssue key={issue.id} issue={issue} onOpen={onOpen} />
        ))}
        {issues.length === 0 && (
          <div
            className={`flex flex-1 items-center justify-center rounded-lg border border-dashed px-3 py-6 text-center text-xs transition-colors ${
              isOver ? "border-accent/50 text-accent" : "border-border text-muted"
            }`}
          >
            Drop issues here
          </div>
        )}
      </div>
    </section>
  );
}

export function KanbanBoard() {
  const { search } = useSearch();
  const { openIssue, activePersonaId, activeScope } = useWorkspace();
  const issues = useIssues(activePersonaId, search, activeScope);
  const grouped = useMemo(() => groupByStatus(issues), [issues]);
  const [active, setActive] = useState<Issue | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  if (issues === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  function onDragStart(event: DragStartEvent) {
    const issue = event.active.data.current?.issue as Issue | undefined;
    setActive(issue ?? null);
  }

  async function onDragEnd(event: DragEndEvent) {
    setActive(null);
    const { active: dragged, over } = event;
    if (!over || !issues || dragged.id === over.id) return;

    const current = issues.find((issue) => issue.id === dragged.id);
    if (!current) return;

    const overStatus = resolveOverStatus(over, issues);
    if (!overStatus) return;

    const overIssue = issues.find((issue) => issue.id === over.id);
    const targetColumn = grouped[overStatus].filter((issue) => issue.id !== current.id);

    let beforeRank: string | undefined;
    let afterRank: string | undefined;

    if (overIssue && overIssue.id !== current.id) {
      const index = targetColumn.findIndex((issue) => issue.id === overIssue.id);
      beforeRank = targetColumn[index - 1]?.rank;
      afterRank = overIssue.rank;
    } else {
      beforeRank = targetColumn[targetColumn.length - 1]?.rank;
    }

    await moveIssue(current.id, overStatus, beforeRank, afterRank);
  }

  return (
    <DndContext
      collisionDetection={collisionDetection}
      sensors={sensors}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <div className="flex flex-col gap-4 px-4 py-4 md:hidden">
        <ScopeTabs compact className="w-full" />
        {STATUSES.map((status) => (
          <Column
            key={status}
            issues={grouped[status]}
            stacked
            status={status}
            onOpen={openIssue}
          />
        ))}
      </div>
      <div className="hidden h-full flex-col overflow-hidden md:flex">
        <div className="shrink-0 px-5 pt-4">
          <ScopeTabs className="max-w-md" />
        </div>
        <div className="min-h-0 flex-1 overflow-x-auto px-5 pb-5">
        <div className="flex h-full min-w-max gap-3">
          {STATUSES.map((status) => (
            <Column key={status} issues={grouped[status]} status={status} onOpen={openIssue} />
          ))}
        </div>
        </div>
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
        {active ? (
          <div className="w-full max-w-72 rotate-2 cursor-grabbing shadow-lg md:w-72">
            <IssueCard issue={active} onOpen={() => undefined} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
