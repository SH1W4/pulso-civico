import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const BASE = "https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br";
const HEADERS = {
  "User-Agent": "Pulso-Civico/0.1",
  Accept: "application/json",
};

type JsonRecord = Record<string, unknown>;
type Candidate = {
  name: string;
  party: string;
  votes: number;
  percent: number;
  number: string;
  status: string;
};

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function requiredRecord(value: unknown, field: string): JsonRecord {
  const record = asRecord(value);
  if (!record) throw new Error("TSE_SCHEMA_INVALID_" + field);
  return record;
}

function requiredArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) throw new Error("TSE_SCHEMA_INVALID_" + field);
  return value;
}

function textValue(value: unknown, fallback = ""): string {
  return value === null || value === undefined ? fallback : String(value).trim();
}

/**
 * Parse only explicit, finite numeric values. Missing or malformed values must
 * not silently become zero: zero is a valid value and must remain distinguishable
 * from missing data.
 */
function numericValue(
  value: unknown,
  field: string,
  options: { integer?: boolean; min?: number; max?: number } = {},
): number {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    throw new Error("TSE_NUMERIC_MISSING_" + field);
  }

  const normalized =
    typeof value === "string" ? value.trim().replace(",", ".") : value;
  const parsed =
    typeof normalized === "number"
      ? normalized
      : typeof normalized === "string"
        ? Number(normalized)
        : Number.NaN;

  if (!Number.isFinite(parsed)) throw new Error("TSE_NUMERIC_INVALID_" + field);
  if (options.integer && !Number.isInteger(parsed)) {
    throw new Error("TSE_NUMERIC_NOT_INTEGER_" + field);
  }
  if (options.min !== undefined && parsed < options.min) {
    throw new Error("TSE_NUMERIC_OUT_OF_RANGE_" + field);
  }
  if (options.max !== undefined && parsed > options.max) {
    throw new Error("TSE_NUMERIC_OUT_OF_RANGE_" + field);
  }
  return parsed;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("TSE_HTTP_" + response.status);
  return response.json() as Promise<unknown>;
}

function parseCandidates(cargo: JsonRecord): Candidate[] {
  const groups = requiredArray(cargo.agr, "PRESIDENTIAL_GROUPS");
  const candidates: Candidate[] = [];

  for (const groupRaw of groups) {
    const group = requiredRecord(groupRaw, "GROUP");
    const parties = requiredArray(group.par, "PARTIES");

    for (const partyRaw of parties) {
      const party = requiredRecord(partyRaw, "PARTY");
      const partyCandidates = requiredArray(party.cand, "CANDIDATES");

      for (const candidateRaw of partyCandidates) {
        const candidate = requiredRecord(candidateRaw, "CANDIDATE");
        const name = textValue(candidate.nmu || candidate.nm);
        if (!name) throw new Error("TSE_CANDIDATE_NAME_MISSING");

        candidates.push({
          name,
          party: textValue(party.sg),
          votes: numericValue(candidate.vap, "CANDIDATE_VOTES", {
            integer: true,
            min: 0,
          }),
          percent: numericValue(candidate.pvap, "CANDIDATE_PERCENT", {
            min: 0,
            max: 100,
          }),
          number: textValue(candidate.n),
          status: textValue(candidate.st),
        });
      }
    }
  }

  if (!candidates.length) throw new Error("TSE_NO_CANDIDATES");
  return candidates.sort((a, b) => b.votes - a.votes);
}

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const urls = [
      BASE + "/br-e006258-ab.json",
      BASE + "/br-c0001-e006258-u.json",
    ];
    const [trackingRaw, resultRaw] = await Promise.all(urls.map(fetchJson));
    const tracking = asRecord(trackingRaw);
    const result = asRecord(resultRaw);

    if (!result || textValue(result.ele) !== "6258") {
      throw new Error("TSE_SCHEMA_UNEXPECTED");
    }

    const cargos = requiredArray(result.carg, "CARGOS");
    const cargo = cargos
      .map((item) => asRecord(item))
      .find((item) => item && textValue(item.cd) === "1");

    if (!cargo) throw new Error("TSE_PRESIDENTIAL_CARGO_MISSING");

    const candidates = parseCandidates(cargo);
    const sections = requiredRecord(result.s, "SECTIONS");
    const totalSections = numericValue(sections.ts, "TOTAL_SECTIONS", {
      integer: true,
      min: 0,
    });
    const countedSections = numericValue(sections.st, "COUNTED_SECTIONS", {
      integer: true,
      min: 0,
      max: totalSections,
    });
    const countedPercent = numericValue(sections.pst, "COUNTED_PERCENT", {
      min: 0,
      max: 100,
    });

    const generatedAt = [result.dg, result.hg].filter(Boolean).join(" ");
    const trackingGeneratedAt = [tracking?.dg, tracking?.hg]
      .filter(Boolean)
      .join(" ");
    const final =
      textValue(result.and).toLowerCase() === "f" ||
      textValue(result.tf).toLowerCase() === "s";

    return NextResponse.json(
      {
        status: "updated",
        checkedAt,
        source: "Tribunal Superior Eleitoral",
        officialUrl: "https://resultados.tse.jus.br/",
        electionCode: "6258",
        generatedAt,
        totalSections,
        countedSections,
        countedPercent,
        final,
        candidates,
        sourceFiles: urls,
        trackingGeneratedAt,
        integrity: {
          schemaValidated: true,
          signatureVerified: false,
          note:
            "Estrutura e campos numéricos obrigatórios validados; assinatura JWS ainda não verificada.",
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unavailable",
        checkedAt,
        source: "TSE",
        message:
          "A consulta oficial falhou ou os dados recebidos não passaram na validação. Nenhum valor anterior será apresentado como atual.",
        detail: error instanceof Error ? error.message : "unknown",
        officialUrl: "https://resultados.tse.jus.br/",
      },
      { status: 502, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
