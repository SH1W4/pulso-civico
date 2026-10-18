# Pulso Cívico — Escopo do produto

## Visão

Pulso Cívico é a experiência pública de participação cívica e transparência associada ao Observatório Eleitoral. A experiência pública é o produto principal; o Centro de Controle é uma ferramenta interna. O MVP deve distinguir consultas comunitárias, pesquisas eleitorais publicadas e resultados oficiais, sem misturar suas origens ou sugerir que uma consulta voluntária representa o eleitorado.

## Camadas de informação

1. **Consultas comunitárias:** feedback voluntário sobre o produto e missões educativas; nunca usadas como intenção de voto.
2. **Pesquisas eleitorais publicadas:** levantamentos de fontes externas, com instituto, período, metodologia, registro aplicável e limitações.
3. **Resultados oficiais:** dados da Justiça Eleitoral em fluxo separado, com proveniência e horário de atualização próprios.

Cada camada deve exibir seu estado de disponibilidade. Dados demonstrativos nunca podem ser apresentados como resultados reais nem substituir silenciosamente uma fonte indisponível.

## Problema

Pessoas interessadas em eleições precisam de formas acessíveis de participar e compreender dados cívicos sem confundir consultas abertas com pesquisas eleitorais profissionais.

## Público e experiência principal

1. A pessoa acessa um link público.
2. Lê o objetivo da consulta, período, regras e aviso de privacidade.
3. Responde voluntariamente às perguntas disponíveis.
4. Recebe confirmação e pontos educativos não relacionados ao conteúdo da opinião.
5. Pode consultar resultados agregados quando houver volume suficiente e período de publicação definido.

## Dentro do MVP

- PWA responsiva em português brasileiro.
- Página inicial e explicação do projeto.
- Fluxo de consulta com consentimento informado.
- Perguntas configuráveis e validação das respostas.
- Resultados agregados com data de atualização e limitações de amostragem.
- Pontuação por participação concluída e missões educativas neutras.
- Estados de carregamento, erro, encerramento e indisponibilidade.
- Registro técnico de proveniência e auditoria sem expor respostas individuais.

## Fora do MVP

- Previsões eleitorais ou probabilidades de vitória.
- Ranking de candidatos, partidos ou ideologias.
- Recompensas por escolher uma opção política específica.
- Alegação de representatividade nacional de uma amostra voluntária.
- Coleta obrigatória de nome, CPF, endereço exato ou título de eleitor.
- Publicação de resultados de apuração oficial neste módulo; isso pertence ao Observatório Eleitoral e deve usar fonte oficial própria.

## Princípios de apresentação

Cada consulta deve informar:
- que se trata de participação voluntária;
- quem pode participar e durante qual período;
- texto exato da pergunta e opções;
- número de respostas válidas e regra de deduplicação, quando aplicável;
- como os resultados são agregados;
- que a amostra é autoselecionada e não representa automaticamente o eleitorado;
- horário da última atualização.

## Métricas de sucesso

- Taxa de conclusão do fluxo.
- Erros técnicos por etapa.
- Tempo de resposta e disponibilidade.
- Proporção de consultas com metadados completos.
- Incidentes de abuso e solicitações de privacidade tratadas.

Não otimizar por polarização, engajamento político compulsivo ou favorecimento de qualquer candidato.
