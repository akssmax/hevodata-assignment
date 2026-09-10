"use client";

import { BriefcaseIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Tabs } from "@heroui/react";
import { useWorkspace } from "@/components/workspace-provider";
import type { ScopeFilter } from "@/lib/scope";

export function ScopeTabs({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { activeScope, setActiveScope } = useWorkspace();

  return (
    <Tabs
      className={className}
      selectedKey={activeScope}
      variant="secondary"
      onSelectionChange={(key) => {
        if (key != null) setActiveScope(String(key) as ScopeFilter);
      }}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="Life area">
          <Tabs.Tab id="all">All</Tabs.Tab>
          <Tabs.Tab id="work">
            <span className="flex items-center gap-1.5">
              <BriefcaseIcon className="size-3.5 shrink-0" aria-hidden />
              {compact ? <span className="hidden sm:inline">Work</span> : "Work"}
            </span>
          </Tabs.Tab>
          <Tabs.Tab id="personal">
            <span className="flex items-center gap-1.5">
              <HomeIcon className="size-3.5 shrink-0" aria-hidden />
              {compact ? <span className="hidden sm:inline">Personal</span> : "Personal"}
            </span>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Indicator />
      </Tabs.ListContainer>
    </Tabs>
  );
}
