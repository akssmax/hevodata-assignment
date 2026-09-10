"use client";

import { Button, Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { IconWarning } from "@/components/icons";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceProvider, useWorkspace } from "@/components/workspace-provider";

const CreateIssueModal = dynamic(() =>
  import("@/components/issue/create-issue-modal").then((m) => ({ default: m.CreateIssueModal })),
);

const IssueDrawer = dynamic(() =>
  import("@/components/issue/issue-drawer").then((m) => ({ default: m.IssueDrawer })),
);

/** Matches the drawer's close transition so it can animate out before unmounting. */
const DRAWER_EXIT_MS = 300;

function StorageUnavailable({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-danger/10 text-danger">
          <IconWarning className="size-5" />
        </span>
        <h2 className="text-sm font-medium">Dayline can&apos;t reach its local storage</h2>
        <p className="text-xs leading-relaxed text-muted">{message}</p>
        <Button className="mt-1" size="sm" onPress={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const { ready, initError, retryInit, createOpen, selectedIssueId } = useWorkspace();
  const [lastIssueId, setLastIssueId] = useState(selectedIssueId);
  const [closingDrawer, setClosingDrawer] = useState(false);

  // Detect the close during render so the exit can start without an extra effect pass.
  if (lastIssueId !== selectedIssueId) {
    setLastIssueId(selectedIssueId);
    if (!selectedIssueId) setClosingDrawer(true);
  }

  // Keep the drawer mounted through its close animation, then unmount it.
  useEffect(() => {
    if (!closingDrawer) return;
    const timer = setTimeout(() => setClosingDrawer(false), DRAWER_EXIT_MS);
    return () => clearTimeout(timer);
  }, [closingDrawer]);

  const drawerMounted = Boolean(selectedIssueId) || closingDrawer;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden h-full shrink-0 md:flex">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col pb-14 md:pb-0">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-auto">
          {initError ? (
            <StorageUnavailable message={initError} onRetry={retryInit} />
          ) : ready ? (
            children
          ) : (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          )}
        </main>
      </div>
      {createOpen && <CreateIssueModal />}
      {drawerMounted && <IssueDrawer />}
      <MobileTabBar />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <ShellFrame>{children}</ShellFrame>
    </WorkspaceProvider>
  );
}
