"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, ExternalLink, Eye, FileSearch, GitBranch, Info, ShieldCheck, Wallet, Waves } from "lucide-react";

const sources = [
  { name: "Polywhaler", type: "Rastreador de grandes operações", updated: "Captura consultada em 24/10/2026", url: "https://polywhaler.com/events/brazil-presidential-election", note: "Agrega operações classificadas como whale trades e aplica seus próprios critérios de alerta." },
  { name: "Veycast", type: "Fluxo, livro de ofertas e liquidez", updated: "Snapshot informado pela fonte: 24/10/2026, 06:59 UTC", url: "https://www.veycast.fun/brazil-presidential-election", note: "A amostra recente exibida não representa necessariamente todas as negociações do mercado." },
  { name: "Cohven", type: "Coorte de carteiras públicas", updated: "Atualizado pela fonte em 22/10/2026", url: "https://cohven.com/polymarket/brazil-presidential-election", note: "Reconstrói posições de uma coorte selecionada de endereços; não representa todos os participantes." },
  { name: "PolymarketScan", type: "Mercados e atividade on-chain", updated: "Consultado em 24/10/2026", url: "https://polymarketscan.org/event/brazil-presidential-election", note: "Agrega vários contratos relacionados; volumes por contrato não devem ser somados sem deduplicação." },
];

const signals = [
  { label: "Probabilidade de Flávio", value: "83,2%", detail: "Preço de mercado observado no Polywhaler", tone: "blue", icon: ArrowUpRight },
  { label: "Probabilidade de Lula", value: "16,8%", detail: "Preço implícito aproximado no mesmo mercado", tone: "red", icon: ArrowDownRight },
  { label: "Volume de grandes operações", value: "US$ 6,79 mi", detail: "Agregado reportado pelo Polywhaler", tone: "mint", icon: Wallet },
  { label: "Carteiras classificadas como whales", value: "137", detail: "315 operações rastreadas pela fonte", tone: "violet", icon: Waves },
];

export default function RadarFluxosPage() {
  const [tab, setTab] = useState<"overview" | "hypotheses" | "method">("overview");
  const [query, setQuery] = useState("");
  const filteredSources = sources.filter((source) => (source.name + " " + source.type + " " + source.note).toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="radar-shell">
      <style>{`
        .radar-shell{min-height:100vh;background:#07111b;color:#edf5fa;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;padding:0 24px 48px}
        .radar-wrap{max-width:1240px;margin:0 auto}.radar-top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:23px 0;border-bottom:1px solid #203546}
        .radar-brand{color:#f4f8fb;text-decoration:none;font-weight:800;letter-spacing:-.04em;display:flex;gap:10px;align-items:center}.radar-mark{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:#d8ff48;color:#07111b}
        .radar-back{font-size:12px;color:#b7c7d2;text-decoration:none}.radar-back:hover,.radar-source-link:hover{color:#d8ff48}
        .radar-kicker{color:#d8ff48;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
        .radar-hero{padding:34px 0 24px;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:end}.radar-hero h1{font-size:clamp(34px,5vw,58px);letter-spacing:-.06em;line-height:1.02;margin:12px 0}.radar-hero p{max-width:740px;color:#9fb2c1;font-size:14px;line-height:1.8;margin:0}
        .radar-live{border:1px solid #3b5030;color:#d8ff48;border-radius:30px;padding:9px 12px;font-size:10px;white-space:nowrap;align-self:start}
        .radar-warning{display:flex;gap:10px;padding:13px 15px;border:1px solid #5a4930;background:#211c13;border-radius:12px;color:#e8d8b4;font-size:11px;line-height:1.65;margin:5px 0 18px}
        .radar-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:20px 0}.radar-tabs button{border:1px solid #263e50;background:#0b1b28;color:#b9c8d2;border-radius:9px;padding:10px 13px;font-size:11px}.radar-tabs button.active{background:#d8ff48;color:#09131b;border-color:#d8ff48;font-weight:800}
        .radar-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.radar-card{border:1px solid #20394b;background:linear-gradient(145deg,#0e2231,#091722);border-radius:15px;padding:17px;min-width:0}.radar-card-label{font-size:10px;color:#9fb2c1;line-height:1.5}.radar-card-value{font-size:clamp(22px,2.6vw,31px);font-weight:800;letter-spacing:-.04em;margin:10px 0 5px}.radar-card-detail{font-size:10px;line-height:1.6;color:#8ea4b5}.radar-blue{color:#59c6ff}.radar-red{color:#ff7d86}.radar-mint{color:#d8ff48}.radar-violet{color:#c3a8ff}
        .radar-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:14px;margin-top:14px}.radar-panel{border:1px solid #20394b;background:#0a1925;border-radius:15px;overflow:hidden;min-width:0}.radar-panel-head{padding:15px 17px;border-bottom:1px solid #20394b;display:flex;align-items:center;justify-content:space-between;gap:12px}.radar-panel-head h2{font-size:12px;margin:0}.radar-panel-body{padding:17px}.radar-small{color:#92a9b9;font-size:10px;line-height:1.7}.radar-bar{height:11px;display:flex;overflow:hidden;border-radius:20px;background:#203546;margin:12px 0}.radar-source-list{display:grid;gap:10px}.radar-source{border:1px solid #20394b;background:#0b1b28;border-radius:12px;padding:13px}.radar-source-top{display:flex;justify-content:space-between;align-items:start;gap:10px}.radar-source strong{font-size:12px}.radar-source-link{color:#d8ff48;font-size:10px;text-decoration:none;white-space:nowrap}.radar-source p{font-size:10px;line-height:1.65;color:#9fb2c1;margin:8px 0}.radar-tag{display:inline-block;border:1px solid #294355;border-radius:20px;padding:5px 8px;font-size:9px;color:#b6c8d4;margin-top:4px}.radar-list{display:grid;gap:12px}.radar-list-item{display:grid;grid-template-columns:28px 1fr;gap:10px}.radar-num{width:27px;height:27px;border-radius:8px;display:grid;place-items:center;background:#1c3343;color:#d8ff48;font-size:11px;font-weight:800}.radar-list-item strong{font-size:11px}.radar-list-item p{font-size:10px;color:#9fb2c1;line-height:1.65;margin:5px 0 0}.radar-search{width:100%;border:1px solid #294355;border-radius:9px;padding:10px 12px;background:#06121c;color:#edf5fa;font:inherit;font-size:11px;margin-bottom:12px}.radar-foot{border-top:1px solid #203546;margin-top:24px;padding-top:17px;color:#8ea4b5;font-size:10px;line-height:1.7}.radar-foot a{color:#d8ff48}
        @media(max-width:900px){.radar-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.radar-grid{grid-template-columns:1fr}.radar-hero{grid-template-columns:1fr}.radar-live{justify-self:start}}
        @media(max-width:540px){.radar-shell{padding:0 14px 32px}.radar-top{padding:17px 0}.radar-hero{padding-top:25px}.radar-stats{gap:8px}.radar-card{padding:13px}.radar-card-detail{font-size:9px}.radar-panel-body{padding:13px}}
      `}</style>
      <div className="radar-wrap">
        <header className="radar-top">
          <Link href="/" className="radar-brand"><span className="radar-mark"><Activity size={20}/></span><span>PULSO CÍVICO <span style={{color:"#d8ff48"}}>/</span> RADAR</span></Link>
          <Link href="/" className="radar-back">← Voltar à plataforma</Link>
        </header>

        <section className="radar-hero">
          <div>
            <div className="radar-kicker">Transparência · Dados públicos · Investigação</div>
            <h1>Radar de Mercados<br/> &amp; Fluxos</h1>
            <p>Uma camada pública para acompanhar probabilidades em mercados de previsão, grandes operações e sinais de concentração — sempre separando fatos observáveis, inferências e perguntas ainda sem resposta.</p>
          </div>
          <span className="radar-live">SNAPSHOT · 24 OUT 2026</span>
        </section>

        <div className="radar-warning"><Info size={17} style={{flexShrink:0,marginTop:1}}/><span><strong>Importante:</strong> estes são dados públicos de terceiros capturados em horários diferentes, não um feed unificado em tempo real. Um alerta de “insider” ou “whale” é uma classificação do rastreador, não prova de crime, coordenação ou identidade. Os números mudam e devem ser conferidos na fonte.</span></div>

        <nav className="radar-tabs" aria-label="Seções do Radar">
          <button className={tab==="overview"?"active":""} onClick={()=>setTab("overview")}>Visão geral</button>
          <button className={tab==="hypotheses"?"active":""} onClick={()=>setTab("hypotheses")}>Hipóteses em teste</button>
          <button className={tab==="method"?"active":""} onClick={()=>setTab("method")}>Método e limites</button>
        </nav>

        {tab==="overview" && <>
          <section className="radar-stats">
            {signals.map((signal)=>{const Icon=signal.icon;return <article className="radar-card" key={signal.label}><div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><span className="radar-card-label">{signal.label}</span><Icon size={17} className={"radar-"+signal.tone}/></div><div className={"radar-card-value radar-"+signal.tone}>{signal.value}</div><div className="radar-card-detail">{signal.detail}</div></article>})}
          </section>
          <section className="radar-grid">
            <article className="radar-panel">
              <div className="radar-panel-head"><h2>Probabilidade de mercado observada</h2><span className="radar-tag">Não é pesquisa eleitoral</span></div>
              <div className="radar-panel-body">
                <div style={{display:"flex",justifyContent:"space-between",gap:10,fontSize:12}}><strong className="radar-blue">Flávio Bolsonaro <span>83,2%</span></strong><strong className="radar-red">Lula <span>16,8%</span></strong></div>
                <div className="radar-bar" role="img" aria-label="Probabilidade de mercado: Flávio Bolsonaro 83,2%, Lula 16,8%"><div style={{width:"83.2%",background:"#59c6ff"}}/><div style={{width:"16.8%",background:"#ff7d86"}}/></div>
                <p className="radar-small">Snapshot do Polywhaler consultado em 24/10/2026. O preço de um contrato é uma probabilidade implícita no mercado, não uma previsão garantida. Confira o contrato, as regras de resolução e o preço atual diretamente na plataforma.</p>
                <a className="radar-source-link" href="https://polymarket.com/elections/brazil" target="_blank" rel="noreferrer">Abrir mercado na Polymarket ↗</a>
                <div style={{height:1,background:"#20394b",margin:"17px 0"}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><div className="radar-card-label">Volume de whale trades</div><strong style={{fontSize:20,display:"block",marginTop:6}}>US$ 6,79 mi</strong><div className="radar-small">Volume agregado rastreado, não saldo líquido.</div></div>
                  <div><div className="radar-card-label">Compras classificadas como sinalizadas</div><strong style={{fontSize:20,display:"block",marginTop:6}}>22</strong><div className="radar-small">Critérios proprietários do rastreador; requerem verificação individual.</div></div>
                </div>
                <div style={{marginTop:14}}><a className="radar-source-link" href="https://polywhaler.com/events/brazil-presidential-election" target="_blank" rel="noreferrer">Auditar operações no Polywhaler ↗</a></div>
              </div>
            </article>
            <article className="radar-panel">
              <div className="radar-panel-head"><h2>Outras leituras do mercado</h2><span className="radar-tag">Snapshots distintos</span></div>
              <div className="radar-panel-body radar-list">
                <div className="radar-list-item"><span className="radar-num">A</span><div><strong>Veycast · fluxo e livro de ofertas</strong><p>Preço “Yes” reportado em 79,6¢, volume em 24h de US$ 1,01 mi, liquidez de US$ 873,1 mil e open interest de US$ 8,46 mi. A amostra recente cobria 65 negociações de um conjunto limitado de trades, não o fluxo total.</p><a className="radar-source-link" href="https://www.veycast.fun/brazil-presidential-election" target="_blank" rel="noreferrer">Ver snapshot e metodologia ↗</a></div></div>
                <div className="radar-list-item"><span className="radar-num">B</span><div><strong>Cohven · coorte de carteiras</strong><p>Atualização de 22/10: 19 de 43 carteiras monitoradas tinham posições no evento; notional reportado de US$ 1,64 mi em sete resultados. É uma coorte selecionada, não todos os investidores.</p><a className="radar-source-link" href="https://cohven.com/polymarket/brazil-presidential-election" target="_blank" rel="noreferrer">Examinar posições reconstruídas ↗</a></div></div>
                <div className="radar-list-item"><span className="radar-num">C</span><div><strong>PolymarketScan · catálogo de contratos</strong><p>Agrega mercados relacionados e apresenta volume e liquidez por contrato. Não some volumes de contratos diferentes sem verificar sobreposição e unidade de medida.</p><a className="radar-source-link" href="https://polymarketscan.org/event/brazil-presidential-election" target="_blank" rel="noreferrer">Abrir catálogo de mercados ↗</a></div></div>
              </div>
            </article>
          </section>
        </>}

        {tab==="hypotheses" && <section className="radar-grid">
          <article className="radar-panel"><div className="radar-panel-head"><h2>Hipóteses a testar</h2><span className="radar-tag">Não são conclusões</span></div><div className="radar-panel-body radar-list">
            <div className="radar-list-item"><span className="radar-num">H1</span><div><strong>Informação diferente das pesquisas</strong><p>Testar se movimentos de preço precedem ou seguem notícias e novas pesquisas. Precisamos de séries temporais alinhadas e arquivos históricos.</p><span className="radar-tag">Evidência atual: insuficiente</span></div></div>
            <div className="radar-list-item"><span className="radar-num">H2</span><div><strong>Concentração de capital</strong><p>Medir participação das maiores ordens e carteiras, liquidez e impacto de preço. Grande operação, isoladamente, não prova manipulação.</p><span className="radar-tag">Evidência atual: parcial</span></div></div>
            <div className="radar-list-item"><span className="radar-num">H3</span><div><strong>Carteiras coordenadas</strong><p>Procurar padrões temporais e transferências comuns entre endereços. Um mesmo intermediário ou contrato compartilhado pode ter explicações legítimas.</p><span className="radar-tag">Evidência atual: não verificada</span></div></div>
            <div className="radar-list-item"><span className="radar-num">H4</span><div><strong>Amplificação de narrativa</strong><p>Comparar preços, cobertura jornalística e posts públicos para avaliar a sequência temporal, sem presumir causalidade.</p><span className="radar-tag">Evidência atual: em aberto</span></div></div>
          </div></article>
          <article className="radar-panel"><div className="radar-panel-head"><h2>Critério de publicação</h2></div><div className="radar-panel-body radar-list">
            <div className="radar-list-item"><span className="radar-num">1</span><div><strong>Observado</strong><p>Valor diretamente exposto pela fonte ou transação pública reproduzível.</p></div></div>
            <div className="radar-list-item"><span className="radar-num">2</span><div><strong>Inferência</strong><p>Interpretação compatível com os dados, acompanhada de explicações alternativas.</p></div></div>
            <div className="radar-list-item"><span className="radar-num">3</span><div><strong>Corroborado</strong><p>Conclusão apoiada por fontes independentes e metodologia documentada.</p></div></div>
            <div className="radar-list-item"><span className="radar-num">4</span><div><strong>Não conhecido</strong><p>Identidade, origem econômica ou beneficiário não podem ser inferidos apenas de um endereço público.</p></div></div>
          </div></article>
        </section>}

        {tab==="method" && <section className="radar-grid">
          <article className="radar-panel"><div className="radar-panel-head"><h2>Fontes e limites</h2><span className="radar-tag">{sources.length} fontes externas</span></div><div className="radar-panel-body">
            <input className="radar-search" aria-label="Filtrar fontes" placeholder="Filtrar por nome, tipo ou observação…" value={query} onChange={(event)=>setQuery(event.target.value)}/>
            <div className="radar-source-list">{filteredSources.map((source)=><div className="radar-source" key={source.name}><div className="radar-source-top"><div><strong>{source.name}</strong><div className="radar-small">{source.type}</div></div><a className="radar-source-link" href={source.url} target="_blank" rel="noreferrer">Abrir fonte ↗</a></div><span className="radar-tag">{source.updated}</span><p>{source.note}</p></div>)}</div>
          </div></article>
          <article className="radar-panel"><div className="radar-panel-head"><h2>Como ler os números</h2><ShieldCheck size={17} color="#d8ff48"/></div><div className="radar-panel-body radar-list">
            <div className="radar-list-item"><span className="radar-num"><Eye size={14}/></span><div><strong>Probabilidade não é intenção de voto</strong><p>O mercado precifica um contrato sobre um evento; pesquisa entrevista uma amostra de pessoas.</p></div></div>
            <div className="radar-list-item"><span className="radar-num"><Wallet size={14}/></span><div><strong>Volume não é capital novo</strong><p>Volume acumulado pode contar muitas trocas do mesmo capital. Notional, liquidez e open interest medem coisas diferentes.</p></div></div>
            <div className="radar-list-item"><span className="radar-num"><GitBranch size={14}/></span><div><strong>Carteira não é identidade</strong><p>Endereço público ajuda a seguir transações, mas não revela automaticamente pessoa, empresa, país ou fonte econômica original.</p></div></div>
            <div className="radar-list-item"><span className="radar-num"><FileSearch size={14}/></span><div><strong>Snapshot não é feed ao vivo</strong><p>Esta página usa capturas consultadas em horários específicos. A atualização automática exige ingestão, armazenamento e monitoramento próprios.</p></div></div>
          </div></article>
        </section>}

        <footer className="radar-foot"><strong style={{color:"#eaf2f7"}}>Pulso Cívico · Radar de Mercados &amp; Fluxos</strong><br/>Painel público de pesquisa exploratória. Dados atribuídos às fontes externas e com horários de captura diferentes. Alertas de terceiros não são acusações nem prova de irregularidade. Nenhuma identidade real é atribuída a carteiras sem comprovação independente. Esta versão é um protótipo editorial, não uma integração automática em tempo real. <br/><a href="https://polymarket.com/elections/brazil" target="_blank" rel="noreferrer">Polymarket</a> · <a href="https://polywhaler.com/events/brazil-presidential-election" target="_blank" rel="noreferrer">Polywhaler</a> · <a href="https://cohven.com/polymarket/brazil-presidential-election" target="_blank" rel="noreferrer">Cohven</a> · <a href="https://www.veycast.fun/brazil-presidential-election" target="_blank" rel="noreferrer">Veycast</a></footer>
      </div>
    </main>
  );
}
