# Matriz de rastreabilidade: Verzel Store (VZS-142 v2.3.0)

Aqui está cada regra e os cenários que a cobrem, separados por camada. O resultado é da execução de 08/10/2026 (`npm run test:all`): a UI rodou em Chromium, Firefox e WebKit, e a API rodou uma vez, no Chromium. O detalhe de cada exemplo está no [03-execucao.md](03-execucao.md) e os bugs no [04-bugs.md](04-bugs.md).

Legenda: ✅ passou · ❌ falhou por bug · "3 nav." = Chromium, Firefox e WebKit.

## Critérios de aceite (CA01 a CA11)

| Regra | O que diz | UI | API | Resultado | Bug |
|---|---|---|---|---|---|
| CA01 | `BEMVINDO10` = 10% sobre o subtotal | CT-01, CT-60 | CT-04 · BEMVINDO10 | ✅ UI (3 nav.) e API | — |
| CA02 | Cupom sem diferença de maiúsculas e sem espaços nas pontas | — (regra de valor, só API) | CT-04 · bemvindo10, CT-04 · `" bemVindo10 "`, CT-05 · verao2026 | ✅ API | — |
| CA03 | Cupom inexistente → "Cupom inválido." e sem desconto | CT-02 · XYZ123 | CT-05 · XYZ123, CT-06 · XYZ123 (422 no pedido) | ✅ UI (3 nav.) e API | — |
| CA04 | Cupom expirado → "Cupom expirado." e sem desconto | CT-02 · VERAO2026, CT-03 | CT-05 · VERAO2026, CT-06 · VERAO2026 (422 no pedido) | ✅ UI (3 nav.) e API | — |
| CA05 | Um cupom por vez; para trocar, remove e aplica outro | CT-01, CT-03 | — (comportamento da tela) | ✅ UI (3 nav.) | — |
| CA06 | Frete grátis com subtotal ≥ R$ 200,00 | CT-20, CT-22 | CT-23, CT-24 · 219,80, CT-24 · 239,70, CT-27 | ❌ CT-20 (3 nav.), CT-23 e CT-27 · ✅ CT-22 e CT-24 | BUG-01 |
| CA07 | Abaixo de R$ 200,00: frete R$ 19,90 e aviso de quanto falta | CT-21 (com comparação visual da tela do carrinho) | CT-24 · 199,90, CT-24 · 199,80, CT-24 · 79,80 | ✅ UI (3 nav.) e API | — |
| CA08 | Frete grátis pelo subtotal antes do desconto | — (regra de valor, só API) | CT-25, CT-26 · 219,80 | ❌ CT-25 · ✅ CT-26 · 219,80 | BUG-01 |
| CA09 | Desconto não incide sobre o frete | — (regra de valor, só API) | CT-26 · 109,80, CT-83 · 109,80 | ✅ API | — |
| CA10 | Máximo de 5 unidades por produto, na UI e na API | CT-50, CT-51 | CT-52 (6 exemplos), CT-53 | ✅ UI (3 nav.) · ❌ CT-52 · 6 e CT-53 · ✅ demais exemplos do CT-52 | BUG-03 |
| CA11 | Valores com 2 casas decimais (e fórmula do total) | — (regra de valor, só API) | CT-83 · 239,70, CT-83 · 109,80 | ✅ API | — |

## Regras da loja anteriores ao card

| Regra | UI | API | Resultado | Bug |
|---|---|---|---|---|
| Nome com nome e sobrenome | CT-61 · nome | CT-63 (`DADOS_INVALIDOS`, confere `erro.campos.0.campo = cliente.nome`), CT-64 (nome só com símbolos, `@bug-04`) | ✅ UI (3 nav.) e API (CT-63) · ❌ CT-64, exploração 9-01 e chamada manual: nome só com símbolos aceito na tela e na API | BUG-04 |
| E-mail válido | CT-61 · email | — (lacuna: o CT-63 envia e-mail inválido, mas só confere o primeiro item de `erro.campos`, o do nome) | ✅ UI (3 nav.) | — |
| CEP com 8 dígitos, com ou sem hífen | CT-61 · cep 7 dígitos, CT-61 · cep 9 dígitos | CT-62 · 01310-100, CT-62 · 01310100 (só CEP válido, normalizado, DOC-03; CEP inválido na API é lacuna) | ✅ UI (3 nav.) e API | — |
| Pagamento na entrega | CT-60 (texto "o pagamento será feito na entrega" na confirmação) | — | ✅ UI (3 nav.) | — |

## Contrato da API (seção "API" e tabela de códigos de erro)

| Regra | API | Resultado | Bug |
|---|---|---|---|
| Códigos de erro e status (400, 404, 422) | CT-80 (8 exemplos: JSON_INVALIDO, ROTA_NAO_ENCONTRADA, PRODUTO_NAO_ENCONTRADO 404 e 422, ITENS_OBRIGATORIOS ×2, ITEM_INVALIDO, ITEM_DUPLICADO). Os demais códigos 422 estão nos cenários das regras: `QUANTIDADE_*` (CT-52, CT-53), `DADOS_INVALIDOS` (CT-63) e `CUPOM_INVALIDO`/`CUPOM_EXPIRADO` (CT-06) | ✅ CT-80 · ❌ `QUANTIDADE_MAXIMA_EXCEDIDA` (CT-52 · 6, CT-53) | BUG-03 |
| Pedido confirmado com número `VZ-` + 6 dígitos | CT-62 (também visto na tela, no CT-60) | ✅ API · ✅ UI (3 nav.) | — |
| Método não aceito → 405 (DOC-11) | CT-81 (3 exemplos) | ✅ | — |
| Lista e consulta de produtos | CT-82 | ✅ | — |

## Resumo

Regras cobertas: 19 de 19.
- CA01 a CA11: 11 de 11.
- Regras da loja: 4 de 4. Como não tem etapa de pagamento, o "pagamento na entrega" é conferido pelo texto da confirmação (CT-60).
- Contrato da API: 4 de 4 (códigos de erro, 405, produtos e número do pedido `VZ-`).

Cenários: 27 (10 de UI e 17 de API). Com os exemplos de `Scenario Outline`, viram 57 execuções: 14 de UI e 43 de API.

Rodadas: 85 (as 14 de UI × 3 navegadores + as 43 de API no Chromium). 76 passaram e 9 falharam por bug, todas com `@bug-XX`. Nenhuma falha ficou sem bug registrado.
- BUG-01 (frete cobrado com subtotal de exatamente R$ 200,00): CT-20 nos 3 navegadores, CT-23, CT-25 e CT-27.
- BUG-03 (API aceita mais de 5 unidades): CT-52 · 6 e CT-53.
- BUG-04 (nome só com símbolos aceito): CT-64.

Bug que achei só na exploração manual, sem cenário automatizado: BUG-02 (layout em larguras pequenas, fora do card). O BUG-04 também saiu da exploração. Na API ganhou o CT-64, que falhou como esperado. Na tela não criei cenário automatizado: o caso está registrado na exploração (9-01), com print.

Comparação visual: no CT-21, a tela inteira do carrinho deu 0 pixels diferentes da referência nos três navegadores.

Lacunas: a validação de e-mail e de CEP inválidos não é conferida na API, porque o CT-63 só confere o nome. As duas regras estão cobertas na UI (CT-61), e o formato da resposta ficou registrado na DOC-01.

Por decisão, algumas regras ficam numa camada só ([Critério de priorização](01-plano-de-teste.md#critério-de-priorização)): CA02, CA08, CA09 e CA11 só na API, porque são regras de valor, e CA05 só na UI, porque é comportamento da tela.
