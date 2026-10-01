import {
  describeExpiry,
  formatExpiryDate,
  readProposalExpiry,
} from "@/lib/proposales/expiry";
import { cleanText, stripMarkdown } from "@/lib/proposales/text";
import type {
  ReadinessReport,
  ReadinessStatus,
  Proposal,
  ProposalBlock,
  ProposalCheck,
} from "@/lib/proposales/types";

function productBlocks(proposal: Proposal): ProposalBlock[] {
  return (proposal.blocks ?? []).filter(
    (block) => block.type === "product-block",
  );
}

function hasPrice(block: ProposalBlock): boolean {
  return [
    block.unit_value_with_discount_with_tax,
    block.unit_value_without_discount_with_tax,
  ].some((value) => typeof value === "number" && value > 0);
}

function summaryLabel(check: ProposalCheck): string {
  if (check.id === "description") {
    return "the description";
  }

  if (check.id === "product-descriptions") {
    return "descriptions on the products";
  }

  return check.label.toLowerCase();
}

function productTitle(block: ProposalBlock): string {
  return cleanText(block.title) || "Untitled product";
}

function joinNames(names: string[]): string {
  if (names.length <= 1) {
    return names[0] ?? "";
  }

  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function joinLabels(checks: ProposalCheck[]): string {
  const labels = checks.map((check) => summaryLabel(check));

  if (labels.length <= 1) {
    return labels[0] ?? "";
  }

  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

function reviewUsesOwnDetail(check: ProposalCheck): boolean {
  if (check.id === "pricing" || check.id === "product-descriptions") {
    return true;
  }

  return check.id === "expiry" && check.detail !== "No expiry date is set.";
}

function summarize(checks: ProposalCheck[], status: ReadinessStatus): string {
  const attention = checks.filter(
    (check) => check.level === "attention" && !check.passed,
  );
  const review = checks.filter(
    (check) => check.level === "review" && !check.passed,
  );

  if (status === "ready") {
    return "Ready to send. The recipient, title, and products are in place.";
  }

  const reviewText = review
    .map((check) => (reviewUsesOwnDetail(check) ? check.detail : null))
    .filter(Boolean)
    .join(" ");
  const otherReview = review.filter((check) => !reviewUsesOwnDetail(check));
  const otherText =
    otherReview.length > 0
      ? `Review ${joinLabels(otherReview)} before sending.`
      : "";
  const reviewSentence = [reviewText, otherText].filter(Boolean).join(" ");

  if (attention.length === 0) {
    return `Nearly ready. ${reviewSentence}`;
  }

  const missing = attention.map((check) => check.detail).join(" ");

  if (review.length === 0) {
    return missing;
  }

  return `${missing} ${reviewSentence}`;
}

export function inspectProposal(proposal: Proposal): ReadinessReport {
  const products = productBlocks(proposal);
  const email = cleanText(proposal.recipient_email);
  const recipientIsSet = proposal.recipient_is_set === true;
  const title = cleanText(proposal.title_md) || cleanText(proposal.title);
  const description = stripMarkdown(cleanText(proposal.description_md));
  const missingDescriptions = products.filter(
    (block) => stripMarkdown(cleanText(block.description)).length === 0,
  );
  const unpriced = products.filter((block) => !hasPrice(block));
  const checks: ProposalCheck[] = [];

  checks.push({
    id: "recipient",
    label: "Recipient",
    level: "attention",
    passed: recipientIsSet && email.length > 0,
    detail: !recipientIsSet
      ? "No recipient is set."
      : email.length === 0
        ? "The recipient has no email."
        : "A recipient with an email is set.",
  });

  checks.push({
    id: "title",
    label: "Title",
    level: "attention",
    passed: title.length > 0,
    detail:
      title.length > 0
        ? "The proposal has a title."
        : "The proposal has no title.",
  });

  checks.push({
    id: "description",
    label: "Description",
    level: "review",
    passed: description.length > 0,
    detail:
      description.length > 0
        ? "The proposal has a description."
        : "The proposal has no description.",
  });

  checks.push({
    id: "products",
    label: `Products (${products.length})`,
    level: "attention",
    passed: products.length > 0,
    detail:
      products.length > 0
        ? `${products.length} ${products.length === 1 ? "product is" : "products are"} included.`
        : "No products are included.",
  });

  if (products.length > 0) {
    checks.push({
      id: "pricing",
      label: "Pricing",
      level: "review",
      nested: true,
      passed: unpriced.length === 0,
      detail:
        unpriced.length === 0
          ? "Every product has a price."
          : `${joinNames(unpriced.map(productTitle))} ${unpriced.length === 1 ? "has" : "have"} no price.`,
    });

    checks.push({
      id: "product-descriptions",
      label: "Description",
      level: "review",
      nested: true,
      passed: missingDescriptions.length === 0,
      detail:
        missingDescriptions.length === 0
          ? "Every product has a description."
          : `${joinNames(missingDescriptions.map(productTitle))} ${missingDescriptions.length === 1 ? "has" : "have"} no description.`,
    });
  }

  const expiry = readProposalExpiry(proposal);

  checks.push({
    id: "expiry",
    label: "Expiry date",
    level: "review",
    passed: expiry.state === "set",
    detail: describeExpiry(
      expiry.state,
      expiry.date ? formatExpiryDate(expiry.date) : null,
    ),
  });

  const attentionCount = checks.filter(
    (check) => check.level === "attention" && !check.passed,
  ).length;
  const reviewCount = checks.filter(
    (check) => check.level === "review" && !check.passed,
  ).length;
  const needsAttention = attentionCount > 0;
  const status: ReadinessStatus = needsAttention
    ? "attention"
    : reviewCount > 0
      ? "review"
      : "ready";

  return {
    status,
    checks,
    summary: summarize(checks, status),
    attentionCount,
    reviewCount,
  };
}
