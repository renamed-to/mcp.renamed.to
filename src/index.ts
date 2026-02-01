#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";

import { getClient, getApiKey } from "./client.js";
import { mapError } from "./errors.js";

const VERSION = "0.1.1";

const server = new McpServer({
  name: "renamed-to",
  version: VERSION,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function text(value: string) {
  return { content: [{ type: "text" as const, text: value }] };
}

function json(value: unknown) {
  return text(JSON.stringify(value, null, 2));
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

server.registerTool(
  "rename",
  {
    description:
      "Rename files using AI content analysis. Sends files to the renamed.to API which analyzes content and returns intelligent filenames.",
    inputSchema: {
      filePaths: z
        .array(z.string())
        .min(1)
        .describe("Absolute or relative paths to the files to rename"),
      outputDir: z
        .string()
        .optional()
        .describe(
          "Directory to write renamed files to. Defaults to the source directory"
        ),
      format: z
        .string()
        .optional()
        .describe(
          'Format template for the new filename (e.g. "{date} - {title}")'
        ),
      dryRun: z
        .boolean()
        .optional()
        .describe("Preview the rename without writing any files"),
    },
  },
  async ({ filePaths, outputDir, format, dryRun }) => {
    try {
      const client = getClient();

      const results: {
        original: string;
        suggested: string;
        destination: string;
        renamed: boolean;
      }[] = [];

      for (const filePath of filePaths) {
        const resolved = path.resolve(filePath);

        if (!fs.existsSync(resolved)) {
          results.push({
            original: filePath,
            suggested: "",
            destination: "",
            renamed: false,
          });
          continue;
        }

        const renameResult = await client.rename(resolved, {
          template: format,
        });

        const destDir = outputDir
          ? path.resolve(outputDir)
          : path.dirname(resolved);
        const destination = path.join(destDir, renameResult.suggestedFilename);

        if (!dryRun) {
          fs.mkdirSync(destDir, { recursive: true });
          fs.renameSync(resolved, destination);
        }

        results.push({
          original: filePath,
          suggested: renameResult.suggestedFilename,
          destination,
          renamed: !dryRun,
        });
      }

      return json({
        dryRun: !!dryRun,
        files: results,
      });
    } catch (error) {
      return mapError(error);
    }
  }
);

// TODO: Add extract tool when the extract API is publicly available
// server.registerTool("extract", ...)

server.registerTool(
  "pdf_split",
  {
    description:
      "Split PDFs by content or topic using AI, by bookmarks, or by page ranges. Sends the PDF to the renamed.to API for processing.",
    inputSchema: {
      filePath: z.string().describe("Path to the PDF file to split"),
      strategy: z
        .enum(["ai", "bookmarks", "pages"])
        .optional()
        .describe(
          'Splitting strategy. "ai" uses content analysis, "bookmarks" uses PDF bookmarks, "pages" uses page ranges'
        ),
      outputDir: z
        .string()
        .optional()
        .describe("Directory to write the split PDF files to"),
    },
  },
  async ({ filePath, strategy, outputDir }) => {
    try {
      const client = getClient();
      const resolved = path.resolve(filePath);

      if (!fs.existsSync(resolved)) {
        return mapError(new Error(`File not found: ${filePath}`));
      }

      // Map MCP strategy names to SDK/API mode values
      let mode: "smart" | "every-n-pages" | "by-bookmarks" | undefined;

      if (strategy === "ai") {
        mode = "smart";
      } else if (strategy === "pages") {
        mode = "every-n-pages";
      } else if (strategy === "bookmarks") {
        mode = "by-bookmarks";
      }

      const job = await client.pdfSplit(resolved, { mode });

      // Poll manually — the API returns a different result shape than the SDK types expect.
      const POLL_INTERVAL = 2000;
      const MAX_ATTEMPTS = 150;
      let attempts = 0;

      interface ApiSplit {
        filename: string;
        downloadUrl: string;
        pages: string;
        reason?: string;
      }
      interface ApiResultEntry {
        originalFilename: string;
        splits: ApiSplit[];
      }
      interface ApiStatusResponse {
        jobId: string;
        status: string;
        progress?: number;
        error?: string | { message: string; retryable: boolean };
        results?: ApiResultEntry[];
      }

      let statusResponse: ApiStatusResponse;

      while (attempts < MAX_ATTEMPTS) {
        // Use the SDK's status() which returns the raw API response
        statusResponse = (await job.status()) as unknown as ApiStatusResponse;

        if (statusResponse.progress !== undefined) {
          console.error(
            `pdf_split progress: ${statusResponse.progress}%`
          );
        }

        if (statusResponse.status === "completed" && statusResponse.results) {
          break;
        }

        if (statusResponse.status === "failed") {
          const errMsg =
            typeof statusResponse.error === "string"
              ? statusResponse.error
              : statusResponse.error?.message ?? "Job failed";
          return mapError(new Error(errMsg));
        }

        attempts++;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
      }

      // @ts-expect-error — statusResponse is assigned inside the loop
      if (!statusResponse?.results) {
        return mapError(new Error("PDF split timed out. Try a smaller file."));
      }

      // Determine output directory
      const destDir = outputDir
        ? path.resolve(outputDir)
        : path.dirname(resolved);
      fs.mkdirSync(destDir, { recursive: true });

      // Download each split document
      const files: {
        filename: string;
        pages: string;
        path: string;
        reason?: string;
      }[] = [];

      for (const entry of statusResponse.results as ApiResultEntry[]) {
        for (const split of entry.splits) {
          const buffer = await client.downloadFile(split.downloadUrl);
          const destPath = path.join(destDir, split.filename);
          fs.writeFileSync(destPath, buffer);

          files.push({
            filename: split.filename,
            pages: split.pages,
            path: destPath,
            ...(split.reason ? { reason: split.reason } : {}),
          });
        }
      }

      return json({
        originalFile: filePath,
        documentsCreated: files.length,
        outputDir: destDir,
        files,
      });
    } catch (error) {
      return mapError(error);
    }
  }
);

server.registerTool(
  "watch",
  {
    description:
      "Watch a directory for new files and auto-process them using rename or pdf-split.",
    inputSchema: {
      directory: z.string().describe("Directory to watch for new files"),
      action: z
        .enum(["rename", "pdf-split"])
        .describe("Action to perform on new files"),
      config: z
        .object({
          format: z
            .string()
            .optional()
            .describe("Format template (for rename action)"),
          strategy: z
            .enum(["ai", "bookmarks", "pages"])
            .optional()
            .describe("Split strategy (for pdf-split action)"),
        })
        .optional()
        .describe("Action-specific configuration"),
    },
  },
  async () => {
    return text(
      "The watch tool requires a long-running process that doesn't fit the MCP request/response model.\n\n" +
        "Use the CLI instead:\n" +
        "  npx @renamed-to/cli watch <directory> --action rename\n" +
        "  npx @renamed-to/cli watch <directory> --action pdf-split\n\n" +
        "Install the CLI: npm install -g @renamed-to/cli\n" +
        "Docs: https://www.renamed.to/docs/cli/watch"
    );
  }
);

server.registerTool(
  "status",
  {
    description:
      "Check authentication status and API connectivity for the renamed.to service.",
    inputSchema: {},
  },
  async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return text(
        "Not configured — no API key found.\n\n" +
          "To set up:\n" +
          "1. Get an API key at https://www.renamed.to/settings/api-keys\n" +
          "2. Add RENAMED_API_KEY to your MCP server environment:\n" +
          '   { "env": { "RENAMED_API_KEY": "rt_..." } }'
      );
    }

    try {
      const client = getClient();
      const user = await client.getUser();

      return json({
        status: "authenticated",
        email: user.email,
        name: user.name ?? undefined,
        credits: user.credits ?? undefined,
        team: user.team ?? undefined,
      });
    } catch (error) {
      return mapError(error);
    }
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("renamed-to MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
