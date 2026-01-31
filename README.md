# @renamed-to/mcp

MCP (Model Context Protocol) server for [renamed.to](https://www.renamed.to) — AI-powered file renaming and PDF splitting. Exposes renamed.to capabilities as tools for AI assistants like Claude Code, Claude Desktop, Cursor, and Windsurf.

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
| `pdf_split` | Split PDFs by content, bookmarks, or pages | `filePath`, `strategy?`, `outputDir?` |
| `watch` | Watch a directory and auto-process new files | `directory`, `action`, `config?` |
| `status` | Check auth status and API connectivity | (none) |

## Authentication

You need a renamed.to account. Visit [https://www.renamed.to/sign-up](https://www.renamed.to/sign-up) to get started.

## Related

- [@renamed-to/cli](https://github.com/renamed-to/cli.renamed.to) — CLI tool
- [@renamed-to/sdk](https://github.com/renamed-to/renamed-sdk) — multi-language SDKs
- [Claude Code plugin](https://github.com/renamed-to/plugin.renamed.to) — skills for Claude Code

## License

MIT
