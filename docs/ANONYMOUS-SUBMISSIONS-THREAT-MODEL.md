# Modelo de ameaças: privacidade e submissões anônimas

## Decisão atual

O Pulso Cívico pode planejar uma sugestão de fonte sem nome público, mas **não deve alegar anonimato forte nem aceitar vazamentos sensíveis por um formulário web comum**. Não há garantia de anonimato apenas porque a aplicação não pede nome: IPs, logs de proxy/CDN, cookies, timestamps, contas, metadados de arquivos e detalhes do relato podem permitir identificação.

Este documento não certifica a segurança da infraestrutura atual. É uma lista de riscos e decisões necessárias antes de lançar qualquer canal de envio.

## Ativos a proteger

- Identidade e dados de contato de quem envia uma contribuição.
- Conteúdo ainda não publicado e documentos anexados.
- Credenciais e acesso de revisores/editores.
- Integridade das decisões editoriais e do catálogo.
- Logs operacionais e dados necessários para responder a incidentes.

## Ameaças e controles

| Ameaça | Controle mínimo antes do lançamento |
|---|---|
| Publicação acidental de uma contribuição pendente | Armazenamento privado, autorização no servidor, consultas públicas filtradas por estado publicado e testes de regressão |
| Reidentificação por campos ou logs | Minimização de campos, retenção limitada, acesso restrito a logs e revisão de fornecedores/proxies |
| Arquivo malicioso ou metadados identificadores | Não aceitar anexos no MVP comum; se adicionados no futuro, validação real de tipo, limites, nomes gerados, armazenamento isolado, análise antimalware e sanitização |
| Acesso não autorizado à fila | Autenticação forte, papéis de menor privilégio, autorização por ação e testes de acesso horizontal |
| Spam, flood ou tentativa de derrubar o serviço | Rate limiting, limites de tamanho, monitoramento proporcional e resposta operacional |
| Alteração ou apagamento silencioso de decisões | Trilha de auditoria protegida e revisão de permissões |
| XSS ou conteúdo perigoso submetido por usuário | Tratar texto e URLs como não confiáveis, escapar saída, validar esquema de URL e testar conteúdo malicioso |
| Divulgação de dado pessoal ou acusação não verificada | Revisão humana, minimização, escalonamento para segunda revisão e mecanismo de retirada/correção |
| Falsa promessa de anonimato | Aviso claro sobre limites, sem termos como “100% anônimo” ou “impossível rastrear” |

## Separar os canais por nível de risco

### Canal A — Sugestão pública comum

- Apenas referências a fontes públicas (por exemplo, URL e título).
- Sem upload de arquivos no primeiro MVP.
- Sem nome público obrigatório.
- Aviso: não enviar dados pessoais, segredos, credenciais, material confidencial ou conteúdo que coloque alguém em risco.
- Fila privada e publicação somente após revisão.
- Não chamar este canal de denúncia anônima segura.

### Canal B — Relato ou documento sensível

Fora do escopo do formulário comum. Exige projeto separado, avaliação de ameaças, procedimento operacional, pessoas treinadas, segurança de endpoints e dispositivos, proteção de metadados, política de retenção e plano de resposta a incidentes. Considerar uma solução especializada como SecureDrop, com instalação e operação conforme sua documentação; a adoção do software por si só não elimina todos os riscos nem garante anonimato absoluto.

Não redirecionar automaticamente conteúdo sensível recebido no Canal A para serviços externos. Exibir instruções preventivas antes da submissão e minimizar a chance de recebê-lo em primeiro lugar.

## Perguntas que precisam de resposta técnica

- Quais logs são gerados por hospedagem, CDN, proxy, aplicação e banco?
- Quem pode acessá-los e por quanto tempo são retidos?
- Quais cookies/identificadores são usados e com que finalidade?
- Os fornecedores e operadores estão descritos no aviso de privacidade?
- Como são feitas exclusão, backup e resposta a pedidos de titulares?
- Como se impede que conteúdo pendente apareça em busca, cache, sitemap ou APIs públicas?
- Como recuperar o serviço sem expor cópias antigas ou dados excluídos?
- Quem responde por incidentes e como suspender rapidamente a coleta?

## Regra de lançamento

Não habilitar a coleta pública até que os critérios de revisão em `docs/COMMUNITY-REVIEW-WORKFLOW.md` sejam atendidos. Não lançar upload de documentos ou um canal de denúncias sensíveis como parte desta primeira etapa.

## Referências técnicas

- SecureDrop — documentação e limites operacionais: https://docs.securedrop.org/en/latest/
- OWASP — File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- LGPD — texto atualizado no Planalto: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm

Este documento é uma orientação técnica de produto, não um parecer jurídico nem uma auditoria de segurança.
