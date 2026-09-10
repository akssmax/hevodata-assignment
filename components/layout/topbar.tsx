"use client";

import { Button, Kbd, SearchField } from "@heroui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconPlus } from "@/components/icons";
import { PersonaPopover } from "@/components/layout/persona-popover";
import { useSearch, useWorkspace } from "@/components/workspace-provider";
import { NAV_TITLES } from "@/lib/nav";
import { getPersona } from "@/lib/personas";

export function Topbar() {
  const pathname = usePathname();
  const { search, setSearch } = useSearch();
  const { activePersonaId, openCreate } = useWorkspace();
  const persona = getPersona(activePersonaId);
  const title = NAV_TITLES[pathname] ?? "Dayline";
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 sm:gap-3 sm:px-5 md:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="shrink-0 md:hidden">
          <PersonaPopover compact />
        </div>
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium md:flex-none">{title}</h1>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        {searchOpen ? (
          <SearchField
            aria-label="Search issues"
            className="w-[min(100vw-7rem,16rem)] sm:min-w-0 sm:flex-1 sm:max-w-72"
            value={search}
            onChange={setSearch}
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                autoFocus
                className="min-w-0 w-full"
                placeholder={`Search ${persona.firstName}'s issues...`}
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        ) : (
          <>
            <Button
              isIconOnly
              aria-label="Search issues"
              className="touch-target md:hidden"
              size="md"
              variant="ghost"
              onPress={() => setSearchOpen(true)}
            >
              <MagnifyingGlassIcon className="size-5" />
            </Button>
            <SearchField
              aria-label="Search issues"
              className="hidden min-w-0 flex-1 md:flex md:max-w-72"
              value={search}
              onChange={setSearch}
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  className="min-w-0 w-full"
                  placeholder={`Search ${persona.firstName}'s issues...`}
                />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </>
        )}

        {searchOpen && (
          <Button
            aria-label="Close search"
            className="md:hidden"
            size="sm"
            variant="ghost"
            onPress={() => {
              setSearchOpen(false);
              setSearch("");
            }}
          >
            Cancel
          </Button>
        )}

        <Button
          className="shrink-0 max-sm:touch-target sm:h-8 sm:px-3"
          size="sm"
          onPress={() => openCreate()}
        >
          <IconPlus className="size-4" />
          <span className="hidden sm:inline">New</span>
          <Kbd className="hidden lg:inline-flex">
            <Kbd.Content>C</Kbd.Content>
          </Kbd>
        </Button>
      </div>
    </header>
  );
}
