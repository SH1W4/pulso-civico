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
        <style>{".launch-election{padding:54px 0;border-bottom:1px solid var(--line,#263126)}.launch-election-heading{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:20px}.launch-election-heading h2{font-size:clamp(32px,4vw,52px);line-height:1;letter-spacing:-.06em;margin:12px 0}.launch-election-heading h2 em{color:var(--lime,#c2f477);font-style:normal}.launch-election-heading p{max-width:440px;color:var(--muted,#a0aa9e);font-size:12px;line-height:1.7}.launch-live-shell{border:1px solid var(--line,#2b352d);border-radius:16px;overflow:hidden;background:var(--panel,#151a16)}.launch-live-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid var(--line,#2b352d)}.launch-live-label{display:flex;align-items:center;gap:9px;font:10px ui-monospace,monospace;letter-spacing:.08em;color:var(--lime,#c2f477)}.launch-live-dot{width:7px;height:7px;border-radius:50%;background:#c2f477;box-shadow:0 0 12px #c2f47788}.launch-live-actions{display:flex;gap:8px;flex-wrap:wrap}.launch-live-link{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border:1px solid var(--line,#344034);border-radius:8px;color:var(--text,#f1f4ec);font-size:11px;text-decoration:none}.launch-live-frame{display:block;width:100%;height:min(76vh,760px);min-height:560px;border:0;background:#fff}.launch-live-disclaimer{display:flex;gap:9px;padding:13px 16px;color:var(--muted,#a0aa9e);font-size:10px;line-height:1.7;border-top:1px solid var(--line,#2b352d)}.launch-live-disclaimer svg{flex-shrink:0;color:var(--lime,#c2f477)}@media(max-width:760px){.launch-election-heading{display:block}.launch-election-heading p{margin-top:12px}.launch-live-frame{height:70vh;min-height:520px}.launch-election{padding:40px 0}}"}</style>
        <div className="launch-election-heading"><div><span className="launch-kicker">ELEIÇÕES 2026 / ACOMPANHAMENTO</span><h2 id="election-title">A apuração, <em>na tela.</em></h2></div><p>Painel externo com dados de apuração. O Pulso Cívico não altera os números exibidos pela fonte; confira a origem e o horário de atualização.</p></div>
        <div className="launch-live-shell">
          <div className="launch-live-top"><span className="launch-live-label"><span className="launch-live-dot" /> PAINEL DE APURAÇÃO · FONTE EXTERNA</span><div className="launch-live-actions"><a className="launch-live-link" href="https://resultados.tse.jus.br/" target="_blank" rel="noreferrer">TSE oficial <ExternalLink size={14} /></a><a className="launch-live-link" href="https://agenciabrasil.ebc.com.br/eleicoes/2026/apuracao/segundo-turno" target="_blank" rel="noreferrer">Abrir em nova aba <ArrowUpRight size={14} /></a></div></div>
          <iframe className="launch-live-frame" title="Painel de apuração eleitoral da Agência Brasil, com dados atribuídos ao TSE" src="https://agenciabrasil.ebc.com.br/eleicoes/2026/apuracao/segundo-turno" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
          <div className="launch-live-disclaimer"><ShieldCheck size={15} /><span>Os dados são apresentados pela Agência Brasil, que identifica o TSE como fonte. Se o painel não carregar dentro desta página por restrições do site, use “Abrir em nova aba” ou o portal oficial. Este iframe não é uma integração própria nem uma captura auditável do Pulso Cívico.</span></div>
        </div>
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
