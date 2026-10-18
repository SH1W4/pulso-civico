"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Check,
  ChevronRight,
  CircleDot,
  Code2,
  GitBranch,
  GitPullRequest,
  Gauge,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Vote,
  Zap,
} from "lucide-react";
import styles from "./control-center.module.css";

type Section = "overview" | "experience" | "roadmap" | "engineering";

const roadmap = [
  { id: "01", title: "Fundação documental", detail: "Escopo, arquitetura, privacidade e fluxo de contribuição", status: "Concluída", state: "done" },
  { id: "02", title: "PWA interativa", detail: "Primeira experiência responsiva, missões e demonstração", status: "Concluída", state: "done" },
  { id: "03", title: "API comunitária", detail: "Persistência PostgreSQL, validação e agregação protegida", status: "Em revisão", state: "review" },
  { id: "04", title: "Interface conectada", detail: "Consentimento, envio real, estados de erro e confirmação", status: "Próxima", state: "next" },
  { id: "05", title: "Fontes eleitorais", detail: "Proveniência, atualização e separação de dados oficiais", status: "Planejada", state: "next" },
];

const pullRequests = [
  { number: 1, title: "Fundação documental", branch: "feat/mvp-foundation", status: "Merged", color: "green", href: "https://github.com/SH1W4/pulso-civico/pull/1", checks: "Integrada" },
  { number: 2, title: "PWA interativa", branch: "feat/interactive-pwa-prototype", status: "Merged", color: "green", href: "https://github.com/SH1W4/pulso-civico/pull/2", checks: "CI verde" },
  { number: 3, title: "API comunitária", branch: "feat/community-feedback-backend", status: "Open", color: "amber", href: "https://github.com/SH1W4/pulso-civico/pull/3", checks: "CI verde · revisão pendente" },
];

const priorities = [
  { key: "trends", label: "Evolução das pesquisas", detail: "Ver mudanças ao longo do tempo" },
  { key: "methods", label: "Metodologia dos institutos", detail: "Entender como o dado foi produzido" },
  { key: "sources", label: "Fontes verificáveis", detail: "Abrir origem e data de cada número" },
  { key: "official", label: "Apuração oficial", detail: "Separada dos dados de pesquisas" },
];

export default function ControlCenterPage() {
  const [section, setSection] = useState<Section>("overview");
  const [selectedPriority, setSelectedPriority] = useState("sources");
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [showArchitecture, setShowArchitecture] = useState(false);

  const sectionLabel = useMemo(() => ({
    overview: "Visão geral",
    experience: "Experiência",
    roadmap: "Roadmap",
    engineering: "Engenharia",
  }[section]), [section]);

  const chooseSection = (next: Section) => {
    setSection(next);
    setDemoSubmitted(false);
  };

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="/" aria-label="Pulso Cívico — página inicial">
          <span className={styles.brandMark}><Radio size={21} /></span>
          <span className={styles.brandName}>PULSO<span>.</span><small>CÍVICO / LAB</small></span>
        </a>
        <div className={styles.workspaceLabel}>WORKSPACE <span>v0.2</span></div>
        <nav className={styles.nav} aria-label="Navegação do centro de controle">
          <button className={section === "overview" ? styles.navActive : ""} onClick={() => chooseSection("overview")}><Gauge size={17} />Visão geral</button>
          <button className={section === "experience" ? styles.navActive : ""} onClick={() => chooseSection("experience")}><Vote size={17} />Experiência interativa<span className={styles.navDot} /></button>
          <button className={section === "roadmap" ? styles.navActive : ""} onClick={() => chooseSection("roadmap")}><Target size={17} />Roadmap</button>
          <button className={section === "engineering" ? styles.navActive : ""} onClick={() => chooseSection("engineering")}><GitBranch size={17} />Engenharia</button>
        </nav>
        <div className={styles.sidebarSpacer} />
        <div className={styles.sidebarSafety}>
          <span className={styles.safetyIcon}><ShieldCheck size={18} /></span>
          <strong>Integridade por padrão</strong>
          <p>Consulta voluntária, dados identificados e sem recompensa por preferência política.</p>
        </div>
        <a className={styles.repoLink} href="https://github.com/SH1W4/pulso-civico" target="_blank" rel="noreferrer"><Code2 size={16} /> Repositório no GitHub <ArrowUpRight size={14} /></a>
      </aside>

      <section className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}><span>Workspace</span><ChevronRight size={14} /><strong>{sectionLabel}</strong></div>
          <div className={styles.topActions}><span className={styles.systemState}><i /> AMBIENTE DE DEMONSTRAÇÃO</span><a href="https://github.com/SH1W4/pulso-civico/pulls" target="_blank" rel="noreferrer" className={styles.topButton}><GitPullRequest size={15} /> Pull requests <ArrowUpRight size={13} /></a></div>
        </header>

        {section === "overview" && (
          <>
            <div className={styles.pageIntro}>
              <div><div className={styles.eyebrow}><Sparkles size={14} /> CIVIC INTELLIGENCE WORKSPACE</div><h1>O pulso do projeto.<br /><span>Em um só lugar.</span></h1><p>Uma camada operacional para evoluir da demonstração à participação comunitária verificável.</p></div>
              <div className={styles.introOrb}><div className={styles.orbRing} /><div className={styles.orbCenter}><Activity size={30} /></div><span className={styles.orbPoint} /></div>
            </div>

            <div className={styles.metrics}>
              <article className={styles.metric}><div className={styles.metricTop}><span>MARCO ATUAL</span><Layers3 size={16} /></div><strong>02<span>/05</span></strong><small>Etapas concluídas</small><div className={styles.metricTrack}><i style={{ width: "40%" }} /></div></article>
              <article className={styles.metric}><div className={styles.metricTop}><span>PULL REQUESTS</span><GitPullRequest size={16} /></div><strong>02<span> merged</span></strong><small>Fundação e PWA integradas</small><div className={styles.metricMeta}><Check size={13} /> fluxo por PR ativo</div></article>
              <article className={styles.metric}><div className={styles.metricTop}><span>QUALIDADE</span><ShieldCheck size={16} /></div><strong>CI<span> verde</span></strong><small>Último ciclo da base validado</small><div className={styles.metricMeta}><Check size={13} /> lint + build</div></article>
              <article className={styles.metric}><div className={styles.metricTop}><span>RESPOSTAS REAIS</span><LockKeyhole size={16} /></div><strong>00</strong><small>Coleta ainda desabilitada</small><div className={styles.metricMeta muted><CircleDot size={13} /> sem dados de produção</div></article>
            </div>

            <div className={styles.sectionHead}><div><span className={styles.overline}>PRÓXIMAS ENTREGAS</span><h2>Da ideia ao sistema</h2></div><button className={styles.textAction} onClick={() => chooseSection("roadmap")}>Ver roadmap <ArrowRight size={15} /></button></div>
            <div className={styles.roadmapMini}>
              {roadmap.map((item) => <div className={styles.roadmapRow} key={item.id}><span className={item.state === "done" ? styles.roadmapCheck : item.state === "review" ? styles.roadmapPulse : styles.roadmapNumber}>{item.state === "done" ? <Check size={14} /> : item.id}</span><div className={styles.roadmapCopy}><strong>{item.title}</strong><small>{item.detail}</small></div><span className={item.state === "done" ? styles.statusDone : item.state === "review" ? styles.statusReview : styles.statusNext}>{item.status}</span><ChevronRight size={16} className={styles.roadmapChevron} /></div>)}
            </div>

            <div className={styles.bottomGrid}>
              <article className={styles.repoCard}><div className={styles.cardHead}><div><span className={styles.overline}>ATIVIDADE NO GITHUB</span><h3>Entrega incremental</h3></div><span className={styles.githubGlyph}><GitBranch size={18} /></span></div><div className={styles.prList}>{pullRequests.map((pr) => <a href={pr.href} target="_blank" rel="noreferrer" className={styles.prRow} key={pr.number}><span className={styles.prNumber}>#{pr.number}</span><span className={styles.prTitle}><strong>{pr.title}</strong><small>{pr.branch}</small></span><span className={pr.color === "green" ? styles.prMerged : styles.prOpen}>{pr.status}</span><ArrowUpRight size={14} /></a>)}</div><a className={styles.cardFooterLink} href="https://github.com/SH1W4/pulso-civico/pulls" target="_blank" rel="noreferrer">Abrir todas as PRs <ArrowRight size={14} /></a></article>
              <article className={styles.nextCard}><div className={styles.nextIcon}><Zap size={20} /></div><span className={styles.overline}>PRÓXIMO SALTO</span><h3>Conectar participação real.</h3><p>Fazer a interface conversar com a API, com consentimento explícito e estados de sucesso/erro honestos.</p><button className={styles.primaryButton} onClick={() => chooseSection("experience")}>Explorar experiência <ArrowRight size={15} /></button><div className={styles.nextCardFoot}><span><LockKeyhole size={13} /> coleta fechada</span><span>v0.2 / laboratória</span></div></article>
            </div>
          </>
        )}

        {section === "experience" && (
          <div className={styles.experiencePage}>
            <div className={styles.sectionHero}><div className={styles.eyebrow}><MessageSquareText size={14} /> LABORATÓRIO DE EXPERIÊNCIA</div><h1>O que a comunidade<br /><span>quer ver primeiro?</span></h1><p>Teste o fluxo da missão. Esta prévia roda apenas no navegador e não envia nem registra sua resposta.</p></div>
            <div className={styles.experienceGrid}>
              <article className={styles.questionCard}>
                <div className={styles.questionMeta}><span>CONSULTA DE PRODUTO · DEMO</span><span>01 / 01</span></div>
                <h2>Qual recurso merece prioridade na próxima entrega?</h2><p>Ajude a organizar o desenvolvimento do Observatório Eleitoral.</p>
                <div className={styles.options}>{priorities.map((option,index)=><button key={option.key} className={selectedPriority === option.key ? styles.optionSelected : styles.option} onClick={() => {setSelectedPriority(option.key);setDemoSubmitted(false);}}><span className={styles.optionIndex}>0{index+1}</span><span className={styles.optionCopy}><strong>{option.label}</strong><small>{option.detail}</small></span><span className={styles.optionRadio}>{selectedPriority === option.key && <i />}</span></button>)}</div>
                {demoSubmitted ? <div className={styles.demoConfirmation}><Check size={18} /><div><strong>Resposta de demonstração registrada na interface.</strong><span>Nenhum dado foi enviado a um servidor. Atualize a página para reiniciar o exemplo.</span></div></div> : <button className={styles.primaryButton} onClick={() => setDemoSubmitted(true)}>Testar envio local <ArrowRight size={16} /></button>}
                <div className={styles.privacyLine}><LockKeyhole size={14} /><span>Ambiente local · sem persistência · nenhuma coleta real</span></div>
              </article>
              <aside className={styles.previewAside}><span className={styles.previewIcon}><ShieldCheck size={22} /></span><span className={styles.overline}>CONTRATO DE CONFIANÇA</span><h3>Transparência não é um detalhe de interface.</h3><p>Antes de uma resposta real, a pessoa verá o aviso de privacidade vigente e aceitará sua versão explícita.</p><div className={styles.asideRule} /><div className={styles.checkpoint}><Check size={15} /><span>Resposta opcional</span></div><div className={styles.checkpoint}><Check size={15} /><span>Resultados com limiar de publicação</span></div><div className={styles.checkpoint}><Check size={15} /><span>Sem pontos por opinião política</span></div><div className={styles.checkpoint}><CircleDot size={15} /><span>Aguardando integração com API</span></div></aside>
            </div>
            <button className={styles.backAction} onClick={() => chooseSection("overview")}> <ArrowDownRight size={15} /> Voltar ao centro de controle</button>
          </div>
        )}

        {section === "roadmap" && (
          <div className={styles.detailPage}>
            <div className={styles.sectionHero}><div className={styles.eyebrow}><Target size={14} /> PLANO DE ENTREGA</div><h1>Construir com<br /><span>evidência e ordem.</span></h1><p>Cada etapa tem um estado explícito. “Planejada” não significa entregue.</p></div>
            <div className={styles.roadmapLarge}>{roadmap.map((item) => <article className={styles.roadmapCard} key={item.id}><div className={item.state === "done" ? styles.roadmapCheck : item.state === "review" ? styles.roadmapPulse : styles.roadmapNumber}>{item.state === "done" ? <Check size={15} /> : item.id}</div><div className={styles.roadmapLargeCopy}><div><h3>{item.title}</h3><span className={item.state === "done" ? styles.statusDone : item.state === "review" ? styles.statusReview : styles.statusNext}>{item.status}</span></div><p>{item.detail}</p></div></article>)}</div>
            <div className={styles.callout}><ShieldCheck size={19} /><div><strong>Regra de saída para produção</strong><p>Não habilitar coleta até aviso de privacidade, retenção, migração, configuração do segredo e revisão de segurança estarem concluídos.</p></div></div>
          </div>
        )}

        {section === "engineering" && (
          <div className={styles.detailPage}>
            <div className={styles.sectionHero}><div className={styles.eyebrow}><Terminal size={14} /> ENGENHARIA / REPOSITÓRIO</div><h1>Pequenas PRs.<br /><span>Rastreabilidade real.</span></h1><p>O centro de controle mostra o estado conhecido do fluxo de desenvolvimento sem inventar checks.</p></div>
            <div className={styles.engineeringList}>{pullRequests.map((pr) => <article className={styles.engineeringCard} key={pr.number}><div className={styles.engineeringIcon}><GitPullRequest size={20} /></div><div className={styles.engineeringMain}><div className={styles.engineeringTitle}><h3>#{pr.number} · {pr.title}</h3><span className={pr.color === "green" ? styles.statusDone : styles.statusReview}>{pr.status === "Merged" ? "Integrada" : "Aberta"}</span></div><code>{pr.branch}</code><p>{pr.checks}</p></div><a className={styles.openPr} href={pr.href} target="_blank" rel="noreferrer">Ver PR <ArrowUpRight size={14} /></a></article>)}</div>
            <button className={styles.architectureButton} onClick={() => setShowArchitecture((value) => !value)}><Blocks size={17} /> {showArchitecture ? "Ocultar arquitetura" : "Abrir mapa da arquitetura"} <ChevronRight className={showArchitecture ? styles.rotateChevron : ""} size={15} /></button>
            {showArchitecture && <div className={styles.architectureMap}><div><span>01</span><strong>PWA / Next.js</strong><small>Interface e consentimento</small></div><span className={styles.architectureArrow}>↓</span><div><span>02</span><strong>API validada</strong><small>Entrada e regras de domínio</small></div><span className={styles.architectureArrow}>↓</span><div><span>03</span><strong>PostgreSQL</strong><small>Persistência minimizada</small></div><span className={styles.architectureArrow}>↓</span><div><span>04</span><strong>Agregação pública</strong><small>Limiar e metodologia</small></div></div>}
            <div className={styles.terminalNote}><Terminal size={16} /><span>GitHub Actions · Node.js 20 · ESLint · Next.js build</span><span className={styles.terminalSuccess}><i /> CI verde na API base</span></div>
          </div>
        )}

        <footer className={styles.footer}><span> PULSO CÍVICO <b>·</b> CENTRO DE CONTROLE</span><span>PROTÓTIPO EM EVOLUÇÃO <i /></span></footer>
      </section>
    </main>
  );
}
