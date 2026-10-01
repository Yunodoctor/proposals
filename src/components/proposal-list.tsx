import { ProposalCard } from "@/components/proposal-card";
import type { InspectedProposal } from "@/lib/proposales/proposals";
import {
  groupProposalsByReadiness,
  readinessClass,
  readinessLabel,
} from "@/lib/utils/readiness";

export function ProposalList({
  proposals,
}: {
  proposals: InspectedProposal[];
}) {
  if (proposals.length === 0) {
    return <p className="mt-8 text-sm text-neutral-400">No proposals yet.</p>;
  }

  const sections = groupProposalsByReadiness(proposals);

  return (
    <div className="mt-10 space-y-10">
      {sections.map((section) => (
        <section key={section.status}>
          <h2
            className={`text-sm font-medium ${readinessClass(section.status)}`}
          >
            {readinessLabel(section.status)}
            <span className="ml-2 text-neutral-500">
              {section.proposals.length}
            </span>
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {section.proposals.map((proposal) => (
              <li key={proposal.item.uuid}>
                <ProposalCard
                  brief={proposal.brief}
                  item={proposal.item}
                  readiness={proposal.readiness}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
