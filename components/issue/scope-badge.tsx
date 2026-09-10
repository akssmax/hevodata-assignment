"use client";

import { BriefcaseIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Chip } from "@heroui/react";
import { SCOPE_DOT, SCOPE_LABELS } from "@/lib/constants";
import type { IssueScope } from "@/lib/types";

export function ScopeDotIcon({ scope, className = "size-2" }: { scope: IssueScope; className?: string }) {
  return (
    <span
      className={`shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: SCOPE_DOT[scope] }}
    />
  );
}

export function ScopeOptionIcon({ scope }: { scope: IssueScope }) {
  return <ScopeDotIcon scope={scope} />;
}

export function ScopeIcon({ scope, className = "size-3" }: { scope: IssueScope; className?: string }) {
  const Icon = scope === "work" ? BriefcaseIcon : HomeIcon;
  return <Icon className={`shrink-0 text-muted ${className}`} aria-hidden />;
}

export function ScopeBadge({ scope, showLabel = true }: { scope: IssueScope; showLabel?: boolean }) {
  return (
    <Chip size="sm" variant="soft" className="gap-1">
      <ScopeIcon scope={scope} className="size-3" />
      {showLabel ? SCOPE_LABELS[scope] : null}
    </Chip>
  );
}

export function scopeBorderStyle(scope: IssueScope): React.CSSProperties {
  return { borderLeftColor: SCOPE_DOT[scope] };
}
