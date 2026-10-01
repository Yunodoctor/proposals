import { ProposalList } from "@/components/proposal-list";
import {
  loadInspector,
  type InspectedProposal,
} from "@/lib/proposales/proposals";

export default async function Home() {
  let proposals: InspectedProposal[];

  try {
    proposals = await loadInspector();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load proposals";

    return (
      <main className="mx-auto max-w-xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Proposal readiness</h1>
        <p className="mt-4 text-sm text-red-400">{message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1800px] px-6 py-12">
      <h1 className="text-2xl font-semibold">Proposal readiness</h1>
      <p className="mt-2 text-sm text-neutral-400">
        What is left before each proposal is ready to send, and where the pitch
        drifts from the quote.
      </p>
      <ProposalList proposals={proposals} />
    </main>
  );
}
