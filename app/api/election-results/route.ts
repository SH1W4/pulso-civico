import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const BASE = "https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br";
const HEADERS = {
  "User-Agent": "Pulso-Civico/0.1",
  Accept: "application/json",
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function textValue(value: unknown, fallback = ""): string {
  return value === null || value === undefined ? fallback : String(value);
}

function numericValue(value: unknown): number {
  const normalized = textValue(value, "0").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
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

    if (!result || textValue(result.ele) !== "6258" || !Array.isArray(result.carg)) {
      throw new Error("TSE_SCHEMA_UNEXPECTED");
    }

    const cargo = result.carg
      .map(asRecord)
      .find((item) => item && textValue(item.cd) === "1");

    if (!cargo || !Array.isArray(cargo.agr)) {
      throw new Error("TSE_PRESIDENTIAL_CARGO_MISSING");
    }

    const candidates = cargo.agr
      .flatMap((groupRaw) => {
        const group = asRecord(groupRaw);
        return asArray(group?.par).flatMap((partyRaw) => {
          const party = asRecord(partyRaw);
          return asArray(party?.cand).map((candidateRaw) => {
            const candidate = asRecord(candidateRaw);
            return {
              name: textValue(candidate?.nmu || candidate?.nm, "Candidatura"),
              party: textValue(party?.sg),
              votes: numericValue(candidate?.vap),
              percent: numericValue(candidate?.pvap),
              number: textValue(candidate?.n),
              status: textValue(candidate?.st),
            };
          });
        });
      })
      .filter(
        (candidate) =>
          Number.isFinite(candidate.votes) && Number.isFinite(candidate.percent),
      )
      .sort((a, b) => b.votes - a.votes);

    if (!candidates.length) throw new Error("TSE_NO_CANDIDATES");

    const sections = asRecord(result.s) ?? {};
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
        totalSections: numericValue(sections.ts),
        countedSections: numericValue(sections.st),
        countedPercent: numericValue(sections.pst),
        final,
        candidates,
        sourceFiles: urls,
        trackingGeneratedAt,
        integrity: {
          schemaValidated: true,
          signatureVerified: false,
          note: "Estrutura básica validada; assinatura JWS ainda não verificada.",
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
          "A consulta oficial falhou ou o formato recebido não passou na validação. Nenhum valor anterior será apresentado como atual.",
        detail: error instanceof Error ? error.message : "unknown",
        officialUrl: "https://resultados.tse.jus.br/",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
