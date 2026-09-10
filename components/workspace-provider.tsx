"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_PERSONA_ID } from "@/lib/personas";
import { ensureSeeded } from "@/lib/seed";
import { defaultCreateScope, type ScopeFilter } from "@/lib/scope";
import type { IssueKind, IssueScope, Status } from "@/lib/types";

export interface CreateDraft {
  startAt?: string;
  endAt?: string;
  dueDate?: string;
  status?: Status;
  kind?: IssueKind;
  scope?: IssueScope;
}

interface SearchContextValue {
  search: string;
  setSearch: (value: string) => void;
}

interface WorkspaceContextValue {
  ready: boolean;
  initError: string | null;
  retryInit: () => void;
  activePersonaId: string;
  setActivePersona: (id: string) => void;
  activeScope: ScopeFilter;
  setActiveScope: (scope: ScopeFilter) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  createOpen: boolean;
  createDraft: CreateDraft;
  openCreate: (draft?: CreateDraft) => void;
  closeCreate: () => void;
  selectedIssueId: string | null;
  openIssue: (id: string) => void;
  closeIssue: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const PERSONA_KEY = "dayline:persona";
const SCOPE_KEY = "dayline:scope";
const SIDEBAR_KEY = "dayline:sidebar-collapsed";

const VALID_SCOPES = new Set<ScopeFilter>(["all", "work", "personal"]);

/** Storage errors are the common failure here: private browsing, full disk, or a blocked upgrade. */
function describeInitError(error: unknown): string {
  const name = error instanceof Error ? error.name : "";

  if (name === "QuotaExceededError") {
    return "Your browser is out of storage space for this site. Free up space or clear site data, then try again.";
  }
  if (name === "VersionError" || name === "BlockedError") {
    return "Dayline is open in another tab that is using an older version of its local database. Close the other tabs, then try again.";
  }
  return "Dayline stores your work in this browser, and that storage is unavailable. This usually means private browsing is on or the browser is blocking site data.";
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [initAttempt, setInitAttempt] = useState(0);
  const [activePersonaId, setActivePersonaId] = useState(DEFAULT_PERSONA_ID);
  const [activeScope, setActiveScopeState] = useState<ScopeFilter>("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateDraft>({});
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    try {
      const savedPersona = window.localStorage.getItem(PERSONA_KEY);
      if (savedPersona) setActivePersonaId(savedPersona);
      const savedScope = window.localStorage.getItem(SCOPE_KEY);
      if (savedScope && VALID_SCOPES.has(savedScope as ScopeFilter)) {
        setActiveScopeState(savedScope as ScopeFilter);
      }
      setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "true");
    } catch {
      // localStorage is blocked in some privacy modes; preferences just fall back to defaults.
    }

    ensureSeeded().then(
      () => {
        if (cancelled) return;
        setInitError(null);
        setReady(true);
      },
      (error: unknown) => {
        if (cancelled) return;
        console.error("Dayline failed to open its local database", error);
        setInitError(describeInitError(error));
        setReady(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [initAttempt]);

  const retryInit = useCallback(() => {
    setInitError(null);
    setInitAttempt((attempt) => attempt + 1);
  }, []);

  const setActivePersona = useCallback((id: string) => {
    setActivePersonaId(id);
    window.localStorage.setItem(PERSONA_KEY, id);
    setSelectedIssueId(null);
    setCreateOpen(false);
    setSearch("");
  }, []);

  const setActiveScope = useCallback((scope: ScopeFilter) => {
    setActiveScopeState(scope);
    window.localStorage.setItem(SCOPE_KEY, scope);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      window.localStorage.setItem(SIDEBAR_KEY, String(!prev));
      return !prev;
    });
  }, []);

  const openCreate = useCallback(
    (draft: CreateDraft = {}) => {
      setCreateDraft({
        ...draft,
        scope: draft.scope ?? defaultCreateScope(activeScope),
      });
      setCreateOpen(true);
    },
    [activeScope],
  );

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    setCreateDraft({});
  }, []);

  const openIssue = useCallback((id: string) => {
    setSelectedIssueId(id);
  }, []);

  const closeIssue = useCallback(() => {
    setSelectedIssueId(null);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        openCreate();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCreate]);

  const searchValue = useMemo(
    () => ({
      search,
      setSearch,
    }),
    [search],
  );

  const workspaceValue = useMemo(
    () => ({
      ready,
      initError,
      retryInit,
      activePersonaId,
      setActivePersona,
      activeScope,
      setActiveScope,
      sidebarCollapsed,
      toggleSidebar,
      createOpen,
      createDraft,
      openCreate,
      closeCreate,
      selectedIssueId,
      openIssue,
      closeIssue,
    }),
    [
      ready,
      initError,
      retryInit,
      activePersonaId,
      setActivePersona,
      activeScope,
      setActiveScope,
      sidebarCollapsed,
      toggleSidebar,
      createOpen,
      createDraft,
      openCreate,
      closeCreate,
      selectedIssueId,
      openIssue,
      closeIssue,
    ],
  );

  return (
    <SearchContext.Provider value={searchValue}>
      <WorkspaceContext.Provider value={workspaceValue}>{children}</WorkspaceContext.Provider>
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within WorkspaceProvider");
  }
  return context;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
