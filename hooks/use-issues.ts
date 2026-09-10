"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "@/lib/db";
import { matchesQuery } from "@/lib/issue-service";
import { filterByScope, type ScopeFilter } from "@/lib/scope";
import type { Issue, Status } from "@/lib/types";

export function useIssues(ownerId: string | null, query = "", scopeFilter: ScopeFilter = "all") {
  // Keyed on the owner alone so typing in search never re-reads IndexedDB.
  const issues = useLiveQuery(async () => {
    if (!ownerId) return [];
    const rows = await db.issues.where("ownerId").equals(ownerId).toArray();
    rows.sort((a, b) => a.rank.localeCompare(b.rank, undefined, { numeric: true }));
    return rows;
  }, [ownerId]);

  return useMemo(() => {
    if (issues === undefined) return undefined;
    const scoped = filterByScope(issues, scopeFilter);
    return query ? scoped.filter((issue) => matchesQuery(issue, query)) : scoped;
  }, [issues, query, scopeFilter]);
}

export function useIssue(id: string | null) {
  return useLiveQuery(async () => {
    if (!id) return undefined;
    return db.issues.get(id);
  }, [id]);
}

export function groupByStatus(issues: Issue[] | undefined) {
  const groups: Record<Status, Issue[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    done: [],
  };

  for (const issue of issues ?? []) {
    groups[issue.status].push(issue);
  }

  return groups;
}
