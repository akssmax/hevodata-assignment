export function rankBetween(before?: string, after?: string): string {
  const previous = before ? Number(before) : 0;
  const next = after ? Number(after) : previous + 1000;

  if (!Number.isFinite(previous) || !Number.isFinite(next) || previous === next) {
    return String(Date.now());
  }

  return String((previous + next) / 2);
}
