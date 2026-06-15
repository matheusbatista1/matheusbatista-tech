export function formatPillLabel(pill: string): string {
  return pill.replace(/_/g, " ").toUpperCase();
}
