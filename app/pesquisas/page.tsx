"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Database, ExternalLink, RefreshCw, Search, ShieldCheck } from "lucide-react";

type Research = {
  registration: string;
  institute: string;
  contractor: string | null;
  registeredAt: string | null;
  publishableAt: string | null;
  fieldStart: string | null;
  fieldEnd: string | null;
  sampleSize: number | null;
  state: string;
  status: string | null;
};
type Catalog = {
  source: string;
  sourceName: string;
  sourceUpdatedAt: string | null;
  checkedAt: string;
  count: number;
  records: Research[];
  links: { dataset: string; pesqele: string };
  notice: string;
};
type ApiError = { error: string; source: string; checkedAt: string };

function date(value: string | null): string {
  if (!value) return "Não informado";
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("pt-BR").format(parsed);
}

export default function PresidentialResearchPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/presidential", { cache: "no-store" });
      const data = await response.json() as Catalog | ApiError;
      if (!response.ok || !("records" in data)) {
        throw new Error("error" in data ? data.error : "Não foi possível carregar o catálogo.");
      }
      setCatalog(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha inesperada ao consultar o catálogo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCatalog(); }, [loadCatalog]);

  const records = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    if (!catalog || !term) return catalog?.records ?? [];
    return catalog.records.filter((item) =>
      [item.registration, item.institute, item.contractor ?? "", item.status ?? ""]
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(term)),
    );
  }, [catalog, query]);

  return (
    <main className="research-page">
      <div className="research-wrap">
        <Link className="research-back" href="/"><ArrowLeft size={16} /> Voltar ao Pulso Cívico</Link>
        <header className="research-header">
          <div className="research-eyebrow"><Database size={15} /> FONTE PÚBLICA · TSE 2026</div>
          <h1>Pesquisas para<br /><span>a Presidência.</span></h1>
          <p>Um catálogo consultável de registros nacionais publicados no conjunto de dados aberto da Justiça Eleitoral. Metadados oficiais, origem identificada e limites explícitos.</p>
          <div className="research-actions">
            <a href="https://dadosabertos.tse.jus.br/dataset/pesquisas-eleitorais-2026" target="_blank" rel="noreferrer">Dados abertos do TSE <ExternalLink size={15} /></a>
            <a href="https://pesqele-divulgacao.tse.jus.br/" target="_blank" rel="noreferrer">Abrir PesqEle <ArrowUpRight size={15} /></a>
          </div>
        </header>

        <section className="research-integrity">
          <ShieldCheck size={20} />
          <div><strong>Registro não é validação de resultado.</strong><p>O TSE informa que não faz controle prévio dos resultados das pesquisas. Percentuais só serão exibidos quando vinculados e conferidos com a publicação ou o relatório correspondente.</p></div>
        </section>

        <section className="research-catalog" aria-labelledby="catalog-title">
          <div className="research-catalog-head">
            <div><span className="research-label">CATÁLOGO OFICIAL</span><h2 id="catalog-title">Registros presidenciais</h2></div>
            <button type="button" onClick={() => void loadCatalog()} disabled={loading}><RefreshCw size={15} className={loading ? "research-spin" : ""} /> Atualizar</button>
          </div>

          <label className="research-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar instituto, contratante ou registro" /></label>

          {loading && <div className="research-state" role="status">Consultando o conjunto de dados do TSE…</div>}
          {!loading && error && <div className="research-state research-error" role="alert"><strong>Não foi possível carregar os registros.</strong><p>{error}</p><button type="button" onClick={() => void loadCatalog()}>Tentar novamente</button></div>}
          {!loading && catalog && (
            <>
              <div className="research-meta"><strong>{records.length}</strong> {records.length === 1 ? "registro encontrado" : "registros encontrados"} <span>·</span> Atualizado em {date(catalog.checkedAt.slice(0, 10))}</div>
              {records.length === 0 ? <div className="research-state">Nenhum registro corresponde à busca.</div> : (
                <div className="research-records">
                  {records.map((item, index) => (
                    <article className="research-record" key={item.registration + "-" + index}>
                      <div className="research-record-top"><span className="research-registration">{item.registration}</span>{item.status && <span className="research-status">{item.status}</span>}</div>
                      <h3>{item.institute}</h3>
                      <p className="research-contractor">{item.contractor ? `Contratante: ${item.contractor}` : "Contratante não identificado no resumo de dados"}</p>
                      <div className="research-facts">
                        <div><CalendarDays size={15} /><span><small>Período de campo</small><strong>{item.fieldStart || item.fieldEnd ? `${date(item.fieldStart)} – ${date(item.fieldEnd)}` : "Não informado"}</strong></span></div>
                        <div><Database size={15} /><span><small>Amostra</small><strong>{item.sampleSize ? item.sampleSize.toLocaleString("pt-BR") + " entrevistas" : "Não informado"}</strong></span></div>
                        <div><CalendarDays size={15} /><span><small>Registro</small><strong>{date(item.registeredAt)}</strong></span></div>
                        <div><CalendarDays size={15} /><span><small>Divulgação prevista</small><strong>{date(item.publishableAt)}</strong></span></div>
                      </div>
                      <a className="research-record-link" href={catalog.links.pesqele} target="_blank" rel="noreferrer">Conferir no PesqEle <ArrowUpRight size={15} /></a>
                    </article>
                  ))}
                </div>
              )}
              <p className="research-source-note">Fonte: <a href={catalog.source} target="_blank" rel="noreferrer">{catalog.sourceName}</a>. {catalog.notice}</p>
            </>
          )}
        </section>
        <footer className="research-footer">Pulso Cívico · Observatório Eleitoral · Catálogo em fase de validação técnica</footer>
      </div>
      <style jsx>{`
        .research-page{min-height:100vh;background:#101312;color:#eef3ef;padding:28px 22px 48px;font-family:Arial,Helvetica,sans-serif}
        .research-wrap{max-width:1000px;margin:0 auto}.research-back,.research-actions a,.research-record-link{display:inline-flex;align-items:center;gap:8px;color:#a8e8c4;text-decoration:none;font-size:14px}
        .research-back{margin:0 0 38px}.research-header{padding:26px 0 34px}.research-eyebrow,.research-label{display:flex;align-items:center;gap:8px;color:#9de4bb;font-size:11px;letter-spacing:.15em;font-weight:700}
        h1{font-size:clamp(42px,8vw,76px);line-height:.98;letter-spacing:-.055em;margin:22px 0 20px}h1 span{color:#9de4bb}.research-header>p{max-width:660px;color:#b4beb7;font-size:17px;line-height:1.65}
        .research-actions{display:flex;flex-wrap:wrap;gap:20px;margin-top:25px}.research-integrity{display:flex;gap:14px;padding:18px;border:1px solid #365846;background:#17221b;border-radius:12px;color:#9de4bb}.research-integrity div{color:#e6eee8}.research-integrity p{margin:7px 0 0;color:#b5c2b9;line-height:1.55;font-size:14px}
        .research-catalog{margin-top:32px;border:1px solid #303b34;border-radius:16px;padding:clamp(16px,3vw,28px);background:#151a17}.research-catalog-head{display:flex;align-items:end;justify-content:space-between;gap:16px}.research-catalog-head h2{font-size:clamp(25px,4vw,34px);margin:10px 0 0}.research-catalog-head button,.research-state button{display:inline-flex;align-items:center;gap:8px;border:1px solid #3d5948;background:#202d24;color:#dff8e8;border-radius:9px;padding:10px 12px;cursor:pointer}.research-catalog-head button:disabled{opacity:.65}
        .research-search{display:flex;align-items:center;gap:10px;border:1px solid #354039;background:#101512;border-radius:10px;padding:0 14px;margin:24px 0 18px;color:#a5b7aa}.research-search input{width:100%;min-width:0;background:transparent;color:#eef3ef;border:0;outline:0;padding:14px 0;font-size:15px}.research-meta{font-size:13px;color:#aeb9b1;margin-bottom:14px}.research-meta strong{font-size:17px;color:#a4e9c0}.research-meta span{margin:0 6px;color:#5e6c62}
        .research-records{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.research-record{border:1px solid #2d3930;background:#101512;border-radius:12px;padding:18px;min-width:0}.research-record-top{display:flex;justify-content:space-between;align-items:center;gap:10px}.research-registration{font-size:12px;font-weight:700;color:#a1e7bd;overflow-wrap:anywhere}.research-status{font-size:11px;color:#c4d1c7;background:#263129;padding:5px 7px;border-radius:20px}.research-record h3{font-size:19px;margin:16px 0 6px;overflow-wrap:anywhere}.research-contractor{font-size:13px;color:#aab6ad;line-height:1.5;min-height:20px}.research-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:20px 0}.research-facts>div{display:flex;gap:8px;align-items:flex-start;color:#9de4bb}.research-facts span{display:flex;flex-direction:column;gap:5px;min-width:0}.research-facts small{font-size:11px;color:#87968b}.research-facts strong{font-size:13px;font-weight:600;color:#e0e8e2;line-height:1.4;overflow-wrap:anywhere}.research-record-link{font-weight:600}.research-source-note{font-size:12px;line-height:1.7;color:#aab5ad;margin:22px 0 0}.research-source-note a{color:#a8e8c4}.research-state{padding:24px;border:1px dashed #3b4b40;border-radius:10px;color:#bac7bd;line-height:1.6}.research-error{border-color:#8b5145;color:#f0c7be}.research-error p{overflow-wrap:anywhere}.research-footer{margin-top:28px;font-size:12px;color:#7f8c82}.research-spin{animation:research-spin 1s linear infinite}@keyframes research-spin{to{transform:rotate(360deg)}}@media(max-width:680px){.research-page{padding:20px 14px 36px}.research-back{margin-bottom:24px}.research-records{grid-template-columns:1fr}.research-catalog-head{align-items:flex-start}.research-facts{gap:14px}.research-integrity{padding:14px}.research-header>p{font-size:15px}}
      `}</style>
    </main>
  );
}
