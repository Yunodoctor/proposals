import { QualityCheck } from "@/components/quality-check";
import {
  briefHasReadableProse,
  briefHighlights,
  type ProposalBrief as Brief,
} from "@/lib/proposales/brief";
import { formatMoney } from "@/lib/utils/format";

export function ProposalBrief({
  brief,
  proposalId,
}: {
  brief: Brief;
  proposalId: string;
}) {
  const highlights = briefHighlights(brief);

  return (
    <div>
      <h4 className="text-xs tracking-wide text-neutral-400 uppercase">
        Brief
      </h4>
      <ul className="mt-2 space-y-1 text-sm text-neutral-300">
        {highlights.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {brief.lines.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-neutral-400">
          {brief.lines.map((line, index) => (
            <li key={`${line.title}-${index}`}>
              {formatLine(line, brief.currency)}
            </li>
          ))}
        </ul>
      ) : null}
      {briefHasReadableProse(brief) ? (
        <QualityCheck brief={brief} proposalId={proposalId} />
      ) : null}
    </div>
  );
}

function formatLine(
  line: Brief["lines"][number],
  currency: string | null,
): string {
  const quantity =
    typeof line.quantity === "number" ? `${line.quantity} × ` : "";
  const price =
    line.unitPrice == null ? "" : ` · ${formatMoney(line.unitPrice, currency)}`;

  return `${quantity}${line.title}${price}`;
}
