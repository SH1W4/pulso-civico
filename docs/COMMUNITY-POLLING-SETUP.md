# Consultas comunitárias persistentes

## Banco e configuração

1. Configure um PostgreSQL gerenciado para o projeto Vercel.
2. Execute `docs/sql/community-polls.sql` no banco.
3. Cadastre `DATABASE_URL` e `POLL_VOTER_HASH_SECRET` nas variáveis de ambiente do Vercel (Production e Preview conforme necessário). Gere um segredo aleatório com pelo menos 32 caracteres. Não use o prefixo `NEXT_PUBLIC_` para nenhuma dessas variáveis.
4. Faça redeploy após salvar as variáveis.

## API

- `GET /api/community/polls`: retorna perguntas e resultados agregados, sem respostas individuais.
- `POST /api/community/polls`: recebe `pollId`, `optionId`, `voterToken` e `consent: true`. Uma restrição única no banco impede uma segunda resposta do mesmo identificador local na mesma consulta.
- O navegador mantém um token aleatório local em `localStorage`; o servidor armazena apenas um HMAC desse token, nunca o token original.
- Resultados individuais não são expostos. A distribuição só é publicada a partir de 5 respostas por consulta; antes disso, a API informa que o limiar não foi atingido.
- Resultados são consultas voluntárias/autoselecionadas, não estimativas representativas do eleitorado.

## Limitações e lançamento seguro

A barreira por token reduz votos repetidos no mesmo navegador, mas não prova identidade e pode ser contornada limpando armazenamento ou usando outro dispositivo. Antes de promover a coleta publicamente, adicione rate limiting no provedor/edge, defina controlador/base legal, contato de privacidade e prazo de retenção, e valide o aviso de privacidade. Não colete nome, CPF, título eleitoral, endereço preciso ou preferência política identificável.

A coleta só funciona depois de configurar banco, segredo e migração. Sem essas variáveis, a API falha de forma explícita e não finge que recebeu votos.
