import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "pulso-civico-research",
  version: "0.1.0",
});

const epistemicStates = [
  "OBSERVAÇÃO",
  "DECLARAÇÃO_DE_TERCEIRO",
  "INFERÊNCIA",
  "HIPÓTESE",
  "CORROBORADO",
  "VERIFICADO",
  "INCONCLUSIVO",
] as const;

server.tool(
  "classify_claim",
  "Classify a civic research claim and return the minimum evidence requirements. This tool does not verify the claim.",
  {
    claim: z.string().min(8).max(2000).describe("The exact claim or proposition being assessed."),
    current_state: z.enum(epistemicStates).describe("Current epistemic status; do not promote status without evidence."),
    domain: z.enum(["elections", "prediction_market", "public_policy", "public_source", "other"]).default("other"),
  },
  async ({ claim, current_state, domain }) => {
    const requirements = [
      "Identify the original publisher and canonical source URL.",
      "Record capture time in UTC and the context/query/parameters used.",
      "Separate directly observed values from interpretation and hypothesis.",
      "Record methodology, coverage, freshness, limitations, and incentives.",
      "Seek disconfirming evidence and at least one independent corroborating source where feasible.",
      "State what evidence would falsify the claim and what remains unknown.",
    ];
    if (current_state === "VERIFICADO") {
      requirements.push("Attach reproducible evidence and document independent review appropriate to the claim.");
    }
    if (domain === "elections") {
      requirements.push("Check official electoral sources, field dates, sample/methodology, registration details, and the distinction between poll, projection, and official result.");
    }
    if (domain === "prediction_market") {
      requirements.push("Record market/contract ID, resolution criteria, exact capture time, liquidity/volume definitions, API endpoint, and whether the metric is a snapshot or a verified live stream.");
      requirements.push("Do not infer manipulation, coordination, or intent from price, volume, or wallet concentration alone.");
    }
    const output = {
      claim,
      current_state,
      domain,
      requirements,
      rule: "The MCP classifies workflow requirements only. It does not access the internet, validate a source, or upgrade the epistemic state.",
    };
    return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }] };
  },
);

server.tool(
  "build_source_validation_record",
  "Create a structured source-validation record template for docs/research/SOURCE-REGISTER.md. No repository files are changed.",
  {
    source_id: z.string().regex(/^SRC-[0-9]{3,}$/),
    canonical_url: z.string().url(),
    source_type: z.enum(["official_record", "dataset", "api", "research", "journalism", "community", "other"]),
    intended_use: z.string().min(5).max(1000),
    publisher: z.string().min(2).max(300),
    capture_time_utc: z.string().optional(),
    methodology: z.string().max(2000).optional(),
    limitations: z.string().max(2000).optional(),
    license_or_terms: z.string().max(1000).optional(),
    evidence_archive: z.string().max(500).optional(),
  },
  async (input) => {
    const record = {
      ...input,
      status: "EM_REVISÃO",
      reviewer: "PENDENTE",
      validation_checks: [
        "Canonical publisher/domain confirmed",
        "Source ownership and provenance documented",
        "Methodology and coverage reviewed",
        "Freshness/capture timestamp recorded",
        "License and terms reviewed",
        "Limitations, incentives, and conflicts documented",
        "Reproduction attempted and result recorded",
        "Independent corroboration or reason for absence recorded",
        "Contrary evidence and uncertainty documented",
      ],
      note: "Template only. Creating this record does not mean the source has been validated.",
    };
    return { content: [{ type: "text", text: JSON.stringify(record, null, 2) }] };
  },
);

server.tool(
  "get_security_gates",
  "Return pre-publication security and privacy gates for Pulso Cívico. This is a checklist, not a certification.",
  {
    activity: z.enum(["research_only", "source_submission_intake", "public_data_collection", "production_release"]),
  },
  async ({ activity }) => {
    const gates = [
      "No secrets in source control, logs, prompts, or published evidence.",
      "Untrusted source content is treated as data, not instructions.",
      "Claims, snapshots, timestamps, and changes are traceable.",
    ];
    if (activity !== "research_only") {
      gates.push(
        "Privacy notice is finalized and reviewed; controller/contact, purpose, legal basis, retention/deletion, processors/transfers, and rights channel are resolved.",
        "Data minimization, access controls, deletion workflow, retention schedule, and incident process are tested.",
        "Rate limiting/abuse controls and monitoring are in place for public endpoints.",
        "URL/file handling has defense-in-depth controls; no arbitrary URL is fetched automatically.",
      );
    }
    if (activity === "public_data_collection" || activity === "production_release") {
      gates.push(
        "Public collection is explicitly authorized and disabled by default until the gates are signed off.",
        "Threat model, dependency review, security tests, backups/recovery, and operational owner are documented.",
      );
    }
    if (activity === "production_release") {
      gates.push(
        "CI/build and critical user journeys are verified against the release commit.",
        "Source of truth, freshness, failure behavior, and labels for static vs live data are demonstrated.",
        "Release and rollback procedures are tested; no unresolved critical/high-risk finding remains without explicit risk acceptance.",
      );
    }
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          activity,
          gates,
          status: "CHECKLIST_ONLY",
          warning: "Passing or receiving this checklist is not evidence that any gate has actually passed and is not a legal or security certification.",
        }, null, 2),
      }],
    };
  },
);

server.tool(
  "draft_research_log_entry",
  "Draft a research-log entry using the repository's epistemic states. This tool does not write to the repository.",
  {
    entry_id: z.string().regex(/^RES-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3,}$/),
    question: z.string().min(8).max(1000),
    state: z.enum(epistemicStates),
    sources: z.array(z.string().min(2).max(300)).max(30).default([]),
    method: z.string().min(5).max(2000),
    findings: z.string().min(5).max(3000),
    limitations: z.string().min(5).max(2000),
    next_action: z.string().min(5).max(1000),
  },
  async (input) => {
    const md = [
      `## ${input.entry_id}`,
      "",
      `- **Pergunta:** ${input.question}`,
      `- **Estado:** ${input.state}`,
      `- **Fontes:** ${input.sources.length ? input.sources.join("; ") : "Nenhuma registrada"}`,
      "",
      "### Método",
      input.method,
      "",
      "### Achados",
      input.findings,
      "",
      "### Limitações e incertezas",
      input.limitations,
      "",
      "### Próxima ação",
      input.next_action,
      "",
      "> Entrada gerada como rascunho. Revisar evidências e metadados antes de incorporá-la ao log oficial.",
    ].join("\n");
    return { content: [{ type: "text", text: md }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
