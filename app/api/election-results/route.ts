import { NextResponse } from "next/server";
export const revalidate = 0;
export const dynamic = "force-dynamic";
const BASE = "https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br";
const HEADERS = { "User-Agent": "Pulso-Civico/0.1", Accept: "application/json" };
async function fetchJson(url: string) { const response = await fetch(url, { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(10000) }); if (!response.ok) throw new Error("TSE_HTTP_" + response.status); return response.json(); }
export async function GET() {
  const checkedAt = new Date().toISOString();
  try {
    const urls = [BASE + "/br-e006258-ab.json", BASE + "/br-c0001-e006258-u.json"];
    const [tracking, result] = await Promise.all(urls.map(fetchJson));
    if (String(result?.ele) !== "6258" || !Array.isArray(result?.carg)) throw new Error("TSE_SCHEMA_UNEXPECTED");
    const cargo = result.carg.find((item: any) => String(item?.cd) === "1");
    if (!cargo || !Array.isArray(cargo.agr)) throw new Error("TSE_PRESIDENTIAL_CARGO_MISSING");
    const candidates = cargo.agr.flatMap((group: any) => (group.par || []).flatMap((party: any) => (party.cand || []).map((candidate: any) => ({ name: String(candidate.nmu || candidate.nm || "Candidatura"), party: String(party.sg || ""), votes: Number(candidate.vap ?? 0), percent: Number(candidate.pvap ?? 0), number: String(candidate.n ?? ""), status: String(candidate.st ?? "") })))).filter((candidate: any) => Number.isFinite(candidate.votes) && Number.isFinite(candidate.percent)).sort((a: any, b: any) => b.votes - a.votes);
    if (!candidates.length) throw new Error("TSE_NO_CANDIDATES");
    const sections = result.s || {};
    return NextResponse.json({ status: "updated", checkedAt, source: "Tribunal Superior Eleitoral", officialUrl: "https://resultados.tse.jus.br/", electionCode: "6258", generatedAt: [result.dg, result.hg].filter(Boolean).join(" "), totalSections: Number(sections.ts ?? 0), countedSections: Number(sections.st ?? 0), countedPercent: Number(sections.pst ?? 0), final: String(result.and || "").toLowerCase() === "f", candidates, sourceFiles: urls, trackingGeneratedAt: [tracking?.dg, tracking?.hg].filter(Boolean).join(" "), integrity: { schemaValidated: true, signatureVerified: false, note: "Estrutura básica validada; assinatura JWS ainda não verificada." } }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    return NextResponse.json({ status: "unavailable", checkedAt, source: "TSE", message: "A consulta oficial falhou ou o formato recebido não passou na validação. Nenhum valor anterior será apresentado como atual.", detail: error instanceof Error ? error.message : "unknown", officialUrl: "https://resultados.tse.jus.br/" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}