"use client";

import { Spinner } from "@heroui/react";
import { CreateIssueModal } from "@/components/issue/create-issue-modal";
import { IssueDrawer } from "@/components/issue/issue-drawer";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceProvider, useWorkspace } from "@/components/workspace-provider";

function ShellFrame({ children }: { children: React.ReactNode }) {
  const { ready } = useWorkspace();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-auto">
          {ready ? (
            children
          ) : (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          )}
        </main>
      </div>
      <CreateIssueModal />
      <IssueDrawer />
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
