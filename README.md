# Pulso Cívico

Módulo de participação cívica gamificada do Observatório Eleitoral.

> Estado atual: protótipo interativo. As respostas são mantidas apenas no estado da interface; não são enviadas nem persistidas em servidor. Gráficos e percentuais são ilustrativos.

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

## Próximos passos

1. Validar o protótipo visual e a acessibilidade.
2. Definir aviso de privacidade, base legal, retenção e limiar de publicação.
3. Implementar API e persistência com testes de abuso e privacidade.
4. Publicar resultados agregados com metadados de amostragem e atualização.
5. Adicionar service worker e validar a instalação/offline da PWA.
6. Configurar CI para lint, typecheck e build.

Consulte `docs/PRODUCT-SCOPE.md`, `docs/ARCHITECTURE.md` e `docs/DATA-GOVERNANCE.md`.
