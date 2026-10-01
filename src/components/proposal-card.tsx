import Image from "next/image";
import { ReadinessCheck } from "@/components/readiness-check";
import { PersonIcon } from "@/components/person-icon";
import { ProposalBrief } from "@/components/proposal-brief";
import type { InspectedProposal } from "@/lib/proposales/proposals";
import { formatEdited, formatMoney, statusLabel } from "@/lib/utils/format";

export function ProposalCard({ item, readiness, brief }: InspectedProposal) {
  const edited = formatEdited(item.updatedAt);

  return (
    <article className="overflow-hidden rounded-xl bg-[#1c1c1c]">
      <div className="relative bg-neutral-900 text-white">
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          src={item.imageUrl ?? "/default-background.webp"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/50" />
        <div className="relative flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl font-semibold">{item.title}</h3>
            <p className="shrink-0 rounded-full border border-white/80 px-3 py-1 text-sm">
              {statusLabel(item.status)}
            </p>
          </div>
          <div>
            <p className="text-lg">
              {formatMoney(item.valueWithTax, item.currency)}
            </p>
            <div className="mt-3 flex items-end justify-between gap-4 text-sm">
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {item.creatorName ? (
                  <span className="inline-flex items-center gap-2">
                    <PersonIcon />
                    {item.creatorName}
                  </span>
                ) : null}
                {item.companyName ? (
                  <span className="inline-flex items-center gap-2">
                    <PersonIcon />
                    {item.companyName}
                  </span>
                ) : null}
              </p>
              {edited ? (
                <p className="shrink-0 text-white/90">{edited}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 py-5">
        {readiness.status === "ready" ? null : (
          <ReadinessCheck readiness={readiness} />
        )}
        <div className={readiness.status === "ready" ? undefined : "mt-6"}>
          <ProposalBrief brief={brief} proposalId={item.uuid} />
        </div>
        {item.url ? (
          <a
            className="mt-6 inline-block text-sm text-neutral-200 underline"
            href={item.url}
            rel="noreferrer"
            target="_blank"
          >
            Open in Proposales
          </a>
        ) : null}
      </div>
    </article>
  );
}
