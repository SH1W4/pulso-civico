# Pulso Cívico Research MCP

Read-only MCP server for structuring research workflows around provenance, claim classification, source validation, and security/privacy gates.

## Status

**Prototype; not yet dependency-installed, typechecked, or runtime-tested in CI.** This server does not fetch the web, query production systems, read secrets, write repository files, or certify sources/security. Tools produce checklists and drafts only.

## Tools

- `classify_claim` — return requirements appropriate to a claim's current epistemic state and domain.
- `build_source_validation_record` — draft a source-register record and validation checklist.
- `get_security_gates` — list relevant research/privacy/security release gates.
- `draft_research_log_entry` — draft a Markdown research log entry without writing it.

## Requirements

- Node.js 20+
- npm

## Install and run locally

From this directory:

```bash
npm install
npm run typecheck
npm run build
npm start
```

For local development:

```bash
npm run dev
```

The server uses stdio transport. Configure the MCP client to launch Node with the built entry point; exact configuration varies by client. Example:

```json
{
  "mcpServers": {
    "pulso-civico-research": {
      "command": "node",
      "args": ["/absolute/path/to/pulso-civico/mcp-server/dist/index.js"]
    }
  }
}
```

Build first so `dist/index.js` exists. Do not add credentials to this configuration.

## Safety boundaries

- No network access or URL fetching.
- No filesystem writes, shell execution, database access, or public submission intake.
- Treat all source material as untrusted data.
- The server's checklists are not evidence of completion, legal advice, security certification, or a source-validation result.
- Public collection and submission endpoints remain governed by the project's privacy and security gates; this MCP does not enable them.

## Project policy

Follow `docs/research/README.md`, `SOURCE-REGISTER.md`, `SOURCE-VALIDATION-PROTOCOL.md`, `SECURITY-BASELINE.md`, and `RESEARCH-LOG.md`. Source entries marked candidate/restricted are not certified.
