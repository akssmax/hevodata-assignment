"use client";

import { Button, Kbd, SearchField } from "@heroui/react";
import { usePathname } from "next/navigation";
import { IconPlus } from "@/components/icons";
import { useSearch, useWorkspace } from "@/components/workspace-provider";
import { getPersona } from "@/lib/personas";

const TITLES: Record<string, string> = {
  "/": "Today",
  "/board": "Board",
  "/calendar": "Calendar",
  "/issues": "Issues",
};

export function Topbar() {
  const pathname = usePathname();
  const { search, setSearch } = useSearch();
  const { activePersonaId, openCreate } = useWorkspace();
  const persona = getPersona(activePersonaId);
  const title = TITLES[pathname] ?? "Dayline";

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border px-5">
      <h1 className="text-sm font-medium">{title}</h1>
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
