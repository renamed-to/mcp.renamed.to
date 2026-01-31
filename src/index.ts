#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const VERSION = "0.1.0";

const server = new McpServer({
  name: "renamed-to",
  version: VERSION,
});

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
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              status: "not_implemented",
              message:
                "Tool not yet implemented — connect to renamed.to API",
              args: { filePaths, outputDir, format, dryRun },
            },
            null,
            2
          ),
        },
      ],
    };
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
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              status: "not_implemented",
              message:
                "Tool not yet implemented — connect to renamed.to API",
              args: { filePath, strategy, outputDir },
            },
            null,
            2
          ),
        },
      ],
    };
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
  async ({ directory, action, config }) => {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              status: "not_implemented",
              message:
                "Tool not yet implemented — connect to renamed.to API",
              args: { directory, action, config },
            },
            null,
            2
          ),
        },
      ],
    };
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
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              status: "not_implemented",
              message:
                "Tool not yet implemented — connect to renamed.to API",
            },
            null,
            2
          ),
        },
      ],
    };
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
