export type ProposalStatus =
  | "accepted"
  | "replaced"
  | "active"
  | "draft"
  | "expired"
  | "rejected"
  | "template"
  | "withdrawn";

export type Company = {
  id: number;
  name: string;
};

export type ProposalSearchResult = {
  uuid: string;
  title: string;
  status: ProposalStatus | null;
  url: string;
};

export type ProposalBlock = {
  type?: string | null;
  title?: string | null;
  description?: string | null;
  quantity?: number | null;
  unit_value_with_discount_with_tax?: number | null;
  unit_value_without_discount_with_tax?: number | null;
};

export type Proposal = {
  uuid: string;
  title?: string | null;
  title_md?: string | null;
  description_md?: string | null;
  status?: ProposalStatus | null;
  recipient_name?: string | null;
  recipient_company_name?: string | null;
  recipient_email?: string | null;
  recipient_is_set?: boolean | null;
  value_with_tax?: number | null;
  value_without_tax?: number | null;
  currency?: string | null;
  company_name?: string | null;
  creator_name?: string | null;
  updated_at?: number | null;
  background_image?: {
    uuid?: string | null;
  } | null;
  expires_at?: number | null;
  data?: {
    _valid_until_at?: string | null;
  } | null;
  blocks?: ProposalBlock[] | null;
};

export type ProposalListItem = {
  uuid: string;
  title: string;
  status: ProposalStatus | null;
  valueWithTax: number | null;
  currency: string | null;
  url: string | null;
  imageUrl: string | null;
  companyName: string | null;
  creatorName: string | null;
  updatedAt: number | null;
};

export type CheckLevel = "attention" | "review";

export type ProposalCheck = {
  id: string;
  label: string;
  level: CheckLevel;
  passed: boolean;
  detail: string;
  nested?: boolean;
};

export type ReadinessStatus = "ready" | "review" | "attention";

export type ReadinessReport = {
  status: ReadinessStatus;
  checks: ProposalCheck[];
  summary: string;
  attentionCount: number;
  reviewCount: number;
};
