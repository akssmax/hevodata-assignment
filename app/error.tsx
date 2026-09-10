"use client";

import { Button } from "@heroui/react";
import { useEffect } from "react";
import { IconWarning } from "@/components/icons";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Dayline hit an unexpected error", error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-danger/10 text-danger">
          <IconWarning className="size-5" />
        </span>
        <h2 className="text-sm font-medium">Something went wrong</h2>
        <p className="text-xs leading-relaxed text-muted">
          This view failed to render. Your saved work is stored in this browser and has not been
          lost.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted">Reference: {error.digest}</p>
        )}
        <Button className="mt-1" size="sm" onPress={() => retry()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
