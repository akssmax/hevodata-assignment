"use client";

import { useEffect } from "react";

/**
 * Replaces the root layout, so it renders its own document and cannot rely on
 * globals.css or the app's theme tokens. Styles are inline by necessity.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Dayline failed to render", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#ffffff",
          color: "#0f172a",
        }}
      >
        <title>Dayline — something went wrong</title>
        <main style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
            Dayline couldn&apos;t start
          </h1>
          <p
            style={{
              fontSize: "0.75rem",
              lineHeight: 1.6,
              color: "#64748b",
              margin: "0 0 1rem",
            }}
          >
            An unexpected error stopped the app from loading. Your saved work is stored in this
            browser and has not been lost.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                fontFamily: "ui-monospace, monospace",
                color: "#64748b",
                margin: "0 0 1rem",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => retry()}
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              padding: "0.5rem 0.875rem",
              borderRadius: "0.5rem",
              border: "1px solid #cbd5e1",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
