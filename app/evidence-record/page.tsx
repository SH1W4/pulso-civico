"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft, ArrowUpRight, Download, FileCheck2, Fingerprint,
  GitCompare, Globe2, Link2, Radio, ShieldCheck, Share2, TimerReset
} from "lucide-react";

const OFFICIAL_SOURCE = "https://resultados.tse.jus.br/";

type CaptureManifest = {
  schema: "pulso-civico/evidence-record/v1";
  record_id: string;
  title: string;
  created_at: string;
  timezone: "America/Bahia";
  status: "prototype_no_live_data";
  scope: string;
  sources: { name: string; url: string; role: string }[];
  observations: unknown[];
  integrity: { algorithm: "SHA-256"; digest: string | null; note: string };
};

function saveFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function EvidenceRecordPage() {
  const [digest, setDigest] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function buildManifest(): CaptureManifest {
    return {
      schema: "pulso-civico/evidence-record/v1",
      record_id: "PC-ELECTION-001",
      title: "Election Evidence Record 001",
      created_at: new Date().toISOString(),
      timezone: "America/Bahia",
      status: "prototype_no_live_data",
      scope: "Estrutura inicial do registro. Nenhum dado de apuração ao vivo foi capturado ou validado por esta página.",
      sources: [
        { name: "TSE — Resultados oficiais", url: OFFICIAL_SOURCE, role: "Fonte primária a consultar" },
      ],
      observations: [],
      integrity: {
        algorithm: "SHA-256",
        digest,
        note: "O hash detecta alterações no pacote calculado; não comprova a veracidade da fonte nem substitui assinatura ou armazenamento imutável.",
      },
    };
  }

  async function exportManifest() {
    setBusy(true);
    setMessage("");
    try {
      const manifest = buildManifest();
      const canonical = JSON.stringify({ ...manifest, integrity: { ...manifest.integrity, digest: null } }, null, 2);
      const bytes = new TextEncoder().encode(canonical);
      const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
      const hash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
      setDigest(hash);
      const finalManifest = { ...manifest, integrity: { ...manifest.integrity, digest: hash } };
      saveFile("pulso-civico-election-evidence-record-001.json", JSON.stringify(finalManifest, null, 2), "application/json");
      setMessage("Manifesto JSON exportado. O hash cobre o conteúdo canônico sem o próprio campo digest.");
    } catch {
      setMessage("Não foi possível calcular o hash neste navegador. Você ainda pode abrir a fonte oficial.");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const csv = [
      "record_id,observed_at,source_name,source_url,claim,verification_status,notes",
      "PC-ELECTION-001,,,,,,",
    ].join("\n");
    saveFile("pulso-civico-evidence-observations-template.csv", csv, "text/csv;charset=utf-8");
    setMessage("Modelo CSV exportado. Nenhuma observação foi preenchida ou presumida.");
  }

  async function shareRecord() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Pulso Cívico — Evidence Record 001", text: "Registro público de evidências — protótipo sem dados ao vivo.", url });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Link copiado para compartilhar.");
      }
    } catch {
      setMessage("Compartilhamento cancelado ou indisponível. Use o endereço da página para compartilhar.");
    }
  }

  return (
    <main className="er-page">
      <style>{`
        .er-page{--bg:#0d100e;--panel:#151a16;--line:#2b352d;--text:#f1f4ec;--muted:#a0aa9e;--lime:#c2f477;min-height:100vh;background:radial-gradient(ellipse at 78% 5%,#28372132,transparent 32%),var(--bg);color:var(--text);padding:0 clamp(16px,5vw,76px) 52px;font-family:ui-sans-serif,system-ui,sans-serif}
        .er-page *{box-sizing:border-box}.er-wrap{max-width:1180px;margin:auto}.er-header{height:78px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--line);flex-wrap:wrap}.er-brand{display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none;font-size:12px;font-weight:800;letter-spacing:.06em}.er-mark{display:grid;place-items:center;background:var(--lime);color:#141810;width:36px;height:36px;border-radius:10px}.er-back{display:inline-flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-size:12px}.er-back:hover{color:var(--lime)}.er-hero{padding:38px 0 24px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:end}.er-kicker{font:10px ui-monospace,monospace;letter-spacing:.14em;color:var(--lime)}.er-hero h1{font-size:clamp(34px,5vw,58px);letter-spacing:-.06em;line-height:1.02;margin:12px 0}.er-hero p{max-width:720px;color:var(--muted);font-size:13px;line-height:1.8;margin:0}.er-state{display:inline-flex;align-items:center;gap:8px;border:1px solid #66522c;background:#211c11;color:#ead8ad;border-radius:8px;padding:10px 12px;font-size:10px;white-space:nowrap}.er-banner{display:flex;gap:12px;border:1px solid #66522c;background:#211c11;color:#e6d8b9;padding:14px;border-radius:12px;font-size:12px;line-height:1.7;margin:12px 0 20px}.er-banner strong{display:block;margin-bottom:2px}.er-grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr);gap:14px}.er-card{border:1px solid var(--line);border-radius:14px;background:var(--panel);min-width:0;overflow:hidden}.er-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px;border-bottom:1px solid var(--line)}.er-card-head h2{font-size:13px;margin:0}.er-card-body{padding:17px}.er-empty{min-height:180px;display:grid;place-items:center;text-align:center;padding:24px}.er-empty-icon{display:grid;place-items:center;width:46px;height:46px;border:1px solid #3b4938;border-radius:14px;color:var(--lime);margin:0 auto 12px}.er-empty strong{display:block;font-size:13px}.er-empty p{max-width:380px;color:var(--muted);font-size:11px;line-height:1.7;margin:7px auto 0}.er-metric{border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:9px}.er-metric:last-child{margin-bottom:0}.er-metric-label{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}.er-metric-value{font-size:13px;font-weight:700;margin-top:7px}.er-metric-note{font-size:10px;color:var(--muted);line-height:1.6;margin-top:5px}.er-source{display:flex;align-items:flex-start;gap:10px}.er-source-icon{color:var(--lime);margin-top:2px}.er-source strong{display:block;font-size:12px}.er-source p{font-size:10px;line-height:1.7;color:var(--muted);margin:5px 0}.er-source a{color:var(--lime);font-size:11px;text-decoration:none;display:inline-flex;align-items:center;gap:5px}.er-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:16px}.er-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #3b4938;background:#182219;color:var(--lime);border-radius:8px;padding:11px 13px;font-size:11px;font-weight:650;cursor:pointer;text-decoration:none}.er-button:hover{background:#223022}.er-button:disabled{opacity:.6;cursor:wait}.er-button.secondary{background:transparent;color:var(--text);border-color:var(--line)}.er-note{font-size:10px;color:var(--muted);line-height:1.7;margin-top:12px}.er-hash{word-break:break-all;font:10px ui-monospace,monospace;color:#d1e9a4;line-height:1.8;margin-top:8px}.er-footer{border-top:1px solid var(--line);margin-top:26px;padding-top:18px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;color:var(--muted);font-size:10px}.er-footer a{color:var(--lime);text-decoration:none}@media(max-width:760px){.er-hero{grid-template-columns:1fr;align-items:start}.er-grid{grid-template-columns:1fr}.er-state{justify-self:start}.er-header{height:auto;min-height:72px;padding:12px 0}.er-hero{padding-top:28px}}
      `}</style>
      <div className="er-wrap">
        <header className="er-header">
          <Link href="/" className="er-brand"><span className="er-mark"><Radio size={18} /></span><span>PULSO CÍVICO <span style={{ color: "#c2f477" }}>·</span> EVIDÊNCIAS</span></Link>
          <Link href="/" className="er-back"><ArrowLeft size={15} /> Voltar ao projeto</Link>
        </header>

        <section className="er-hero">
          <div>
            <div className="er-kicker">EVIDENCE RECORD / 001</div>
            <h1>O histórico<br />não se apaga.</h1>
            <p>Um registro compartilhável para preservar fontes, observações e mudanças ao longo do tempo. Cada afirmação deve apontar para sua origem; cada incerteza permanece visível.</p>
          </div>
          <div className="er-state"><TimerReset size={15} /> PROTÓTIPO · SEM DADOS AO VIVO</div>
        </section>

        <div className="er-banner">
          <ShieldCheck size={18} />
          <div><strong>Transparência sobre o estado atual</strong>Esta página é a primeira estrutura de registro. Ainda não está conectada à API do TSE nem a um armazenamento persistente. Não apresenta números eleitorais e não afirma que uma captura real foi realizada.</div>
        </div>

        <div className="er-grid">
          <section className="er-card">
            <div className="er-card-head"><h2>01 / Linha do tempo de evidências</h2><GitCompare size={17} color="#c2f477" /></div>
            <div className="er-empty">
              <div>
                <div className="er-empty-icon"><FileCheck2 size={22} /></div>
                <strong>Nenhuma observação registrada</strong>
                <p>Quando a coleta estiver integrada, cada captura será exibida aqui com horário, fonte, diferença em relação à versão anterior e estado de verificação.</p>
              </div>
            </div>
            <div className="er-card-body" style={{ borderTop: "1px solid #2b352d" }}>
              <div className="er-source">
                <Globe2 size={17} className="er-source-icon" />
                <div><strong>Fonte primária configurada</strong><p>TSE — portal de resultados oficiais. A consulta precisa ser realizada e registrada antes de publicar valores.</p><a href={OFFICIAL_SOURCE} target="_blank" rel="noreferrer">Abrir resultados do TSE <ArrowUpRight size={13} /></a></div>
              </div>
            </div>
          </section>

          <aside className="er-card">
            <div className="er-card-head"><h2>02 / Pacote de preservação</h2><Fingerprint size={17} color="#c2f477" /></div>
            <div className="er-card-body">
              <div className="er-metric"><div className="er-metric-label">Formato de registro</div><div className="er-metric-value">JSON + CSV</div><div className="er-metric-note">Manifesto de proveniência e modelo tabular para observações.</div></div>
              <div className="er-metric"><div className="er-metric-label">Integridade</div><div className="er-metric-value">SHA-256</div><div className="er-metric-note">Hash calculado no navegador sobre um manifesto canônico, sem o próprio digest.</div>{digest && <div className="er-hash">{digest}</div>}</div>
              <div className="er-metric"><div className="er-metric-label">Persistência</div><div className="er-metric-value">Exportação local</div><div className="er-metric-note">Nesta versão, o arquivo é baixado para o dispositivo. Nenhum arquivo é enviado ao servidor.</div></div>
              <div className="er-actions">
                <button className="er-button" onClick={exportManifest} disabled={busy}><Download size={15} /> {busy ? "Calculando…" : "Exportar manifesto"}</button>
                <button className="er-button secondary" onClick={exportCsv}><Download size={15} /> Modelo CSV</button>
                <button className="er-button secondary" onClick={shareRecord}><Share2 size={15} /> Compartilhar página</button>
              </div>
              {message && <p className="er-note" role="status">{message}</p>}
              <p className="er-note">O hash ajuda a detectar alterações no arquivo exportado. Não prova que a fonte é verdadeira, que o dado foi capturado no horário alegado ou que o arquivo está preservado em armazenamento imutável.</p>
            </div>
          </aside>
        </div>

        <section className="er-card" style={{ marginTop: 14 }}>
          <div className="er-card-head"><h2>03 / Contrato de evidência</h2><Link2 size={17} color="#c2f477" /></div>
          <div className="er-card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            <div className="er-metric"><div className="er-metric-label">Origem</div><div className="er-metric-value">URL + fonte identificada</div><div className="er-metric-note">Preservar a URL consultada e a identidade do publicador.</div></div>
            <div className="er-metric"><div className="er-metric-label">Tempo</div><div className="er-metric-value">Captura e referência</div><div className="er-metric-note">Distinguir o horário de consulta do período coberto pelo dado.</div></div>
            <div className="er-metric"><div className="er-metric-label">Verificação</div><div className="er-metric-value">Confirmado / insuficiente / conflito</div><div className="er-metric-note">Estado justificado por evidências; nenhuma inferência causal automática.</div></div>
            <div className="er-metric"><div className="er-metric-label">Histórico</div><div className="er-metric-value">Append-only como meta</div><div className="er-metric-note">Versões anteriores devem permanecer recuperáveis após a implementação do armazenamento.</div></div>
          </div>
        </section>

        <footer className="er-footer"><span>Pulso Cívico · protótipo de proveniência e preservação</span><span><a href={OFFICIAL_SOURCE} target="_blank" rel="noreferrer">Fonte oficial do TSE</a> · <Link href="/">Página inicial</Link></span></footer>
      </div>
    </main>
  );
}
