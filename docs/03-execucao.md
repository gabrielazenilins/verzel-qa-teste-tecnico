# Execução

Status: **Passou** (resultado igual ao esperado) · **Falhou** (o sistema respondeu diferente do esperado; vira bug) · **Bloqueado** (não foi possível executar). "—" = ainda não executado.

Colunas Chromium, Firefox e WebKit: resultado em cada navegador, na execução de 07/10/2026 (`npm run test:all`). Os cenários de UI rodaram nos três navegadores. Os de API não dependem de navegador e rodam uma vez, pelo Chromium; por isso ficam com "—" no Firefox e no WebKit. Os caminhos de evidência são relativos a `docs/05-evidencias/`.

Nos `Scenario Outline`, cada exemplo tem a sua linha (ex.: `CT-24 · 199,90`), para cada resultado ter evidência própria.

## Cupom de desconto (`features/cupom.feature`)

| ID | Cenário | Regra | Camada | Tipo | Chromium | Firefox | WebKit | Evidência | Bug |
|---|---|---|---|---|---|---|---|---|---|
| CT-01 | Cupom válido mostra o desconto e esconde o campo de cupom | CA01, CA05 | UI | automatizado | Passou | Passou | Passou | | |
| CT-02 · XYZ123 | Cupom recusado mostra o motivo e não dá desconto | CA03 | UI | automatizado | Passou | Passou | Passou | | |
| CT-02 · VERAO2026 | Cupom recusado mostra o motivo e não dá desconto | CA04 | UI | automatizado | Passou | Passou | Passou | | |
| CT-03 | Para trocar de cupom, o cliente remove o atual e aplica outro | CA05 | UI | automatizado | Passou | Passou | Passou | | |
| CT-04 · BEMVINDO10 | API aplica 10% de desconto com o BEMVINDO10 em qualquer forma aceita | CA01 | API | automatizado | Passou | — | — | | |
| CT-04 · bemvindo10 | API aplica 10% de desconto com o BEMVINDO10 em qualquer forma aceita | CA02 | API | automatizado | Passou | — | — | | |
| CT-04 · `" bemVindo10 "` | API aplica 10% de desconto com o BEMVINDO10 em qualquer forma aceita | CA02 | API | automatizado | Passou | — | — | | |
| CT-05 · XYZ123 | API recusa cupom inexistente ou expirado sem erro e sem desconto | CA03 | API | automatizado | Passou | — | — | | |
| CT-05 · VERAO2026 | API recusa cupom inexistente ou expirado sem erro e sem desconto | CA04 | API | automatizado | Passou | — | — | | |
| CT-05 · verao2026 | API recusa cupom inexistente ou expirado sem erro e sem desconto | CA02, CA04 | API | automatizado | Passou | — | — | | |
| CT-06 · XYZ123 | Pedido com cupom inexistente ou expirado é recusado com 422 | CA03 | API | automatizado | Passou | — | — | | |
| CT-06 · VERAO2026 | Pedido com cupom inexistente ou expirado é recusado com 422 | CA04 | API | automatizado | Passou | — | — | | |

## Frete grátis (`features/frete.feature`)

| ID | Cenário | Regra | Camada | Tipo | Chromium | Firefox | WebKit | Evidência | Bug |
|---|---|---|---|---|---|---|---|---|---|
| CT-20 | Frete grátis com subtotal de exatamente R$ 200,00 | CA06 | UI | automatizado | Falhou | Falhou | Falhou | `automacao/CT-20_chromium_falhou.png`, `automacao/CT-20_firefox_falhou.png`, `automacao/CT-20_webkit_falhou.png` | BUG-01 |
| CT-21 | Frete cobrado e aviso de R$ 0,10 com subtotal de R$ 199,90 | CA07 | UI | automatizado | Passou | Passou | Passou | | |
| CT-22 | Frete passa a ser grátis ao aumentar a quantidade no carrinho | CA06 | UI | automatizado | Passou | Passou | Passou | | |
| CT-23 | API dá frete grátis com subtotal de exatamente R$ 200,00 | CA06 | API | automatizado | Falhou | — | — | `automacao/CT-23_api.json` | BUG-01 |
| CT-24 · 219,80 | API calcula frete e valor faltante acima e abaixo de R$ 200,00 | CA06 | API | automatizado | Passou | — | — | | |
| CT-24 · 239,70 | API calcula frete e valor faltante acima e abaixo de R$ 200,00 | CA06 | API | automatizado | Passou | — | — | | |
| CT-24 · 199,90 | API calcula frete e valor faltante acima e abaixo de R$ 200,00 | CA07 | API | automatizado | Passou | — | — | | |
| CT-24 · 199,80 | API calcula frete e valor faltante acima e abaixo de R$ 200,00 | CA07 | API | automatizado | Passou | — | — | | |
| CT-24 · 79,80 | API calcula frete e valor faltante acima e abaixo de R$ 200,00 | CA07 | API | automatizado | Passou | — | — | | |
| CT-25 | API mantém frete grátis quando o cupom deixa o valor em R$ 180,00 | CA08 | API | automatizado | Falhou | — | — | `automacao/CT-25_api.json` | BUG-01 |
| CT-26 · 219,80 | API calcula desconto e frete com cupom | CA08 | API | automatizado | Passou | — | — | | |
| CT-26 · 109,80 | API calcula desconto e frete com cupom | CA09 | API | automatizado | Passou | — | — | | |
| CT-27 | Pedido com subtotal de exatamente R$ 200,00 sai com frete grátis | CA06 | API | automatizado | Falhou | — | — | `automacao/CT-27_api.json` | BUG-01 |

## Limite de quantidade (`features/quantidade.feature`)

| ID | Cenário | Regra | Camada | Tipo | Chromium | Firefox | WebKit | Evidência | Bug |
|---|---|---|---|---|---|---|---|---|---|
| CT-50 | Carrinho trava o botão + ao chegar a 5 unidades | CA10 | UI | automatizado | Passou | Passou | Passou | | |
| CT-51 | Vitrine trava o botão Adicionar ao carrinho ao chegar a 5 unidades | CA10 | UI | automatizado | Passou | Passou | Passou | | |
| CT-52 · 5 | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | Passou | — | — | | |
| CT-52 · 6 | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | Falhou | — | — | `automacao/CT-52-ex2_api.json` | BUG-03 |
| CT-52 · 0 | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | Passou | — | — | | |
| CT-52 · -1 | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | Passou | — | — | | |
| CT-52 · 1.5 | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | Passou | — | — | | |
| CT-52 · `"2"` | API aceita até 5 unidades e recusa quantidade acima do limite ou inválida | CA10 | API | automatizado | Passou | — | — | | |
| CT-53 | Pedido com mais de 5 unidades de um produto é recusado | CA10 | API | automatizado | Falhou | — | — | `automacao/CT-53_api.json` | BUG-03 |

## Checkout e confirmação (`features/checkout.feature`)

| ID | Cenário | Regra | Camada | Tipo | Chromium | Firefox | WebKit | Evidência | Bug |
|---|---|---|---|---|---|---|---|---|---|
| CT-60 | Compra completa com cupom, do carrinho à confirmação | CA01, regra da loja | UI | automatizado | Passou | Passou | Passou | | |
| CT-61 · nome | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | regra da loja | UI | automatizado | Passou | Passou | Passou | | |
| CT-61 · email | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | regra da loja | UI | automatizado | Passou | Passou | Passou | | |
| CT-61 · cep 7 dígitos | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | regra da loja | UI | automatizado | Passou | Passou | Passou | | |
| CT-61 · cep 9 dígitos | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | regra da loja | UI | automatizado | Passou | Passou | Passou | | |
| CT-62 · 01310-100 | API cria o pedido com número VZ- e CEP normalizado | regra da loja | API | automatizado | Passou | — | — | | |
| CT-62 · 01310100 | API cria o pedido com número VZ- e CEP normalizado | regra da loja | API | automatizado | Passou | — | — | | |
| CT-63 | API recusa pedido com dados do cliente inválidos | regra da loja | API | automatizado | Passou | — | — | | |

## Contrato da API (`features/api-erros.feature`)

| ID | Cenário | Regra | Camada | Tipo | Chromium | Firefox | WebKit | Evidência | Bug |
|---|---|---|---|---|---|---|---|---|---|
| CT-80 · JSON_INVALIDO | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | Passou | — | — | | |
| CT-80 · ROTA_NAO_ENCONTRADA | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | Passou | — | — | | |
| CT-80 · PRODUTO_NAO_ENCONTRADO 404 | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | Passou | — | — | | |
| CT-80 · PRODUTO_NAO_ENCONTRADO 422 | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | Passou | — | — | | |
| CT-80 · ITENS_OBRIGATORIOS sem itens | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | Passou | — | — | | |
| CT-80 · ITENS_OBRIGATORIOS lista vazia | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | Passou | — | — | | |
| CT-80 · ITEM_INVALIDO | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | Passou | — | — | | |
| CT-80 · ITEM_DUPLICADO | API responde com o status e o código de erro documentados | contrato da API | API | automatizado | Passou | — | — | | |
| CT-81 · GET /api/carrinho/calcular | API recusa método não aceito numa rota existente | contrato da API | API | automatizado | Passou | — | — | | |
| CT-81 · GET /api/pedidos | API recusa método não aceito numa rota existente | contrato da API | API | automatizado | Passou | — | — | | |
| CT-81 · POST /api/produtos | API recusa método não aceito numa rota existente | contrato da API | API | automatizado | Passou | — | — | | |
| CT-82 | API lista os 8 produtos e consulta um produto pelo id | contrato da API | API | automatizado | Passou | — | — | | |
| CT-83 · 239,70 | API calcula o total pela fórmula, com itens e valores em 2 casas decimais | CA11, fórmula | API | automatizado | Passou | — | — | | |
| CT-83 · 109,80 | API calcula o total pela fórmula, com itens e valores em 2 casas decimais | CA11, fórmula | API | automatizado | Passou | — | — | | |

---

## Execução manual — Google Chrome 154

Roteiro para repetir à mão os cenários de UI no Google Chrome 154.0.8037.98, sem precisar ler o Gherkin. Uma linha por exemplo, com os mesmos IDs da automação.

**Antes de cada linha:** abra uma **nova janela anônima** (Ctrl+Shift+N) em https://verzel-store.qa-test-verzel-store.workers.dev/. O carrinho fica guardado só na aba, então cada cenário começa com o carrinho vazio. "Adicionar" = clicar no botão "Adicionar ao carrinho" do card do produto na vitrine; cada clique soma 1 unidade.

**Ao executar:** preencha "Resultado obtido" com o que a tela mostrou, "Status" com Passou, Falhou ou Bloqueado, e salve o print em `docs/05-evidencias/manual/CT-XX_chrome154.png` (em Outline, `CT-XX-ex<N>_chrome154.png`).

| ID | Cenário | Passos (o que eu faço na tela) | Resultado esperado | Resultado obtido | Status | Evidência |
|---|---|---|---|---|---|---|
| CT-01 | Cupom válido mostra o desconto e esconde o campo de cupom | 1. Adicionar 1 Calça Jeans Slim e 2 Boné Aba Curva (2 cliques).<br>2. Abrir o Carrinho no cabeçalho.<br>3. Digitar `BEMVINDO10` no campo de cupom e clicar em "Aplicar cupom". | Aparece "Cupom BEMVINDO10 aplicado." com o botão "Remover cupom", e o campo de cupom some.<br>Desconto: - R$ 23,97.<br>Total: R$ 215,73. | | | |
| CT-02 · XYZ123 | Cupom recusado mostra o motivo e não dá desconto | 1. Adicionar 1 Mochila Urbana 20L.<br>2. Abrir o Carrinho.<br>3. Aplicar o cupom `XYZ123`. | Mensagem "Cupom inválido.".<br>Total: R$ 119,90 (sem desconto). | | | |
| CT-02 · VERAO2026 | Cupom recusado mostra o motivo e não dá desconto | 1. Adicionar 1 Mochila Urbana 20L.<br>2. Abrir o Carrinho.<br>3. Aplicar o cupom `VERAO2026`. | Mensagem "Cupom expirado.".<br>Total: R$ 119,90 (sem desconto). | | | |
| CT-03 | Para trocar de cupom, o cliente remove o atual e aplica outro | 1. Adicionar 1 Calça Jeans Slim e 2 Boné Aba Curva.<br>2. Abrir o Carrinho e aplicar `BEMVINDO10`.<br>3. Clicar em "Remover cupom".<br>4. Aplicar `VERAO2026`. | Depois de remover, o campo de cupom volta.<br>Ao aplicar o segundo cupom: "Cupom expirado.".<br>Subtotal: R$ 239,70. Total: R$ 239,70. | | | |
| CT-20 | Frete grátis com subtotal de exatamente R$ 200,00 | 1. Adicionar 2 Mochila Urbana 20L.<br>2. Abrir o Carrinho. | Subtotal: R$ 200,00. Frete: "Grátis". Total: R$ 200,00.<br>Sem o aviso "Faltam R$ ... para o frete grátis.".<br>(Na automação falhou: BUG-01.) | | | |
| CT-21 | Frete cobrado e aviso de R$ 0,10 com subtotal de R$ 199,90 | 1. Adicionar 1 Mochila Urbana 20L, 1 Garrafa Térmica 750ml e 1 Boné Aba Curva.<br>2. Abrir o Carrinho. | Subtotal: R$ 199,90. Frete: R$ 19,90. Total: R$ 219,80.<br>Aviso "Faltam R$ 0,10 para o frete grátis.". | | | |
| CT-22 | Frete passa a ser grátis ao aumentar a quantidade no carrinho | 1. Adicionar 3 Camiseta Essencial.<br>2. Abrir o Carrinho.<br>3. Clicar uma vez no "+" da Camiseta Essencial. | Quantidade: 4. Subtotal: R$ 239,60. Frete: "Grátis". Total: R$ 239,60.<br>O aviso "Faltam R$ ..." some. | | | |
| CT-50 | Carrinho trava o botão + ao chegar a 5 unidades | 1. Adicionar 1 Camiseta Essencial.<br>2. Abrir o Carrinho.<br>3. Clicar 4 vezes no "+" da Camiseta Essencial. | Quantidade: 5. O "+" fica desabilitado.<br>Aparece "Limite de 5 unidades por produto." na linha da camiseta.<br>Subtotal: R$ 299,50. | | | |
| CT-51 | Vitrine trava o botão Adicionar ao carrinho ao chegar a 5 unidades | 1. Na vitrine, clicar 5 vezes em "Adicionar ao carrinho" da Camiseta Essencial. | O botão "Adicionar ao carrinho" da camiseta fica desabilitado.<br>O card mostra o aviso de limite ("Limite de 5 unidades atingido."). | | | |
| CT-60 | Compra completa com cupom, do carrinho à confirmação | 1. Adicionar 1 Mochila Urbana 20L.<br>2. Abrir o Carrinho e aplicar `BEMVINDO10`.<br>3. Clicar em "Finalizar compra".<br>4. Preencher: Maria Silva / maria@exemplo.com / 01310-100.<br>5. Clicar em "Confirmar pedido". | Tela "Pedido confirmado", com número no formato VZ- e 6 dígitos.<br>Subtotal: R$ 100,00. Desconto: - R$ 10,00. Frete: R$ 19,90. Total: R$ 109,90.<br>Texto "o pagamento será feito na entrega".<br>Contador do Carrinho no cabeçalho: 0. | | | |
| CT-61 · nome | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | 1. Adicionar 1 Mochila Urbana 20L, abrir o Carrinho e clicar em "Finalizar compra".<br>2. Preencher: **Maria** / maria@exemplo.com / 01310-100.<br>3. Clicar em "Confirmar pedido". | No campo nome: "Informe nome e sobrenome.".<br>Continua na tela "Finalizar compra" (pedido não confirmado). | | | |
| CT-61 · email | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | 1. Adicionar 1 Mochila Urbana 20L, abrir o Carrinho e clicar em "Finalizar compra".<br>2. Preencher: Maria Silva / **maria.exemplo.com** / 01310-100.<br>3. Clicar em "Confirmar pedido". | No campo e-mail: "Informe um e-mail válido.".<br>Continua na tela "Finalizar compra". | | | |
| CT-61 · cep 7 dígitos | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | 1. Adicionar 1 Mochila Urbana 20L, abrir o Carrinho e clicar em "Finalizar compra".<br>2. Preencher: Maria Silva / maria@exemplo.com / **0131010**.<br>3. Clicar em "Confirmar pedido". | No campo CEP: "Informe um CEP com 8 dígitos.".<br>Continua na tela "Finalizar compra". | | | |
| CT-61 · cep 9 dígitos | Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido | 1. Adicionar 1 Mochila Urbana 20L, abrir o Carrinho e clicar em "Finalizar compra".<br>2. Preencher: Maria Silva / maria@exemplo.com / **013101000**.<br>3. Clicar em "Confirmar pedido". | No campo CEP: "Informe um CEP com 8 dígitos.".<br>Continua na tela "Finalizar compra". | | | |
