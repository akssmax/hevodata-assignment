"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

function isInOverlay(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      [
        '[role="dialog"]',
        '[data-slot="popover"]',
        '[data-slot="date-picker-popover"]',
        '[data-slot="date-picker"]',
        '[data-slot="listbox"]',
        '[data-react-aria-top-layer]',
        '[data-overlay-container]',
        ".react-aria-Popover",
        ".react-aria-ListBox",
        ".react-aria-Calendar",
        ".react-aria-DatePicker",
      ].join(", "),
    ),
  );
}

function hasOpenOverlay(row: HTMLElement): boolean {
  return Boolean(row.querySelector('[aria-expanded="true"], [data-open="true"]'));
}

export function PropertyField({
  label,
  icon,
  summary,
  children,
  interactive = true,
  /** After pin (summary click), open an in-row date picker popover automatically. */
  autoActivateOnPin = false,
}: {
  label: string;
  icon?: ReactNode;
  summary: ReactNode;
  children?: ReactNode;
  /** Read-only rows skip the hover editor. */
  interactive?: boolean;
  autoActivateOnPin?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focused, setFocused] = useState(false);
  const showControls = interactive && (hovered || pinned || focused);

  const openDatePicker = useCallback(() => {
    if (!autoActivateOnPin) return;
    const row = rowRef.current;
    if (!row) return;

    // Editor children are always mounted; open on the next frame after pin toggles visibility.
    requestAnimationFrame(() => {
      const trigger = row.querySelector('[data-slot="date-picker-trigger"]') as HTMLElement | null;
      if (trigger?.getAttribute("aria-expanded") !== "true") {
        trigger?.click();
      }
    });
  }, [autoActivateOnPin]);

  const pin = useCallback(() => {
    if (pinnedRef.current) return;
    pinnedRef.current = true;
    setPinned(true);
    openDatePicker();
  }, [openDatePicker]);
  const unpin = useCallback(() => {
    pinnedRef.current = false;
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
        const row = rowRef.current;
        if (!pinned && !focused && !(row && hasOpenOverlay(row))) {
          setHovered(false);
        }
      }}
      onFocusCapture={() => interactive && setFocused(true)}
      onBlurCapture={(event) => {
        const row = rowRef.current;
        if (!row) return;
        // pin() is async; ref stays in sync so blur in the same gesture doesn't hide the editor.
        if (pinnedRef.current) return;
        if (event.relatedTarget && row.contains(event.relatedTarget as Node)) return;
        if (isInOverlay(event.relatedTarget)) return;
        // Popover open often reports null relatedTarget for one frame.
        if (!event.relatedTarget) return;
        setFocused(false);
        setHovered(false);
      }}
    >
      <span className="flex h-8 shrink-0 items-center gap-2 text-xs text-muted">
        {icon ? (
          <span className="flex size-4 shrink-0 items-center justify-center opacity-70">{icon}</span>
        ) : null}
        {label}
      </span>

      {interactive ? (
        <div className="grid h-10 min-w-0 grid-cols-1 grid-rows-1 items-center md:h-8">
          {/* Both layers share one grid cell so height stays locked while swapping. */}
          <div
            className={`col-start-1 row-start-1 w-full min-w-0 ${
              showControls ? "invisible pointer-events-none" : ""
            }`}
          >
            <button
              type="button"
              className="flex h-full w-full items-center truncate rounded-md px-1 text-left text-xs text-foreground/90 transition-colors hover:bg-surface/40"
              onPointerDown={(event) => {
                event.preventDefault();
                pin();
              }}
            >
              {summary}
            </button>
          </div>
          <div
            className={`col-start-1 row-start-1 w-full min-w-0 ${
              showControls ? "" : "invisible pointer-events-none"
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
