"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileSearch,
  Globe2,
  Menu,
  Radio,
  Scale,
  SearchCheck,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";

const resources = [
  {
    number: "01",
    icon: SearchCheck,
    eyebrow: "CHECAGEM",
    title: "Verifique antes de compartilhar",
    description: "Acesse ferramentas e organizações de checagem para investigar conteúdos, imagens e alegações.",
    href: "/observatory",
    action: "Explorar recursos",
    tone: "lime",
  },
  {
    number: "02",
    icon: FileSearch,
    eyebrow: "DADOS E FONTES",
    title: "Vá até a origem da informação",
    description: "Encontre caminhos para consultar registros, documentos públicos e dados em seu contexto original.",
    href: "/observatory",
    action: "Consultar catálogo",
    tone: "violet",
  },
  {
    number: "03",
    icon: Radio,
    eyebrow: "INVESTIGAÇÃO",
    title: "Explore sinais com contexto",
    description: "Conheça o protótipo de observação de fluxos e leia a metodologia e os limites antes de interpretar sinais.",
    href: "/radar-fluxos",
    action: "Abrir Radar de fluxos",
    tone: "blue",
  },
];

const principles = [
  {
    icon: Globe2,
    title: "Comece pela fonte",
    description: "Procure o documento original, a data, a autoria e o contexto em que a informação foi publicada.",
  },
  {
    icon: Scale,
    title: "Separe fato de interpretação",
    description: "Diferencie o que o registro mostra, o que alguém conclui e o que ainda precisa ser investigado.",
  },
  {
    icon: Eye,
    title: "Leia os limites",
    description: "Uma evidência isolada não prova toda uma narrativa. Compare fontes independentes e registre incertezas.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  async function shareHub() {
    const url = window.location.origin;
    const text = "Pulso Cívico — um ponto de partida para consultar fontes e ferramentas de verificação.";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Pulso Cívico", text, url });
      } catch {
        // Closing the native share sheet is not an error that needs to be surfaced.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareMessage("Link copiado. Você já pode compartilhar o Pulso Cívico.");
    } catch {
      setShareMessage(url);
    }
  }

  return (
    <main className="launch-page">
      <header className="launch-header">
        <Link className="launch-brand" href="/" aria-label="Pulso Cívico — início">
          <span className="launch-brand-mark"><Radio size={20} strokeWidth={2.3} /></span>
          <span className="launch-brand-name">pulso<span>.</span><small>cívico</small></span>
        </Link>

        <nav className="launch-nav" aria-label="Navegação principal">
          <a href="#explorar">Explorar</a>
          <a href="#metodo">Como usar</a>
          <Link href="/observatory">Catálogo de fontes</Link>
          <Link href="/radar-fluxos">Radar de fluxos</Link>
        </nav>

        <div className="launch-header-actions">
          <span className="launch-status"><span /> PROJETO ABERTO</span>
          <button className="launch-menu-button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <Link className="launch-header-cta" href="/observatory">Acessar fontes <ArrowUpRight size={15} /></Link>
        </div>
      </header>

      {menuOpen && (
        <nav className="launch-mobile-nav" aria-label="Menu móvel">
          <a href="#explorar" onClick={() => setMenuOpen(false)}>Explorar</a>
          <a href="#metodo" onClick={() => setMenuOpen(false)}>Como usar</a>
          <Link href="/observatory" onClick={() => setMenuOpen(false)}>Catálogo de fontes</Link>
          <Link href="/radar-fluxos" onClick={() => setMenuOpen(false)}>Radar de fluxos</Link>
        </nav>
      )}

      <section className="launch-hero">
        <div className="launch-hero-copy">
          <div className="launch-kicker"><span className="launch-kicker-line" /> INFORMAÇÃO CÍVICA, COM CONTEXTO</div>
          <h1>Curiosidade<br />pública. <em>Fontes</em><br />abertas.</h1>
          <p className="launch-hero-description">
            Um ponto de partida para investigar informações, encontrar fontes e praticar uma leitura crítica do que circula no espaço público.
          </p>
          <div className="launch-hero-actions">
            <Link className="launch-button-primary" href="/observatory">Explorar fontes <ArrowRight size={17} /></Link>
            <a className="launch-button-text" href="#metodo">Conheça o método <ArrowDownRight size={17} /></a>
          </div>
          <div className="launch-hero-note"><ShieldCheck size={17} /><span><strong>Sem atalhos para a verdade.</strong> Consulte as fontes, confira o contexto e forme sua própria leitura.</span></div>
        </div>

        <div className="launch-hero-art" aria-label="Ilustração abstrata de fontes conectadas">
          <div className="launch-orbit launch-orbit-one" />
          <div className="launch-orbit launch-orbit-two" />
          <div className="launch-orbit launch-orbit-three" />
          <div className="launch-art-center"><Radio size={40} strokeWidth={1.4} /></div>
          <div className="launch-art-node node-top"><span className="node-icon"><BookOpen size={16} /></span><span><strong>Fontes</strong><small>Origem verificável</small></span><CheckCircle2 size={15} /></div>
          <div className="launch-art-node node-left"><span className="node-icon violet"><SearchCheck size={16} /></span><span><strong>Verificação</strong><small>Método e contexto</small></span></div>
          <div className="launch-art-node node-bottom"><span className="node-icon blue"><Eye size={16} /></span><span><strong>Leitura crítica</strong><small>Limites explícitos</small></span></div>
          <div className="launch-art-caption">ORIGEM <b>→</b> EVIDÊNCIA <b>→</b> CONTEXTO</div>
        </div>
      </section>

      <section className="launch-manifesto" aria-label="Princípios do projeto">
        <div><span className="manifesto-index">01 / ACESSO</span><strong>Informação rastreável</strong></div>
        <div><span className="manifesto-index">02 / MÉTODO</span><strong>Incerteza visível</strong></div>
        <div><span className="manifesto-index">03 / AUTONOMIA</span><strong>Leitura independente</strong></div>
      </section>

      <section className="launch-election" id="eleicoes" aria-labelledby="election-title">
        <style>{".launch-election{padding:76px 0;border-bottom:1px solid var(--line,#263126)}.launch-election-heading{display:grid;grid-template-columns:1fr minmax(260px,.7fr);gap:28px;align-items:end;margin-bottom:26px}.launch-election-heading h2{font-size:clamp(32px,4vw,52px);line-height:1;letter-spacing:-.06em;margin:14px 0 0}.launch-election-heading h2 em{color:var(--lime,#c2f477);font-style:normal}.launch-election-heading>p,.launch-election-card p{color:var(--muted,#a0aa9e);font-size:13px;line-height:1.75}.launch-election-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.launch-election-card{min-width:0;display:flex;flex-direction:column;align-items:flex-start;border:1px solid var(--line,#2b352d);border-radius:14px;background:var(--panel,#151a16);padding:22px}.launch-election-primary{border-color:#526b36;background:linear-gradient(145deg,#1c2819,#141914)}.launch-election-card-top{width:100%;display:flex;justify-content:space-between;gap:12px;color:var(--lime,#c2f477);font:10px ui-monospace,monospace;letter-spacing:.08em}.launch-election-card h3{font-size:19px;letter-spacing:-.03em;margin:26px 0 0}.launch-election-card p{flex:1;margin:10px 0 18px}.launch-election-card small{display:block;color:var(--muted,#a0aa9e);font-size:10px;line-height:1.6;margin-top:16px}.launch-election-note{display:flex;align-items:flex-start;gap:10px;padding:15px;margin-top:14px;border:1px solid var(--line,#2b352d);border-radius:10px;color:var(--muted,#a0aa9e);font-size:11px;line-height:1.7}.launch-election-note svg{flex-shrink:0;color:var(--lime,#c2f477);margin-top:2px}.launch-election-note strong{color:var(--text,#f1f4ec)}@media(max-width:800px){.launch-election-heading{grid-template-columns:1fr;gap:10px}.launch-election-grid{grid-template-columns:1fr}.launch-election-card{padding:18px}.launch-election{padding:54px 0}}"}</style>
        <div className="launch-election-heading">
          <div><span className="launch-kicker">ELEIÇÕES 2026 / FONTES SEPARADAS</span><h2 id="election-title">Acompanhe a <em>apuração.</em></h2></div>
          <p>Consulte o dado na origem. Este painel não simula uma transmissão ao vivo: os resultados só serão exibidos aqui quando houver coleta e validação automáticas verificadas.</p>
        </div>
        <div className="launch-election-grid">
          <article className="launch-election-card launch-election-primary">
            <div className="launch-election-card-top"><span>01 / RESULTADO OFICIAL</span><ShieldCheck size={18} /></div>
            <h3>Tribunal Superior Eleitoral</h3><p>Acompanhe a totalização oficial e selecione a eleição, o estado e o município no portal do TSE.</p>
            <a href="https://resultados.tse.jus.br/" target="_blank" rel="noreferrer" className="launch-card-link">Abrir resultados oficiais <ArrowUpRight size={16} /></a>
            <small>Fonte primária · consulta externa · sem espelhamento de números nesta versão</small>
          </article>
          <article className="launch-election-card">
            <div className="launch-election-card-top"><span>02 / COBERTURA INDEPENDENTE</span><ExternalLink size={17} /></div>
            <h3>Apuração na Bahia</h3><p>Consulte a página de cobertura do SBT News, que identifica os dados como provenientes do TSE. Confira o horário da última atualização antes de interpretar os números.</p>
            <a href="https://sbtnews.sbt.com.br/eleicoes/2026/visao-geral/ba" target="_blank" rel="noreferrer" className="launch-card-link">Ver painel da Bahia <ArrowUpRight size={16} /></a>
            <small>Fonte secundária · a página externa pode atualizar em outro ritmo</small>
          </article>
          <article className="launch-election-card">
            <div className="launch-election-card-top"><span>03 / PESQUISAS</span><BookOpen size={18} /></div>
            <h3>Intenção de voto não é apuração</h3><p>Pesquisas são entrevistas realizadas segundo a metodologia e o período de cada instituto; resultados oficiais são votos contabilizados pela Justiça Eleitoral. Não misturamos as duas séries.</p>
            <a href="https://noticias.uol.com.br/eleicoes/agregador-de-pesquisas-eleitorais/" target="_blank" rel="noreferrer" className="launch-card-link">Consultar agregador de pesquisas <ArrowUpRight size={16} /></a>
            <small>Agregador editorial · metodologia e datas variam por levantamento</small>
          </article>
        </div>
        <div className="launch-election-note"><ShieldCheck size={16} /><span><strong>Integridade do painel:</strong> nenhum percentual é copiado para esta interface sem captura com fonte, horário, método e validação. A camada de participação popular também deve permanecer separada dos resultados oficiais e das pesquisas.</span></div>
      </section>
      <section className="launch-explore" id="explorar">
        <div className="launch-section-heading">
          <div><span className="launch-kicker">UM HUB PARA INVESTIGAR</span><h2>Da pergunta<br />à <em>fonte.</em></h2></div>
          <p>Use o Pulso Cívico como mapa de acesso. Cada ferramenta tem um propósito próprio; confira sempre o escopo, a metodologia e a data dos dados apresentados.</p>
        </div>
        <div className="launch-resource-grid">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <article className={`launch-resource-card tone-${resource.tone}`} key={resource.number}>
                <div className="launch-card-top"><span>{resource.number} / {resource.eyebrow}</span><Icon size={19} /></div>
                <div className="launch-resource-icon"><Icon size={23} strokeWidth={1.7} /></div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <Link href={resource.href} className="launch-card-link">{resource.action} <ArrowUpRight size={16} /></Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="launch-method" id="metodo">
        <div className="launch-method-intro">
          <span className="launch-kicker">UM MÉTODO SIMPLES</span>
          <h2>Não pare no<br /><em>primeiro sinal.</em></h2>
          <p>Ferramentas ajudam a encontrar pistas. A interpretação exige contexto, transparência e fontes que possam ser consultadas por outras pessoas.</p>
          <button className="launch-share-button" onClick={shareHub}><Share2 size={16} /> Compartilhar o projeto <ArrowUpRight size={15} /></button>
          {shareMessage && <p className="launch-share-message" role="status">{shareMessage}</p>}
        </div>
        <div className="launch-principles">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return <article className="launch-principle" key={principle.title}>
              <span className="launch-principle-number">0{index + 1}</span>
              <span className="launch-principle-icon"><Icon size={19} /></span>
              <div><h3>{principle.title}</h3><p>{principle.description}</p></div>
            </article>;
          })}
        </div>
      </section>

      <section className="launch-community">
        <div className="launch-community-symbol"><BookOpen size={23} /></div>
        <div><span className="launch-kicker">A COMUNIDADE TAMBÉM CONSTRÓI O CATÁLOGO</span><h2>Conhece uma fonte útil?</h2><p>Sugira recursos públicos, ferramentas de verificação e organizações para avaliação editorial antes da publicação.</p></div>
        <Link className="launch-button-primary" href="/observatory">Sugerir uma fonte <ArrowRight size={16} /></Link>
      </section>

      <footer className="launch-footer">
        <Link className="launch-brand" href="/" aria-label="Pulso Cívico — início">
          <span className="launch-brand-mark"><Radio size={18} /></span>
          <span className="launch-brand-name">pulso<span>.</span><small>cívico</small></span>
        </Link>
        <p>Um projeto de acesso à informação e alfabetização cívica.</p>
        <div className="launch-footer-links"><Link href="/observatory">Fontes</Link><Link href="/radar-fluxos">Radar</Link><button onClick={shareHub}><Share2 size={14} /> Compartilhar</button></div>
        <div className="launch-footer-note"><ShieldCheck size={14} /> Ferramenta de apoio à pesquisa. Consulte as fontes originais e não confunda sinais com conclusões.</div>
      </footer>
    </main>
  );
}
