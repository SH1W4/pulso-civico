"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, BarChart3, Check, ChevronDown, Compass, Heart, Info, MapPin, Menu, MessageCircle, ShieldCheck, Users, Vote, X } from "lucide-react";

type March = "lula" | "flavio";
const issues = [
  { name: "Economia e renda", icon: "↗", desc: "Emprego, preços e poder de compra" },
  { name: "Saúde pública", icon: "+", desc: "Acesso, prevenção e atendimento" },
  { name: "Educação", icon: "∑", desc: "Escolas, universidades e oportunidades" },
  { name: "Segurança", icon: "◇", desc: "Prevenção, investigação e proteção" },
  { name: "Meio ambiente", icon: "◌", desc: "Clima, energia e conservação" },
  { name: "Democracia e instituições", icon: "§", desc: "Direitos, transparência e participação" },
];

export default function PracaPublicaPage() {
  const [joined, setJoined] = useState<March | null>(null);
  const [tab, setTab] = useState<"passeatas" | "pautas" | "sobre">("passeatas");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [region, setRegion] = useState("Brasil");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const participationCount = joined ? 1 : 0;
  const regionalLabel = useMemo(() => region === "Brasil" ? "Visão nacional" : "Filtro: " + region, [region]);

  const colors = {
    bg: "#06111b", panel: "#0b1b29", line: "#1b3445", text: "#f1f6fa",
    muted: "#91a7b7", lime: "#d7ff3f", red: "#ff4e58", blue: "#43b9ff"
  };

  function submitMessage() {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessages((prev) => [trimmed, ...prev].slice(0, 8));
    setMessage("");
  }

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <style>{`
        *{box-sizing:border-box} button,input,select{font:inherit} button{cursor:pointer}
        .pc-wrap{max-width:1500px;margin:0 auto;padding:0 28px}
        .pc-header{display:flex;align-items:center;gap:24px;min-height:76px;border-bottom:1px solid ${colors.line};position:relative}
        .pc-brand{display:flex;align-items:center;gap:11px;color:#fff;text-decoration:none;min-width:210px}
        .pc-logo{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#d7ff3f;color:#08131d}
        .pc-brand strong{display:block;font-size:18px;letter-spacing:-.04em}.pc-brand small{display:block;color:${colors.muted};font-size:10px;letter-spacing:.14em;margin-top:3px}
        .pc-nav{display:flex;align-items:center;gap:5px;flex:1}.pc-nav button{border:0;background:transparent;color:#b6c6d2;padding:11px 13px;border-radius:9px;font-size:12px}.pc-nav button.active,.pc-nav button:hover{background:#152b3a;color:${colors.lime}}
        .pc-badge{font-size:10px;color:${colors.lime};border:1px solid #42552b;padding:8px 10px;border-radius:20px;white-space:nowrap}
        .pc-hero{padding:36px 0 24px;display:grid;grid-template-columns:1.05fr .95fr;gap:24px;align-items:stretch}
        .pc-eyebrow{color:${colors.lime};font-size:10px;letter-spacing:.16em;font-weight:700;display:flex;align-items:center;gap:9px}.pc-eyebrow:before{content:"";width:22px;height:2px;background:${colors.lime}}
        .pc-hero h1{font-size:clamp(42px,5vw,72px);letter-spacing:-.065em;line-height:.99;margin:20px 0 16px;max-width:680px}.pc-hero h1 span{color:${colors.lime}}
        .pc-hero p{color:#a6bac8;line-height:1.75;font-size:14px;max-width:600px}
        .pc-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}
        .pc-primary,.pc-secondary{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 16px;border-radius:10px;font-size:12px;font-weight:700;border:1px solid transparent}
        .pc-primary{background:${colors.lime};color:#101a0b}.pc-secondary{background:#102433;color:#eaf3f9;border-color:#254052}
        .pc-visual{border:1px solid #1b3c50;border-radius:20px;padding:18px;background:radial-gradient(ellipse at 50% 0%,#16405a 0%,#0a1a27 58%);min-height:280px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;position:relative}
        .pc-visual:before{content:"";position:absolute;inset:0;background-image:linear-gradient(#28435733 1px,transparent 1px),linear-gradient(90deg,#28435733 1px,transparent 1px);background-size:24px 24px;mask-image:linear-gradient(to bottom,black,transparent)}
        .pc-visual-top,.pc-visual-bottom{position:relative;z-index:1;display:flex;justify-content:space-between;gap:12px;align-items:center}.pc-chip{border:1px solid #315064;border-radius:20px;padding:8px 10px;font-size:10px;color:#d5e4ed;background:#071722aa}
        .pc-crowd{display:flex;justify-content:center;align-items:end;gap:5px;min-height:135px;position:relative;z-index:1}
        .pc-person{width:clamp(17px,3vw,31px);height:clamp(35px,5vw,62px);border-radius:9px 9px 4px 4px;background:linear-gradient(180deg,#31576c,#132a3b);border:1px solid #477085;position:relative;box-shadow:0 0 20px #43b9ff12}
        .pc-person:before{content:"";position:absolute;width:45%;aspect-ratio:1;border-radius:50%;background:#e1b995;top:-9px;left:28%;border:2px solid #0b1b29}
        .pc-person:nth-child(3n){height:48px;background:linear-gradient(180deg,#a4c64a,#344a2c)}.pc-person:nth-child(4n){height:58px;background:linear-gradient(180deg,#d06b66,#592f37)}.pc-person:nth-child(2n){height:40px}
        .pc-vs{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;margin-top:14px;position:relative;z-index:1}.pc-side{padding:12px;border:1px solid #2b4557;border-radius:12px;background:#071722cc}.pc-side strong{font-size:13px;display:block}.pc-side small{font-size:10px;color:${colors.muted};display:block;margin-top:5px}.pc-vs-mark{font-size:10px;color:#668092}
        .pc-grid{display:grid;grid-template-columns:1.1fr .9fr 1fr;gap:15px;margin:8px 0 24px}
        .pc-panel{border:1px solid ${colors.line};background:linear-gradient(150deg,#0d2030,#081722);border-radius:16px;overflow:hidden;min-width:0}
        .pc-panel-head{padding:16px 17px;border-bottom:1px solid ${colors.line};display:flex;justify-content:space-between;gap:10px;align-items:center}.pc-panel-head h2{font-size:12px;margin:0;letter-spacing:.03em}.pc-panel-body{padding:16px}
        .pc-region{width:100%;background:#102535;color:#e5eef5;border:1px solid #2a4659;border-radius:8px;padding:10px;font-size:11px}
        .pc-region-note{font-size:10px;color:${colors.muted};margin:11px 0 15px}
        .pc-issue{display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #193243}.pc-issue:last-child{border-bottom:0}.pc-issue-icon{width:31px;height:31px;display:grid;place-items:center;border-radius:9px;background:#172f3d;color:${colors.lime};font-weight:700}.pc-issue strong{font-size:11px;display:block}.pc-issue small{font-size:10px;color:${colors.muted};display:block;margin-top:4px}.pc-issue button{background:transparent;color:#a8bbc8;border:1px solid #2c4656;border-radius:8px;padding:7px 8px;font-size:10px}.pc-issue button.selected{color:#07111a;background:${colors.lime};border-color:${colors.lime}}
        .pc-steps{display:grid;gap:15px}.pc-step{display:grid;grid-template-columns:32px 1fr;gap:10px;align-items:start}.pc-step-num{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#203b4d;color:${colors.lime};font-size:12px;font-weight:700}.pc-step strong{font-size:11px}.pc-step p{margin:5px 0 0;font-size:10px;line-height:1.6;color:${colors.muted}}
        .pc-bottom{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:30px}.pc-feed{display:grid;gap:10px}.pc-feed-item{display:flex;gap:10px;align-items:flex-start;padding:11px;border:1px solid #1c3647;border-radius:10px;background:#0b1a26}.pc-avatar{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:#213c4d;color:${colors.lime};flex-shrink:0}.pc-feed-item strong{font-size:11px}.pc-feed-item p{font-size:10px;line-height:1.5;color:${colors.muted};margin:4px 0 0;overflow-wrap:anywhere}
        .pc-form{display:flex;gap:8px;margin-top:12px}.pc-form input{min-width:0;flex:1;background:#06131d;border:1px solid #284356;color:white;border-radius:9px;padding:11px;font-size:11px}.pc-form button{border:0;border-radius:9px;background:${colors.lime};color:#07111a;padding:0 12px}
        .pc-notice{display:flex;gap:10px;align-items:flex-start;padding:14px 0 25px;color:${colors.muted};font-size:10px;line-height:1.6}.pc-notice svg{color:${colors.lime};flex-shrink:0}
        .pc-menu{display:none;background:#102433;color:white;border:1px solid #2c4656;border-radius:8px;padding:8px}
        @media(max-width:1000px){.pc-wrap{padding:0 18px}.pc-header{gap:12px}.pc-brand{min-width:auto}.pc-nav button{padding:10px 8px}.pc-badge{display:none}.pc-grid{grid-template-columns:1fr 1fr}.pc-grid .pc-panel:last-child{grid-column:1/-1}}
        @media(max-width:680px){.pc-wrap{padding:0 14px}.pc-header{min-height:66px;justify-content:space-between}.pc-nav{display:none;position:absolute;top:65px;left:0;right:0;z-index:10;background:#0b1b29;border:1px solid #244154;border-radius:12px;padding:8px;flex-direction:column;align-items:stretch}.pc-nav.open{display:flex}.pc-nav button{text-align:left}.pc-menu{display:block}.pc-hero{grid-template-columns:1fr;padding-top:25px;gap:17px}.pc-hero h1{font-size:48px}.pc-visual{min-height:245px}.pc-grid,.pc-bottom{grid-template-columns:1fr}.pc-grid .pc-panel:last-child{grid-column:auto}.pc-vs{grid-template-columns:1fr auto 1fr}.pc-side{padding:9px}.pc-side strong{font-size:11px}.pc-panel-head{padding:14px}.pc-panel-body{padding:14px}.pc-notice{padding-bottom:18px}}
        @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
      `}</style>
      <div className="pc-wrap">
        <header className="pc-header">
          <a className="pc-brand" href="/"><span className="pc-logo"><Activity size={24}/></span><span><strong>Pulso Cívico</strong><small>PESSOAS. DADOS. DEMOCRACIA.</small></span></a>
          <nav className={"pc-nav" + (showMenu ? " open" : "")} aria-label="Navegação principal">
            <button className={tab === "passeatas" ? "active" : ""} onClick={() => setTab("passeatas")}><Users size={14} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>Passeatas</button>
            <button className={tab === "pautas" ? "active" : ""} onClick={() => setTab("pautas")}><Vote size={14} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>Pautas</button>
            <button className={tab === "sobre" ? "active" : ""} onClick={() => setTab("sobre")}><Info size={14} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>Como funciona</button>
          </nav>
          <span className="pc-badge">PROTÓTIPO INTERATIVO</span>
          <button className="pc-menu" aria-label={showMenu ? "Fechar menu" : "Abrir menu"} onClick={() => setShowMenu(!showMenu)}>{showMenu ? <X size={18}/> : <Menu size={18}/>}</button>
        </header>

        <section className="pc-hero">
          <div>
            <div className="pc-eyebrow">PRAÇA PÚBLICA DIGITAL</div>
            <h1>O país fala.<br/><span>Você participa.</span></h1>
            <p>Uma praça digital para visualizar mobilização cívica, discutir prioridades e explorar informações verificáveis. Participação voluntária não é pesquisa eleitoral.</p>
            <div className="pc-actions">
              <button className="pc-primary" onClick={() => document.getElementById("pc-passeatas")?.scrollIntoView({behavior:"smooth"})}>Explorar passeatas <ArrowRight size={16}/></button>
              <button className="pc-secondary" onClick={() => setTab("pautas")}>Ver pautas <Compass size={15}/></button>
            </div>
          </div>
          <div className="pc-visual" aria-label="Visualização ilustrativa de uma multidão digital">
            <div className="pc-visual-top"><span className="pc-chip"><MapPin size={12} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/>BRASIL · VISÃO CONCEITUAL</span><span className="pc-chip">AVATARES DEMONSTRATIVOS</span></div>
            <div className="pc-crowd" aria-hidden="true">{Array.from({length:19},(_,i)=><span className="pc-person" key={i}/>)}</div>
            <div className="pc-vs">
              <div className="pc-side"><strong style={{color:colors.red}}>Lula</strong><small>Passeata virtual · dados reais não conectados</small></div>
              <span className="pc-vs-mark">VISÃO NEUTRA</span>
              <div className="pc-side" style={{textAlign:"right"}}><strong style={{color:colors.blue}}>Flávio Bolsonaro</strong><small>Passeata virtual · dados reais não conectados</small></div>
            </div>
          </div>
        </section>

        <section id="pc-passeatas" className="pc-grid">
          <article className="pc-panel">
            <div className="pc-panel-head"><h2><Users size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>PASSEATAS VIRTUAIS</h2><span style={{fontSize:10,color:colors.muted}}>DEMO</span></div>
            <div className="pc-panel-body">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{padding:13,border:"1px solid #513038",borderRadius:12,background:"#21151d"}}>
                  <div style={{fontSize:10,color:"#ff9298",letterSpacing:".08em"}}>CANDIDATURA</div><h3 style={{fontSize:20,margin:"9px 0 5px"}}>Lula</h3><p style={{fontSize:10,color:colors.muted,lineHeight:1.5,minHeight:30,margin:"0 0 13px"}}>Entre na representação virtual desta candidatura.</p>
                  <button className="pc-primary" style={{width:"100%",padding:"10px 7px",fontSize:10,background:joined==="lula"? "#253a2a":colors.red,color:joined==="lula"?"#dcffd0":"white"}} onClick={()=>setJoined(joined==="lula"?null:"lula")}>{joined==="lula"?<><Check size={13}/> Você entrou</>:<><Users size={13}/> Participar</>}</button>
                </div>
                <div style={{padding:13,border:"1px solid #244c67",borderRadius:12,background:"#101e2a"}}>
                  <div style={{fontSize:10,color:"#83d6ff",letterSpacing:".08em"}}>CANDIDATURA</div><h3 style={{fontSize:20,margin:"9px 0 5px"}}>Flávio Bolsonaro</h3><p style={{fontSize:10,color:colors.muted,lineHeight:1.5,minHeight:30,margin:"0 0 13px"}}>Entre na representação virtual desta candidatura.</p>
                  <button className="pc-primary" style={{width:"100%",padding:"10px 7px",fontSize:10,background:joined==="flavio"?"#253a2a":colors.blue,color:joined==="flavio"?"#dcffd0":"#06111b"}} onClick={()=>setJoined(joined==="flavio"?null:"flavio")}>{joined==="flavio"?<><Check size={13}/> Você entrou</>:<><Users size={13}/> Participar</>}</button>
                </div>
              </div>
              <div style={{display:"flex",gap:9,alignItems:"flex-start",marginTop:13,color:colors.muted,fontSize:10,lineHeight:1.6}}><Info size={15} style={{flexShrink:0,color:colors.lime}}/>Sua escolha fica apenas nesta sessão de demonstração. Não é enviada nem salva no servidor; não conta como intenção de voto.</div>
              <div style={{borderTop:"1px solid #1b3445",marginTop:14,paddingTop:13,display:"flex",justifyContent:"space-between",fontSize:10,color:colors.muted}}><span><Users size={13} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/>Sua participação local</span><strong style={{color:colors.text}}>{participationCount}</strong></div>
            </div>
          </article>

          <article className="pc-panel">
            <div className="pc-panel-head"><h2><Heart size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>PAUTAS EM DESTAQUE</h2><span style={{fontSize:10,color:colors.muted}}>{selectedIssues.length} selecionadas</span></div>
            <div className="pc-panel-body">
              {issues.map((issue)=>{const active=selectedIssues.includes(issue.name);return <div className="pc-issue" key={issue.name}><span className="pc-issue-icon">{issue.icon}</span><span><strong>{issue.name}</strong><small>{issue.desc}</small></span><button className={active?"selected":""} aria-pressed={active} onClick={()=>setSelectedIssues(old=>active?old.filter(x=>x!==issue.name):[...old,issue.name])}>{active?"Selecionada":"Selecionar"}</button></div>})}
              <p style={{fontSize:10,color:colors.muted,lineHeight:1.6,margin:"13px 0 0"}}>Seleções locais: ainda não representam uma amostra da população.</p>
            </div>
          </article>

          <article className="pc-panel">
            <div className="pc-panel-head"><h2><Compass size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>EXPLORAR TERRITÓRIO</h2><MapPin size={15} color={colors.lime}/></div>
            <div className="pc-panel-body">
              <label htmlFor="pc-region" style={{fontSize:10,color:colors.muted,display:"block",marginBottom:8}}>REGIÃO DE INTERESSE</label>
              <select id="pc-region" className="pc-region" value={region} onChange={e=>setRegion(e.target.value)}><option>Brasil</option><option>Norte</option><option>Nordeste</option><option>Centro-Oeste</option><option>Sudeste</option><option>Sul</option><option>Bahia</option><option>Salvador</option></select>
              <p className="pc-region-note">{regionalLabel}. O filtro organiza a experiência; não há geolocalização nem contagem territorial real conectada.</p>
              <div style={{border:"1px solid #203b4c",borderRadius:12,background:"radial-gradient(ellipse at center,#143448,#091823)",padding:17,minHeight:145,display:"grid",placeItems:"center",textAlign:"center"}}>
                <div><MapPin size={29} color={colors.lime}/><p style={{fontSize:11,fontWeight:700,margin:"8px 0 4px"}}>{region==="Brasil"?"Brasil":region}</p><small style={{fontSize:10,color:colors.muted}}>Camada territorial preparada para dados verificados</small></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:10,color:colors.muted,marginTop:12}}><ShieldCheck size={14} color={colors.lime}/>Sem rastreamento de localização</div>
            </div>
          </article>
        </section>

        <section className="pc-bottom">
          <article className="pc-panel">
            <div className="pc-panel-head"><h2><MessageCircle size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>PRAÇA DE IDEIAS</h2><span style={{fontSize:10,color:colors.muted}}>LOCAL</span></div>
            <div className="pc-panel-body">
              <p style={{fontSize:11,color:colors.muted,lineHeight:1.65,margin:"0 0 12px"}}>Registre uma proposta ou pergunta para discussão. Nesta versão, o conteúdo fica apenas na memória da página.</p>
              <form className="pc-form" onSubmit={e=>{e.preventDefault();submitMessage()}}><input value={message} onChange={e=>setMessage(e.target.value)} maxLength={180} placeholder="Qual proposta você quer discutir?" aria-label="Sua proposta"/><button type="submit" aria-label="Adicionar proposta"><ArrowRight size={16}/></button></form>
              <div className="pc-feed" style={{marginTop:12}}>{messages.length?messages.map((item,i)=><div className="pc-feed-item" key={i}><span className="pc-avatar"><MessageCircle size={15}/></span><div><strong>Proposta da sessão</strong><p>{item}</p></div></div>):<div className="pc-feed-item"><span className="pc-avatar"><Info size={15}/></span><div><strong>Comece uma conversa</strong><p>Seja respeitoso, indique fontes e critique ideias — não pessoas.</p></div></div>}</div>
            </div>
          </article>
          <article className="pc-panel">
            <div className="pc-panel-head"><h2><ShieldCheck size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>REGRAS DE TRANSPARÊNCIA</h2></div>
            <div className="pc-panel-body pc-steps">
              <div className="pc-step"><span className="pc-step-num">1</span><div><strong>Mobilização não é intenção de voto</strong><p>Participar de uma passeata virtual não equivale a declarar voto nem representa o eleitorado.</p></div></div>
              <div className="pc-step"><span className="pc-step-num">2</span><div><strong>Sem números inventados</strong><p>Contagens, mapas e atividade pública só serão exibidos quando houver dados verificáveis e origem identificada.</p></div></div>
              <div className="pc-step"><span className="pc-step-num">3</span><div><strong>Privacidade por padrão</strong><p>Este protótipo não transmite sua escolha, localização ou proposta para um servidor.</p></div></div>
              <div className="pc-step"><span className="pc-step-num">4</span><div><strong>Fontes separadas</strong><p>Pesquisas publicadas, consultas comunitárias e dados oficiais serão camadas distintas.</p></div></div>
            </div>
          </article>
        </section>
        <footer className="pc-notice"><ShieldCheck size={17}/><span><strong style={{color:"#dce8ee"}}>Pulso Cívico · protótipo interativo.</strong> Avatares e visualização são ilustrativos. Interações ficam no navegador durante esta sessão. Não há contagens públicas reais, coleta persistente, rastreamento ou integração eleitoral ativa.</span></footer>
      </div>
    </main>
  );
}
