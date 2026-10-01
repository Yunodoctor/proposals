# Proposal readiness

A pre-send check for [Proposales](https://proposales.com) proposals. It loads proposals the company on the API key, groups them by what is still missing, and can compare the pitch to the quoted line items.

## Why

I built this as an overview layer around proposal drafts. The proposal list shows high-level information such as title, total pricing and status, while details like recipients, products, product pricing, and expiry live inside each proposal. For drafts, the checklist provides a quick way to spot missing or incomplete fields without having to go into each proposal and reviewing everything manually.

Proposals can also enter Proposales through integrations such as email or web-based RFP collection, where many of those fields may already be populated. In those cases, the more interesting question is whether the proposal still makes sense as a whole: what is being quoted, what the written pitch promises, and whether those two tell the same story.

The inspector therefore separates factual checks, which are handled deterministically, from a semantic consistency check that uses an LLM only when there is enough written content to compare against the quoted line items.

## What it shows

Each proposal is checked for:

- a recipient with an email
- a title
- a description
- at least one product
- a price and description on every product
- an expiry date

Proposals land in one of three groups:

- **Needs attention** — a recipient, title, or product list is missing
- **Review** — those are in place, but pricing, descriptions, or expiry might still need a look
- **Ready** — nothing left on the checklist

Each card also includes a short brief: the largest line as a share of the total, expiry, very short product descriptions, and the line items. If the pitch or a product description has enough prose, **Generate review** asks the model for two things only: a concrete mismatch between the pitch and the quote, and obvious spelling mistakes. Reviews are stored in the browser and marked stale when the pitch or line items change.

## Requirements

- Node.js 20.9 or newer
- A Proposales API token
- A [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) API key, if you want reviews

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Variable             | Required    | What it is                                                                                                                                                                                                                  |
| -------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PROPOSALES_API_KEY` | Yes         | Bearer token for `https://api.proposales.com`.                                                                                                                                                                              |
| `AI_GATEWAY_API_KEY` | For reviews | Key from the [AI Gateway API keys](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys&title=AI+Gateway+API+Keys) page. The list still loads without it. **Generate review** returns an error until the key is set. |

Reviews use `openai/gpt-4.1-mini` through the AI SDK’s AI Gateway provider.

Built in Cursor with help of Grok 4.7.
