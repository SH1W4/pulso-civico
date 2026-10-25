# Diário de pesquisa e decisões

Use uma nova entrada para cada investigação relevante, revisão de fonte, alteração metodológica ou correção pública. Não apague entradas anteriores para esconder mudanças; registre correções de forma rastreável.

## Modelo de entrada

```markdown
## RES-YYYY-MM-DD-001 — Título curto

- Estado: PROPOSTO | EM_REVISÃO | VALIDADO | INCONCLUSIVO
- Responsável:
- Data/hora UTC:
- Pergunta investigada:
- Escopo e período:
- Hipótese inicial:
- Fontes (IDs do SOURCE-REGISTER):
- Capturas/evidências:
- Método e parâmetros:
- Resultado observado:
- Interpretação:
- Explicações alternativas:
- Limitações e incerteza:
- Revisão independente:
- Decisão de publicação:
- Próxima ação:
- Histórico/correções:
```

## Registro inicial

### RES-2026-10-25-001 — Prontidão pública e proveniência do Pulso Cívico

- **Estado:** EM_REVISÃO
- **Pergunta:** a documentação e a interface permitem distinguir fontes, dados atuais, snapshots e hipóteses antes da divulgação a desenvolvedores e imprensa?
- **Escopo:** leitura do README, escopo do produto, arquitetura, governança de dados, documentação das APIs comunitárias, rascunho de privacidade e código do Radar.
- **Observação:** o Radar contém indicadores definidos estaticamente no código e um rótulo visual “LIVE”; a consulta realizada não confirmou uma cadeia de ingestão automática que sustente esse rótulo.
- **Observação:** a documentação identifica campos pendentes no aviso de privacidade e controles operacionais ainda necessários antes de ativar coleta pública.
- **Limitação:** esta foi uma revisão de repositório/documentação. Não constitui pentest, validação independente das fontes externas, auditoria jurídica, teste do banco de produção ou verificação completa do deploy.
- **Decisão provisória:** não apresentar o Radar como monitoramento em tempo real sem comprovação; manter as flags de coleta desativadas até fechar os requisitos de privacidade e segurança.
- **Próximas ações:** validar cada indicador contra sua fonte e captura; revisar as fontes candidatas; testar flags e migrações em ambiente controlado; designar responsável por privacidade, segurança e contato editorial.
