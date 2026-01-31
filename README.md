# @renamed-to/mcp

MCP (Model Context Protocol) server for [renamed.to](https://www.renamed.to) — an AI-powered file renaming, document extraction, and PDF splitting service. This server exposes renamed.to capabilities as tools that AI assistants like Claude Code, Claude Desktop, and Cursor can use directly.

## Install

```bash
npx -y @renamed-to/mcp
```

## Configuration

### Claude Code

```bash
claude mcp add renamed-to -- npx -y @renamed-to/mcp
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "renamed-to": {
      "command": "npx",
      "args": ["-y", "@renamed-to/mcp"]
    }
  }
}
```

### Cursor

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "renamed-to": {
      "command": "npx",
      "args": ["-y", "@renamed-to/mcp"]
    }
  }
}
```

## Available Tools

| Tool | Description | Key Inputs |
| --- | --- | --- |
| `rename` | Rename files using AI content analysis | `filePaths`, `outputDir?`, `format?`, `dryRun?` |
| `extract` | Extract structured data from documents | `filePath`, `schema`, `outputFormat?` |
| `pdf_split` | Split PDFs by content, bookmarks, or pages | `filePath`, `strategy?`, `outputDir?` |
| `watch` | Watch a directory and auto-process new files | `directory`, `action`, `config?` |
| `status` | Check auth status and API connectivity | (none) |

## Authentication

You need a renamed.to account to use this server. Visit [https://www.renamed.to](https://www.renamed.to) to sign up and get your API key.

## License

MIT
