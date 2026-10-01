import { readinessClass, readinessLabel } from "@/lib/utils/readiness";
import type { ReadinessReport } from "@/lib/proposales/types";

export function ReadinessCheck({ readiness }: { readiness: ReadinessReport }) {
  return (
    <div>
      <h3 className="text-xs tracking-wide text-neutral-400 uppercase">
        Readiness
      </h3>
      <p
        className={`mt-2 text-sm font-medium ${readinessClass(readiness.status)}`}
      >
        {readinessLabel(readiness.status)}
      </p>
      <ul className="mt-4 space-y-2">
        {readiness.checks.map((check) => (
          <li
            className="flex items-baseline justify-between gap-4"
            key={check.id}
          >
            <span
              className={`text-sm text-neutral-100 ${check.nested ? "pl-4" : ""}`}
            >
              <span className="block">{check.label}</span>
              {check.nested && !check.passed ? (
                <span className="mt-0.5 block text-xs text-neutral-400">
                  {check.detail}
                </span>
              ) : null}
            </span>
            <span
              className={`shrink-0 text-sm ${
                check.passed
                  ? "font-medium text-green-500"
                  : check.level === "attention"
                    ? "text-red-400"
                    : "font-medium text-yellow-500"
              }`}
            >
              {check.passed ? (
                <>
                  <span aria-hidden="true">✓</span>
                  <span className="sr-only">Done</span>
                </>
              ) : check.level === "attention" ? (
                "Missing"
              ) : (
                "Review"
              )}
            </span>
          </li>
        ))}
      </ul>
      {readiness.attentionCount > 0 || readiness.reviewCount > 0 ? (
        <p className="mt-4 text-sm text-neutral-400">
          {[
            readiness.attentionCount > 0
              ? `${readiness.attentionCount} missing`
              : null,
            readiness.reviewCount > 0
              ? `${readiness.reviewCount} to review`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : null}
      <h3 className="mt-6 text-xs tracking-wide text-neutral-400 uppercase">
        Summary
      </h3>
      <p className="mt-2 text-sm text-neutral-300">{readiness.summary}</p>
    </div>
  );
}
