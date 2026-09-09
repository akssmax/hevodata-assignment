"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { matchesQuery } from "@/lib/issue-service";
import type { Issue, Status } from "@/lib/types";

export function useIssues(ownerId: string | null, query = "") {
  return useLiveQuery(async () => {
    if (!ownerId) return [];
    const issues = await db.issues.where("ownerId").equals(ownerId).toArray();
    issues.sort((a, b) => a.rank.localeCompare(b.rank, undefined, { numeric: true }));
    return query ? issues.filter((issue) => matchesQuery(issue, query)) : issues;
  }, [ownerId, query]);
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
