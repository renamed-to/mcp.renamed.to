# @renamed-to/mcp

[![npm version](https://img.shields.io/npm/v/@renamed-to/mcp)](https://www.npmjs.com/package/@renamed-to/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org)

[Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for [renamed.to](https://www.renamed.to) — bring AI-powered file renaming, organization, and PDF splitting into Claude Code, Claude Desktop, Cursor, Windsurf, and any MCP-compatible client. Tell the AI how you want your files named using plain English — it reads the actual document content (OCR, tables, headers) and follows your instructions.

## Features

- **Natural-language prompts** — describe your naming rules in plain English and the AI follows them (per-document-type rules, conditional logic, localization, and more)
- **AI content analysis** — OCR and NLP extract dates, vendors, amounts, document types, and reference numbers from the actual file contents
- **PDF splitting** — split PDFs by content/topic (AI), bookmarks, or page ranges
- **Organization strategies** — auto-sort into folders by year, company, document type, or combinations
- **Dry-run mode** — preview renames before committing changes
- **Multi-platform** — works with Claude Code, Claude Desktop, Cursor, and Windsurf

## Quick Start

```bash
claude mcp add renamed-to -- npx -y @renamed-to/mcp
```

Set your API key and you're ready to go:

```bash
export RENAMED_API_KEY="rt_..."
```

> Using Claude Desktop, Cursor, or Windsurf? See [Configuration](#configuration) below.

## Installation

### Run directly (no install)

```bash
npx -y @renamed-to/mcp
```

### Global install

```bash
npm install -g @renamed-to/mcp
renamed-mcp
```

### From source

```bash
git clone https://github.com/renamed-to/mcp.renamed.to.git
cd mcp.renamed.to
npm install
npm run build
node dist/index.js
```

## Configuration

### Claude Code

```bash
claude mcp add renamed-to -- npx -y @renamed-to/mcp
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "renamed-to": {
      "command": "npx",
      "args": ["-y", "@renamed-to/mcp"],
      "env": {
        "RENAMED_API_KEY": "rt_your_key_here"
      }
    }
  }
}
```

### Cursor

Add to your MCP configuration (Settings → MCP Servers):

```json
{
  "mcpServers": {
    "renamed-to": {
      "command": "npx",
      "args": ["-y", "@renamed-to/mcp"],
      "env": {
        "RENAMED_API_KEY": "rt_your_key_here"
      }
    }
  }
}
```

### Windsurf

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "renamed-to": {
      "command": "npx",
      "args": ["-y", "@renamed-to/mcp"],
      "env": {
        "RENAMED_API_KEY": "rt_your_key_here"
      }
    }
  }
}
```

## Authentication

1. [Sign up](https://www.renamed.to/sign-up) for a renamed.to account
2. Go to [Settings → API Keys](https://www.renamed.to/settings/api-keys) and create a key
3. Set the environment variable:

```bash
export RENAMED_API_KEY="rt_..."
```

The server also accepts `RENAMED_TOKEN` as a fallback. Use the `status` tool to verify your connection.

## Tools

### `rename`

Rename files using AI content analysis. Sends files to the renamed.to API which reads the actual document content — OCR for scans, NLP for text — extracts metadata (dates, vendors, amounts, reference numbers), and generates filenames based on your instructions.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filePaths` | `string[]` | Yes | — | Absolute or relative paths to the files to rename |
| `outputDir` | `string` | No | Source directory | Directory to write renamed files to |
| `format` | `string` | No | AI-chosen | Natural-language prompt describing how filenames should be formatted (see [Prompt examples](#prompt-examples) below) |
| `dryRun` | `boolean` | No | `false` | Preview the rename without writing any files |

#### Prompt examples

The `format` parameter accepts plain English instructions. The AI interprets them and applies them to each file based on its content:

```
Invoices: {date} - {vendor} - Invoice #{number} - ${amount}
Contracts: {vendor} - {type} - {date}
Receipts: {date} - {vendor} - Receipt
```

You can specify per-document-type rules, conditional logic, localization, and more:

- **Department prefixes** — `"Add HR_ prefix for employment documents, FIN_ for financial records"`
- **Localization** — `"Use German date format DD.MM.YYYY, translate document types to German"`
- **Conditional logic** — `"If invoice amount > $1000, add LARGE_ prefix"`
- **Industry formats** — `"Include matter number for legal documents, client code for accounting"`

When no `format` is provided, the AI automatically selects the best naming pattern for each document.

<details>
<summary>Example output</summary>

```json
{
  "dryRun": true,
  "files": [
    {
      "original": "scan_001.pdf",
      "suggested": "2024-03-15 - Quarterly Report Q1.pdf",
      "destination": "/Users/you/Documents/2024-03-15 - Quarterly Report Q1.pdf",
      "renamed": false
    }
  ]
}
```

</details>

### `pdf_split`

Split PDFs by content or topic using AI, by bookmarks, or by page ranges. The AI reads the full document, identifies logical sections and topic boundaries, and creates individually named PDFs for each.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filePath` | `string` | Yes | — | Path to the PDF file to split |
| `strategy` | `"ai"` \| `"bookmarks"` \| `"pages"` | No | `"ai"` | Splitting strategy |
| `outputDir` | `string` | No | Source directory | Directory to write the split PDF files to |

**Strategies:**

- **`ai`** — analyzes content and splits by topic or logical sections
- **`bookmarks`** — splits at PDF bookmark boundaries
- **`pages`** — splits by page ranges

<details>
<summary>Example output</summary>

```json
{
  "originalFile": "annual-report.pdf",
  "documentsCreated": 3,
  "outputDir": "/Users/you/Documents",
  "files": [
    {
      "filename": "annual-report - Financial Summary.pdf",
      "pages": "1-12",
      "path": "/Users/you/Documents/annual-report - Financial Summary.pdf",
      "reason": "Financial data and balance sheets"
    },
    {
      "filename": "annual-report - Operations Review.pdf",
      "pages": "13-28",
      "path": "/Users/you/Documents/annual-report - Operations Review.pdf",
      "reason": "Operational metrics and departmental reviews"
    }
  ]
}
```

</details>

### `watch`

Watch a directory for new files and auto-process them using rename or pdf-split.

> **Note:** Directory watching requires a long-running process that doesn't fit the MCP request/response model. This tool returns instructions to use the CLI instead:

```bash
npx @renamed-to/cli watch <directory> --action rename
npx @renamed-to/cli watch <directory> --action pdf-split
```

See the [@renamed-to/cli docs](https://www.renamed.to/docs/cli/watch) for more details.

### `status`

Check authentication status and API connectivity. Takes no parameters.

<details>
<summary>Example output (authenticated)</summary>

```json
{
  "status": "authenticated",
  "email": "you@example.com",
  "name": "Your Name",
  "credits": 500
}
```

</details>

### Tool Annotations

| Tool | Read-Only | Destructive | Idempotent |
|------|-----------|-------------|------------|
| `rename` | No | Yes (renames files in place) | No |
| `pdf_split` | No | No (creates new files) | Yes |
| `watch` | Yes (informational only) | No | Yes |
| `status` | Yes | No | Yes |

## Examples

**Rename scanned documents based on their content:**

> "Rename all the PDFs in my Downloads folder based on their content"

The AI reads each file — even scanned images via OCR — extracts dates, vendors, document types, and generates descriptive names like `2024-03-15 - Quarterly Report Q1.pdf`.

**Use natural-language rules for different document types:**

> "Rename these files. For invoices use '{date} - {vendor} - Invoice #{number}', for contracts use '{vendor} - {type} - {date}', and add a LARGE_ prefix if the amount is over $1000"

The AI applies different naming rules per document type, with conditional logic, all from a single plain-English prompt.

**Split a long report into separate documents by topic:**

> "Split this 50-page annual report into separate documents by topic"

The AI analyzes content boundaries and creates individually named PDFs for each logical section — no bookmarks required.

**Preview renames with localized formatting:**

> "Do a dry run rename of these invoices using German date format DD.MM.YYYY and translate document types to German"

Shows what the new filenames would be without moving any files. The AI handles localization and translation in the naming.

## Error Handling

The server provides clear error messages for common issues:

| Error | Cause | Resolution |
|-------|-------|------------|
| Not configured | `RENAMED_API_KEY` not set | Add your API key to the environment ([get one here](https://www.renamed.to/settings/api-keys)) |
| Authentication failed | Invalid or expired API key | Generate a new key at [Settings → API Keys](https://www.renamed.to/settings/api-keys) |
| Insufficient credits | Account credits depleted | Top up at [Settings → Billing](https://www.renamed.to/settings/billing) |
| Rate limit exceeded | Too many requests | Wait and retry (the error includes a retry-after interval when available) |
| Network error | Cannot reach the API | Check your internet connection |
| File not found | Invalid file path | Verify the path exists and is accessible |

## Security

- **API key** is read from environment variables only — never hardcoded or logged
- **File contents** are sent to the renamed.to API for analysis — be aware of this when processing sensitive documents
- **Runs locally** via stdio transport — no network ports are opened on your machine
- **No data stored** — the server is stateless between requests

## Related

- **[@renamed-to/cli](https://github.com/renamed-to/cli.renamed.to)** — command-line tool for renamed.to (includes `watch` for directory monitoring)
- **[@renamed-to/sdk](https://github.com/renamed-to/renamed-sdk)** — multi-language SDKs for the renamed.to API
- **[Claude Code plugin](https://github.com/renamed-to/plugin.renamed.to)** — Claude Code skills for renamed.to

## Contributing

Contributions are welcome. Please open an issue before submitting significant changes. Run `npm run typecheck` before opening a PR.

## License

[MIT](./LICENSE)
