"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Over,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Chip, Spinner } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { IssueCard } from "@/components/issue/issue-card";
import { useSearch, useWorkspace } from "@/components/workspace-provider";
import { groupByStatus, useIssues } from "@/hooks/use-issues";
import { STATUS_DOT, STATUS_LABELS } from "@/lib/constants";
import { moveIssue } from "@/lib/issue-service";
import { STATUSES, type Issue, type Status } from "@/lib/types";

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

function SortableIssue({ issue, onOpen }: { issue: Issue; onOpen: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
    data: { type: "issue", issue },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, touchAction: "none" }}
      className={isDragging ? "opacity-40" : undefined}
      {...attributes}
      {...listeners}
    >
      <IssueCard issue={issue} onOpen={isDragging ? () => undefined : onOpen} />
    </div>
  );
}

function Column({
  status,
  issues,
  onOpen,
}: {
  status: Status;
  issues: Issue[];
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });
  const itemIds = useMemo(() => issues.map((issue) => issue.id), [issues]);

  return (
    <section
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl p-3 transition-colors ${
        isOver ? "bg-accent/10" : "bg-default/40"
      }`}
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
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <SortableIssue key={issue.id} issue={issue} onOpen={onOpen} />
          ))}
        </SortableContext>
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
  const { openIssue, activePersonaId } = useWorkspace();
  const issues = useIssues(activePersonaId, search);
  const grouped = useMemo(() => groupByStatus(issues), [issues]);
  const [active, setActive] = useState<Issue | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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

    if (current.status === overStatus && overIssue?.id === current.id) return;

    await moveIssue(current.id, overStatus, beforeRank, afterRank);
  }

  return (
    <div className="h-full overflow-x-auto px-5 py-5">
      <DndContext
        collisionDetection={closestCorners}
        sensors={sensors}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
      >
        <div className="flex h-full min-w-max gap-3">
          {STATUSES.map((status) => (
            <Column key={status} issues={grouped[status]} status={status} onOpen={openIssue} />
          ))}
        </div>
        <DragOverlay>
          {active ? (
            <div className="w-72">
              <IssueCard issue={active} onOpen={() => undefined} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
