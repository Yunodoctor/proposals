import { useSyncExternalStore } from "react";

import {
  proposalReviewSchema,
  type ProposalReview,
  type ProposalReviewInput,
} from "@/lib/proposal-review";

const STORAGE_KEY_PREFIX = "proposales.review.v2:";

export type StoredReview = {
  fingerprint: string;
  review: ProposalReview;
};

const snapshots = new Map<
  string,
  { raw: string | null; value: StoredReview | null }
>();

export function reviewFingerprint(input: ProposalReviewInput): string {
  return hashString(JSON.stringify(input));
}

export function useStoredReview(proposalId: string): StoredReview | null {
  return useSyncExternalStore(
    subscribeStoredReviews,
    () => readStoredReview(proposalId),
    getServerStoredReview,
  );
}

export function readStoredReview(proposalId: string): StoredReview | null {
  if (typeof window === "undefined") {
    return null;
  }

  let raw: string | null;

  try {
    raw = window.localStorage.getItem(storageKey(proposalId));
  } catch {
    return null;
  }

  const previous = snapshots.get(proposalId);

  if (previous && previous.raw === raw) {
    return previous.value;
  }

  const value = parseStoredReview(raw);
  snapshots.set(proposalId, { raw, value });
  return value;
}

export function writeStoredReview(
  proposalId: string,
  stored: StoredReview,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = JSON.stringify(stored);
    window.localStorage.setItem(storageKey(proposalId), raw);
    snapshots.set(proposalId, { raw, value: stored });
    window.dispatchEvent(
      new StorageEvent("storage", { key: storageKey(proposalId) }),
    );
  } catch {
    // The review still shows for this session if storage is unavailable.
  }
}

function getServerStoredReview(): null {
  return null;
}

function subscribeStoredReviews(onStoreChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key == null || event.key.startsWith(STORAGE_KEY_PREFIX)) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function parseStoredReview(raw: string | null): StoredReview | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const stored = parsed as { fingerprint?: unknown; review?: unknown };

    if (
      typeof stored.fingerprint !== "string" ||
      stored.fingerprint.length === 0
    ) {
      return null;
    }

    const review = proposalReviewSchema.safeParse(stored.review);

    if (!review.success) {
      return null;
    }

    return { fingerprint: stored.fingerprint, review: review.data };
  } catch {
    return null;
  }
}

function storageKey(proposalId: string): string {
  return `${STORAGE_KEY_PREFIX}${proposalId}`;
}

function hashString(value: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (
    (h2 >>> 0).toString(16).padStart(8, "0") +
    (h1 >>> 0).toString(16).padStart(8, "0")
  );
}
