# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-02-01

### Changed

- Comprehensive README rewrite with detailed tool docs, parameter tables, and examples
- Spotlight AI natural-language prompts as the core feature
- Add configuration examples with `env` for all platforms (Claude Desktop, Cursor, Windsurf)

### Added

- CHANGELOG.md
- LICENSE file

## [0.1.1] - 2025-05-30

### Fixed

- Use Node 24 in CI for trusted publishing OIDC support

## [0.1.0] - 2025-05-30

### Added

- MCP server exposing renamed.to capabilities via stdio transport
- `rename` tool — AI-powered file renaming based on content analysis
- `pdf_split` tool — split PDFs by content (AI), bookmarks, or page ranges
- `watch` tool — directory watching (redirects to CLI)
- `status` tool — authentication and connectivity check
- CI and release workflows for automated npm publishing

[0.1.2]: https://github.com/renamed-to/mcp.renamed.to/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/renamed-to/mcp.renamed.to/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/renamed-to/mcp.renamed.to/releases/tag/v0.1.0
