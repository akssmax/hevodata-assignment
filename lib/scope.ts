import type { Issue, IssueScope } from "./types";

export type ScopeFilter = "all" | IssueScope;

export function filterByScope(issues: Issue[], scope: ScopeFilter): Issue[] {
  if (scope === "all") return issues;
  return issues.filter((issue) => issue.scope === scope);
}

export function defaultCreateScope(activeScope: ScopeFilter): IssueScope {
  return activeScope === "personal" ? "personal" : "work";
}
