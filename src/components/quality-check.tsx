"use client";

import { useState } from "react";

import type {
  ProposalReview,
  ProposalReviewInput,
} from "@/lib/proposal-review";
import type { ProposalBrief } from "@/lib/proposales/brief";
import {
  reviewFingerprint,
  useStoredReview,
  writeStoredReview,
} from "@/lib/review-cache";

type Session =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; review: ProposalReview; fingerprint: string }
  | { status: "error"; message: string };

export function QualityCheck({
  brief,
  proposalId,
}: {
  brief: ProposalBrief;
  proposalId: string;
}) {
  const [session, setSession] = useState<Session>({ status: "idle" });

  const input = reviewInput(brief);
  const fingerprint = reviewFingerprint(input);
  const cached = useStoredReview(proposalId);

  const sessionReview =
    session.status === "done" && session.fingerprint === fingerprint
      ? session.review
      : null;
  const review = sessionReview ?? cached?.review ?? null;
  const stale =
    sessionReview == null &&
    cached != null &&
    cached.fingerprint !== fingerprint;
  const showReview = review != null && session.status !== "loading";
  const empty =
    showReview && review.mismatches.length === 0 && review.typos.length === 0;

  async function onReview() {
    setSession({ status: "loading" });

    try {
      const response = await fetch("/api/proposal-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok || body == null) {
        setSession({
          status: "error",
          message: errorMessage(body),
        });
        return;
      }

      const review = body as ProposalReview;

      writeStoredReview(proposalId, { fingerprint, review });
      setSession({ status: "done", review, fingerprint });
    } catch {
      setSession({
        status: "error",
        message: "Could not review this proposal.",
      });
    }
  }

  return (
    <div className="mt-4">
      <button
        className="rounded-full border border-white/20 px-3 py-1 text-sm text-neutral-200 disabled:opacity-50"
        disabled={session.status === "loading"}
        onClick={onReview}
        type="button"
      >
        {session.status === "loading"
          ? "Reading the pitch…"
          : showReview
            ? "Review again"
            : "Generate review"}
      </button>
      <div aria-live="polite">
        {session.status === "error" ? (
          <p className="mt-3 text-sm text-red-400">{session.message}</p>
        ) : null}
        {showReview ? (
          <ReviewFindings empty={empty} review={review} stale={stale} />
        ) : null}
      </div>
    </div>
  );
}

function ReviewFindings({
  review,
  empty,
  stale,
}: {
  review: ProposalReview;
  empty: boolean;
  stale: boolean;
}) {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <h5 className="text-xs tracking-wide text-neutral-400 uppercase">
          AI quality check
        </h5>
        {stale ? (
          <p className="rounded-full border border-yellow-500/40 px-2 py-0.5 text-xs text-yellow-500">
            Not up to date with the latest changes
          </p>
        ) : null}
      </div>
      {empty ? (
        <p className="mt-3 text-sm text-neutral-300">
          The pitch matches the line items.
        </p>
      ) : (
        <ul className="mt-3 space-y-4">
          {review.mismatches.map((mismatch) => (
            <li key={`${mismatch.pitchSays}-${mismatch.linesSay}`}>
              <p className="text-sm text-yellow-500">
                <span aria-hidden="true">⚠ </span>
                Possible pitch/quote mismatch
              </p>
              <div className="mt-1 space-y-0.5 pl-5 text-sm text-neutral-300">
                <p>Pitch says: “{mismatch.pitchSays}”</p>
                <p>Quote contains: {mismatch.linesSay}</p>
              </div>
            </li>
          ))}
          {review.typos.map((typo) => (
            <li key={`${typo.word}-${typo.sentence}`}>
              <p className="text-sm text-yellow-500">
                <span aria-hidden="true">⚠ </span>
                Possible typo
              </p>
              <div className="mt-1 space-y-0.5 pl-5 text-sm text-neutral-300">
                <p>
                  <span className="text-neutral-100">{typo.word}</span>
                  <span className="text-neutral-500"> → </span>
                  {typo.correction}
                </p>
                <p>In: “{typo.sentence}”</p>
                <p className="text-neutral-400">Location: {typo.location}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function reviewInput(brief: ProposalBrief): ProposalReviewInput {
  return {
    pitch: brief.pitch,
    lines: brief.lines.map((line) => ({
      title: line.title,
      quantity: line.quantity,
      description: line.description,
    })),
  };
}

function errorMessage(body: unknown): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string" &&
    body.error.trim()
  ) {
    return body.error;
  }

  return "Could not review this proposal.";
}
