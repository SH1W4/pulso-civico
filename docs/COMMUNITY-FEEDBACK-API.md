# API de consulta comunitária

Este primeiro backend aceita somente as consultas não políticas de prioridade de funcionalidades e transparência. Não use estas rotas para perguntar preferência por candidato, partido ou intenção de voto.

## Estado inicial

A API fica **desabilitada por padrão**. Não habilite coleta pública até que o aviso de privacidade seja completado/revisado, a retenção seja definida e testada, o banco esteja migrado e a interface apresente o aviso antes de pedir uma sessão.

## Configuração

1. Configure PostgreSQL e aplique `db/migrations/0001_community_feedback.sql`.
2. Defina `DATABASE_URL`.
3. Gere `PARTICIPANT_TOKEN_SECRET` aleatório e exclusivo do ambiente (mínimo 32 bytes).
4. Preencha e aprove o aviso; defina `COMMUNITY_FEEDBACK_PRIVACY_NOTICE_VERSION` para a versão publicada.
5. Defina `COMMUNITY_FEEDBACK_ENABLED=true` somente depois da revisão de privacidade e segurança.

Consulte `.env.example`. Nunca comite credenciais.

## Rotas

### `POST /api/community-feedback/session`

Corpo: `{ "accepted": true, "privacyNoticeVersion": "..." }`.

Só emite o cookie aleatório `pc_feedback_participant` após a aceitação explícita da versão vigente do aviso. Cookie HttpOnly, SameSite=Lax e Secure em produção.

### `POST /api/community-feedback`

Corpo: `{ "survey": "feature-priorities", "option": "poll-trends", "privacyNoticeVersion": "..." }`.

Requer cookie de sessão e versão atual do aviso. Resposta 201 quando registrada, 409 para duplicação no mesmo navegador, 400 para entrada inválida e 503 quando desabilitada ou indisponível.

### `GET /api/community-feedback?survey=feature-priorities`

Retorna resultados agregados somente quando existem pelo menos 10 respostas no total; abaixo do limiar, oculta contagens e total.

## Limites conhecidos

- O cookie limita repetição no mesmo navegador; não comprova unicidade de pessoas e pode ser contornado ao limpar cookies ou usar outro navegador.
- Não há ainda rate limiting distribuído nem painel administrativo.
- A rotina de retenção/exclusão ainda precisa ser implementada antes de ativar a coleta.
- O aviso em `docs/PRIVACY-NOTICE-DRAFT.md` é um rascunho com campos pendentes, não um texto aprovado.
- Esta API não se conecta ainda à interface da PWA; a integração deverá apresentar o aviso e tratar erros sem afirmar que uma resposta foi salva quando não foi.
