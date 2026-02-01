import {
  AuthenticationError,
  RateLimitError,
  InsufficientCreditsError,
  ValidationError,
  NetworkError,
  TimeoutError,
  JobError,
} from "@renamed-to/sdk";

interface McpToolResult {
  content: { type: "text"; text: string }[];
  isError: true;
}

/** Map an SDK or internal error to an MCP tool error response. */
export function mapError(error: unknown): McpToolResult {
  if (error instanceof Error && error.message === "NO_API_KEY") {
    return fail(
      "Not configured — set the RENAMED_API_KEY environment variable.\n\n" +
        "1. Get an API key at https://www.renamed.to/settings/api-keys\n" +
        "2. Add it to your MCP server config:\n" +
        '   { "env": { "RENAMED_API_KEY": "rt_..." } }'
    );
  }

  if (error instanceof AuthenticationError) {
    return fail(
      "Authentication failed — your API key is invalid or expired.\n" +
        "Get a new key at https://www.renamed.to/settings/api-keys"
    );
  }

  if (error instanceof InsufficientCreditsError) {
    return fail(
      "Insufficient credits. Top up at https://www.renamed.to/settings/billing"
    );
  }

  if (error instanceof RateLimitError) {
    const retry = error.retryAfter ? ` Retry after ${error.retryAfter}s.` : "";
    return fail(`Rate limit exceeded.${retry} Please wait and try again.`);
  }

  if (error instanceof ValidationError) {
    return fail(`Validation error: ${error.message}`);
  }

  if (error instanceof NetworkError) {
    return fail(
      "Network error — could not reach the renamed.to API.\n" +
        "Check your internet connection and try again."
    );
  }

  if (error instanceof TimeoutError) {
    return fail("Request timed out. Try again or use a smaller file.");
  }

  if (error instanceof JobError) {
    return fail(`Processing failed: ${error.message}`);
  }

  const msg =
    error instanceof Error ? error.message : "An unexpected error occurred";
  return fail(msg);
}

function fail(text: string): McpToolResult {
  return {
    content: [{ type: "text" as const, text }],
    isError: true,
  };
}
