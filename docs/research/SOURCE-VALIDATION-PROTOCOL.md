# Protocolo de validação de fontes e evidências

**Status:** proposta de protocolo operacional. Deve ser revisada antes de ser declarada política definitiva.

## 1. Objetivo

Estabelecer um processo consistente para que cada afirmação publicada possa ser rastreada até a evidência que a sustenta, incluindo contexto, método, incerteza e limitações.

## 2. Classificação da afirmação

Classificar cada item antes de publicar:

- **OBSERVAÇÃO:** valor ou evento diretamente presente na fonte consultada.
- **DECLARAÇÃO DE TERCEIRO:** algo que uma fonte ou pessoa afirma, ainda sem validação independente.
- **INFERÊNCIA:** interpretação derivada de uma ou mais observações.
- **HIPÓTESE:** explicação provisória que exige testes adicionais.
- **CORROBORADO:** sustentado por evidências independentes convergentes, dentro do escopo descrito.
- **VERIFICADO:** checado por procedimento documentado adequado à afirmação.
- **INCONCLUSIVO:** evidência insuficiente, conflitante ou incapaz de distinguir explicações concorrentes.

Não promover uma hipótese a fato apenas porque vários agregadores repetem a mesma origem de dados.

## 3. Procedimento de validação

### Etapa A — Definir a pergunta

- Formular uma pergunta delimitada e falsificável.
- Definir população/universo, período, unidade de análise e termos usados.
- Identificar quais observações poderiam apoiar ou enfraquecer a hipótese.
- Registrar explicações alternativas antes de interpretar os resultados.

### Etapa B — Identificar a fonte

- Registrar a fonte no SOURCE-REGISTER.
- Confirmar autoria, domínio, documentação, responsável e finalidade.
- Identificar se é fonte primária, republicação, agregador ou opinião.
- Verificar método, cobertura, incentivos, licença e termos de uso.
- Procurar correções, limitações conhecidas e documentação de atualização.

### Etapa C — Capturar a evidência

- Guardar URL específica, data/hora UTC, parâmetros, filtros e versão.
- Registrar data do evento, data de publicação e data de captura separadamente.
- Preservar o original quando permitido e seguro; calcular hash quando útil.
- Documentar paginação, amostragem, deduplicação, conversão de unidades e filtros.
- Nunca substituir falha de captura por números ilustrativos sem rotulagem.

### Etapa D — Reproduzir o resultado

- Recalcular a métrica a partir do material capturado, quando tecnicamente possível.
- Registrar fórmula, denominador, unidade, janela temporal e exclusões.
- Conferir consistência interna e comparar com a documentação da fonte.
- Quando a reprodução não for possível, declarar a limitação explicitamente.
- Distinguir preço implícito de mercado, previsão, pesquisa de opinião e resultado oficial.

### Etapa E — Corroborar e tentar refutar

- Buscar evidência independente, não apenas sites que replicam a mesma fonte.
- Comparar períodos e unidades equivalentes.
- Verificar se liquidez, mudanças de contrato, notícias, seleção de amostra ou falhas técnicas explicam o padrão.
- Registrar evidências contrárias e resultados nulos.
- Para alegações de fraude, manipulação, coordenação ou comportamento ilícito, exigir revisão independente e linguagem proporcional à evidência.

### Etapa F — Revisão e publicação

Antes de publicar, confirmar:

- [ ] A afirmação está delimitada e tem uma fonte específica.
- [ ] A captura e o horário de referência estão registrados.
- [ ] O método é reproduzível ou suas limitações estão explícitas.
- [ ] A evidência foi distinguida de inferência e hipótese.
- [ ] Foram consideradas explicações alternativas.
- [ ] O grau de confiança não excede a força da evidência.
- [ ] A publicação respeita privacidade, licença e segurança.
- [ ] Um segundo revisor avaliou alegações de alto impacto.
- [ ] O texto não sugere atualização em tempo real sem prova técnica.

## 4. Regras específicas para dados eleitorais e mercados

- Não apresentar consulta voluntária como pesquisa probabilística representativa.
- Para pesquisas publicadas, registrar instituto, contratante, datas de campo, população, método, tamanho amostral, margem de erro apenas quando apropriada e registro/documentação aplicável.
- Para mercados, registrar identificador do contrato, regra de resolução, moeda, unidade, timestamp, liquidez, spread e endpoint.
- Não somar contratos diferentes sem explicar compatibilidade e deduplicação.
- Não inferir identidade, intenção ou coordenação ilícita de uma carteira apenas por padrões temporais.
- Não tratar preço de mercado como probabilidade científica calibrada ou resultado eleitoral.
- Não combinar dados oficiais, pesquisas profissionais, mercados e consultas comunitárias em uma única série sem separação visível e método explícito.

## 5. Linguagem pública

Preferir:

- “A fonte X reportava Y na captura de [data/hora UTC].”
- “O padrão é compatível com a hipótese, mas não exclui A, B e C.”
- “Os dados disponíveis não permitem concluir.”
- “Este snapshot não é um feed em tempo real.”

Evitar, sem evidência adequada:

- “Foi provado que houve manipulação.”
- “O mercado sabe o resultado.”
- “A população pensa X” a partir de respostas voluntárias.
- “Ao vivo” ou “tempo real” para dados estáticos ou com atualização não verificada.

## 6. Correções e histórico

Se uma fonte corrigir dados ou um erro for encontrado:

1. registrar o erro e seu impacto;
2. preservar o registro anterior quando permitido;
3. atualizar a análise com data, responsável e justificativa;
4. corrigir a interface/publicação de modo visível;
5. revisar conclusões derivadas da evidência afetada.
