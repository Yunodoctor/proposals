import type { ReadinessStatus } from "@/lib/proposales/types";

const groups: ReadinessStatus[] = ["attention", "review", "ready"];

export function readinessLabel(status: ReadinessStatus): string {
  if (status === "ready") {
    return "Ready";
  }

  if (status === "review") {
    return "Review";
  }

  return "Needs attention";
}

export function readinessClass(status: ReadinessStatus): string {
  if (status === "ready") {
    return "text-emerald-400";
  }

  if (status === "review") {
    return "text-yellow-500";
  }

  return "text-red-400";
}

export type ReadinessSection<
  T extends { readiness: { status: ReadinessStatus } },
> = {
  status: ReadinessStatus;
  proposals: T[];
};

export function groupProposalsByReadiness<
  T extends { readiness: { status: ReadinessStatus } },
>(proposals: T[]): ReadinessSection<T>[] {
  return groups
    .map((status) => ({
      status,
      proposals: proposals.filter(
        (proposal) => proposal.readiness.status === status,
      ),
    }))
    .filter((section) => section.proposals.length > 0);
}
