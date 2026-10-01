import { z } from "zod";

import {
  describeExpiry,
  formatExpiryDate,
  readProposalExpiry,
} from "@/lib/proposales/expiry";
import { cleanText, displayTitle, stripMarkdown } from "@/lib/proposales/text";
import type { Proposal, ProposalBlock } from "@/lib/proposales/types";

const READABLE_WORDS = 6;

export const proposalBriefSchema = z.object({
  title: z.string(),
  recipientName: z.string().nullable(),
  recipientCompany: z.string().nullable(),
  currency: z.string().nullable(),
  total: z.number().nullable(),
  pitch: z.string().max(20_000),
  lines: z
    .array(
      z.object({
        title: z.string(),
        quantity: z.number().nullable(),
        unitPrice: z.number().nullable(),
        description: z.string().max(8_000),
      }),
    )
    .max(80),
  largestLine: z
    .object({
      title: z.string(),
      share: z.number(),
    })
    .nullable(),
  shortDescriptions: z.array(z.string()).max(80),
  expiry: z.enum(["missing", "past", "soon", "set"]),
  expiryDate: z.string().nullable(),
});

export type ProposalBrief = z.infer<typeof proposalBriefSchema>;

export function wordCount(value: string): number {
  return value.split(/\s+/).filter(Boolean).length;
}

export function briefHasReadableProse(value: {
  pitch: string;
  lines: { description: string }[];
}): boolean {
  if (wordCount(value.pitch) >= READABLE_WORDS) {
    return true;
  }

  return value.lines.some(
    (line) => wordCount(line.description) >= READABLE_WORDS,
  );
}

export function briefHighlights(brief: ProposalBrief): string[] {
  const highlights: string[] = [];

  if (brief.largestLine) {
    const percent = Math.round(brief.largestLine.share * 100);
    highlights.push(
      percent < 1
        ? `${brief.largestLine.title} is the largest line, at under 1% of the total.`
        : `${brief.largestLine.title} is ${percent}% of the total.`,
    );
  }

  highlights.push(describeExpiry(brief.expiry, brief.expiryDate));

  if (brief.shortDescriptions.length === 1) {
    highlights.push(
      `${brief.shortDescriptions[0]} has a very short description.`,
    );
  } else if (brief.shortDescriptions.length > 1) {
    highlights.push(
      `${nameList(brief.shortDescriptions)} have very short descriptions.`,
    );
  }

  return highlights;
}

export function buildProposalBrief(proposal: Proposal): ProposalBrief {
  const title = displayTitle(proposal);
  const pitch = stripMarkdown(cleanText(proposal.description_md));
  const recipientName = present(proposal.recipient_name);
  const recipientCompany = present(proposal.recipient_company_name);
  const lines = productLines(proposal);
  const expiry = readProposalExpiry(proposal);

  return {
    title,
    recipientName,
    recipientCompany,
    currency: present(proposal.currency),
    total:
      typeof proposal.value_without_tax === "number"
        ? proposal.value_without_tax
        : null,
    pitch,
    lines,
    largestLine: largestLine(lines, proposal.value_with_tax),
    shortDescriptions: lines
      .filter((line) => wordCount(line.description) < READABLE_WORDS)
      .map((line) => line.title),
    expiry: expiry.state,
    expiryDate: expiry.date ? formatExpiryDate(expiry.date) : null,
  };
}

function productLines(proposal: Proposal): ProposalBrief["lines"] {
  return (proposal.blocks ?? [])
    .filter((block) => block.type === "product-block")
    .map((block) => ({
      title: cleanText(block.title) || "Untitled product",
      quantity: typeof block.quantity === "number" ? block.quantity : null,
      unitPrice: unitPrice(block),
      description: stripMarkdown(cleanText(block.description)),
    }));
}

function unitPrice(block: ProposalBlock): number | null {
  const discounted = block.unit_value_with_discount_with_tax;
  const list = block.unit_value_without_discount_with_tax;

  if (typeof discounted === "number" && discounted > 0) {
    return discounted;
  }

  if (typeof list === "number" && list > 0) {
    return list;
  }

  return null;
}

function lineAmount(
  quantity: number | null,
  price: number | null,
): number | null {
  if (price == null) {
    return null;
  }

  const qty = typeof quantity === "number" && quantity > 0 ? quantity : 1;
  return qty * price;
}

function largestLine(
  lines: ProposalBrief["lines"],
  total: number | null | undefined,
): ProposalBrief["largestLine"] {
  const priced = lines.flatMap((line) => {
    const amount = lineAmount(line.quantity, line.unitPrice);
    return amount == null ? [] : [{ title: line.title, amount }];
  });

  if (priced.length < 2 || typeof total !== "number" || total <= 0) {
    return null;
  }

  const largest = priced.reduce((best, line) =>
    line.amount > best.amount ? line : best,
  );

  if (largest.amount > total) {
    return null;
  }

  return { title: largest.title, share: largest.amount / total };
}

function present(value: string | null | undefined): string | null {
  const text = cleanText(value);
  return text || null;
}

function nameList(names: string[]): string {
  if (names.length <= 4) {
    return joinNames(names);
  }

  return `${joinNames(names.slice(0, 3))} and ${names.length - 3} more`;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) {
    return names[0] ?? "";
  }

  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
