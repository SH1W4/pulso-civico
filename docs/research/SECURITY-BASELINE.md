# Base de segurança — Research e dados públicos

**Status:** baseline proposta; não é certificação de segurança nem substitui revisão técnica, jurídica ou teste de invasão.

## 1. Princípios

- Menor privilégio e segredos fora do código.
- Coleta mínima e privacidade por padrão.
- Separação entre ambiente local, preview e produção.
- Revisão humana para decisões de publicação e moderação.
- Evidência rastreável, logs proporcionais e retenção definida.
- Falha segura: se uma fonte, API ou banco estiver indisponível, mostrar indisponibilidade — nunca inventar ou reaproveitar números como se fossem atuais.

## 2. Segredos e configuração

- Nunca versionar tokens, senhas, chaves privadas, URLs de banco com credenciais ou arquivos reais de ambiente.
- Usar variáveis de ambiente do provedor e valores distintos por ambiente.
- Não expor segredos em variáveis com prefixo público, logs, screenshots ou mensagens de erro.
- Rotacionar credenciais em caso de suspeita de exposição e documentar o incidente.
- Revisar permissões do repositório, CI e contas de deploy periodicamente.
- Verificar dependências e lockfile; preferir instalação reproduzível em CI.

## 3. Endpoints e banco

Antes de ativar qualquer endpoint de escrita em produção:

- [ ] Migrações revisadas e testadas em banco descartável.
- [ ] Backup e procedimento de restauração testados quando houver dados importantes.
- [ ] Validação de esquema, limites de tamanho e consultas parametrizadas.
- [ ] Autorização e verificação de entrada testadas.
- [ ] Rate limiting/proteção de borda e monitoramento de abuso definidos.
- [ ] Respostas de erro não revelam segredos, SQL, stack traces ou detalhes internos.
- [ ] Retenção e exclusão implementadas e verificadas.
- [ ] Testes de integração e teste de comportamento sob indisponibilidade.
- [ ] Feature flag permanece desabilitada até aprovação documentada.

### Estado de coleta conhecido na documentação do projeto

- `COMMUNITY_FEEDBACK_ENABLED=false` em `.env.example`.
- `SOURCE_SUBMISSIONS_ENABLED=false` em `.env.example`.
- Os avisos de privacidade e retenção ainda exigem conclusão antes de coleta pública.
- O token de moderação de fontes é um segredo compartilhado; não equivale a identidade individual de moderador.
- A proteção de host da API de fontes é básica e não deve ser considerada defesa completa contra todos os cenários de resolução DNS.

Estes são estados declarados em documentação/código consultados; confirmar a configuração real de produção separadamente.

## 4. Privacidade

- Não coletar intenção de voto, identidade ou atributos sensíveis sem finalidade, base legal e revisão apropriadas.
- Não publicar respostas individuais nem permitir reidentificação por grupos pequenos.
- Informar finalidade, dados tratados, retenção, compartilhamentos e canal de direitos antes de qualquer coleta.
- Definir controlador, operadores, base legal e prazo de retenção com revisão competente.
- Implementar processo de exclusão; uma promessa documental sem mecanismo operacional não é suficiente.
- Não tratar cookie ou identificador de navegador como prova de identidade única.
- Limitar logs ao necessário e documentar seu prazo de retenção.

## 5. Segurança de fontes e arquivos

- Tratar textos, CSVs, URLs e arquivos externos como entrada não confiável.
- Não executar scripts ou arquivos recebidos de fontes desconhecidas.
- Não transformar uma URL submetida por usuário em proxy de rede ou serviço de crawl.
- Validar formato, tamanho e tipo real dos arquivos antes de processar.
- Ao capturar evidência, evitar dados pessoais, conteúdo restrito e material que não possa ser redistribuído.
- Registrar licença e termos antes de armazenar ou republicar dados de terceiros.

## 6. Integridade de pesquisa

- Cada métrica publicada deve ter fonte, captura, unidade, período, método e ressalvas.
- Nunca substituir erro de ingestão por dados de demonstração sem aviso visível.
- Marcar dados estáticos, atrasados, incompletos e não verificados.
- Não usar rótulo “LIVE”/“tempo real” sem teste demonstrável de atualização e indicação do último sucesso.
- Preservar histórico de correções e versões do método.
- Separar dados oficiais, pesquisas publicadas, mercados e consultas comunitárias.

## 7. CI, revisão e release

- Executar lint, build e testes definidos no repositório.
- Revisar dependências e alterações de permissões.
- Revisar mudanças de API, banco, coleta e moderação por outra pessoa quando possível.
- Não fazer merge apenas com base em compilação bem-sucedida.
- Testar preview em mobile/desktop e verificar estados vazios, erros e indisponibilidade.
- Documentar o commit liberado, ambiente e checks realmente executados.

## 8. Resposta a incidentes

1. Suspender a funcionalidade afetada ou desativar a flag quando necessário.
2. Proteger credenciais e limitar acesso.
3. Preservar evidência técnica relevante sem coletar dados excessivos.
4. Avaliar impacto em dados, integridade de resultados e usuários.
5. Corrigir, rotacionar segredos e testar a mitigação.
6. Registrar linha do tempo, impacto, correção e ações preventivas.
7. Fazer comunicações exigidas após avaliação apropriada.

## 9. Critérios de liberação

Não liberar coleta pública enquanto houver qualquer item aplicável sem resolução:

- aviso de privacidade incompleto;
- retenção/exclusão não operacional;
- migração não testada;
- autorização ou segredos não verificados;
- ausência de proteção proporcional contra abuso;
- resultados sem proveniência ou rotulados como atuais sem comprovação.

Para vulnerabilidades, publicar um canal de reporte somente depois de escolher um contato real e autorizado. Não inventar e-mail nem incluir dados pessoais sem consentimento.
