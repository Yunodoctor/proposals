import type { Proposal } from "@/lib/proposales/types";

export function cleanText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
    .trim();
}

export function stripMarkdown(value: string): string {
  return value
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function displayTitle(
  proposal: Pick<Proposal, "title" | "title_md">,
  fallback?: string | null,
): string {
  return (
    cleanText(proposal.title_md) ||
    cleanText(proposal.title) ||
    cleanText(fallback) ||
    "Untitled proposal"
  );
}
