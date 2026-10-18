"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Eye,
  Flame,
  HeartHandshake,
  Info,
  LockKeyhole,
  Menu,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Vote,
  X,
  Zap,
} from "lucide-react";

const missions = [
  {
    tag: "MISSÃO 01 · COMUNIDADE",
    title: "O que você quer acompanhar primeiro?",
    description:
      "Ajude a priorizar as ferramentas que tornam a informação eleitoral mais acessível.",
    options: [
      { label: "Evolução das pesquisas", detail: "Acompanhar tendências ao longo do tempo", icon: BarChart3 },
      { label: "Comparar institutos", detail: "Entender métodos e diferenças", icon: Eye },
      { label: "Meu estado no contexto nacional", detail: "Explorar recortes territoriais", icon: Compass },
      { label: "Apuração em tempo real", detail: "Acompanhar dados oficiais no dia da votação", icon: Radio },
    ],
  },
  {
    tag: "MISSÃO 02 · TRANSPARÊNCIA",
    title: "O que não pode faltar em uma pesquisa?",
    description:
      "Transparência também é saber como um dado foi produzido e quais são seus limites.",
    options: [
      { label: "Metodologia acessível", detail: "Como a pesquisa foi realizada", icon: CircleHelp },
      { label: "Fonte verificável", detail: "De onde veio a informação", icon: ShieldCheck },
      { label: "Margem de erro explicada", detail: "Como interpretar a incerteza", icon: BarChart3 },
      { label: "Histórico de atualizações", detail: "Quando e o que mudou", icon: Radio },
    ],
  },
  {
    tag: "MISSÃO 03 · APRENDIZADO",
    title: "Uma consulta aberta representa todo o eleitorado?",
    description:
      "Uma pergunta rápida para praticar leitura crítica de dados cívicos.",
    options: [
      { label: "Sim, sempre", detail: "Qualquer pessoa pode responder", icon: Vote },
      { label: "Não necessariamente", detail: "Participantes voluntários não formam automaticamente uma amostra representativa", icon: HeartHandshake },
      { label: "Só se tiver muitas respostas", detail: "O tamanho sozinho resolve tudo", icon: BarChart3 },
    ],
    correct: 1,
  },
];

const demoBars = [
  { label: "Pesquisas ao longo do tempo", value: 38, color: "mint" },
  { label: "Comparação de institutos", value: 27, color: "violet" },
  { label: "Apuração oficial", value: 22, color: "amber" },
  { label: "Transparência metodológica", value: 13, color: "blue" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"participar" | "resultados">("participar");
  const [missionIndex, setMissionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const mission = missions[missionIndex];
  const isComplete = completed.includes(missionIndex);
  const points = completed.length * 50;
  const progress = (completed.length / missions.length) * 100;
  const level = points >= 100 ? "Explorador cívico" : points >= 50 ? "Participante" : "Iniciante";

  const demoTotal = useMemo(() => demoBars.reduce((sum, item) => sum + item.value, 0), []);

  function submitAnswer() {
    if (selected === null || isComplete) return;
    setCompleted((previous) => [...previous, missionIndex]);
  }

  function nextMission() {
    setMissionIndex((current) => (current + 1) % missions.length);
    setSelected(null);
  }

  function resetDemo() {
    setMissionIndex(0);
    setSelected(null);
    setCompleted([]);
    setActiveTab("participar");
  }

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#" aria-label="Pulso Cívico, início" onClick={() => resetDemo()}>
          <span className="brand-mark"><Radio size={21} strokeWidth={2.4} /></span>
          <span className="brand-copy">
            <strong>PULSO<span>.</span></strong>
            <small>CÍVICO</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <button className={activeTab === "participar" ? "nav-link active" : "nav-link"} onClick={() => setActiveTab("participar")}>Participar</button>
          <button className={activeTab === "resultados" ? "nav-link active" : "nav-link"} onClick={() => setActiveTab("resultados")}>Explorar dados</button>
          <a className="nav-link" href="#sobre">Como funciona</a>
        </nav>
        <div className="topbar-actions">
          <span className="demo-pill"><span /> MODO DEMONSTRAÇÃO</span>
          <button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setShowMenu((value) => !value)}>{showMenu ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </header>

      {showMenu && (
        <nav className="mobile-nav" aria-label="Menu móvel">
          <button onClick={() => { setActiveTab("participar"); setShowMenu(false); }}>Participar</button>
          <button onClick={() => { setActiveTab("resultados"); setShowMenu(false); }}>Explorar dados</button>
          <a href="#sobre" onClick={() => setShowMenu(false)}>Como funciona</a>
        </nav>
      )}

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> PARTICIPAÇÃO CÍVICA, SEM RUÍDO</div>
          <h1>Sua voz.<br />Mais <span>contexto.</span></h1>
          <p>Um espaço para participar, aprender e entender como os dados cívicos são construídos. Sem torcida. Com transparência.</p>
          <div className="hero-actions">
            <button className="button-primary" onClick={() => { setActiveTab("participar"); document.getElementById("experience")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Participar agora <ArrowRight size={17} /></button>
            <button className="button-quiet" onClick={() => setShowInfo((value) => !value)}><Info size={16} /> Sobre esta experiência</button>
          </div>
          {showInfo && (
            <div className="inline-note"><Info size={17} /><p>Este protótipo é local e demonstrativo. Suas respostas não são enviadas nem armazenadas em um servidor. Os gráficos usam números ilustrativos.</p></div>
          )}
          <div className="hero-proof">
            <div className="proof-icon"><ShieldCheck size={17} /></div>
            <span><strong>Transparência por padrão</strong><small>Fonte, contexto e limites importam.</small></span>
          </div>
        </div>
        <div className="hero-art" aria-label="Ilustração abstrata de participação e dados">
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="orbit orbit-c" />
          <div className="orbit-core"><Radio size={38} /></div>
          <div className="float-card float-card-top"><span className="mini-dot mint-dot" /><span><strong>Participação</strong><small>Uma voz de cada vez</small></span><ArrowUpRight size={17} /></div>
          <div className="float-card float-card-bottom"><span className="float-symbol"><BarChart3 size={17} /></span><span><strong>Dados com contexto</strong><small>Entender antes de concluir</small></span><Sparkles size={16} /></div>
          <div className="orbit-caption">ESCUTAR <span>·</span> CONTEXTUALIZAR <span>·</span> APRENDER</div>
        </div>
      </section>

      <section className="stats-strip" aria-label="Resumo do progresso demonstrativo">
        <div className="stat-cell"><span className="stat-icon mint"><Zap size={17} /></span><span><small>SEUS PONTOS</small><strong>{points.toString().padStart(3, "0")} <em>XP</em></strong></span></div>
        <div className="stat-cell"><span className="stat-icon violet"><Trophy size={17} /></span><span><small>NÍVEL ATUAL</small><strong>{level}</strong></span></div>
        <div className="stat-cell progress-stat"><span className="stat-icon amber"><Flame size={17} /></span><span className="progress-copy"><small>MISSÕES CONCLUÍDAS</small><strong>{completed.length} <em>de {missions.length}</em></strong><span className="progress-track"><span style={{ width: progress + "%" }} /></span></span></div>
        <div className="stat-cell stat-badge"><BadgeCheck size={21} /><span><strong>Participação</strong><small>Voluntária e educativa</small></span></div>
      </section>

      <section id="experience" className="experience-section">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-line" /> SEU ESPAÇO CÍVICO</div><h2>Explore o <span>pulso.</span></h2></div>
          <div className="tab-switch" role="tablist" aria-label="Área do Pulso Cívico">
            <button role="tab" aria-selected={activeTab === "participar"} className={activeTab === "participar" ? "tab active" : "tab"} onClick={() => setActiveTab("participar")}><Vote size={16} /> Participar</button>
            <button role="tab" aria-selected={activeTab === "resultados"} className={activeTab === "resultados" ? "tab active" : "tab"} onClick={() => setActiveTab("resultados")}><BarChart3 size={16} /> Resultados</button>
          </div>
        </div>

        {activeTab === "participar" ? (
          <div className="experience-grid">
            <article className="mission-card">
              <div className="card-topline"><span className="mission-number">0{missionIndex + 1}</span><span className="mission-tag">{mission.tag}</span><span className="card-status"><span /> {isComplete ? "CONCLUÍDA" : "DISPONÍVEL"}</span></div>
              <div className="mission-content">
                <div className="mission-progress-label"><span>SEU CAMINHO</span><span>{missionIndex + 1} / {missions.length}</span></div>
                <div className="mission-steps">{missions.map((item, index) => <button key={item.tag} aria-label={"Ir para missão " + (index + 1)} className={(index === missionIndex ? "step current " : "") + (completed.includes(index) ? "step done" : "step")} onClick={() => { setMissionIndex(index); setSelected(null); }}><span>{completed.includes(index) ? <Check size={13} /> : index + 1}</span></button>)}</div>
                <h3>{mission.title}</h3>
                <p className="mission-description">{mission.description}</p>
                <div className="option-list">
                  {mission.options.map((option, index) => {
                    const OptionIcon = option.icon;
                    const chosen = selected === index;
                    return (
                      <button key={option.label} className={"option-card" + (chosen ? " selected" : "") + (isComplete && chosen ? " submitted" : "")} onClick={() => !isComplete && setSelected(index)} disabled={isComplete} aria-pressed={chosen}>
                        <span className="option-icon"><OptionIcon size={18} /></span>
                        <span className="option-copy"><strong>{option.label}</strong><small>{option.detail}</small></span>
                        <span className="option-check">{chosen ? <Check size={16} /> : <ChevronRight size={17} />}</span>
                      </button>
                    );
                  })}
                </div>
                {missionIndex === 2 && selected !== null && (
                  <div className="learning-note"><Sparkles size={17} /><p>{selected === mission.correct ? "Isso mesmo. O recrutamento voluntário não garante representatividade: o perfil de quem responde pode diferir do eleitorado." : "Pense em quem decide participar e em quem não chega a responder. O tamanho da amostra, sozinho, não elimina esse viés."}</p></div>
                )}
                <div className="mission-footer">
                  <span><LockKeyhole size={14} /> Sem envio ao servidor</span>
                  {!isComplete ? (
                    <button className="button-primary" disabled={selected === null} onClick={submitAnswer}>Confirmar <ArrowRight size={16} /></button>
                  ) : (
                    <button className="button-primary" onClick={nextMission}>Próxima missão <ArrowRight size={16} /></button>
                  )}
                </div>
              </div>
            </article>

            <aside className="side-column">
              <article className="reward-card">
                <div className="reward-glow" />
                <div className="reward-top"><span className="reward-icon"><Trophy size={20} /></span><span className="reward-label">SUA JORNADA</span><span className="reward-level">LV. {Math.min(1 + Math.floor(points / 100), 3).toString().padStart(2, "0")}</span></div>
                <h3>Conhecimento<br />também é poder.</h3>
                <p>Complete missões e desbloqueie conquistas por participar e aprender.</p>
                <div className="reward-meter"><span style={{ width: Math.min((points % 100) || (points === 0 ? 0 : 100), 100) + "%" }} /></div>
                <div className="reward-meter-caption"><span>{points % 100} / 100 XP para o próximo nível</span><Zap size={14} /></div>
                <div className="reward-divider" />
                <div className="achievement-row"><span className={completed.length >= 1 ? "achievement-icon unlocked" : "achievement-icon"}><HeartHandshake size={17} /></span><span><strong>Primeira participação</strong><small>{completed.length >= 1 ? "Conquista desbloqueada" : "Conclua uma missão"}</small></span>{completed.length >= 1 && <Check size={16} className="achievement-check" />}</div>
                <div className="achievement-row"><span className={completed.length >= 3 ? "achievement-icon unlocked" : "achievement-icon"}><Sparkles size={17} /></span><span><strong>Olhar crítico</strong><small>{completed.length >= 3 ? "Conquista desbloqueada" : "Conclua as três missões"}</small></span>{completed.length >= 3 && <Check size={16} className="achievement-check" />}</div>
              </article>
              <article className="principle-card"><span className="principle-icon"><ShieldCheck size={19} /></span><div><strong>Neutralidade é um compromisso.</strong><p>Pontos são por participação e aprendizado — nunca pela opinião escolhida.</p><button onClick={() => setShowInfo(true)}>Conheça os princípios <ArrowUpRight size={14} /></button></div></article>
              <button className="reset-button" onClick={resetDemo}><RotateCcw size={14} /> Reiniciar demonstração</button>
            </aside>
          </div>
        ) : (
          <div className="results-grid">
            <article className="results-card">
              <div className="results-title-row"><div><span className="mission-tag">PAINEL ILUSTRATIVO</span><h3>O que a comunidade quer explorar?</h3></div><span className="demo-stamp"><span /> DADOS FICTÍCIOS</span></div>
              <p className="results-subtitle">Exemplo visual de como uma distribuição de respostas poderá ser apresentada quando houver coleta real.</p>
              <div className="demo-warning"><Info size={17} /><span>Estes valores são fictícios, não correspondem a votos ou a uma pesquisa real.</span></div>
              <div className="bar-list">{demoBars.map((bar) => <div className="bar-item" key={bar.label}><div className="bar-label"><span>{bar.label}</span><strong>{bar.value}%</strong></div><div className="bar-track"><span className={bar.color} style={{ width: (bar.value / demoTotal * 100) + "%" }} /></div></div>)}</div>
              <div className="results-foot"><span><Radio size={15} /> Atualização: demonstração estática</span><span>{demoTotal} pontos ilustrativos</span></div>
            </article>
            <aside className="results-aside"><span className="results-aside-icon"><ShieldCheck size={23} /></span><h3>Dados precisam de contexto.</h3><p>Uma consulta aberta reúne pessoas que decidiram participar. Isso não torna automaticamente seus resultados representativos de todo o eleitorado.</p><div className="aside-rule" /><div className="aside-stat"><strong>0</strong><span>respostas reais coletadas por este protótipo</span></div><button className="button-secondary" onClick={() => setActiveTab("participar")}>Responder missão <ArrowRight size={15} /></button></aside>
          </div>
        )}
      </section>

      <section className="principles-section" id="sobre">
        <div className="principles-heading"><div className="eyebrow"><span className="eyebrow-line" /> NOSSO CONTRATO COM VOCÊ</div><h2>Participar é livre.<br /><span>Entender é essencial.</span></h2></div>
        <div className="principles-list">
          <div className="principle-item"><span>01</span><div><strong>Você escolhe participar</strong><p>Nenhuma resposta é obrigatória. A experiência demonstrativa não envia dados.</p></div><ArrowUpRight size={17} /></div>
          <div className="principle-item"><span>02</span><div><strong>Opinião não é moeda</strong><p>Não há recompensa por apoiar candidatos, partidos ou posições específicas.</p></div><ArrowUpRight size={17} /></div>
          <div className="principle-item"><span>03</span><div><strong>Contexto antes da conclusão</strong><p>Fontes, metodologia, limitações e atualização devem acompanhar os dados reais.</p></div><ArrowUpRight size={17} /></div>
        </div>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#" onClick={resetDemo}><span className="brand-mark"><Radio size={18} /></span><span className="brand-copy"><strong>PULSO<span>.</span></strong><small>CÍVICO</small></span></a>
        <p>Uma iniciativa de participação cívica com transparência.</p>
        <div className="footer-right"><span><span className="footer-dot" /> PROTÓTIPO INTERATIVO</span><span>© 2026 PULSO CÍVICO</span></div>
      </footer>
      <div className="disclaimer"><Info size={14} /><span>Protótipo demonstrativo. Não é pesquisa eleitoral registrada, não coleta respostas reais e não representa a opinião do eleitorado brasileiro.</span></div>
    </main>
  );
}
