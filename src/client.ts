import { RenamedClient } from "@renamed-to/sdk";
import type { Logger } from "@renamed-to/sdk";

/** Logger that writes to stderr so it doesn't interfere with MCP JSON-RPC on stdout. */
const stderrLogger: Logger = {
  debug: (msg, ...args) => console.error("[debug]", msg, ...args),
  info: (msg, ...args) => console.error("[info]", msg, ...args),
  warn: (msg, ...args) => console.error("[warn]", msg, ...args),
  error: (msg, ...args) => console.error("[error]", msg, ...args),
};

let cachedClient: RenamedClient | undefined;

/** Read the API key from environment variables. Returns undefined if not set. */
export function getApiKey(): string | undefined {
  return process.env.RENAMED_API_KEY ?? process.env.RENAMED_TOKEN;
}

/**
 * Get or create the RenamedClient singleton.
 * Throws if no API key is configured.
 */
export function getClient(): RenamedClient {
  if (cachedClient) return cachedClient;

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  cachedClient = new RenamedClient({
    apiKey,
    logger: stderrLogger,
  });

  return cachedClient;
}
