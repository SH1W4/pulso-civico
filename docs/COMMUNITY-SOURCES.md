# Catálogo comunitário de fontes

## Fluxo

1. A pessoa envia URL, categoria e descrição opcional em /observatory.
2. O frontend envia POST /api/source-submissions.
3. A API valida formato/protocolo, limita tamanho e rejeita URLs com credenciais ou destinos locais/privados conhecidos.
4. A URL normalizada é única. Uma repetição recebe HTTP 409.
5. A sugestão é armazenada como PENDING e não aparece no catálogo público.
6. Uma pessoa autorizada pode revisar a fila e mudar o estado para APPROVED, REJECTED ou NEEDS_REVIEW.
7. Apenas fontes aprovadas são retornadas por GET /api/source-submissions.

## Migração

Aplique a migração em ambiente de teste e depois no banco do ambiente de destino:

    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0002_source_submissions.sql

Não execute migrações de produção sem backup e revisão do procedimento operacional.

## Configuração

Configure DATABASE_URL, SOURCE_MODERATION_TOKEN e SOURCE_SUBMISSIONS_ENABLED no ambiente de execução. Mantenha SOURCE_SUBMISSIONS_ENABLED=false até aplicar a migração, revisar a política de privacidade/retensão e configurar proteção contra abuso. Para ativar o recebimento, defina SOURCE_SUBMISSIONS_ENABLED=true. Use um segredo aleatório, longo e exclusivo por ambiente. Nunca use prefixo NEXT_PUBLIC_ para esse segredo.

O token autoriza a consulta da fila pendente via GET /api/source-submissions?status=pending e a moderação via PATCH /api/source-submissions.

Exemplo para listar pendências:

    curl -H "Authorization: Bearer $SOURCE_MODERATION_TOKEN" "$APP_ORIGIN/api/source-submissions?status=pending"

Exemplo de aprovação:

    curl -X PATCH "$APP_ORIGIN/api/source-submissions" \
      -H "Authorization: Bearer $SOURCE_MODERATION_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"id":"1","status":"APPROVED","moderationNote":"URL e autoria revisadas"}'

Os exemplos são operacionais; substitua APP_ORIGIN pelo domínio do ambiente e o ID pelo valor retornado pela fila.

## Segurança e limites

- A API não faz fetch/crawl da URL submetida. Isso evita transformar o formulário em um proxy de rede; a validação de hostname é uma barreira básica, não uma garantia de segurança para qualquer resolução DNS.
- O token de moderação é compartilhado como segredo operacional; rotacione-o se houver suspeita de exposição. Para uma equipe maior, substitua por autenticação individual com papéis e trilha de auditoria do ator.
- A tabela registra eventos de moderação, mas a implementação atual não grava identidade do moderador. Não trate essa trilha como auditoria individual completa.
- A proteção contra duplicatas é feita por URL normalizada. Não existe rate limiting distribuído nesta versão; configure proteção de borda/WAF e monitore abuso antes de divulgação ampla.
- Não foi implementada detecção automática de veracidade. “Aprovada” significa aprovada para inclusão no catálogo, não que toda afirmação contida no site foi checada.
- O endpoint não armazena IP ou user-agent intencionalmente.
- Configure política de retenção e rotina de exclusão operacional antes de uso público em larga escala.
- Compartilhamento usa a URL da página atual, evitando hardcode de URL de repositório.
