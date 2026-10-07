# Matriz de rastreabilidade — Verzel Store (VZS-142 v2.3.0)

Cada regra × cenários que a cobrem, separados por camada. Resultado da execução de 07/10/2026 (`npm run test:all`): a UI roda em Chromium, Firefox e WebKit; a API roda uma vez, pelo Chromium. O detalhe de cada exemplo está em [03-execucao.md](03-execucao.md) e os bugs em [04-bugs.md](04-bugs.md).

Legenda: ✅ passou · ❌ falhou por bug · "3 nav." = Chromium, Firefox e WebKit.

## Critérios de aceite (CA01 a CA11)

| Regra | O que diz | UI | API | Resultado | Bug |
|---|---|---|---|---|---|
| CA01 | `BEMVINDO10` = 10% sobre o subtotal | CT-01, CT-60 | CT-04 · BEMVINDO10 | ✅ UI (3 nav.) e API | — |
| CA02 | Cupom sem diferença de maiúsculas e sem espaços nas pontas | — (regra de valor, só API) | CT-04 · bemvindo10, CT-04 · `" bemVindo10 "`, CT-05 · verao2026 | ✅ API | — |
| CA03 | Cupom inexistente → "Cupom inválido." e sem desconto | CT-02 · XYZ123 | CT-05 · XYZ123, CT-06 · XYZ123 (422 no pedido) | ✅ UI (3 nav.) e API | — |
| CA04 | Cupom expirado → "Cupom expirado." e sem desconto | CT-02 · VERAO2026 | CT-05 · VERAO2026, CT-06 · VERAO2026 (422 no pedido) | ✅ UI (3 nav.) e API | — |
| CA05 | Um cupom por vez; para trocar, remove e aplica outro | CT-01, CT-03 | — (comportamento da tela) | ✅ UI (3 nav.) | — |
| CA06 | Frete grátis com subtotal ≥ R$ 200,00 | CT-20, CT-22 | CT-23, CT-24 · 219,80, CT-24 · 239,70, CT-27 | ❌ CT-20 (3 nav.), CT-23 e CT-27 · ✅ CT-22 e CT-24 | BUG-01 |
| CA07 | Abaixo de R$ 200,00: frete R$ 19,90 e aviso de quanto falta | CT-21 | CT-24 · 199,90, CT-24 · 199,80, CT-24 · 79,80 | ✅ UI (3 nav.) e API | — |
| CA08 | Frete grátis pelo subtotal antes do desconto | — (regra de valor, só API) | CT-25, CT-26 · 219,80 | ❌ CT-25 · ✅ CT-26 · 219,80 | BUG-01 |
| CA09 | Desconto não incide sobre o frete | — (regra de valor, só API) | CT-26 · 109,80 | ✅ API | — |
| CA10 | Máximo de 5 unidades por produto, na UI e na API | CT-50, CT-51 | CT-52 (6 exemplos), CT-53 | ✅ UI (3 nav.) · ❌ CT-52 · 6 e CT-53 · ✅ demais exemplos do CT-52 | BUG-03 |
| CA11 | Valores com 2 casas decimais (e fórmula do total) | — (regra de valor, só API) | CT-83 · 239,70, CT-83 · 109,80 | ✅ API | — |

## Regras da loja anteriores ao card

| Regra | UI | API | Resultado | Bug |
|---|---|---|---|---|
| Nome com nome e sobrenome | CT-61 · nome | CT-63 (`DADOS_INVALIDOS`) | ✅ UI (3 nav.) e API | — |
| E-mail válido | CT-61 · email | CT-63 | ✅ UI (3 nav.) e API | — |
| CEP com 8 dígitos, com ou sem hífen | CT-61 · cep 7 dígitos, CT-61 · cep 9 dígitos | CT-62 · 01310-100, CT-62 · 01310100 (CEP normalizado, DOC-03) | ✅ UI (3 nav.) e API | — |
| Pedido confirmado com número `VZ-` + 6 dígitos | CT-60 | CT-62 | ✅ UI (3 nav.) e API | — |
| Pagamento na entrega | — | — | Não coberto: a loja não tem etapa de pagamento; fora dos cenários críticos | — |

## Contrato da API (seção "API" e tabela de códigos de erro)

| Regra | API | Resultado | Bug |
|---|---|---|---|
| Códigos de erro e status (400, 404, 422) | CT-80 (8 exemplos: JSON_INVALIDO, ROTA_NAO_ENCONTRADA, PRODUTO_NAO_ENCONTRADO 404 e 422, ITENS_OBRIGATORIOS ×2, ITEM_INVALIDO, ITEM_DUPLICADO) | ✅ | — |
| Método não aceito → 405 (DOC-11) | CT-81 (3 exemplos) | ✅ | — |
| Lista e consulta de produtos | CT-82 | ✅ | — |

## Resumo

- **Regras cobertas:** 18 de 19.
  - CA01 a CA11: 11 de 11.
  - Regras da loja: 4 de 5. "Pagamento na entrega" fica sem cenário, porque a loja não tem etapa de pagamento.
  - Contrato da API: 3 de 3.
- **Cenários:** 26 (10 de UI e 16 de API), que somam 56 execuções por causa dos exemplos de `Scenario Outline`: 14 de UI e 42 de API.
- **Rodadas:** 84 (as 14 de UI × 3 navegadores + as 42 de API no Chromium).
  - **Passaram:** 76.
  - **Falharam por bug:** 8, todas com `@bug-XX`. Nenhuma falha sem bug registrado.
    - BUG-01 (frete cobrado com subtotal de exatamente R$ 200,00): CT-20 nos 3 navegadores, CT-23, CT-25 e CT-27.
    - BUG-03 (API aceita mais de 5 unidades): CT-52 · 6 e CT-53.
- **Só numa camada, por decisão** ([Critério de priorização](01-plano-de-teste.md#critério-de-priorização)): CA02, CA08, CA09 e CA11 só na API, por serem regras de valor; CA05 só na UI, por ser comportamento da tela.
