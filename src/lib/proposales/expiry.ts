import { cleanText } from "@/lib/proposales/text";
import type { Proposal } from "@/lib/proposales/types";

const EXPIRY_SOON_MS = 7 * 24 * 60 * 60 * 1000;

export type ProposalExpiryState = "missing" | "past" | "soon" | "set";

export type ProposalExpiry = {
  state: ProposalExpiryState;
  date: Date | null;
};

export function readProposalExpiry(
  proposal: Proposal,
  now = Date.now(),
): ProposalExpiry {
  const date = parseExpiry(proposal);

  return {
    state: expiryState(date, now),
    date,
  };
}

export function formatExpiryDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function describeExpiry(
  state: ProposalExpiryState,
  dateLabel: string | null,
): string {
  if (state === "missing") {
    return "No expiry date is set.";
  }

  if (state === "past") {
    return dateLabel
      ? `Expired on ${dateLabel}.`
      : "This quote is past its expiry date.";
  }

  if (state === "soon") {
    return dateLabel
      ? `Expires ${dateLabel}, within 7 days.`
      : "Expires within 7 days.";
  }

  return dateLabel ? `Valid until ${dateLabel}.` : "An expiry date is set.";
}

function parseExpiry(proposal: Proposal): Date | null {
  const raw = cleanText(proposal.data?._valid_until_at);

  if (raw) {
    const date = new Date(raw);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (typeof proposal.expires_at === "number") {
    const ms =
      proposal.expires_at > 1e12
        ? proposal.expires_at
        : proposal.expires_at * 1000;
    const date = new Date(ms);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

function expiryState(date: Date | null, now: number): ProposalExpiryState {
  if (!date) {
    return "missing";
  }

  const delta = date.getTime() - now;

  if (delta < 0) {
    return "past";
  }

  if (delta <= EXPIRY_SOON_MS) {
    return "soon";
  }

  return "set";
}
