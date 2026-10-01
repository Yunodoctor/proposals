import { z } from "zod";

export const proposalReviewInputSchema = z.strictObject({
  pitch: z.string().max(20_000),
  lines: z
    .array(
      z.strictObject({
        title: z.string(),
        quantity: z.number().nullable(),
        description: z.string().max(8_000),
      }),
    )
    .max(80),
});

export type ProposalReviewInput = z.infer<typeof proposalReviewInputSchema>;

export const proposalReviewSchema = z.object({
  mismatches: z
    .array(
      z.object({
        pitchSays: z.string().max(400),
        linesSay: z.string().max(400),
      }),
    )
    .max(6),
  typos: z
    .array(
      z.object({
        word: z.string().max(80),
        correction: z.string().max(80),
        sentence: z.string().max(400),
        location: z.string().max(120),
      }),
    )
    .max(8),
});

export type ProposalReview = z.infer<typeof proposalReviewSchema>;
