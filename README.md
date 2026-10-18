# Pulso Cívico

Módulo de participação cívica e transparência do Observatório Eleitoral.

## Interfaces

- **Experiência pública:** `/` — produto principal; participação educativa demonstrativa e apresentação explícita das três camadas de dados.
- **Centro de controle:** `/control-center` — ferramenta interna de acompanhamento de roadmap, CI e PRs; não é a experiência pública.

Estado atual: a página pública não envia nem persiste respostas. A API comunitária foi integrada à `main`, mas a coleta permanece desabilitada por padrão até concluir aviso de privacidade, retenção/exclusão, configuração e revisão de segurança. Pesquisas eleitorais publicadas e resultados oficiais ainda não estão conectados e devem permanecer em áreas separadas.

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
- Navegação entre participação e resultados demonstrativos, com distinção visível entre consultas comunitárias, pesquisas publicadas e apuração oficial.
- Centro de controle interno separado da experiência pública.
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

1. Validar a experiência pública em celular, desktop e acessibilidade.
2. Revisar as três camadas de dados e manter todos os dados de demonstração claramente rotulados.
3. Completar e revisar o aviso de privacidade e a política de retenção/exclusão.
4. Validar a API comunitária e a migração em ambiente controlado antes de habilitar coleta.
5. Integrar apenas as consultas comunitárias não políticas com consentimento e estados de erro/sucesso.
6. Projetar ingestões separadas para pesquisas publicadas e resultados oficiais, com proveniência própria.

Consulte `docs/PRODUCT-SCOPE.md`, `docs/ARCHITECTURE.md`, `docs/DATA-GOVERNANCE.md` e `docs/COMMUNITY-FEEDBACK-API.md`.
