export function normalizeLimit(value?: number, fallback = 2000, max = 20000): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(value, max));
}
