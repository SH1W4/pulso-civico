# Fluxo de contribuição e revisão comunitária

## Objetivo e limite desta entrega

Definir como sugestões de fontes e materiais públicos podem chegar à equipe, ser avaliados em privado e só então integrar o catálogo público. Este documento é uma especificação de produto e segurança, não afirma que um formulário, uma fila autenticada ou um canal seguro de denúncia já estejam implementados.

**O formulário comum de sugestão não deve ser divulgado como canal seguro para denunciantes, vazamentos ou documentos confidenciais.** Para esse tipo de material, use um canal especializado e separado, como SecureDrop, depois de uma avaliação operacional própria.

## Estados canônicos

- `RECEIVED`: recebido e visível somente a revisores autorizados.
- `IN_REVIEW`: um revisor assumiu a avaliação.
- `NEEDS_CLARIFICATION`: faltam informações não sensíveis para avaliar a sugestão.
- `APPROVED`: aprovado para publicação, ainda não necessariamente publicado.
- `REJECTED`: não será publicado; motivo interno registrado.
- `PUBLISHED`: item publicado no catálogo com proveniência e data.
- `WITHDRAWN`: retirado após pedido válido ou revisão editorial.

Toda transição deve ser validada no servidor; a interface não pode definir o estado final por conta própria.

## Tipos de contribuição

### Sugestão de fonte pública (MVP)

Aceitar apenas referências que já sejam públicas, como URL, título, entidade responsável, tema e justificativa curta. Evitar anexos na primeira versão. Mostrar um aviso para não inserir dados pessoais, credenciais, informações sigilosas ou acusações não verificadas.

A sugestão não deve exigir nome público ou perfil social. Se for necessário um meio de retorno, torná-lo opcional, explicar sua finalidade e não publicá-lo. Não prometer anonimato técnico sem uma análise real de logs, infraestrutura e fornecedores.

### Documento ou relato sensível (fora do MVP comum)

Não aceitar upload de vazamentos, documentos privados, credenciais, dados pessoais de terceiros ou material obtido sem autorização pelo formulário de sugestão comum. Encaminhar a pessoa para instruções de segurança adequadas e para um canal especializado separado, quando disponível. Não criar um botão que sugira existir tal canal se ele ainda não foi implantado e testado.

## Revisão e publicação

1. Validar formato, tamanho e campos no servidor.
2. Aplicar controles de abuso proporcionais e manter a coleta de telemetria no mínimo necessário.
3. Colocar a contribuição em fila privada; não indexar nem exibir a URL submetida publicamente antes da aprovação.
4. O revisor verifica origem, acessibilidade, finalidade pública, licença/termos, data, contexto e riscos de privacidade.
5. Pedir segunda revisão para alegações potencialmente danosas, material com dados pessoais ou casos de alto risco; não publicar até a resolução.
6. O editor registra decisão e motivo. A rejeição interna não precisa revelar detalhes que facilitem abuso.
7. Antes da publicação, remover dados pessoais desnecessários, conferir redirecionamentos e preservar a origem/proveniência.
8. Publicar apenas os metadados aprovados, com data de revisão, URL de origem, escopo, limitações e estado editorial.
9. Oferecer um canal de correção/retirada e reavaliar itens publicados quando a fonte mudar.

## Papéis e permissões

- **Público:** consultar catálogo e enviar sugestão simples.
- **Revisor:** ver fila privada, anotar evidências e recomendar decisão; não gerenciar papéis nem alterar configurações.
- **Editor:** aprovar, rejeitar, publicar, retirar e registrar justificativas.
- **Administrador:** gerenciar acessos e configuração; não deve ter poder invisível de apagar o histórico de decisões.

Não confiar em papel, ID de usuário ou estado enviados pelo cliente. Autorizar cada ação no servidor. Exigir autenticação forte para contas internas e revisar periodicamente quem mantém acesso.

## Registro de auditoria

Registrar, no mínimo, ID da contribuição, estado anterior/novo, ação, identidade interna do agente autorizado, timestamp e motivo editorial. Não copiar o texto completo, anexos, e-mail do remetente ou outros dados pessoais para logs de auditoria. Proteger o registro contra alteração e limitar o acesso.

## Dados e retenção

Antes de ativar coleta real, decidir e documentar:
- finalidade e base legal do tratamento;
- controlador, operadores e canal de direitos;
- campos coletados e dados de logs inevitáveis;
- prazo de retenção por categoria;
- processo de exclusão, retirada e resposta a incidentes;
- fornecedores que recebem dados e localização/transferência, quando aplicável.

Não armazenar conteúdo de contribuições reais até que a migração, a política de retenção e o procedimento de exclusão estejam implementados e testados.

## Critérios de aceite antes de habilitar o fluxo

- [ ] Aviso de privacidade revisado e publicado, com versão identificável.
- [ ] Migração de banco revisada e testada em ambiente controlado.
- [ ] Acesso à fila privada e permissões negativas testados.
- [ ] Estados e transições validados no servidor.
- [ ] Rate limiting e tratamento de erros testados.
- [ ] Política de retenção/exclusão implementada e verificada.
- [ ] Nenhum conteúdo pendente aparece no catálogo, sitemap, busca ou endpoint público.
- [ ] Logs não armazenam conteúdo desnecessário nem credenciais.
- [ ] Testes para XSS, CSRF conforme arquitetura, acesso horizontal indevido e submissão automatizada.
- [ ] Aviso explícito de que a sugestão comum não é um canal seguro de denúncia.
- [ ] Revisão de acessibilidade e experiência móvel concluída.

## Princípio editorial

A aprovação significa que a entrada atende aos critérios de publicação definidos — não que toda interpretação ou alegação associada seja automaticamente verdadeira. Distinguir sempre fonte, evidência, inferência e incerteza. Não usar publicação comunitária para promover candidatos, partidos ou posições políticas.
