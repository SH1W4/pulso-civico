import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const BASE = "https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br";
const jsonHeaders = { "User-Agent": "Pulso-Civico/0.1 (+public-interest dashboard)", Accept: "application/json" };

export async function GET() {
  const checkedAt = new Date().toISOString();
  try {
    const urls = [
      `${BASE}/br-e006258-ab.json`,
      `${BASE}/br-c0001-e006258-u.json`,
    ];
    const responses = await Promise.all(urls.map((url) =>
      fetch(url, { headers: jsonHeaders, cache: "no-store", signal: AbortSignal.timeout(8000) })
    ));
    if (responses.some((r) => !r.ok)) {
      return NextResponse.json({ status: "unavailable", checkedAt, source: "TSE", message: "O TSE não disponibilizou um dos arquivos esperados nesta consulta.", officialUrl: "https://resultados.tse.jus.br/" }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    const [tracking, result] = await Promise.all(responses.map((r) => r.json()));
    if (String(result?.ele) !== "6258" || String(result?.carg?.[0]?.cd) !== "1" || !Array.isArray(result?.carg?.[0]?.agr)) {
      return NextResponse.json({ status: "unavailable", checkedAt, source: "TSE", message: "A estrutura recebida não corresponde ao resultado presidencial esperado. Nenhum valor foi exibido.", officialUrl: "https://resultados.tse.jus.br/" }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    const candidates = result.carg.flatMap((cargo: any) => (cargo.agr ?? []).flatMap((group: any) => (group.par ?? []).flatMap((party: any) => (party.cand ?? []).map((c: any) => ({
      name: String(c.nmu || c.nm || "Candidatura"),
      party: String(party.sg || ""),
      votes: Number(c.vap ?? 0),
      percent: Number(c.pvap ?? 0),
      number: String(c.n ?? ""),
      status: String(c.st ?? ""),
    }))))).sort((a: any, b: any) => b.votes - a.votes);
    const sections = result.s ?? {};
    const generatedAt = [result.dg, result.hg].filter(Boolean).join(" ");
    return NextResponse.json({
      status: "updated",
      checkedAt,
      generatedAt,
      totalizationAt: [result.dt, result.ht].filter(Boolean).join(" "),
      totalSections: Number(sections.ts ?? 0),
      countedSections: Number(sections.st ?? 0),
      countedPercent: Number(sections.pst ?? 0),
      final: String(result.tf) === "s" || String(result.and) === "f",
      candidates,
      source: "Tribunal Superior Eleitoral",
      sourceFiles: urls,
      trackingGeneratedAt: [tracking?.dg, tracking?.hg].filter(Boolean).join(" "),
      officialUrl: "https://resultados.tse.jus.br/",
      integrity: { schemaValidated: true, rawPayloadHash: null, note: "Esquema básico validado; assinatura JWS e hash do payload bruto ainda não verificados." }
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return NextResponse.json({ status: "unavailable", checkedAt, source: "TSE", message: "Falha ao consultar os arquivos oficiais. A interface não reutiliza valores antigos como se fossem atuais.", officialUrl: "https://resultados.tse.jus.br/" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
