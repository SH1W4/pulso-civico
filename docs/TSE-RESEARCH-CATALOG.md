# Catálogo de pesquisas presidenciais do TSE

## Fonte e escopo

A rota `/pesquisas` consulta o conjunto público **Pesquisas Eleitorais — 2026** do Portal de Dados Abertos do TSE. A API de servidor consulta os metadados do CKAN, baixa o arquivo compactado da fonte, extrai o CSV/TXT e filtra registros de abrangência nacional para o cargo de Presidente.

- Conjunto: https://dadosabertos.tse.jus.br/dataset/pesquisas-eleitorais-2026
- Consulta pública PesqEle: https://pesqele-divulgacao.tse.jus.br/
- Página institucional sobre pesquisas: https://www.tse.jus.br/eleicoes/pesquisas-eleitorais

## Limites de interpretação

- O conjunto aberto fornece principalmente metadados cadastrais; não se deve inferir percentuais de intenção de voto a partir do registro.
- O TSE informa que não faz controle prévio dos resultados das pesquisas.
- Percentuais só poderão ser apresentados em etapa posterior se houver ligação rastreável com a publicação ou o relatório da pesquisa e revisão dos valores transcritos.
- Campos ausentes são exibidos como “Não informado”; não devem ser preenchidos por suposição.
- O endpoint tem limites de tamanho e tempo para download e cache curto no CDN. Erros da fonte são expostos como estado indisponível, sem trocar silenciosamente por dados fictícios.

## Validação operacional

Depois do merge/deploy, validar `GET /api/research/presidential` e `/pesquisas` contra o arquivo vigente do TSE. Se a fonte alterar nomes de colunas ou o arquivo não contiver registros nacionais com cargo explícito, a API deve falhar de forma visível e o mapeamento precisa ser atualizado; não relaxar o filtro para mostrar pesquisas de outros cargos ou estados.
