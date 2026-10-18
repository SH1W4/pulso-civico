# Pulso Cívico

Módulo de participação cívica e transparência do Observatório Eleitoral.

Estado atual: protótipo interativo com catálogo público de pesquisas presidenciais e consultas comunitárias voluntárias. Metadados do TSE não equivalem a percentuais de intenção de voto; respostas comunitárias não são representativas automaticamente do eleitorado.

## Executar localmente

Requisitos: Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

Verificação de produção:

```bash
npm run build
npm start
```

## O que o protótipo demonstra

- Interface responsiva para celular e desktop.
- Navegação entre participação e resultados.
- Três missões interativas, progresso, pontos e conquistas locais.
- Uma missão educativa sobre os limites de amostras voluntárias.
- Painel ilustrativo claramente marcado como fictício.
- Manifesto PWA e metadados de instalação.

## Limitações explícitas

- Não há backend, banco de dados, API de submissão ou coleta real.
- O estado da participação existe apenas na memória da página e é perdido ao recarregar.
- Os gráficos são demonstrações estáticas, não resultados de uma pesquisa.
- Não há service worker nem garantia de funcionamento offline nesta versão.

## Consultas comunitárias persistentes

A API `/api/community/polls` registra respostas voluntárias em PostgreSQL e publica apenas agregados a partir de cinco respostas por consulta. Configure `DATABASE_URL` e `POLL_VOTER_HASH_SECRET` no Vercel e execute `docs/sql/community-polls.sql` antes de habilitar a coleta. O identificador do navegador reduz duplicação, mas não comprova identidade nem impede abuso sofisticado. Revise privacidade, retenção, exclusão e controles de abuso antes de abrir a coleta ao público.

## Pesquisas presidenciais públicas

A interface consulta `/api/research/presidential` para exibir metadados do catálogo público do TSE. O catálogo é uma fonte de registros, não uma fonte automática de percentuais de intenção de voto. Consulte a publicação original de cada instituto para interpretar resultados, metodologia, amostra, período de campo e abrangência.

## Próximos passos

1. Validar o protótipo visual e a acessibilidade.
2. Definir aviso de privacidade, base legal, retenção e limiar de publicação.
3. Implementar API e persistência com testes de abuso e privacidade.
4. Publicar resultados agregados com metadados de amostragem e atualização.
5. Adicionar service worker e validar a instalação/offline da PWA.
6. Configurar CI para lint, typecheck e build.

Consulte `docs/PRODUCT-SCOPE.md`, `docs/ARCHITECTURE.md`, `docs/DATA-GOVERNANCE.md` e `docs/COMMUNITY-POLLING-SETUP.md`.

## Consultas comunitárias persistentes

A coleta voluntária usa PostgreSQL e a API de servidor em `/api/community/polls`. Antes de ativá-la, configure `DATABASE_URL` e `POLL_VOTER_HASH_SECRET` no ambiente do Vercel e execute `docs/sql/community-polls.sql`. Veja `docs/COMMUNITY-POLLING-SETUP.md` para configuração, limites e cuidados de privacidade. A interface atualiza agregados a cada 15 segundos e só publica distribuições a partir de cinco respostas por consulta. A proteção por identificador de navegador reduz duplicação, mas não prova identidade nem impede abuso sofisticado.
