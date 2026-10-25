# Registro de fontes

Use este documento como índice de fontes candidatas e aprovadas. Uma fonte ser registrada não significa que seus dados foram verificados nem que todo o conteúdo é confiável.

## Campos mínimos por fonte

Para cada entrada, preencher:

- **ID:** identificador estável, por exemplo `SRC-001`.
- **Nome e URL canônica:** preferir documentação ou endpoint oficial.
- **Tipo:** primária oficial, dado primário de plataforma, pesquisa publicada, imprensa, agregador, análise independente ou fonte comunitária.
- **Uso pretendido:** qual afirmação ou variável a fonte pode sustentar.
- **Responsável/editor:** quem publica ou mantém a fonte.
- **Método/cobertura:** como os dados são produzidos, universo, período e critérios de inclusão conhecidos.
- **Captura:** data/hora UTC da consulta, URL exata, parâmetros e versão quando aplicável.
- **Licença/termos:** permissão de uso, redistribuição, atribuição e limites de acesso.
- **Limitações e incentivos:** cobertura incompleta, amostragem, conflitos de interesse, dados retrospectivos ou metodologia opaca.
- **Estado:** PROPOSTO, EM_REVISÃO, VALIDADO, RESTRITO, REJEITADO ou DESATUALIZADO.
- **Revisor e última revisão:** nome/handle de equipe e data.
- **Evidência arquivada:** caminho interno ou identificador de captura, sem armazenar dados pessoais ou segredos.

## Inventário inicial

As entradas abaixo são **candidatas para revisão**, não certificações de confiabilidade.

| ID | Fonte | Uso possível | Tipo | Estado inicial | Cuidados |
|---|---|---|---|---|---|
| SRC-001 | TSE — Pesquisas eleitorais: https://www.tse.jus.br/eleicoes/pesquisas-eleitorais | Verificar registros e documentos de pesquisas publicadas | Fonte oficial | EM_REVISÃO | Registrar instituto, contratante, datas de campo, metodologia, registro aplicável e documento específico |
| SRC-002 | Polymarket Data API: https://data-api.polymarket.com/v2/docs | Consultar dados públicos de mercado e atividade disponíveis na API | Dados de plataforma | EM_REVISÃO | Identificar contrato/mercado, endpoint, parâmetros, timestamp, paginação, unidade e termos de uso |
| SRC-003 | Cohven: https://cohven.com/polymarket/brazil-presidential-election | Contexto de coortes e posições analisadas pelo serviço | Agregador externo | RESTRITO | Verificar definição da coorte, cobertura, método e atualização; não generalizar para todo o mercado |
| SRC-004 | Polywhaler: https://polywhaler.com/events/brazil-presidential-election | Contexto de operações sinalizadas pelo serviço | Agregador externo | RESTRITO | Critérios de “whale” são próprios do serviço; confirmar período, contratos e método |
| SRC-005 | Veycast: https://www.veycast.fun/brazil-presidential-election | Snapshots de preço, volume, liquidez ou livro de ofertas, se documentados | Agregador externo | RESTRITO | Registrar captura exata, unidade, cobertura, atraso e limitações da amostra |
| SRC-006 | PolymarketScan: https://polymarketscan.org/event/brazil-presidential-election | Contexto complementar de mercados e atividade on-chain | Agregador externo | RESTRITO | Validar contratos incluídos e evitar somar volumes duplicados |

## Registro de cada captura

Não sobrescrever silenciosamente registros antigos. Para cada captura relevante, registrar em uma entrada de pesquisa:

- `capture_id`;
- `source_id`;
- data/hora UTC da captura;
- URL, endpoint e parâmetros exatos;
- intervalo temporal coberto pelos dados;
- hash do arquivo original, quando for viável;
- método de limpeza ou transformação;
- responsável pela captura;
- status de validação e ressalvas.

## Regras de aceitação

- Uma página inicial não substitui a URL da evidência específica.
- Uma data “consultado em” não prova que os dados estavam atualizados naquele momento.
- Agregadores servem como pistas até que método e proveniência sejam compreendidos.
- Se uma fonte não permite reproduzir um número relevante, rotular como não verificado ou não usar o número.
- Avaliar licença e termos antes de redistribuir dados, capturas ou conteúdo de terceiros.
- Não registrar credenciais, tokens, dados pessoais ou conteúdo obtido por acesso não autorizado.
