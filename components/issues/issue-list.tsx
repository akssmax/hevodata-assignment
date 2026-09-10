"use client";

import { Chip, Spinner } from "@heroui/react";
import {
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
  type LegacyRow,
} from "@tanstack/react-table/legacy";
import { flexRender, type ExpandedState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { IconCalendar, IconChevronRight, IconInbox } from "@/components/icons";
import { IssueCard } from "@/components/issue/issue-card";
import { PriorityIcon } from "@/components/issue/priority-icon";
import { ScopeIcon } from "@/components/issue/scope-badge";
import { ScopeTabs } from "@/components/scope/scope-tabs";
import { StatusChip } from "@/components/issue/status-chip";
import { useSearch, useWorkspace } from "@/components/workspace-provider";
import { useIssues } from "@/hooks/use-issues";
import { PRIORITY_LABELS, STATUS_DOT, STATUS_LABELS } from "@/lib/constants";
import { formatTimeRange, toDateKey } from "@/lib/dates";
import type { Issue, Status } from "@/lib/types";

const STATUS_ORDER: Status[] = ["in_progress", "todo", "backlog", "done"];

const coreRowModel = getCoreRowModel<Issue>();
const groupedRowModel = getGroupedRowModel<Issue>();
const expandedRowModel = getExpandedRowModel<Issue>();

const columns: LegacyColumnDef<Issue>[] = [
  {
    id: "scope",
    accessorKey: "scope",
    header: "",
    cell: ({ row }) => <ScopeIcon scope={row.original.scope} />,
    size: 24,
  },
  {
    id: "priority",
    accessorKey: "priority",
    header: "",
    cell: ({ row }) => <PriorityIcon priority={row.original.priority} />,
    size: 32,
  },
  {
    id: "identifier",
    accessorKey: "identifier",
    header: "ID",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted">{getValue<string>()}</span>
    ),
    size: 72,
  },
  {
    id: "title",
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="flex min-w-0 items-center gap-2">
        {row.original.kind === "event" && (
          <IconCalendar className="size-3.5 shrink-0 text-indigo-300" />
        )}
        <span className="truncate text-[13px] font-medium">{row.original.title}</span>
      </span>
    ),
  },
  {
    id: "schedule",
    header: "Schedule",
    cell: ({ row }) => {
      const time = formatTimeRange(row.original.startAt, row.original.endAt);
      return time ? (
        <Chip size="sm" variant="soft">
          {time}
        </Chip>
      ) : (
        <span className="text-xs text-muted">—</span>
      );
    },
    size: 150,
  },
  {
    id: "dueDate",
    accessorKey: "dueDate",
    header: "Due",
    cell: ({ row }) => {
      const due = row.original.dueDate;
      if (!due) return <span className="text-xs text-muted">—</span>;
      const overdue = due < toDateKey(new Date()) && row.original.status !== "done";
      return (
        <Chip color={overdue ? "danger" : "warning"} size="sm" variant="soft">
          {due}
        </Chip>
      );
    },
    size: 110,
  },
  {
    id: "priorityLabel",
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <span className="text-xs text-muted">{PRIORITY_LABELS[row.original.priority]}</span>
    ),
    size: 90,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusChip status={row.original.status} />,
    size: 110,
  },
];

export function IssueList() {
  const { search, setSearch } = useSearch();
  const { openIssue, openCreate, activePersonaId, activeScope } = useWorkspace();
  const issues = useIssues(activePersonaId, search, activeScope);
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const data = useMemo(() => issues ?? [], [issues]);

  const table = useLegacyTable({
    data,
    columns,
    state: { grouping: ["status"], expanded },
    onExpandedChange: setExpanded,
    getCoreRowModel: coreRowModel,
    getGroupedRowModel: groupedRowModel,
    getExpandedRowModel: expandedRowModel,
    groupedColumnMode: false,
  });

  if (issues === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (issues.length === 0) {
    const scopeLabel =
      activeScope === "personal" ? "personal" : activeScope === "work" ? "work" : "";
    return (
      <div className="flex flex-col gap-4 px-4 py-4 md:px-5 md:py-6">
        <ScopeTabs compact className="max-w-md" />
        <EmptyState
          icon={<IconInbox className="size-5" />}
          title={
            search.trim()
              ? "No issues match this search"
              : scopeLabel
                ? `No ${scopeLabel} issues yet`
                : "No issues yet"
          }
          description={
            search.trim()
              ? `Nothing found for "${search.trim()}". Try a different keyword.`
              : "Create your first task or event to get started."
          }
          actionLabel={search.trim() ? "Clear search" : "New issue"}
          onAction={
            search.trim()
              ? () => setSearch("")
              : () => openCreate({ scope: activeScope === "personal" ? "personal" : "work" })
          }
        />
      </div>
    );
  }

  const groups = [...table.getGroupedRowModel().rows].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.getValue("status") as Status) -
      STATUS_ORDER.indexOf(b.getValue("status") as Status),
  );

  return (
    <>
      <div className="px-4 pt-4 md:px-5 md:pt-5">
        <ScopeTabs compact className="max-w-md" />
      </div>
      <div className="flex flex-col gap-4 px-4 py-4 md:hidden">
        {groups.map((groupRow) => {
          const status = groupRow.getValue("status") as Status;
          return (
            <section key={groupRow.id}>
              <div className="mb-2 flex min-h-11 items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: STATUS_DOT[status] }}
                />
                <span className="text-xs font-medium">{STATUS_LABELS[status]}</span>
                <Chip size="sm" variant="soft">
                  {groupRow.subRows.length}
                </Chip>
              </div>
              <div className="flex flex-col gap-2">
                {groupRow.subRows.map((row) => (
                  <IssueCard key={row.id} issue={row.original} onOpen={openIssue} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <div className="hidden px-5 py-4 md:block">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-surface/40">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted uppercase"
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {groups.map((groupRow) => {
              const status = groupRow.getValue("status") as Status;
              return (
                <GroupSection
                  key={groupRow.id}
                  count={groupRow.subRows.length}
                  expanded={groupRow.getIsExpanded()}
                  onToggle={groupRow.getToggleExpandedHandler()}
                  rows={groupRow.subRows}
                  status={status}
                  onOpen={openIssue}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}

function GroupSection({
  status,
  count,
  expanded,
  onToggle,
  rows,
  onOpen,
}: {
  status: Status;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  rows: LegacyRow<Issue>[];
  onOpen: (id: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-border/60 bg-surface/30">
        <td colSpan={columns.length} className="px-2 py-1.5">
          <button
            type="button"
            onClick={onToggle}
            className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface/60"
          >
            <motion.span
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="text-muted"
            >
              <IconChevronRight className="size-3" />
            </motion.span>
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: STATUS_DOT[status] }}
            />
            <span className="text-xs font-medium">{STATUS_LABELS[status]}</span>
            <Chip size="sm" variant="soft">
              {count}
            </Chip>
          </button>
        </td>
      </tr>
      {expanded &&
        rows.map((row) => (
          <motion.tr
            key={row.id}
            tabIndex={0}
            aria-label={`Open ${row.original.identifier}: ${row.original.title}`}
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 600, damping: 35 }}
            className="cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-surface/60 focus-visible:bg-surface/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            onClick={() => onOpen(row.original.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen(row.original.id);
              }
            }}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-4 py-3">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </motion.tr>
        ))}
    </>
  );
}
