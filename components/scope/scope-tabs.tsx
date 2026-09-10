"use client";

import { BriefcaseIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { useWorkspace } from "@/components/workspace-provider";
import type { ScopeFilter } from "@/lib/scope";

const OPTIONS = [
  { id: "all" as const, label: "All", icon: null },
  { id: "work" as const, label: "Work", icon: BriefcaseIcon },
  { id: "personal" as const, label: "Personal", icon: HomeIcon },
];

export function ScopeTabs({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { activeScope, setActiveScope } = useWorkspace();

  return (
    <div
      role="tablist"
      aria-label="Life area"
      className={`flex shrink-0 items-center gap-1 rounded-lg bg-default/60 p-1 ${className ?? ""}`}
    >
      {OPTIONS.map((option) => {
        const active = activeScope === option.id;
        const Icon = option.icon;
        return (
          <Button
            key={option.id}
            size="sm"
            variant={active ? "secondary" : "ghost"}
            className="gap-1.5 rounded-md text-xs"
            onPress={() => setActiveScope(option.id as ScopeFilter)}
          >
            {Icon ? <Icon aria-hidden className="size-3.5 shrink-0" /> : null}
            {compact && option.id !== "all" ? (
              <span className="hidden sm:inline">{option.label}</span>
            ) : (
              option.label
            )}
          </Button>
        );
      })}
    </div>
  );
}
