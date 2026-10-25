"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, BookOpen, CircleHelp, Filter, GitBranch, Info, Search, ShieldCheck, Share2, Plus, ExternalLink } from "lucide-react";

type View = "overview" | "evidence" | "hypotheses" | "sources";
type Status = "Verificado" | "Corroborado" | "Indício" | "Inconclusivo";

const sections: { id: View; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Resumo executivo", icon: Activity },
  { id: "evidence", label: "Evidências e método", icon: ShieldCheck },
  { id: "hypotheses", label: "Hipóteses", icon: GitBranch },
  { id: "sources", label: "Fontes", icon: BookOpen },
];

const sources = [
  { name: "Polymarket Data API", kind: "Mercado", detail: "Negociações, atividade e posições públicas.", url: "https://data-api.polymarket.com/v2/docs", role: "Fonte primária" },
  { name: "TSE — Pesquisas eleitorais", kind: "Pesquisa", detail: "Registros, contratantes e documentação de pesquisas.", url: "https://www.tse.jus.br/eleicoes/pesquisas-eleitorais", role: "Fonte oficial" },
  { name: "Cohven", kind: "Carteiras", detail: "Análises externas de carteiras e posições; validar metodologia.", url: "https://cohven.com/polymarket/brazil-presidential-election", role: "Agregador externo" },
  { name: "Polywhaler", kind: "Carteiras", detail: "Operações sinalizadas segundo critérios próprios do serviço.", url: "https://polywhaler.com/events/brazil-presidential-election", role: "Agregador externo" },
  { name: "Veycast", kind: "Mercado", detail: "Snapshots de preço, volume, liquidez e livro de ofertas.", url: "https://www.veycast.fun/brazil-presidential-election", role: "Agregador externo" },
];

const hypotheses = [
  { id: "H1", title: "Concentração de capital", question: "As maiores carteiras respondem por uma parcela desproporcional do volume ou do impacto no preço?", method: "Participação das 10 maiores carteiras, HHI e impacto estimado no preço.", evidence: "Trades e posições com timestamp, critérios de inclusão e janela definidos." },
  { id: "H2", title: "Atividade antes de informação pública", question: "Há atividade atípica antes de notícias ou pesquisas, em comparação com janelas de controle?", method: "Retorno pré-evento, volume anormal e janelas de controle comparáveis.", evidence: "Série histórica sincronizada, registro da publicação e comparação com eventos de controle." },
  { id: "H3", title: "Relações entre carteiras", question: "Há fluxos ou padrões temporais compartilhados que justifiquem investigação adicional?", method: "Transferências comuns, sincronização temporal e explicações alternativas.", evidence: "Hashes, endereços, rede, ativos e timestamps validados em explorador." },
  { id: "H4", title: "Mercado versus pesquisas", question: "Quanto da divergência pode ser explicado por liquidez, contrato, notícias ou diferenças de métrica?", method: "Séries alinhadas, spreads, liquidez e incerteza de cada medição.", evidence: "Dados comparáveis e normalizados; data de campo separada da publicação." },
];

const statuses: { name: Status; description: string }[] = [
  { name: "Verificado", description: "Registro reproduzível em fonte primária." },
  { name: "Corroborado", description: "Evidência independente consistente, método documentado." },
  { name: "Indício", description: "Sinal que merece teste; não confirma uma explicação." },
  { name: "Inconclusivo", description: "Dados insuficientes, conflitantes ou não comparáveis." },
];

function StatusTag({ children }: { children: Status | "Pendente" | "Protótipo" }) {
  const cls = children === "Verificado" ? "verified" : children === "Corroborado" ? "corroborated" : children === "Indício" ? "signal" : "pending";
  return <span className={"status-tag " + cls}>{children}</span>;
}

export default function ObservatoryPage() {
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState("H1");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("Todos");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceCategory, setSourceCategory] = useState("Checagem de fatos");
  const [sourceNote, setSourceNote] = useState("");
  const [submittedSources, setSubmittedSources] = useState<{ url: string; category: string; note: string }[]>([]);
  const [sourceMessage, setSourceMessage] = useState("");
  const [sourceSubmitting, setSourceSubmitting] = useState(false);
  const [approvedSources, setApprovedSources] = useState<{ id: string; url: string; category: string; description: string | null; status: string }[]>([]);
  useEffect(() => { let active = true; fetch("/api/source-submissions").then(async response => { if (!response.ok) throw new Error("catalog unavailable"); return response.json(); }).then(data => { if (active && Array.isArray(data.sources)) setApprovedSources(data.sources); }).catch(() => undefined); return () => { active = false; }; }, []);
  const activeHypothesis = hypotheses.find(h => h.id === selected) ?? hypotheses[0];
  const filteredSources = useMemo(() => sources.filter(s => (kind === "Todos" || s.kind === kind) && (s.name + " " + s.detail + " " + s.kind).toLowerCase().includes(search.toLowerCase())), [kind, search]);

  return (
    <main className="obs">
      <style>{`
        .obs{--bg:#0a0e0b;--panel:#111813;--line:#29362d;--text:#edf2eb;--muted:#a1afa3;--lime:#c7f36b;min-height:100vh;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif;padding:0 24px 42px}
        .obs *{box-sizing:border-box}.obs a{color:var(--lime);text-decoration:none}.obs a:hover{text-decoration:underline}.obs-wrap{max-width:1240px;margin:auto}
        .obs-header{height:72px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--line)}.obs-brand{display:flex;align-items:center;gap:10px;color:var(--text)!important;font-size:12px;font-weight:800;letter-spacing:.06em}.obs-mark{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:var(--lime);color:#11180d}
        .obs-chip{border:1px solid #596a42;border-radius:99px;padding:7px 10px;color:var(--lime);font-size:9px;letter-spacing:.08em}
        .obs-layout{display:grid;grid-template-columns:200px minmax(0,1fr);gap:28px}.obs-side{padding-top:26px;border-right:1px solid var(--line);padding-right:16px}.obs-overline{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);font-weight:750}
        .obs-nav{display:grid;gap:5px;margin-top:14px}.obs-nav button{display:flex;align-items:center;gap:10px;width:100%;border:1px solid transparent;border-radius:9px;background:transparent;padding:11px;color:var(--muted);font-size:11px;text-align:left;cursor:pointer}.obs-nav button.active{background:#1a241a;border-color:#394a32;color:var(--lime)}.obs-nav button:hover{background:#151e17;color:var(--text)}
        .obs-side-note{margin-top:25px;padding:13px;border:1px solid var(--line);border-radius:10px;color:var(--muted);font-size:10px;line-height:1.7}.obs-main{min-width:0;padding-top:30px}.obs-hero{margin-bottom:22px}.obs-hero h1{font-size:clamp(29px,4vw,43px);letter-spacing:-.055em;line-height:1.08;margin:10px 0}.obs-hero p{max-width:720px;color:var(--muted);font-size:12px;line-height:1.8;margin:0}
        .obs-alert{display:flex;align-items:flex-start;gap:10px;background:#211c11;border:1px solid #51452b;border-radius:10px;padding:13px 14px;color:#e4d5b1;font-size:10px;line-height:1.75;margin:18px 0}.obs-alert svg{flex-shrink:0;margin-top:2px}
        .obs-section-title{font-size:20px;letter-spacing:-.04em;margin:0 0 7px}.obs-intro{font-size:11px;line-height:1.8;color:var(--muted);margin:0 0 18px;max-width:780px}
        .obs-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:18px 0}.obs-kpi,.obs-panel{background:var(--panel);border:1px solid var(--line);border-radius:13px;min-width:0}.obs-kpi{padding:16px}.obs-kpi-label{font-size:9px;color:var(--muted);letter-spacing:.06em}.obs-kpi-value{font-size:23px;font-weight:780;letter-spacing:-.04em;margin:12px 0 5px}.obs-kpi-note{font-size:10px;color:var(--muted);line-height:1.65}
        .obs-panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 16px;border-bottom:1px solid var(--line)}.obs-panel-head h2{font-size:12px;margin:0}.obs-panel-body{padding:16px}.obs-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr);gap:12px;margin-top:12px}.obs-list{display:grid}.obs-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:14px 0;border-bottom:1px solid #253128}.obs-row:last-child{border-bottom:0}.obs-row strong{font-size:11px}.obs-row p{font-size:10px;line-height:1.7;color:var(--muted);margin:5px 0 0}.status-tag{display:inline-flex;align-items:center;align-self:start;white-space:nowrap;border:1px solid var(--line);border-radius:99px;padding:5px 8px;font-size:9px;color:#c0cbc2}.status-tag.pending{color:#e5c98d;border-color:#61502e}.status-tag.verified{color:#c7f36b;border-color:#52683b}.status-tag.corroborated{color:#8ac7ff;border-color:#38556a}.status-tag.signal{color:#e5b86c;border-color:#65502d}
        .obs-number{font-size:28px;font-weight:800;letter-spacing:-.05em}.obs-muted{font-size:10px;line-height:1.7;color:var(--muted)}.obs-button{display:inline-flex;align-items:center;gap:7px;border:1px solid #3c4b3c;background:#182219;color:var(--lime);border-radius:8px;padding:9px 11px;font-size:10px;cursor:pointer}.obs-button:hover{background:#223022}.obs-hyp-list{display:grid;gap:8px}.obs-hyp{width:100%;text-align:left;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px;color:var(--text);cursor:pointer}.obs-hyp.active{border-color:#829c5c;background:#172116}.obs-hyp strong{font-size:11px}.obs-hyp p{font-size:10px;line-height:1.7;color:var(--muted);margin:7px 0}.obs-hyp small{color:var(--lime);font-size:9px}
        .obs-search{display:flex;align-items:center;gap:8px;border:1px solid #3a493d;border-radius:8px;padding:0 10px;margin-bottom:12px}.obs-search input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:var(--text);padding:11px 0;font:inherit;font-size:10px}.obs-filters{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}.obs-filter{border:1px solid var(--line);background:#0c120e;color:var(--muted);border-radius:7px;padding:7px 9px;font-size:9px;cursor:pointer}.obs-filter.active{border-color:#6b8249;color:var(--lime)}.obs-source{padding:13px 0;border-bottom:1px solid #253128}.obs-source:last-child{border-bottom:0}.obs-source strong{font-size:11px}.obs-source p{font-size:10px;line-height:1.7;color:var(--muted);margin:6px 0}.obs-source-meta{font-size:9px;color:#89988c;margin-top:4px}
        .obs-footer{border-top:1px solid var(--line);margin-top:28px;padding-top:14px;color:#89968b;font-size:9px;line-height:1.7;display:flex;justify-content:space-between;gap:12px}.obs-empty{font-size:10px;color:var(--muted);padding:18px 0}
        .obs-community{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.8fr);gap:12px;margin-top:18px}.obs-field{display:grid;gap:6px;margin-top:12px}.obs-field label{font-size:10px;color:var(--muted)}.obs-field input,.obs-field select,.obs-field textarea{width:100%;border:1px solid #3a493d;border-radius:8px;background:#0c120e;color:var(--text);padding:10px;font:inherit;font-size:11px;min-width:0}.obs-share-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.obs-success{margin-top:10px;padding:10px;border:1px solid #52683b;border-radius:8px;color:#c7f36b;font-size:10px;line-height:1.7}.obs-community-note{font-size:10px;line-height:1.7;color:var(--muted);margin:8px 0 0}
        @media(max-width:850px){.obs-community{grid-template-columns:1fr}.obs-layout{grid-template-columns:1fr;gap:0}.obs-side{border-right:0;border-bottom:1px solid var(--line);padding:12px 0}.obs-side-note{display:none}.obs-nav{display:flex;overflow-x:auto;margin:0}.obs-nav button{width:auto;white-space:nowrap}.obs-main{padding-top:22px}.obs-grid{grid-template-columns:1fr}}
        @media(max-width:560px){.obs{padding:0 13px 26px}.obs-header{height:62px}.obs-chip{font-size:8px}.obs-kpis{grid-template-columns:1fr}.obs-kpi{padding:13px}.obs-kpi-value{margin:7px 0 4px}.obs-row{grid-template-columns:1fr;gap:8px}.obs-footer{display:block}.obs-footer span{display:block;margin-top:6px}}
      `}</style>
      <div className="obs-wrap">
        <header className="obs-header">
          <Link href="/" className="obs-brand"><span className="obs-mark"><Activity size={18}/></span><span>PULSO CÍVICO <span style={{color:"#c7f36b"}}>/</span> OBSERVATORY</span></Link>
          <span className="obs-chip">PROTÓTIPO · SEM DADOS SINCRONIZADOS</span>
        </header>
        <div className="obs-layout">
          <aside className="obs-side">
            <div className="obs-overline">Investigação</div>
            <nav className="obs-nav" aria-label="Navegação do Observatory">
              {sections.map(item => { const Icon = item.icon; return <button key={item.id} className={view===item.id?"active":""} onClick={()=>setView(item.id)} aria-current={view===item.id?"page":undefined}><Icon size={15}/>{item.label}</button>; })}
            </nav>
            <div className="obs-side-note"><ShieldCheck size={16} style={{color:"#c7f36b",marginBottom:8}}/><br/>Separar fato, indício e interpretação. Toda conclusão deve mostrar a evidência, a incerteza e o que ainda falta saber.</div>
          </aside>
          <section className="obs-main">
            <div className="obs-hero">
              <div className="obs-overline">Centro de análise · Evidências públicas</div>
              <h1>{view==="overview"?"O que sabemos — e o que ainda não sabemos":sections.find(s=>s.id===view)?.label}</h1>
              <p>Uma leitura direta das conclusões sustentadas pelos dados disponíveis, das hipóteses que precisam ser testadas e das fontes necessárias para avançar.</p>
            </div>
            <div className="obs-alert"><Info size={15}/><span><strong>Limite atual:</strong> esta é uma interface de protótipo. Nenhuma ingestão automática ou série histórica está conectada. Portanto, não apresentamos números de atividade, alertas ou conclusões como se tivessem sido medidos.</span></div>

            {view==="overview" && <>
              <div className="obs-kpis">
                <article className="obs-kpi"><div className="obs-kpi-label">CONCLUSÕES CONFIRMADAS</div><div className="obs-kpi-value">—</div><div className="obs-kpi-note">Ainda não calculadas: falta uma base de evidências validada.</div></article>
                <article className="obs-kpi"><div className="obs-kpi-label">HIPÓTESES EM AVALIAÇÃO</div><div className="obs-kpi-value">{hypotheses.length}</div><div className="obs-kpi-note">Perguntas de investigação propostas, não resultados.</div></article>
                <article className="obs-kpi"><div className="obs-kpi-label">FONTES CATALOGADAS</div><div className="obs-kpi-value">{sources.length}</div><div className="obs-kpi-note">Catálogo de referência; disponibilidade e conteúdo não foram verificados ao vivo.</div></article>
              </div>
              <div className="obs-grid">
                <article className="obs-panel"><div className="obs-panel-head"><h2>Leitura executiva</h2><StatusTag>Inconclusivo</StatusTag></div><div className="obs-panel-body">
                  <h3 style={{fontSize:16,letterSpacing:"-.03em",margin:"0 0 9px"}}>Ainda não há base para afirmar uma relação causal.</h3>
                  <p className="obs-muted">O produto foi estruturado para cruzar mercados de previsão, pesquisas eleitorais, imprensa e atividade pública de carteiras. Sem dados brutos sincronizados, esse cruzamento permanece como plano de investigação.</p>
                  <div style={{borderTop:"1px solid #29362d",marginTop:14,paddingTop:13}}><div className="obs-overline">Próximo passo prioritário</div><p className="obs-muted">Importar um primeiro conjunto de dados com origem, timestamp, unidade e método registrados; só então calcular indicadores e comparar eventos.</p><button className="obs-button" onClick={()=>setView("evidence")}>Ver critérios de evidência <ArrowUpRight size={13}/></button></div>
                </div></article>
                <article className="obs-panel"><div className="obs-panel-head"><h2>Como ler os estados</h2><span className="obs-overline">Protocolo</span></div><div className="obs-panel-body obs-list">{statuses.map(s=><div className="obs-row" key={s.name}><div><strong>{s.name}</strong><p>{s.description}</p></div><StatusTag>{s.name}</StatusTag></div>)}</div></article>
              </div>
              <article className="obs-panel" style={{marginTop:12}}><div className="obs-panel-head"><h2>Frentes de investigação</h2><span className="obs-overline">4 perguntas abertas</span></div><div className="obs-panel-body obs-list">{hypotheses.map(h=><div className="obs-row" key={h.id}><div><strong>{h.title}</strong><p>{h.question}</p></div><button className="obs-button" onClick={()=>{setSelected(h.id);setView("hypotheses")}}>Abrir hipótese <ArrowUpRight size={12}/></button></div>)}</div></article>
            </>}

            {view==="evidence" && <>
              <h2 className="obs-section-title">O que conta como evidência?</h2><p className="obs-intro">Cada conclusão deve ser rastreável até um registro verificável. Uma correlação temporal, sozinha, não demonstra coordenação, intenção ou causalidade.</p>
              <div className="obs-grid">
                <article className="obs-panel"><div className="obs-panel-head"><h2>Ficha mínima de uma evidência</h2></div><div className="obs-panel-body obs-list">{[["Origem","URL, documento, endpoint ou hash da transação."],["Tempo","Timestamp original, fuso e regra de normalização."],["Método","Consulta, filtros, janela temporal e transformação aplicada."],["Limitações","Dados ausentes, viés de seleção e explicações alternativas."],["Reprodução","Artefato bruto preservado e passos para repetir o cálculo."]].map(([a,b],i)=><div className="obs-row" key={a}><div><strong>{String(i+1).padStart(2,"0")} · {a}</strong><p>{b}</p></div></div>)}</div></article>
                <article className="obs-panel"><div className="obs-panel-head"><h2>Regra para publicar uma conclusão</h2></div><div className="obs-panel-body"><div className="obs-overline">Antes de publicar</div><p className="obs-muted">A conclusão deve responder às três perguntas abaixo.</p>{["O que observamos diretamente?","Que interpretação é compatível com os dados — e quais alternativas existem?","Que evidência poderia enfraquecer ou refutar a interpretação?"].map((q,i)=><div className="obs-row" key={q}><div><strong>{i+1}. {q}</strong></div></div>)}<div className="obs-alert" style={{marginBottom:0}}><CircleHelp size={15}/><span>Endereço de carteira não equivale a identidade civil. Sequência temporal não prova conhecimento prévio.</span></div></div></article>
              </div>
            </>}

            {view==="hypotheses" && <>
              <h2 className="obs-section-title">Hipóteses de investigação</h2><p className="obs-intro">Selecione uma pergunta para ver o teste proposto e os dados necessários. Todas permanecem não testadas nesta versão.</p>
              <div className="obs-grid"><div className="obs-hyp-list">{hypotheses.map(h=><button key={h.id} className={"obs-hyp "+(selected===h.id?"active":"")} onClick={()=>setSelected(h.id)}><div className="obs-overline">{h.id} · Não testada</div><strong>{h.title}</strong><p>{h.question}</p><small>Selecionar hipótese →</small></button>)}</div>
                <article className="obs-panel"><div className="obs-panel-head"><h2>{activeHypothesis.id} · Plano de teste</h2><StatusTag>Pendente</StatusTag></div><div className="obs-panel-body"><div className="obs-overline">Pergunta</div><p className="obs-muted">{activeHypothesis.question}</p><div className="obs-overline" style={{marginTop:18}}>Método proposto</div><p className="obs-muted">{activeHypothesis.method}</p><div className="obs-overline" style={{marginTop:18}}>Dados necessários</div><p className="obs-muted">{activeHypothesis.evidence}</p><div className="obs-alert"><Info size={15}/><span>O método é uma proposta de teste, não um resultado. Não interpretar ausência de dados como ausência de atividade.</span></div><button className="obs-button" onClick={()=>setView("sources")}>Consultar fontes <ArrowUpRight size={13}/></button></div></article>
              </div>
            </>}

            {view==="sources" && <>
              <h2 className="obs-section-title">Catálogo de fontes</h2><p className="obs-intro">Fontes candidatas para coleta e validação. A inclusão no catálogo não significa que os dados já foram importados, validados ou cruzados.</p>
              <div className="obs-community">
                <article className="obs-panel"><div className="obs-panel-head"><h2><Plus size={14} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>Sugerir uma fonte</h2><span className="obs-overline">Participação pública</span></div><div className="obs-panel-body">
                  <p className="obs-muted">Indique uma página pública, ferramenta ou organização que outras pessoas possam consultar. Sugestões precisam ser verificadas antes de entrar no catálogo.</p>
                  <form onSubmit={async e=>{e.preventDefault();setSourceMessage("");setSourceSubmitting(true);try{const response=await fetch("/api/source-submissions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:sourceUrl.trim(),category:sourceCategory,note:sourceNote.trim()})});const payload=await response.json().catch(()=>({}));if(!response.ok){setSourceMessage(payload.error||"Não foi possível enviar a sugestão.");return;}setSubmittedSources(items=>[{url:sourceUrl.trim(),category:sourceCategory,note:sourceNote.trim()},...items]);setSourceMessage("Sugestão recebida pela API e aguardando moderação. Ela ainda não aparece no catálogo público.");setSourceUrl("");setSourceNote("");}catch{setSourceMessage("Não foi possível conectar à API. A sugestão não foi enviada.");}finally{setSourceSubmitting(false);}}}>
                    <div className="obs-field"><label htmlFor="source-url">URL da fonte *</label><input id="source-url" type="url" required placeholder="https://exemplo.org" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)}/></div>
                    <div className="obs-field"><label htmlFor="source-category">Categoria</label><select id="source-category" value={sourceCategory} onChange={e=>setSourceCategory(e.target.value)}><option>Checagem de fatos</option><option>Fonte oficial / dados públicos</option><option>Jornalismo</option><option>Ferramenta de verificação</option><option>Pesquisa e universidade</option><option>Outro recurso</option></select></div>
                    <div className="obs-field"><label htmlFor="source-note">Por que é útil? (opcional)</label><textarea id="source-note" rows={2} placeholder="Descreva o conteúdo e como pode ser verificado." value={sourceNote} onChange={e=>setSourceNote(e.target.value)}/></div>
                    <div style={{marginTop:12}}><button className="obs-button" type="submit" disabled={sourceSubmitting}>{sourceSubmitting?"Enviando…":"Enviar sugestão"} <ArrowUpRight size={13}/></button></div>
                  </form>
                  {sourceMessage&&<div className="obs-success" role="status">{sourceMessage}</div>}
                  {submittedSources.length>0&&<div style={{marginTop:14}}><div className="obs-overline">Sugestões nesta sessão ({submittedSources.length})</div>{submittedSources.map((item,i)=><div className="obs-source" key={item.url+"-"+i}><strong>{item.category}</strong><p><a href={item.url} target="_blank" rel="noreferrer">{item.url} ↗</a></p>{item.note&&<p>{item.note}</p>}<div className="obs-source-meta">Pendente de validação · não publicado</div></div>)}</div>}
                </div></article>
                <article className="obs-panel"><div className="obs-panel-head"><h2><Share2 size={14} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>Compartilhar o hub</h2></div><div className="obs-panel-body"><p className="obs-muted">Divulgue o Pulso Cívico ou compartilhe o acesso ao catálogo com sua comunidade e seus canais.</p><div className="obs-share-actions"><button className="obs-button" type="button" onClick={()=>{const url=window.location.href;const message="Conheça o Pulso Cívico: um hub de acesso a fontes públicas e ferramentas de verificação de fatos. "+url;window.open("https://wa.me/?text="+encodeURIComponent(message),"_blank","noopener,noreferrer");}}>WhatsApp <ExternalLink size={12}/></button><button className="obs-button" type="button" onClick={()=>{const url=window.location.href;window.open("https://www.linkedin.com/sharing/share-offsite/?url="+encodeURIComponent(url),"_blank","noopener,noreferrer");}}>LinkedIn <ExternalLink size={12}/></button><button className="obs-button" type="button" onClick={()=>{const url=window.location.href;const message="Conheça o Pulso Cívico: um hub de acesso a fontes públicas e ferramentas de verificação de fatos. "+url;if(navigator.share){navigator.share({title:"Pulso Cívico",text:message,url}).catch(()=>undefined);}else if(navigator.clipboard){navigator.clipboard.writeText(message).then(()=>setSourceMessage("Texto e link de compartilhamento copiados.")).catch(()=>setSourceMessage("Copie o endereço desta página para compartilhar: "+url));}else{setSourceMessage("Copie o endereço desta página para compartilhar: "+url);}}}>Compartilhar / copiar <Share2 size={12}/></button></div><p className="obs-community-note">O compartilhamento abre a plataforma escolhida. As sugestões de fontes não são publicadas automaticamente e ainda não têm backend de envio.</p></div></article>
              </div>
              <div className="obs-panel" style={{marginTop:12}}><div className="obs-panel-body"><div className="obs-search"><Search size={14}/><input aria-label="Buscar fontes" placeholder="Buscar por nome, categoria ou descrição…" value={search} onChange={e=>setSearch(e.target.value)}/><Filter size={13}/></div><div className="obs-filters">{["Todos","Mercado","Pesquisa","Carteiras"].map(k=><button key={k} className={"obs-filter "+(kind===k?"active":"")} onClick={()=>setKind(k)}>{k}</button>)}</div>
                {filteredSources.length?filteredSources.map(s=><div className="obs-source" key={s.name}><div style={{display:"flex",alignItems:"start",justifyContent:"space-between",gap:12}}><div><strong>{s.name}</strong><div className="obs-source-meta">{s.kind} · {s.role}</div></div><a href={s.url} target="_blank" rel="noreferrer">Abrir fonte ↗</a></div><p>{s.detail}</p></div>):<div className="obs-empty">Nenhuma fonte corresponde à busca.</div>}
                {approvedSources.length>0&&<div style={{marginTop:18}}><div className="obs-overline">Fontes aprovadas pela comunidade</div>{approvedSources.filter(s=>(search.trim()===""||(s.url+" "+s.category+" "+(s.description||"")).toLowerCase().includes(search.toLowerCase()))).map(s=><div className="obs-source" key={s.id}><div style={{display:"flex",alignItems:"start",justifyContent:"space-between",gap:12}}><div><strong>{s.category}</strong><div className="obs-source-meta">Fonte comunitária · aprovada</div></div><a href={s.url} target="_blank" rel="noreferrer">Abrir fonte ↗</a></div>{s.description&&<p>{s.description}</p>}</div>)}</div>}
              </div></div>
            </>}
            <footer className="obs-footer"><span>PULSO CÍVICO · OBSERVATORY · PROTÓTIPO</span><span>Sem ingestão automática ou resultados verificados. <Link href="/radar-fluxos">Abrir Radar de fluxos ↗</Link></span></footer>
          </section>
        </div>
      </div>
    </main>
  );
}
