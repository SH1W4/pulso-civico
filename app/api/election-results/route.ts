import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";
const ROOT = "https://resultados.tse.jus.br/oficial/ele2026";
const HEADERS = { "User-Agent": "Pulso-Civico/0.1", Accept: "application/json" };

async function fetchJson(url: string) {
  const response = await fetch(url, { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("TSE_HTTP_" + response.status);
  return response.json();
}

export async function GET() {
  const checkedAt = new Date().toISOString();
  try {
    // EA11 is the official election configuration. Discover the election code instead of hardcoding a guessed code.
    const config = await fetchJson(ROOT + "/dados/BR/abr/abr-e0000-ab.json").catch(() => null);
    const electionCode = config?.ele?.find((item: any) => String(item?.cd) && /2026/.test(String(item?.nm || item?.ano || "")))?.cd;
    if (!electionCode) {
      return NextResponse.json({ status: "unavailable", checkedAt, source: "TSE", message: "Não foi possível identificar automaticamente o código da eleição no arquivo de configuração. Nenhum resultado foi presumido.", officialUrl: "https://resultados.tse.jus.br/" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    const dataBase = ROOT + "/" + electionCode + "/dados/br";
    const trackingUrl = dataBase + "/br-e" + electionCode + "-ab.json";
    const tracking = await fetchJson(trackingUrl);
    const resultUrl = dataBase + "/br-c0001-e" + electionCode + "-u.json";
    const result = await fetchJson(resultUrl);
    const cargo = (result?.carg || []).find((item: any) => String(item?.cd) === "1");
    if (!cargo || !Array.isArray(cargo.agr)) throw new Error("TSE_SCHEMA_UNEXPECTED");
    const candidates = cargo.agr.flatMap((group: any) => (group.par || []).flatMap((party: any) => (party.cand || []).map((candidate: any) => ({
      name: String(candidate.nmu || candidate.nm || "Candidatura"),
      party: String(party.sg || ""),
      votes: Number(candidate.vap ?? 0),
      percent: Number(candidate.pvap ?? 0),
      number: String(candidate.n ?? ""),
      status: String(candidate.st ?? "")
    })))).filter((candidate: any) => Number.isFinite(candidate.votes) && Number.isFinite(candidate.percent)).sort((a: any, b: any) => b.votes - a.votes);
    if (!candidates.length) throw new Error("TSE_NO_CANDIDATES");
    const sectionData = result.s || {};
    return NextResponse.json({
      status: "updated", checkedAt, source: "Tribunal Superior Eleitoral", officialUrl: "https://resultados.tse.jus.br/",
      electionCode: String(electionCode), generatedAt: [result.dg, result.hg].filter(Boolean).join(" "),
      totalSections: Number(sectionData.ts ?? 0), countedSections: Number(sectionData.st ?? 0), countedPercent: Number(sectionData.pst ?? 0),
      final: String(result.tf || "").toLowerCase() === "s", candidates, sourceFiles: [trackingUrl, resultUrl],
      trackingGeneratedAt: [tracking?.dg, tracking?.hg].filter(Boolean).join(" "),
      integrity: { schemaValidated: true, signatureVerified: false, note: "Estrutura básica validada. Assinatura JWS ainda não verificada." }
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    return NextResponse.json({ status: "unavailable", checkedAt, source: "TSE", message: "A consulta oficial falhou ou o formato recebido não passou na validação. Nenhum valor anterior será apresentado como atual.", detail: error instanceof Error ? error.message : "unknown", officialUrl: "https://resultados.tse.jus.br/" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}