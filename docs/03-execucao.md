# Execução

Status: **Passou** (resultado igual ao esperado) · **Falhou** (o sistema respondeu diferente do esperado; vira bug) · **Bloqueado** (não foi possível executar). "—" = ainda não executado.

Nos `Scenario Outline`, cada exemplo tem a sua linha (ex.: `CT-24 · 199,90`), para cada resultado ter evidência própria.

## Cupom de desconto (`features/cupom.feature`)

| ID | Cenário | Regra | Camada | Tipo | Resultado | Evidência | Bug |
|---|---|---|---|---|---|---|---|
| CT-01 | Cupom válido mostra o desconto e esconde o campo de cupom | CA01, CA05 | UI | automatizado | — | | |
| CT-02 · XYZ123 | Cupom recusado mostra o motivo e não dá desconto | CA03 | UI | automatizado | — | | |
| CT-02 · VERAO2026 | Cupom recusado mostra o motivo e não dá desconto | CA04 | UI | automatizado | — | | |
| CT-03 | Para trocar de cupom, o cliente remove o atual e aplica outro | CA05 | UI | automatizado | — | | |
| CT-04 · BEMVINDO10 | API aplica 10% de desconto com o BEMVINDO10 em qualquer forma aceita | CA01 | API | automatizado | — | | |
| CT-04 · bemvindo10 | API aplica 10% de desconto com o BEMVINDO10 em qualquer forma aceita | CA02 | API | automatizado | — | | |
| CT-04 · `" bemVindo10 "` | API aplica 10% de desconto com o BEMVINDO10 em qualquer forma aceita | CA02 | API | automatizado | — | | |
| CT-05 · XYZ123 | API recusa cupom inexistente ou expirado sem erro e sem desconto | CA03 | API | automatizado | — | | |
| CT-05 · VERAO2026 | API recusa cupom inexistente ou expirado sem erro e sem desconto | CA04 | API | automatizado | — | | |
| CT-05 · verao2026 | API recusa cupom inexistente ou expirado sem erro e sem desconto | CA02, CA04 | API | automatizado | — | | |
| CT-06 · XYZ123 | Pedido com cupom inexistente ou expirado é recusado com 422 | CA03 | API | automatizado | — | | |
| CT-06 · VERAO2026 | Pedido com cupom inexistente ou expirado é recusado com 422 | CA04 | API | automatizado | — | | |

## Frete grátis (`features/frete.feature`)

| ID | Cenário | Regra | Camada | Tipo | Resultado | Evidência | Bug |
|---|---|---|---|---|---|---|---|
| CT-20 | Frete grátis com subtotal de exatamente R$ 200,00 | CA06 | UI | automatizado | — | | BUG-01 |
| CT-21 | Frete cobrado e aviso de R$ 0,10 com subtotal de R$ 199,90 | CA07 | UI | automatizado | — | | |
| CT-22 | Frete passa a ser grátis ao aumentar a quantidade no carrinho | CA06 | UI | automatizado | — | | |
| CT-23 | API dá frete grátis com subtotal de exatamente R$ 200,00 | CA06 | API | automatizado | — | | BUG-01 |
| CT-24 · 219,80 | API calcula frete e valor faltante acima e abaixo de R$ 200,00 | CA06 | API | automatizado | — | | |
| CT-24 · 239,70 | API calcula frete e valor faltante acima e abaixo de R$ 200,00 | CA06 | API | automatizado | — | | |
| CT-24 · 199,90 | API calcula frete e valor faltante acima e abaixo de R$ 200,00 | CA07 | API | automatizado | — | | |
| CT-24 · 199,80 | API calcula frete e valor faltante acima e abaixo de R$ 200,00 | CA07 | API | automatizado | — | | |
| CT-24 · 79,80 | API calcula frete e valor faltante acima e abaixo de R$ 200,00 | CA07 | API | automatizado | — | | |
| CT-25 | API mantém frete grátis quando o cupom deixa o valor em R$ 180,00 | CA08 | API | automatizado | — | | BUG-01 |
| CT-26 · 219,80 | API calcula desconto e frete com cupom | CA08 | API | automatizado | — | | |
| CT-26 · 109,80 | API calcula desconto e frete com cupom | CA09 | API | automatizado | — | | |
| CT-27 | Pedido com subtotal de exatamente R$ 200,00 sai com frete grátis | CA06 | API | automatizado | — | | |

## Limite de quantidade (`features/quantidade.feature`)

| ID | Cenário | Regra | Camada | Tipo | Resultado | Evidência | Bug |
|---|---|---|---|---|---|---|---|
| CT-50 | Carrinho trava o botão + ao chegar a 5 unidades | CA10 | UI | automatizado | — | | |
| CT-51 | Vitrine trava o botão Adicionar ao carrinho ao chegar a 5 unidades | CA10 | UI | automatizado | — | | |
| CT-52 · 5 | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | — | | |
| CT-52 · 6 | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | — | | |
| CT-52 · 0 | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | — | | |
| CT-52 · -1 | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | — | | |
| CT-52 · 1.5 | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | — | | |
| CT-52 · `"2"` | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | — | | |

## Checkout e confirmação (`features/checkout.feature`)

| ID | Cenário | Regra | Camada | Tipo | Resultado | Evidência | Bug |
|---|---|---|---|---|---|---|---|
| CT-60 | Compra completa com cupom, do carrinho à confirmação | CA01, regra da loja | UI | automatizado | — | | |
| CT-61 · nome | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | regra da loja | UI | automatizado | — | | |
| CT-61 · email | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | regra da loja | UI | automatizado | — | | |
| CT-61 · cep 7 dígitos | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | regra da loja | UI | automatizado | — | | |
| CT-61 · cep 9 dígitos | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | regra da loja | UI | automatizado | — | | |
| CT-62 · 01310-100 | API cria o pedido com número VZ- e CEP normalizado | regra da loja | API | automatizado | — | | |
| CT-62 · 01310100 | API cria o pedido com número VZ- e CEP normalizado | regra da loja | API | automatizado | — | | |
| CT-63 | API recusa pedido com dados do cliente inválidos | regra da loja | API | automatizado | — | | |

## Contrato da API (`features/api-erros.feature`)

| ID | Cenário | Regra | Camada | Tipo | Resultado | Evidência | Bug |
|---|---|---|---|---|---|---|---|
| CT-80 · JSON_INVALIDO | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | — | | |
| CT-80 · ROTA_NAO_ENCONTRADA | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | — | | |
| CT-80 · PRODUTO_NAO_ENCONTRADO 404 | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | — | | |
| CT-80 · PRODUTO_NAO_ENCONTRADO 422 | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | — | | |
| CT-80 · ITENS_OBRIGATORIOS sem itens | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | — | | |
| CT-80 · ITENS_OBRIGATORIOS lista vazia | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | — | | |
| CT-80 · ITEM_INVALIDO | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | — | | |
| CT-80 · ITEM_DUPLICADO | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | — | | |
| CT-81 · GET /api/carrinho/calcular | API recusa método não aceito numa rota existente | contrato da API | API | automatizado | — | | |
| CT-81 · GET /api/pedidos | API recusa método não aceito numa rota existente | contrato da API | API | automatizado | — | | |
| CT-81 · POST /api/produtos | API recusa método não aceito numa rota existente | contrato da API | API | automatizado | — | | |
| CT-82 | API lista os 8 produtos e consulta um produto pelo id | contrato da API | API | automatizado | — | | |
| CT-83 · 239,70 | API calcula o total pela fórmula, com itens e valores em 2 casas decimais | CA11, fórmula | API | automatizado | — | | |
| CT-83 · 109,80 | API calcula o total pela fórmula, com itens e valores em 2 casas decimais | CA11, fórmula | API | automatizado | — | | |
