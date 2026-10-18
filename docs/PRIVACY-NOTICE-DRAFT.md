# Aviso de privacidade — consulta comunitária (rascunho)

> **Rascunho para revisão. Não publicar nem habilitar coleta em produção até preencher os campos pendentes e aprovar o texto.**

## Finalidade
Registrar respostas voluntárias sobre prioridades de funcionalidades e transparência do Pulso Cívico. Esta consulta não pergunta em qual candidato a pessoa pretende votar.

## Dados previstos
- opção selecionada em uma consulta comunitária;
- identificador aleatório guardado em cookie próprio, usado para limitar uma resposta por consulta;
- versão do aviso aceito e data/hora do registro.

O servidor armazena um HMAC do identificador aleatório, não o valor do cookie. A aplicação não deve registrar IP, user-agent ou dados de identidade neste fluxo.

## Campos obrigatórios antes da publicação
- Controlador e contato: **PREENCHER**
- Base legal validada para o tratamento: **REVISAR**
- Prazo de retenção e rotina de exclusão: **DEFINIR**
- Operadores, hospedagem e transferências internacionais: **PREENCHER**
- Canal para exercício dos direitos dos titulares: **PREENCHER**
- Encarregado, quando aplicável: **PREENCHER**

## Participação e resultados
A participação é voluntária. O identificador no cookie reduz respostas repetidas no mesmo navegador, mas não prova que cada pessoa respondeu apenas uma vez: limpar cookies ou usar outro navegador pode contornar o controle.

Os resultados só são publicados após um limiar mínimo de respostas, e sempre identificados como consulta voluntária/autoselecionada. Não são pesquisa probabilística nem retrato representativo do eleitorado.

## Importante
Não habilitar `COMMUNITY_FEEDBACK_ENABLED=true` em produção enquanto este aviso não estiver completo e revisado, a retenção não estiver operacional e o banco não tiver sido migrado.
