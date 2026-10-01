import "server-only";

const PROPOSALES_API_URL = "https://api.proposales.com";

export class ProposalesError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ProposalesError";
    this.status = status;
  }
}

function readErrorMessage(body: unknown, fallback: string): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "object" &&
    body.error !== null &&
    "message" in body.error &&
    typeof body.error.message === "string"
  ) {
    return body.error.message;
  }

  return fallback;
}

export async function proposalesFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = process.env.PROPOSALES_API_KEY;

  if (!token) {
    throw new ProposalesError("Missing token for Proposales API", 500);
  }

  const response = await fetch(`${PROPOSALES_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ProposalesError(
      readErrorMessage(
        body,
        response.statusText || "Proposales request failed",
      ),
      response.status,
    );
  }

  if (body === null) {
    throw new ProposalesError(
      "Proposales returned an empty response",
      response.status,
    );
  }

  return body as T;
}
