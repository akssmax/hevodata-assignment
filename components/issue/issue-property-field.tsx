"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

function isInOverlay(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      '[role="dialog"], [data-slot="popover"], [data-react-aria-top-layer], [data-overlay-container], .react-aria-Popover, .react-aria-ListBox, .react-aria-Calendar',
    ),
  );
}

export function PropertyField({
  label,
  icon,
  summary,
  children,
  interactive = true,
}: {
  label: string;
  icon?: ReactNode;
  summary: ReactNode;
  children?: ReactNode;
  /** Read-only rows skip the hover editor. */
  interactive?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focused, setFocused] = useState(false);
  const showControls = interactive && (hovered || pinned || focused);

  const pin = useCallback(() => setPinned(true), []);
  const unpin = useCallback(() => {
    setPinned(false);
    setHovered(false);
    setFocused(false);
  }, []);

  useEffect(() => {
    if (!pinned) return;

    function onPointerDown(event: PointerEvent) {
      const row = rowRef.current;
      if (!row) return;
      if (row.contains(event.target as Node)) return;
      if (isInOverlay(event.target)) return;
      unpin();
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [pinned, unpin]);

  return (
    <div
      ref={rowRef}
      className="group/prop grid min-h-11 grid-cols-1 items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface/50 md:grid-cols-[6.75rem_minmax(0,1fr)] md:gap-3"
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => {
        if (!pinned && !focused) setHovered(false);
      }}
      onFocusCapture={() => interactive && setFocused(true)}
      onBlurCapture={(event) => {
        const row = rowRef.current;
        if (!row) return;
        if (event.relatedTarget && row.contains(event.relatedTarget as Node)) return;
        if (isInOverlay(event.relatedTarget)) return;
        setFocused(false);
        if (!pinned) setHovered(false);
      }}
    >
      <span className="flex h-8 shrink-0 items-center gap-2 text-xs text-muted">
        {icon ? (
          <span className="flex size-4 shrink-0 items-center justify-center opacity-70">{icon}</span>
        ) : null}
        {label}
      </span>

      {interactive ? (
        <div className="relative min-w-0">
          {/* Summary overlays the editor; editor stays in flow so row height never shifts. */}
          <div
            className={`pointer-events-none absolute inset-0 z-10 flex items-center transition-opacity duration-100 ${
              showControls ? "opacity-0" : "opacity-100"
            }`}
          >
            <button
              type="button"
              className="pointer-events-auto flex min-h-10 w-full items-center truncate rounded-md px-1 text-left text-xs text-foreground/90 transition-colors hover:bg-surface/40 md:min-h-8"
              onClick={pin}
            >
              {summary}
            </button>
          </div>
          <div
            className={`transition-opacity duration-100 ${
              showControls ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onPointerDownCapture={pin}
          >
            {children}
          </div>
        </div>
      ) : (
        <div className="flex min-h-8 min-w-0 items-center truncate text-xs text-foreground/90">
          {summary}
        </div>
      )}
    </div>
  );
}
