"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity, ArrowDownLeft, ArrowUpRight, BarChart3, ChevronDown, CircleHelp,
  Clock3, ExternalLink, FileSearch, Filter, GitBranch, Info, Layers3, Newspaper,
  Search, ShieldCheck, Wallet, X,
} from "lucide-react";

type View = "overview" | "flows" | "narrative" | "actors" | "dossiers";

const nav: { id: View; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Panorama", icon: Activity },
  { id: "flows", label: "Fluxos financeiros", icon: GitBranch },
  { id: "narrative", label: "Imprensa & pesquisas", icon: Newspaper },
  { id: "actors", label: "Mapa de atores", icon: Layers3 },
  { id: "dossiers", label: "Dossiês", icon: FileSearch },
];

const sources = [
  { name: "Polymarket Data API", kind: "Mercado", detail: "Negociações, atividade e posições públicas", url: "https://data-api.polymarket.com/v2/docs", status: "Fonte primária" },
  { name: "TSE — Pesquisas eleitorais", kind: "Pesquisa", detail: "Registros, contratantes e documentação de pesquisas", url: "https://www.tse.jus.br/eleicoes/pesquisas-eleitorais", status: "Fonte oficial" },
  { name: "Cohven", kind: "Carteiras", detail: "Coorte selecionada de carteiras e posições reconstruídas", url: "https://cohven.com/polymarket/brazil-presidential-election", status: "Agregador externo" },
  { name: "Polywhaler", kind: "Carteiras", detail: "Operações sinalizadas segundo critérios próprios do serviço", url: "https://polywhaler.com/events/brazil-presidential-election", status: "Agregador externo" },
  { name: "Veycast", kind: "Mercado", detail: "Snapshot de preço, volume, liquidez e livro de ofertas", url: "https://www.veycast.fun/brazil-presidential-election", status: "Agregador externo" },
];

const events = [
  { time: "DADO A COLETAR", title: "Publicação de pesquisa eleitoral", type: "Pesquisa", note: "Importar data de campo, data de publicação, instituto, amostra e margem de erro." },
  { time: "DADO A COLETAR", title: "Mudança anormal de preço ou volume", type: "Mercado", note: "Detectar somente após obter uma série histórica com timestamps sincronizados." },
  { time: "DADO A COLETAR", title: "Transferência anterior à negociação", type: "On-chain", note: "Correlacionar hash, carteira, ativo e horário; origem econômica pode permanecer desconhecida." },
];

const hypotheses = [
  { id: "H1", title: "Concentração de capital", text: "As maiores carteiras respondem por parcela desproporcional das negociações ou do impacto no preço?", metric: "Top 10 · HHI · impacto de preço", state: "Ainda não testada" },
  { id: "H2", title: "Movimento antes de informação pública", text: "Há atividade atípica antes de notícias ou pesquisas, em comparação com janelas de controle?", metric: "Retorno pré-evento · volume anormal · controles", state: "Ainda não testada" },
  { id: "H3", title: "Relações entre carteiras", text: "Há transferências ou padrões temporais compartilhados que mereçam investigação adicional?", metric: "Fluxos comuns · sincronização · alternativas legítimas", state: "Ainda não testada" },
  { id: "H4", title: "Mercado versus pesquisas", text: "Quanto da divergência pode ser explicado por liquidez, contrato, notícias ou diferenças de métrica?", metric: "Séries alinhadas · incerteza · spreads", state: "Ainda não testada" },
];

function Graph() {
  const [selected, setSelected] = useState("market");
  const nodes = [
    { id: "polls", x: 95, y: 68, label: "Pesquisas", sub: "TSE / institutos", color: "#9ba9a1" },
    { id: "press", x: 300, y: 68, label: "Imprensa", sub: "eventos públicos", color: "#9ba9a1" },
    { id: "market", x: 198, y: 174, label: "Mercado", sub: "contratos / preços", color: "#c7f36b" },
    { id: "wallets", x: 95, y: 276, label: "Carteiras", sub: "trades / posições", color: "#8ac7ff" },
    { id: "funding", x: 300, y: 276, label: "Transferências", sub: "Polygon / bridges", color: "#8ac7ff" },
  ];
  const details: Record<string, string> = {
    polls: "Cruzar registros e resultados de pesquisas com data de campo, publicação e margem de erro.",
    press: "Registrar a primeira publicação, atualizações e horário de repercussão. Correlação não prova causalidade.",
    market: "Normalizar contratos, preços, volume, liquidez e horários antes de comparar fontes.",
    wallets: "Mapear negócios e posições públicas. Endereço não equivale a identidade civil.",
    funding: "Seguir transações públicas verificáveis sem presumir que o remetente é o beneficiário final.",
  };
  return <div className="graph-wrap">
    <svg viewBox="0 0 395 340" role="img" aria-label="Mapa conceitual interativo de relações entre pesquisas, imprensa, mercado, carteiras e transferências">
      <defs><pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#26362e"/></pattern></defs>
      <rect width="395" height="340" fill="url(#dots)" rx="14"/>
      {[[95,68,198,174],[300,68,198,174],[198,174,95,276],[198,174,300,276],[95,68,95,276],[300,68,300,276]].map((p,i)=><line key={i} x1={p[0]} y1={p[1]} x2={p[2]} y2={p[3]} stroke={i<4?"#52644b":"#344239"} strokeWidth={i<4?1.5:1} strokeDasharray={i>3?"4 5":"none"}/>)}
      {nodes.map(n=><g key={n.id} onClick={()=>setSelected(n.id)} role="button" tabIndex={0} aria-label={"Selecionar "+n.label} style={{cursor:"pointer"}} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")setSelected(n.id)}}>
        <rect x={n.x-64} y={n.y-26} width="128" height="52" rx="10" fill={selected===n.id?"#1d2b20":"#0e1712"} stroke={selected===n.id?n.color:"#344239"} strokeWidth={selected===n.id?1.7:1}/>
        <circle cx={n.x-48} cy={n.y-9} r="3" fill={n.color}/>
        <text x={n.x-38} y={n.y-5} fill="#edf4ec" fontSize="10" fontWeight="600">{n.label}</text>
        <text x={n.x-52} y={n.y+13} fill="#87978b" fontSize="8.5">{n.sub}</text>
      </g>)}
    </svg>
    <div className="graph-detail"><span className="eyebrow">NÓ SELECIONADO</span><strong>{nodes.find(n=>n.id===selected)?.label}</strong><p>{details[selected]}</p></div>
  </div>;
}

export default function ObservatoryPage() {
  const [view, setView] = useState<View>("overview");
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedHypothesis, setSelectedHypothesis] = useState("H1");
  const [showLimits, setShowLimits] = useState(true);
  const filteredSources = useMemo(() => sources.filter(s => (filter==="Todos" || s.kind===filter) && (s.name+" "+s.detail+" "+s.kind).toLowerCase().includes(search.toLowerCase())), [filter, search]);

  return <main className="obs-shell">
    <style>{`
      .obs-shell{min-height:100vh;background:#090d0c;color:#e8f0e7;font-family:Inter,ui-sans-serif,system-ui,sans-serif;padding:0 22px 46px}
      .obs-wrap{max-width:1440px;margin:0 auto}.obs-header{height:74px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #26332b;gap:16px}
      .obs-brand{display:flex;align-items:center;gap:10px;color:#edf4ec;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:.04em}.obs-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#c7f36b;color:#10150d}
      .obs-status{font-size:9px;letter-spacing:.13em;color:#a9b8ab;border:1px solid #344239;border-radius:99px;padding:8px 10px}
      .obs-layout{display:grid;grid-template-columns:208px minmax(0,1fr);gap:26px}.obs-side{padding-top:28px;border-right:1px solid #26332b;padding-right:18px}.obs-side-label,.eyebrow{font-size:9px;color:#9aa99d;letter-spacing:.16em;text-transform:uppercase;font-weight:700}
      .obs-nav{display:grid;gap:5px;margin-top:14px}.obs-nav button{display:flex;align-items:center;gap:10px;border:1px solid transparent;background:transparent;color:#9eada1;text-align:left;padding:11px;border-radius:9px;font-size:11px;cursor:pointer}.obs-nav button.active{background:#192219;color:#c7f36b;border-color:#344239}.obs-nav button:hover{color:#edf4ec;background:#141c16}
      .obs-main{min-width:0;padding-top:30px}.obs-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:24px}.obs-hero h1{font-size:clamp(29px,4vw,48px);letter-spacing:-.06em;line-height:1.04;margin:9px 0 12px}.obs-hero p{max-width:760px;color:#9eada1;font-size:12px;line-height:1.8;margin:0}.obs-demo{white-space:nowrap;border:1px solid #4a5d39;border-radius:99px;color:#c7f36b;padding:8px 10px;font-size:9px;letter-spacing:.08em}
      .obs-notice{display:flex;gap:10px;background:#1d1a12;border:1px solid #51452c;color:#d9caa7;border-radius:10px;padding:12px 14px;font-size:10px;line-height:1.7;margin-bottom:18px}.obs-notice svg{flex-shrink:0;margin-top:1px}
      .obs-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.obs-panel,.obs-kpi{background:#0e1510;border:1px solid #26332b;border-radius:13px;min-width:0}.obs-kpi{padding:15px}.obs-kpi-label{color:#9eada1;font-size:9px;line-height:1.5}.obs-kpi-value{font-size:22px;font-weight:750;letter-spacing:-.04em;margin:12px 0 6px}.obs-kpi-foot{font-size:9px;color:#849388;line-height:1.6}.lime{color:#c7f36b}.blue{color:#8ac7ff}.amber{color:#f2b84b}.muted{color:#a5b1a7}
      .obs-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:12px;margin-top:12px}.obs-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #26332b;padding:14px 16px}.obs-panel-head h2{font-size:11px;margin:0}.obs-pill{border:1px solid #344239;color:#9eada1;border-radius:99px;padding:5px 8px;font-size:8px;white-space:nowrap}.obs-panel-body{padding:15px}.obs-mini{color:#8d9b90;font-size:9px;line-height:1.75}.obs-chart{width:100%;height:auto;display:block}.obs-legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}.obs-legend span{font-size:9px;color:#a5b1a7;display:flex;align-items:center;gap:6px}.obs-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
      .graph-wrap{display:grid;grid-template-columns:minmax(0,1fr);gap:10px}.graph-wrap svg{width:100%;height:auto;max-height:350px}.graph-detail{border:1px solid #26332b;background:#0a100c;border-radius:10px;padding:12px}.graph-detail strong{display:block;font-size:13px;margin-top:7px}.graph-detail p{font-size:10px;color:#9eada1;line-height:1.7;margin:6px 0 0}
      .obs-timeline{display:grid;gap:0}.obs-event{display:grid;grid-template-columns:100px 1fr;gap:12px;padding:13px 0;border-bottom:1px solid #202b23}.obs-event:last-child{border-bottom:0}.obs-time{font-size:8px;letter-spacing:.08em;color:#c7f36b;padding-top:2px}.obs-event strong{font-size:10px}.obs-event p{font-size:9px;color:#9eada1;line-height:1.65;margin:5px 0 0}
      .obs-section-title{font-size:18px;letter-spacing:-.04em;margin:0 0 7px}.obs-section-intro{font-size:11px;color:#9eada1;line-height:1.7;margin:0 0 18px}.obs-hyp-list{display:grid;gap:8px}.obs-hyp{border:1px solid #26332b;background:#0e1510;border-radius:11px;padding:14px;text-align:left;color:#e8f0e7;cursor:pointer}.obs-hyp.active{border-color:#738b51;background:#151e14}.obs-hyp-top{display:flex;align-items:center;gap:10px}.obs-hyp-id{color:#c7f36b;font-size:10px;font-weight:800}.obs-hyp strong{font-size:11px}.obs-hyp p{font-size:10px;line-height:1.7;color:#9eada1;margin:9px 0}.obs-hyp-foot{font-size:9px;color:#829085;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
      .obs-search{display:flex;align-items:center;gap:8px;background:#090f0b;border:1px solid #344239;border-radius:9px;padding:0 10px;margin-bottom:12px}.obs-search input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:#e8f0e7;font:inherit;font-size:10px;padding:11px 0}.obs-filter{background:#101a13;border:1px solid #344239;border-radius:8px;color:#dbe5da;padding:9px;font-size:10px}.obs-source{padding:13px 0;border-bottom:1px solid #202b23}.obs-source:last-child{border-bottom:0}.obs-source-top{display:flex;justify-content:space-between;gap:12px;align-items:start}.obs-source strong{font-size:11px}.obs-source p{font-size:10px;color:#9eada1;line-height:1.7;margin:6px 0}.obs-source a{font-size:9px;color:#c7f36b;text-decoration:none;white-space:nowrap}.obs-source a:hover{text-decoration:underline}
      .obs-footer{border-top:1px solid #26332b;margin-top:26px;padding-top:15px;display:flex;justify-content:space-between;gap:15px;color:#78877c;font-size:9px;line-height:1.7}.obs-footer a{color:#c7f36b;text-decoration:none}.obs-empty{font-size:10px;color:#9eada1;padding:20px 0}
      @media(max-width:1050px){.obs-layout{grid-template-columns:1fr;gap:0}.obs-side{border-right:0;border-bottom:1px solid #26332b;padding:14px 0}.obs-side-label{display:none}.obs-nav{display:flex;overflow-x:auto;margin-top:0}.obs-nav button{white-space:nowrap}.obs-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.obs-main{padding-top:22px}}
      @media(max-width:700px){.obs-shell{padding:0 13px 28px}.obs-header{height:62px}.obs-status{font-size:8px}.obs-hero{display:block}.obs-demo{display:inline-block;margin-top:14px}.obs-grid{grid-template-columns:1fr}.obs-event{grid-template-columns:1fr;gap:5px}.obs-footer{display:block}.obs-footer span{display:block;margin-top:6px}}
    `}</style>
    <div className="obs-wrap">
      <header className="obs-header">
        <Link href="/" className="obs-brand"><span className="obs-mark"><Activity size={19}/></span><span>PULSO CÍVICO <span className="lime">/</span> OBSERVATORY</span></Link>
        <span className="obs-status">PROTÓTIPO · DADOS NÃO SINCRONIZADOS</span>
      </header>
      <div className="obs-layout">
        <aside className="obs-side">
          <div className="obs-side-label">CENTRO DE INTELIGÊNCIA</div>
          <nav className="obs-nav" aria-label="Áreas do observatório">
            {nav.map(item => { const Icon=item.icon; return <button key={item.id} className={view===item.id?"active":""} onClick={()=>setView(item.id)} aria-current={view===item.id?"page":undefined}><Icon size={15}/>{item.label}</button>; })}
          </nav>
          <div style={{marginTop:24,padding:"12px",border:"1px solid #26332b",borderRadius:10}}>
            <ShieldCheck size={17} className="lime"/>
            <p className="obs-mini" style={{marginBottom:0}}>Transparência por padrão. Toda conclusão deve apontar para sua evidência e suas limitações.</p>
          </div>
        </aside>
        <section className="obs-main">
          <div className="obs-hero">
            <div><div className="eyebrow">INTELLIGENCE / PUBLIC EVIDENCE</div><h1>{nav.find(n=>n.id===view)?.label==="Panorama"?"Ver o sistema.":nav.find(n=>n.id===view)?.label}</h1><p>Pesquisas, imprensa, mercados de previsão e fluxos financeiros em uma única superfície de investigação. Explore conexões sem confundir sinais com provas.</p></div>
            <span className="obs-demo">● MODO DE DEMONSTRAÇÃO</span>
          </div>
          <div className="obs-notice"><Info size={15}/><span><strong>Estado dos dados:</strong> esta interface é uma camada visual de protótipo. Não há ingestão automática, grafo de transações reconstruído nem série histórica sincronizada conectada. Indicadores de fontes externas precisam ser reconciliados antes de qualquer conclusão.</span></div>

          {view==="overview" && <>
            <div className="obs-kpis">
              <article className="obs-kpi"><div className="obs-kpi-label">ESTADO DA INVESTIGAÇÃO</div><div className="obs-kpi-value lime">Em aberto</div><div className="obs-kpi-foot">Nenhuma hipótese confirmada</div></article>
              <article className="obs-kpi"><div className="obs-kpi-label">CAMADAS A CRUZAR</div><div className="obs-kpi-value">05</div><div className="obs-kpi-foot">Mercado · pesquisas · imprensa · carteiras · fluxos</div></article>
              <article className="obs-kpi"><div className="obs-kpi-label">FONTES DE REFERÊNCIA</div><div className="obs-kpi-value blue">{sources.length}</div><div className="obs-kpi-foot">Fontes primárias e agregadores externos</div></article>
              <article className="obs-kpi"><div className="obs-kpi-label">GRAFO FINANCEIRO</div><div className="obs-kpi-value amber">Pendente</div><div className="obs-kpi-foot">Exige extração e validação de transações</div></article>
            </div>
            <div className="obs-grid">
              <article className="obs-panel"><div className="obs-panel-head"><h2>Mapa de relações</h2><span className="obs-pill">CONCEITUAL · INTERATIVO</span></div><div className="obs-panel-body"><Graph/><p className="obs-mini">Selecione um nó para ver a pergunta de investigação correspondente. As arestas representam relações a testar, não conexões comprovadas.</p></div></article>
              <article className="obs-panel"><div className="obs-panel-head"><h2>Linha do tempo de investigação</h2><span className="obs-pill">AGUARDANDO DADOS</span></div><div className="obs-panel-body"><div className="obs-timeline">{events.map((e,i)=><div className="obs-event" key={i}><div className="obs-time">{e.time}</div><div><strong>{e.title}</strong><p>{e.note}</p><span className="obs-pill">{e.type}</span></div></div>)}</div><p className="obs-mini" style={{marginTop:12}}>Próxima etapa: importar timestamps reais e normalizar tudo em UTC.</p></div></article>
            </div>
            <div className="obs-grid">
              <article className="obs-panel"><div className="obs-panel-head"><h2>Princípios de leitura</h2><span className="obs-pill">PROTOCOLO</span></div><div className="obs-panel-body">
                {[["01","Observado","Dado reproduzível diretamente em fonte primária ou transação pública."],["02","Inferido","Interpretação explícita, com alternativas e incerteza."],["03","Corroborado","Conclusão apoiada por fontes independentes e método documentado."]].map(x=><div key={x[0]} className="obs-event"><div className="obs-time">{x[0]} / {x[1].toUpperCase()}</div><div><strong>{x[1]}</strong><p>{x[2]}</p></div></div>)}
              </div></article>
              <article className="obs-panel"><div className="obs-panel-head"><h2>Fontes de partida</h2><span className="obs-pill">{sources.length} REGISTROS</span></div><div className="obs-panel-body">{sources.slice(0,3).map(s=><div className="obs-source" key={s.name}><div className="obs-source-top"><strong>{s.name}</strong><a href={s.url} target="_blank" rel="noreferrer">Abrir fonte <ExternalLink size={10} style={{display:"inline"}}/></a></div><p>{s.detail}</p></div>)}<button className="obs-filter" onClick={()=>setView("dossiers")}>Explorar fontes e hipóteses →</button></div></article>
            </div>
          </>}

          {view==="flows" && <><h2 className="obs-section-title">Carteiras e fluxos financeiros</h2><p className="obs-section-intro">A investigação deve partir de negociações e transferências públicas verificáveis, sem atribuir identidade civil a um endereço sem evidência independente.</p><div className="obs-grid"><article className="obs-panel"><div className="obs-panel-head"><h2>Grafo de fluxo</h2><span className="obs-pill">MODELO CONCEITUAL</span></div><div className="obs-panel-body"><Graph/><div className="obs-notice" style={{marginTop:12,marginBottom:0}}><Wallet size={15}/><span>Para preencher o grafo: obter trade IDs, endereços, hashes de transação, ativos, montantes e timestamps; validar contra o explorador da rede.</span></div></div></article><article className="obs-panel"><div className="obs-panel-head"><h2>Campos mínimos por transação</h2></div><div className="obs-panel-body">{["Hash e rede","Endereço de origem e destino","Ativo e valor bruto","Timestamp UTC","Relação temporal com negociação","Método e confiança da atribuição"].map((x,i)=><div className="obs-event" key={x}><div className="obs-time">CAMPO 0{i+1}</div><div><strong>{x}</strong><p>Armazenar a origem e preservar o registro bruto para auditoria.</p></div></div)}</div></article></div></>}

          {view==="narrative" && <><h2 className="obs-section-title">Imprensa, pesquisas e eventos</h2><p className="obs-section-intro">Uma linha temporal confiável precisa distinguir data de campo, data de divulgação e momento em que o mercado reagiu.</p><div className="obs-grid"><article className="obs-panel"><div className="obs-panel-head"><h2>Eventos a importar</h2><span className="obs-pill">SEM SÉRIE HISTÓRICA</span></div><div className="obs-panel-body"><div className="obs-timeline">{events.map((e,i)=><div className="obs-event" key={i}><div className="obs-time">{e.time}</div><div><strong>{e.title}</strong><p>{e.note}</p><span className="obs-pill">{e.type}</span></div></div>)}</div></div></article><article className="obs-panel"><div className="obs-panel-head"><h2>Normalização das pesquisas</h2></div><div className="obs-panel-body">{["Instituto e contratante","Campo e publicação","População, amostra e método","Margem de erro e confiança","Resultado bruto e votos válidos","Registro e questionário"].map((x,i)=><div className="obs-event" key={x}><div className="obs-time">VARIÁVEL 0{i+1}</div><div><strong>{x}</strong><p>Preservar a unidade original e não comparar métricas diferentes como se fossem equivalentes.</p></div></div>)}<a className="obs-source-link" href="https://www.tse.jus.br/eleicoes/pesquisas-eleitorais" target="_blank" rel="noreferrer">Abrir portal do TSE ↗</a></div></article></div></>}

          {view==="actors" && <><h2 className="obs-section-title">Mapa de atores e entidades</h2><p className="obs-section-intro">Atribuição exige evidência. Carteira pública, serviço rotulado e pessoa identificada são categorias distintas.</p><div className="obs-grid"><article className="obs-panel"><div className="obs-panel-head"><h2>Grafo de entidades</h2><span className="obs-pill">CLIQUE NOS NÓS</span></div><div className="obs-panel-body"><Graph/></div></article><article className="obs-panel"><div className="obs-panel-head"><h2>Níveis de atribuição</h2></div><div className="obs-panel-body">{[["Fonte primária","Registro direto de transação ou documento oficial."],["Entidade rotulada","Serviço público atribui o endereço a uma plataforma; validar escopo."],["Vínculo documentado","Documento confiável relaciona uma entidade a um endereço ou organização."],["Não identificado","Não inferir nome, intenção ou beneficiário final apenas pelo padrão de transações."]].map((x,i)=><div className="obs-event" key={x[0]}><div className="obs-time">NÍVEL 0{i+1}</div><div><strong>{x[0]}</strong><p>{x[1]}</p></div></div>)}</div></article></div></>}

          {view==="dossiers" && <><h2 className="obs-section-title">Dossiês e hipóteses</h2><p className="obs-section-intro">Selecione uma hipótese para consultar a pergunta, as métricas e o estado atual. Nenhuma hipótese foi confirmada por esta interface.</p><div className="obs-grid"><div className="obs-hyp-list">{hypotheses.map(h=><button key={h.id} className={"obs-hyp "+(selectedHypothesis===h.id?"active":"")} onClick={()=>setSelectedHypothesis(h.id)}><div className="obs-hyp-top"><span className="obs-hyp-id">{h.id}</span><strong>{h.title}</strong></div><p>{h.text}</p><div className="obs-hyp-foot"><span>{h.metric}</span><span>{h.state}</span></div></button>)}</div><article className="obs-panel"><div className="obs-panel-head"><h2>Registro de evidências</h2><span className="obs-pill">{selectedHypothesis}</span></div><div className="obs-panel-body"><div className="eyebrow">HIPÓTESE SELECIONADA</div><h3 style={{fontSize:19,letterSpacing:"-.04em"}}>{hypotheses.find(h=>h.id===selectedHypothesis)?.title}</h3><p className="obs-mini">{hypotheses.find(h=>h.id===selectedHypothesis)?.text}</p><div className="obs-notice" style={{marginTop:15}}><CircleHelp size={15}/><span>Estado atual: não testada nesta aplicação. É necessário importar os dados, definir controles e publicar evidências favoráveis e contrárias.</span></div><strong style={{fontSize:10}}>Métricas propostas</strong><p className="obs-mini">{hypotheses.find(h=>h.id===selectedHypothesis)?.metric}</p><div className="obs-event"><div className="obs-time">PRÓXIMA AÇÃO</div><div><strong>Obter e validar dados brutos</strong><p>Guardar snapshot, origem, timestamp, unidade, método e hash do artefato quando aplicável.</p></div></div><button className="obs-filter" onClick={()=>setView("dossiers")}>Manter no dossiê selecionado</button></div></article></div><article className="obs-panel" style={{marginTop:12}}><div className="obs-panel-head"><h2>Registro de fontes</h2><span className="obs-pill">PESQUISÁVEL</span></div><div className="obs-panel-body"><div className="obs-search"><Search size={14}/><input aria-label="Pesquisar fontes" placeholder="Pesquisar nome, categoria ou descrição..." value={search} onChange={e=>setSearch(e.target.value)}/><Filter size={13}/></div><div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>{["Todos","Mercado","Pesquisa","Carteiras"].map(f=><button key={f} className="obs-filter" style={{borderColor:filter===f?"#738b51":"#344239",color:filter===f?"#c7f36b":"#dbe5da"}} onClick={()=>setFilter(f)}>{f}</button>)}</div>{filteredSources.length?filteredSources.map(s=><div className="obs-source" key={s.name}><div className="obs-source-top"><div><strong>{s.name}</strong><div className="obs-mini">{s.kind} · {s.status}</div></div><a href={s.url} target="_blank" rel="noreferrer">Abrir fonte ↗</a></div><p>{s.detail}</p></div>):<div className="obs-empty">Nenhuma fonte corresponde ao filtro.</div>}</div></article></>}
          <footer className="obs-footer"><span>ESTADO: PROTÓTIPO DE INTERFACE · SEM INGESTÃO AUTOMÁTICA</span><span>Fontes externas são independentes e podem divergir. <Link href="/radar-fluxos">Abrir Radar de fluxos ↗</Link></span></footer>
        </section>
      </div>
    </div>
  </main>;
}
