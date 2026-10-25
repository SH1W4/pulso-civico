# Election Evidence Record 001

## Objetivo

Preservar capturas e observações relacionadas à apuração eleitoral com proveniência, timestamps, histórico de alterações e exportação pública. O sistema deve distinguir a hora em que um dado foi consultado do período a que o dado se refere.

## Estado inicial

A rota `/evidence-record` é um protótipo de interface e exportação local. Ela **não** consulta a API do TSE, não grava dados em banco e não deve ser apresentada como monitor ao vivo. A linha do tempo começa vazia para evitar números ou eventos inventados.

## Contrato de observação (proposta v1)

Cada observação persistida deverá incluir:

- `record_id`: identificador estável do caso;
- `observation_id`: identificador estável da observação;
- `observed_at`: timestamp UTC da captura;
- `source_published_at`: horário de publicação/atualização declarado pela fonte, se disponível;
- `source_url` e `source_name`: proveniência;
- `source_payload_sha256`: hash do arquivo original preservado;
- `normalized_payload_sha256`: hash da representação normalizada, se aplicável;
- `claim`: descrição limitada ao que o registro mostra;
- `verification_status`: `verified`, `insufficient_evidence` ou `conflict`;
- `verification_notes`: método, limites e divergências;
- `previous_observation_id`: elo opcional para a versão anterior;
- `collector_version`: versão do coletor que produziu a captura.

## Regras de integridade e publicação

1. Não sobrescrever capturas antigas; correções geram novas versões e preservam o histórico.
2. Armazenar a resposta original antes de normalizar os dados.
3. Registrar horário da captura em UTC e exibir também o fuso local `America/Bahia`.
4. Calcular SHA-256 dos bytes originais; documentar exatamente quais bytes foram hasheados.
5. Não usar o hash como prova de veracidade da fonte ou de horário confiável.
6. Não publicar alegações como fatos confirmados sem fonte e método visíveis.
7. Não inferir coordenação ou causalidade apenas pela proximidade temporal ou geográfica.
8. Manter resultados oficiais, pesquisas e contribuições comunitárias em conjuntos separados.
9. Publicar exportações JSON/CSV sem dados pessoais desnecessários.
10. Uma página pública só pode indicar “ao vivo” após coleta automática e atualização terem sido verificadas operacionalmente.

## Próxima etapa técnica

- Implementar um adaptador de leitura para endpoints oficiais documentados do TSE.
- Salvar respostas brutas e manifesto em armazenamento persistente com política de retenção.
- Implementar comparação de snapshots e testes para campos ausentes, atraso, duplicação e mudanças.
- Adicionar endpoint público somente leitura para snapshots validados.
- Automatizar coleta com cadência compatível com as regras e disponibilidade da fonte.
- Testar exportação e reprodutibilidade antes de conectar à página pública.

## Como usar o protótipo

Abra `/evidence-record`, exporte o manifesto JSON ou o modelo CSV. O JSON inclui estado explícito de protótipo sem dados ao vivo e um hash do manifesto canônico. A exportação ocorre no navegador e não é enviada ao servidor.
