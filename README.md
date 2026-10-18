# Pulso Cívico

Módulo de participação cívica e transparência do Observatório Eleitoral.

## Interfaces

- **Página de participação:** `/` — protótipo interativo com missões educativas e resultados explicitamente fictícios.
- **Centro de controle:** `/control-center` — painel operacional com estado das entregas, roadmap, PRs do GitHub e laboratório de experiência.

Estado atual: a interface pública de participação continua demonstrativa; respostas não são enviadas nem persistidas nessa página. O backend comunitário está em revisão por PR e permanece desabilitado por padrão até completar configuração, privacidade, retenção e revisão de segurança.

## Executar localmente

Requisitos: Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:3000 ou http://localhost:3000/control-center.

Verificação de produção:

```bash
npm run build
npm start
```

## O que o protótipo demonstra

- Interface responsiva em português brasileiro.
- Navegação entre participação, resultados demonstrativos e centro de controle.
- Missões educativas, pontuação apenas local e conquistas demonstrativas.
- Roadmap com estados explícitos e atalhos para pull requests.
- Backend proposto com validação, PostgreSQL e resultados agregados, ainda não habilitado para coleta pública.
- Valores ilustrativos identificados como fictícios.

## Limitações e salvaguardas

- O fluxo público não coleta respostas reais.
- O backend comunitário não deve ser habilitado até concluir a revisão de privacidade e retenção e aplicar a migração.
- Uma consulta aberta por link é voluntária/autoselecionada; não deve ser apresentada como amostra probabilística ou retrato representativo do eleitorado.
- Não há service worker nem garantia de funcionamento offline nesta versão.
- Fontes profissionais de pesquisas e resultados oficiais devem permanecer separadas, com proveniência e horários de atualização próprios.

## Próximas entregas

1. Validar visual, responsividade e acessibilidade do centro de controle.
2. Validar a API comunitária e a migração em ambiente controlado.
3. Completar e revisar o aviso de privacidade e a política de retenção.
4. Integrar o fluxo de consentimento e resposta da interface com a API.
5. Adicionar controles contra abuso e testes automatizados de domínio/API.
6. Projetar a ingestão separada de pesquisas publicadas e resultados oficiais.

Consulte `docs/PRODUCT-SCOPE.md`, `docs/ARCHITECTURE.md`, `docs/DATA-GOVERNANCE.md` e `docs/COMMUNITY-FEEDBACK-API.md`.
