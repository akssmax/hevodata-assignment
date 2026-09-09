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
import { PriorityIcon } from "@/components/issue/priority-icon";
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
      <span className="font-mono text-[11px] text-muted">{getValue<string>()}</span>
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
        <span className="text-[11px] text-muted">—</span>
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
      if (!due) return <span className="text-[11px] text-muted">—</span>;
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
      <span className="text-[11px] text-muted">{PRIORITY_LABELS[row.original.priority]}</span>
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
  const { openIssue, openCreate, activePersonaId } = useWorkspace();
  const issues = useIssues(activePersonaId, search);
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
    return (
      <div className="px-5 py-10">
        <EmptyState
          icon={<IconInbox className="size-5" />}
          title={search.trim() ? "No issues match this search" : "No issues yet"}
          description={
            search.trim()
              ? `Nothing found for "${search.trim()}". Try a different keyword.`
              : "Create your first task or event to get started."
          }
          actionLabel={search.trim() ? "Clear search" : "New issue"}
          onAction={search.trim() ? () => setSearch("") : () => openCreate()}
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
    <div className="px-5 py-4">
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-surface/40">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left text-[11px] font-medium tracking-wide text-muted uppercase"
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
            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-surface/60"
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
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 600, damping: 35 }}
            className="cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-surface/60"
            onClick={() => onOpen(row.original.id)}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-4 py-2.5">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </motion.tr>
        ))}
    </>
  );
}
