"use client";

import { Button, Kbd, SearchField } from "@heroui/react";
import { usePathname } from "next/navigation";
import { IconChevron, IconChevronRight, IconPlus } from "@/components/icons";
import { useSearch, useWorkspace } from "@/components/workspace-provider";
import { formatDayLabel, startOfDay, toDateKey } from "@/lib/dates";
import { getPersona } from "@/lib/personas";

const TITLES: Record<string, string> = {
  "/board": "Board",
  "/calendar": "Calendar",
  "/issues": "Issues",
};

function todayTitle(viewDate: Date): string {
  if (toDateKey(viewDate) === toDateKey(startOfDay())) return "Today";
  return formatDayLabel(viewDate);
}

export function Topbar() {
  const pathname = usePathname();
  const { search, setSearch } = useSearch();
  const { activePersonaId, openCreate, viewDate, goToPreviousDay, goToNextDay } = useWorkspace();
  const persona = getPersona(activePersonaId);
  const isTodayRoute = pathname === "/";
  const title = isTodayRoute ? todayTitle(viewDate) : (TITLES[pathname] ?? "Dayline");

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border px-5">
      {isTodayRoute ? (
        <div className="flex items-center gap-1">
          <Button
            isIconOnly
            aria-label="Previous day"
            size="sm"
            variant="ghost"
            onPress={goToPreviousDay}
          >
            <IconChevron className="size-4" />
          </Button>
          <h1 className="min-w-[7rem] text-center text-sm font-medium">{title}</h1>
          <Button
            isIconOnly
            aria-label="Next day"
            size="sm"
            variant="ghost"
            onPress={goToNextDay}
          >
            <IconChevronRight className="size-4" />
          </Button>
        </div>
      ) : (
        <h1 className="text-sm font-medium">{title}</h1>
      )}
      <div className="flex items-center gap-3">
        <SearchField
          aria-label="Search issues"
          className="w-72"
          value={search}
          onChange={setSearch}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              className="w-56"
              placeholder={`Search ${persona.firstName}'s issues...`}
            />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Button size="sm" onPress={() => openCreate()}>
          <IconPlus className="size-3.5" />
          New
          <Kbd className="hidden sm:inline-flex">
            <Kbd.Content>C</Kbd.Content>
          </Kbd>
        </Button>
      </div>
    </header>
  );
}
