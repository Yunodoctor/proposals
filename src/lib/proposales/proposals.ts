import "server-only";

import { buildProposalBrief, type ProposalBrief } from "@/lib/proposales/brief";
import { ProposalesError, proposalesFetch } from "@/lib/proposales/client";
import { inspectProposal } from "@/lib/proposales/inspect";
import { cleanText, displayTitle } from "@/lib/proposales/text";
import type {
  Company,
  ReadinessReport,
  Proposal,
  ProposalListItem,
  ProposalSearchResult,
} from "@/lib/proposales/types";

const SEARCH_LIMIT = 25;

export async function listCompanies(): Promise<Company[]> {
  const result = await proposalesFetch<{ data: Company[] }>("/v3/companies");
  return result.data;
}

export async function searchProposals(
  companyId: number,
): Promise<ProposalSearchResult[]> {
  const params = new URLSearchParams({
    company_id: String(companyId),
    limit: String(SEARCH_LIMIT),
  });
  const result = await proposalesFetch<{ data: ProposalSearchResult[] }>(
    `/v3/proposal-search?${params.toString()}`,
  );
  return result.data;
}

export async function getProposal(uuid: string): Promise<Proposal> {
  const result = await proposalesFetch<{ data: Proposal }>(
    `/v3/proposals/${encodeURIComponent(uuid)}`,
  );
  return result.data;
}

export type InspectedProposal = {
  item: ProposalListItem;
  readiness: ReadinessReport;
  brief: ProposalBrief;
};

function backgroundImageUrl(uuid: string | null | undefined): string | null {
  const imageUuid = cleanText(uuid);

  if (!imageUuid) {
    return null;
  }

  return `https://ucarecdn.com/${imageUuid}/-/scale_crop/1200x480/center/`;
}

function toListItem(
  proposal: Proposal,
  searchResult: ProposalSearchResult,
): ProposalListItem {
  return {
    uuid: proposal.uuid,
    title: displayTitle(proposal, searchResult.title),
    status: proposal.status ?? searchResult.status ?? null,
    valueWithTax: proposal.value_with_tax ?? null,
    currency: proposal.currency ?? null,
    url: searchResult.url ?? null,
    imageUrl: backgroundImageUrl(proposal.background_image?.uuid),
    companyName: proposal.company_name?.trim() || null,
    creatorName: proposal.creator_name?.trim() || null,
    updatedAt: proposal.updated_at ?? null,
  };
}

export async function loadInspector(): Promise<InspectedProposal[]> {
  const companies = await listCompanies();
  const company = companies[0];

  if (!company) {
    throw new ProposalesError("No company is available", 404);
  }

  const results = await searchProposals(company.id);
  const proposals = await Promise.all(
    results.map(async (result) => ({
      result,
      proposal: await getProposal(result.uuid),
    })),
  );

  return proposals.map(({ proposal, result }) => ({
    item: toListItem(proposal, result),
    readiness: inspectProposal(proposal),
    brief: buildProposalBrief(proposal),
  }));
}
