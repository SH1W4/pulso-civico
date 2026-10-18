# Arquitetura inicial

## Princípios

- Separar interface, domínio de consultas, persistência e agregação.
- Tratar entradas de usuários como não confiáveis.
- Não acoplar o Pulso Cívico à coleta de pesquisas profissionais nem à apuração do TSE.
- Não publicar respostas individuais.
- Manter os dados demonstrativos claramente separados dos dados de produção.

## Arquitetura-alvo

```text
PWA responsiva
  ├── páginas públicas e acessíveis
  ├── formulário de participação
  └── visualização de resultados agregados
          │
          ▼
API de consultas
  ├── validação de pergunta e opções
  ├── limites de frequência e proteção contra abuso
  ├── regras de consentimento e retenção
  └── agregação com limiar mínimo de publicação
          │
          ▼
Persistência
  ├── definição/versionamento das consultas
  ├── submissões minimizadas
  ├── eventos de auditoria sem conteúdo sensível
  └── metadados de publicação
```

## Stack proposta

- Next.js + TypeScript para PWA e endpoints.
- PostgreSQL para persistência quando o backend for implementado.
- Validação de entrada no servidor.
- Testes unitários para regras de domínio e testes de integração para submissões e agregações.
- CI para lint, typecheck, testes e build.

A stack é uma proposta inicial; dependências e versões devem ser fixadas na primeira implementação funcional.

## Domínios separados

1. **Consulta interna:** respostas voluntárias e agregações próprias.
2. **Pesquisas eleitorais profissionais:** dados de institutos, com fonte e metodologia.
3. **Apuração oficial:** dados publicados pela autoridade eleitoral, com atualização e status próprios.

Não combinar os três conjuntos em um único gráfico sem rotulagem e explicação explícitas.

## Segurança e privacidade

- Não colocar segredos no frontend.
- Validar entradas no servidor e impor limites de tamanho.
- Proteger endpoints contra abuso automatizado.
- Evitar identificadores persistentes desnecessários.
- Definir política de retenção antes de armazenar submissões reais.
- Aplicar controle de acesso a ferramentas administrativas.
- Registrar alterações de perguntas e regras de agregação.
- Exibir somente agregações que reduzam risco de reidentificação.

## Atualização e confiabilidade

Cada publicação de resultados deve ter timestamp, versão da consulta, quantidade de respostas válidas e estado de atualização. Falhas de backend nunca devem ser substituídas silenciosamente por números fictícios.
