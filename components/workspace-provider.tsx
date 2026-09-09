"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_PERSONA_ID } from "@/lib/personas";
import { ensureSeeded } from "@/lib/seed";
import type { IssueKind, Status } from "@/lib/types";

export interface CreateDraft {
  startAt?: string;
  endAt?: string;
  dueDate?: string;
  status?: Status;
  kind?: IssueKind;
}

interface SearchContextValue {
  search: string;
  setSearch: (value: string) => void;
}

interface WorkspaceContextValue {
  ready: boolean;
  activePersonaId: string;
  setActivePersona: (id: string) => void;
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
const SIDEBAR_KEY = "dayline:sidebar-collapsed";
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState(DEFAULT_PERSONA_ID);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateDraft>({});
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  useEffect(() => {
    const savedPersona = window.localStorage.getItem(PERSONA_KEY);
    if (savedPersona) setActivePersonaId(savedPersona);
    setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "true");
    ensureSeeded().finally(() => setReady(true));
  }, []);

  const setActivePersona = useCallback((id: string) => {
    setActivePersonaId(id);
    window.localStorage.setItem(PERSONA_KEY, id);
    setSelectedIssueId(null);
    setCreateOpen(false);
    setSearch("");
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      window.localStorage.setItem(SIDEBAR_KEY, String(!prev));
      return !prev;
    });
  }, []);

  const openCreate = useCallback((draft: CreateDraft = {}) => {
    setCreateDraft(draft);
    setCreateOpen(true);
  }, []);

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
      activePersonaId,
      setActivePersona,
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
      activePersonaId,
      setActivePersona,
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
