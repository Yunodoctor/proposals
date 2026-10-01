import { proposalReviewInputSchema } from "@/lib/proposal-review";
import { ReviewError, reviewProposal } from "@/lib/review";

export const maxDuration = 30;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = proposalReviewInputSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid review input" }, { status: 400 });
  }

  try {
    const review = await reviewProposal(parsed.data);
    return Response.json(review);
  } catch (error) {
    if (error instanceof ReviewError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return Response.json(
      { error: "Could not review this proposal." },
      { status: 502 },
    );
  }
}
