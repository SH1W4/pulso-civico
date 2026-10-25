# Research — Pulso Cívico

Esta pasta organiza a base de pesquisa, proveniência de fontes, protocolos de validação e controles de segurança do Pulso Cívico.

O objetivo é criar um processo reproduzível para investigar sinais públicos sem confundir dado observado, interpretação, hipótese e conclusão.

## Princípios obrigatórios

1. **Proveniência antes de interpretação:** toda afirmação relevante deve apontar para uma fonte identificável e para o momento em que foi consultada.
2. **Reprodutibilidade:** registrar método, parâmetros, período, limitações e transformações.
3. **Separação epistemológica:** distinguir fato observado, declaração de terceiros, inferência, hipótese e conclusão verificada.
4. **Sem alegações de tempo real sem prova:** indicar explicitamente quando os dados são snapshots, estáticos, atrasados ou indisponíveis.
5. **Segurança por padrão:** não coletar dados pessoais desnecessários, não publicar segredos e não habilitar endpoints sem revisão operacional.
6. **Correção rastreável:** mudanças de método, fontes ou resultados devem deixar histórico e justificativa.

## Documentos desta pasta

- [Registro de fontes](./SOURCE-REGISTER.md): inventário de fontes, finalidade, confiabilidade e restrições.
- [Protocolo de validação de fontes e evidências](./SOURCE-VALIDATION-PROTOCOL.md): procedimento para avaliar, capturar e citar evidências.
- [Base de segurança](./SECURITY-BASELINE.md): controles mínimos, riscos, critérios de liberação e resposta a incidentes.
- [Diário de pesquisa](./RESEARCH-LOG.md): registro cronológico das investigações e decisões metodológicas.

## Estados padronizados

- **PROPOSTO:** fonte, método ou controle ainda não avaliado.
- **EM_REVISÃO:** avaliação em andamento.
- **VALIDADO:** verificado conforme protocolo, com evidências registradas.
- **RESTRITO:** utilizável apenas com ressalvas ou para contexto.
- **REJEITADO:** não usar como suporte factual.
- **DESATUALIZADO:** já foi válido, mas precisa de nova verificação.

Um estado VALIDADO aplica-se somente ao escopo, período e uso documentados; não significa que todas as afirmações de uma fonte sejam verdadeiras.

## Fluxo de trabalho

1. Registrar a fonte antes de utilizá-la como suporte importante.
2. Avaliar autoria, origem, método, data, cobertura, incentivos e limitações.
3. Capturar a evidência relevante e registrar quando foi consultada.
4. Separar observação de interpretação e documentar explicações alternativas.
5. Fazer revisão independente para alegações de alto impacto.
6. Publicar somente quando a cadeia de evidência e os limites estiverem claros.
7. Reavaliar fontes e dados quando houver mudança, correção ou expiração.

## Limites atuais

Este conjunto de documentos define uma base operacional proposta. Não certifica que todas as verificações já foram executadas, que os dados do produto estejam atualizados, nem que a infraestrutura tenha passado por teste de invasão ou auditoria jurídica.

Não usar esta pasta como autorização para ativar coleta pública. As flags de coleta permanecem sujeitas aos bloqueadores já descritos em `docs/PRIVACY-NOTICE-DRAFT.md`, `docs/COMMUNITY-FEEDBACK-API.md` e `docs/COMMUNITY-SOURCES.md`.
