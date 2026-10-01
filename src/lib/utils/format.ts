import type { ProposalStatus } from "@/lib/proposales/types";

export function formatMoney(
  value: number | null,
  currency: string | null,
): string {
  if (value == null) {
    return "No total";
  }

  const amount = value / 100;

  if (!currency) {
    return String(amount);
  }

  const digits = Number.isInteger(amount) ? 0 : 2;

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatEdited(updatedAt: number | null): string | null {
  if (updatedAt == null) {
    return null;
  }

  const then = updatedAt > 1e12 ? updatedAt : updatedAt * 1000;
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));

  if (minutes < 1) {
    return "Last edited just now";
  }

  if (minutes < 60) {
    return `Last edited ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `Last edited ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.round(hours / 24);

  return `Last edited ${days} ${days === 1 ? "day" : "days"} ago`;
}

export function statusLabel(status: ProposalStatus | null): string {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}
