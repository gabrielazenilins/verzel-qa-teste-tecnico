---
name: cenarios-verzel-store
description: Levanta e automatiza cenários BDD da Verzel Store (cupom, frete grátis, quantidade, checkout e API) com Playwright + Cucumber, seguindo o padrão deste repositório. Use ao pedir cenários, Gherkin, steps, Page Objects ou testes de API da Verzel Store.
---

# Cenários BDD — Verzel Store

Skill específica deste repositório (teste técnico QA Júnior Verzel, card VZS-142).

**Divisão de responsabilidades:**
- `CLAUDE.md` (raiz) = O QUE o sistema deve fazer: regras CA01–CA11, fórmula do total, dados de teste, códigos de erro, o que NÃO é bug, fora de escopo.
- Esta skill = COMO escrever e organizar os testes.
- Nunca copie regras de negócio para esta skill nem para os testes "de cabeça": consulte o `CLAUDE.md` e, em caso de dúvida, `docs/referencias/documentacao-v2.3.0.md` (o PDF original só serve para tirar dúvida sobre a transcrição).

> Locators e rotas confirmados na exploração manual de 06/10/2026 (`docs/00-exploracao.md`).
> A loja não usa `data-testid`; use os ganchos estáveis listados na seção 4.

## 0. Antes de qualquer tarefa
1. Leia o `CLAUDE.md`.
2. Liste `features/`, `steps/`, `pages/`, `api/` e `support/` para saber o que já existe.
3. Confira o maior `@CT-XX` já usado na faixa da feature (seção 2.3).
4. Se o pedido não deixar claro qual regra, tela ou endpoint testar, pergunte.

## 1. Stack e configuração
- Playwright + Cucumber, JavaScript **CommonJS** (`require` / `module.exports`).
- `support/world.js` abre e fecha o navegador por cenário, escolhido pela variável `BROWSER` (`chromium` é o padrão, ou `firefox`/`webkit`). Para rodar nos três: `npm run test:all` (o Chromium roda tudo; Firefox e WebKit só os `@ui`, porque a API não depende de navegador). Cada cenário começa com contexto novo, portanto **carrinho vazio** (o carrinho fica só na aba). Não crie passos de "limpar carrinho".
- `support/config.js` exporta `BASE_URL` (`process.env.BASE_URL` com fallback para a URL da loja). Nunca escreva a URL em outro arquivo.
- `cucumber.js` exclui `@manual` da execução (`tags: 'not @manual'`), carrega o `world.js` antes dos outros arquivos de `support/` (assim o `After` que fecha o navegador roda por último) e gera um relatório por navegador (`reports/cucumber-report-<navegador>.html`).
- Não altere `world.js`, `config.js` nem `cucumber.js` sem perguntar.

## 2. Mapa do projeto

### 2.1 Telas e Page Objects (`pages/`)
| Page Object | Tela | Rota | Como confirmar que está na tela |
|---|---|---|---|
| `CatalogPage` | Vitrine de produtos | `/` | `h2#titulo-vitrine` = "Produtos" · título da aba "Produtos \| Verzel Store" |
| `CartPage` | Carrinho | `/carrinho` | `h1` = "Carrinho" (vazio: `h1` = "Seu carrinho está vazio") |
| `CheckoutPage` | Finalizar compra | `/checkout` | `h1` = "Finalizar compra" |
| `ConfirmationPage` | Pedido confirmado | `/pedido-confirmado` | `.confirmacao-selo` = "Pedido confirmado" |
| `components/Header.js` | Cabeçalho | todas | links Produtos / Documentação / Carrinho e `.contador-carrinho` |
| `components/Summary.js` | Resumo de valores | carrinho, checkout e confirmação | `[data-valor="subtotal|desconto|frete|total"]` (texto cru, convertido no step com `money.js`) |

Comportamentos da interface (confirmados):
- Não há página de produto nem escolha de quantidade na vitrine: cada clique em "Adicionar ao carrinho" soma 1 unidade e atualiza o aviso do card (ex.: "3 no carrinho"). Com 5 unidades, o botão do produto fica desabilitado e o aviso mostra "Limite de 5 unidades atingido.".
- O cupom fica **no carrinho**. Com cupom aplicado, o campo some e aparece "Cupom BEMVINDO10 aplicado." com o botão "Remover cupom".
- Quantidade só por botões +/−. O "−" fica desabilitado em 1; o "+" fica desabilitado em 5 e aparece "Limite de 5 unidades por produto.". Para tirar o item, use "Remover".
- O carrinho e o cupom sobrevivem ao F5 (ficam na aba). Após confirmar o pedido, o carrinho é esvaziado.
- Cupom inválido ou expirado não é levado ao checkout; o erro 422 de `/api/pedidos` só é testável pela API.
- No checkout, as validações aparecem só ao clicar em "Confirmar pedido".
- Cada alteração no carrinho chama `POST /api/carrinho/calcular`; a tela exibe o resultado.

### 2.2 Clientes de API (`api/`)
| Cliente | Endpoints |
|---|---|
| `ProdutosApi` | `GET /api/produtos`, `GET /api/produtos/{id}` |
| `CarrinhoApi` | `POST /api/carrinho/calcular` |
| `PedidosApi` | `POST /api/pedidos` |
| `RawApi` | requisição livre (método, rota, corpo cru) para testar 400, 404 e 405 |

### 2.3 Features e faixas de ID
Cada feature agrupa uma regra e pode ter cenários `@ui` e `@api`.

| Arquivo | Escopo | Faixa de ID |
|---|---|---|
| `features/cupom.feature` | CA01–CA05 | CT-01 a CT-19 |
| `features/frete.feature` | CA06–CA09 | CT-20 a CT-39 |
| ~~`features/calculo.feature`~~ | não será criada: a fórmula do total e o CA11 ficaram no CT-83 de `api-erros.feature` | (CT-40 a CT-49 sem uso) |
| `features/quantidade.feature` | CA10 | CT-50 a CT-59 |
| `features/checkout.feature` | nome, e-mail, CEP, confirmação | CT-60 a CT-79 |
| `features/api-erros.feature` | contrato da API: códigos de erro, 405, produtos, fórmula do total e CA11 | CT-80 a CT-99 |

Steps: todos os passos ficam num único arquivo, `steps/common.steps.js`, separados por seção (API, UI: preparação do carrinho, ações, verificações). Antes de criar um passo, procure nele: o Cucumber dá erro com passos duplicados. Só crie outro arquivo de steps se um passo for exclusivo de uma feature e não fizer sentido no vocabulário comum.

## 3. Linguagem padrão dos passos
Keywords em inglês, Feature e Scenario em português, passos em inglês.
**Reaproveite estes passos.** Só crie um passo novo se nenhum servir, e procure antes em todos os arquivos de steps: o Cucumber dá erro com passos duplicados.
Valores monetários nos passos sempre como string com ponto decimal: `"23.97"`, `"0.00"`.

**`steps/common.steps.js` — UI**
```gherkin
Given I am on the products page
Given I have "P005" with quantity 2 in the cart       # clica N vezes em "Adicionar ao carrinho" na vitrine
Given I have the following items in the cart:
  | produto | quantidade |
  | P002    | 1          |
  | P004    | 2          |
When I apply the coupon "BEMVINDO10"
When I remove the coupon
When I increase the quantity of "P001" 2 times
When I decrease the quantity of "P001" 1 time
When I remove "P001" from the cart
When I go to checkout
When I fill the customer data with name "Maria Silva", email "maria@exemplo.com" and zip code "01310-100"
When I confirm the order
Then the subtotal should be "239.70"
Then the discount should be "23.97"
Then the shipping should be "0.00"
Then the total should be "215.73"
Then the amount missing for free shipping should be "0.20"
Then the shipping should be free
Then the free shipping notice should not be shown        # com frete grátis o aviso "Faltam R$ X" some (DOC-15)
Then the free shipping notice should be "Faltam R$ 0,10 para o frete grátis."
Then the coupon message should be "Cupom inválido."
Then the coupon "BEMVINDO10" should be shown as applied
Then the coupon field should not be shown                # com cupom aplicado, o campo some (CA05)
Then the increase button of "P001" should be disabled
Then I should see the limit message for "P001"
Then the field "cep" should show the error "Informe um CEP com 8 dígitos."
Then I should see the order confirmation with a number in the format VZ-000000
Then the cart should be empty
Then I should still be on the checkout page                # dado inválido: o pedido não é confirmado
```

**`steps/common.steps.js` — UI (vitrine)**
```gherkin
When I add "P001" to the cart 5 times                    # cliques em "Adicionar ao carrinho" na vitrine, ficando na vitrine
Then the add button of "P001" should be disabled
Then I should see the limit notice of "P001" on the products page   # só que o aviso de limite aparece, sem cobrar o texto
```

**`steps/common.steps.js` — API**
```gherkin
Given the cart items:
  | produto | quantidade |
  | P005    | 1          |
Given the coupon "BEMVINDO10"
Given the customer with name "Maria Silva", email "maria@exemplo.com" and zip code "01310-100"
When I calculate the cart via API
When I create the order via API
When I send a "GET" request to "/api/carrinho/calcular"
When I send a "POST" request to "/api/carrinho/calcular" with body "{invalido"
Then the response status should be 200
Then the response field "desconto" should be "23.97"
Then the response field "cupom.aplicado" should be "false"
Then the error code should be "QUANTIDADE_MAXIMA_EXCEDIDA" on field "itens[0].quantidade"
When I send a "POST" request to "/api/carrinho/calcular" with body '{"itens":[]}'   # aspas simples quando o JSON tem aspas duplas; '' = sem corpo
When I attach the response to the report               # ação: vem logo depois do When que chama a API, para rodar mesmo se um Then falhar
Then the response field "numero" should match "^VZ-\d{6}$"
Then the response should be a list with exactly the ids "P001, P002, P003, P004, P005, P006, P007, P008"
Then the response total should be subtotal minus discount plus shipping   # compara em centavos (Math.round(x*100)); os campos já são conferidos com toBe
Then every monetary value in the response should have at most 2 decimal places
```
- `the response field` aceita caminho com ponto (`cupom.mensagem`; índice de lista também com ponto: `itens.0.total`) e converte o esperado: número (`"23.97"` → 23.97), booleano (`"true"`) ou texto. A comparação de números usa `toBe` (exata), para pegar erro de ponto flutuante (CA11).
- Os passos `Given` de API só montam o corpo em `this.requestBody`; quem envia é o `When`.
- `the cart items:` lê a coluna `quantidade` como literal JSON (`JSON.parse`): `1.5` vai como número decimal e `"2"` (com aspas) vai como texto. Não converta com `Number()`, senão o caso `"2"` do CT-52 deixa de testar o que diz testar.

## 4. Page Objects
- Sem `data-testid` na loja. Use, nesta ordem: `getByRole` com o nome acessível (`aria-label`), `#id`, `[data-valor=...]` e classes semânticas (`.aviso-frete`). Evite XPath e seletor por posição.
- Métodos de ação e de leitura (`getTotalText()`), **sem `expect`**.
- Leituras de valor devolvem o texto cru; a conversão para número é feita no step com `money.js`.
- Os `aria-label` usam o **nome** do produto, não o id. Converta id → nome com `support/produtos.js`.
- Se a tela já tiver Page Object, acrescente métodos em vez de recriar.

### Ganchos confirmados
| Tela | Elemento | Locator |
|---|---|---|
| Vitrine | botão adicionar do produto | `page.locator('.produto-corpo').filter({ has: page.locator('#nome-P002') }).getByRole('button', { name: 'Adicionar ao carrinho' })` |
| Vitrine | aviso do card ("3 no carrinho"; no limite, "Limite de 5 unidades atingido." com a classe `produto-aviso-limite`) | `#aviso-P002` |
| Vitrine | botão adicionar no limite | o mesmo botão, com `disabled` e `aria-describedby="aviso-P002"` |
| Cabeçalho | contador (soma de **unidades**: P001 ×3 → 3) | `.contador-carrinho` |
| Carrinho | aumentar / diminuir | `getByRole('button', { name: 'Aumentar quantidade de Camiseta Essencial' })` / `'Diminuir quantidade de ...'` |
| Carrinho | quantidade | `getByRole('group', { name: 'Quantidade de Camiseta Essencial' }).locator('output')` |
| Carrinho | remover item | `getByRole('button', { name: 'Remover Camiseta Essencial do carrinho' })` |
| Carrinho | linha do produto | `page.locator('li.item-carrinho').filter({ has: <grupo 'Quantidade de ...'> })` |
| Carrinho | aviso de limite | `.item-limite` dentro da linha do produto ("Limite de 5 unidades por produto.") |
| Carrinho | campo do cupom | `#campo-cupom` |
| Carrinho | aplicar cupom | `getByRole('button', { name: 'Aplicar cupom' })` |
| Carrinho | mensagem de erro do cupom | `#mensagem-cupom` ("Cupom inválido.", "Cupom expirado.", "Informe um cupom.") |
| Carrinho | cupom aplicado | `.cupom-aplicado` ("Cupom BEMVINDO10 aplicado.") |
| Carrinho | remover cupom | `getByRole('button', { name: 'Remover cupom' })` |
| Carrinho | aviso de frete | `.aviso-frete` ("Faltam R$ X para o frete grátis."). Com frete grátis, o aviso **não aparece** e `[data-valor="frete"]` mostra "Grátis" |
| Carrinho | finalizar | `getByRole('link', { name: 'Finalizar compra' })` |
| Carrinho | esvaziar | `getByRole('button', { name: 'Esvaziar carrinho' })` |
| Carrinho, Checkout, Confirmação | valores | `[data-valor="subtotal"]`, `[data-valor="desconto"]`, `[data-valor="frete"]`, `[data-valor="total"]` |
| Checkout, Confirmação | itens do resumo | `.resumo-itens li` (ex.: "5x Kit 3 Pares de Meias · R$ 149,50") |
| Checkout | campos | `#campo-nome`, `#campo-email`, `#campo-cep` |
| Checkout | erros dos campos | `#campo-nome-erro`, `#campo-email-erro`, `#campo-cep-erro` |
| Checkout | confirmar | `getByRole('button', { name: 'Confirmar pedido' })` |
| Confirmação | número do pedido | `.numero-pedido` (ex.: "VZ-856317") |

Os Page Objects reais estão em `pages/`; o trecho abaixo resume o `CartPage` (veja o arquivo antes de acrescentar métodos):
```js
class CartPage {
    constructor(page){
        this.page = page
        this.heading         = page.getByRole('heading', { level: 1 })
        this.couponInput     = page.locator('#campo-cupom')
        this.applyCouponBtn  = page.getByRole('button', { name: 'Aplicar cupom' })
        this.removeCouponBtn = page.getByRole('button', { name: 'Remover cupom' })
        this.couponMessage   = page.locator('#mensagem-cupom')
        this.couponApplied   = page.locator('.cupom-aplicado')
        this.shippingNotice  = page.locator('.aviso-frete')
        this.checkoutLink    = page.getByRole('link', { name: 'Finalizar compra' })
    }
    item(id){ /* li.item-carrinho do produto */ }
    limitMessage(id){ /* .item-limite dentro de item(id) */ }
    increaseButton(id){ /* "Aumentar quantidade de <nome>" */ }
    decreaseButton(id){ /* "Diminuir quantidade de <nome>" */ }
    quantity(id){ /* <output> do grupo "Quantidade de <nome>" */ }
    async increase(id){ /* um clique; o step espera a quantidade mudar */ }
    async decrease(id){ /* idem */ }
    async remove(id){ /* "Remover <nome> do carrinho" */ }
    async applyCoupon(code){ /* preenche e clica em "Aplicar cupom" */ }
    async removeCoupon(){ /* clica em "Remover cupom" */ }
    async goToCheckout(){ /* clica em "Finalizar compra" */ }
}
```
- **Valores** (subtotal, desconto, frete, total) **não** ficam no `CartPage`: estão em `pages/components/Summary.js` (`value(nome)` / `getValueText(nome)`), que serve ao carrinho, ao checkout e à confirmação. Não duplique esses localizadores nos Page Objects.
- Cada clique em +, −, aplicar ou remover dispara `POST /api/carrinho/calcular`. Os steps esperam o efeito na tela antes de seguir: a quantidade mudar (+/−), o cupom aplicado ou a mensagem aparecer (aplicar cupom), o campo voltar (remover cupom). Valores são lidos com `expect.poll` + `parseMoney`, devolvendo o texto cru quando a conversão falha, para o poll tentar de novo. Nunca `waitForTimeout`.

## 5. Helpers (`support/`)
- `money.js` → `parseMoney(texto)` converte os formatos exibidos na tela:
  - `"R$ 59,90"` → `59.9` · `"R$ 1.234,56"` → `1234.56`
  - `"- R$ 20,00"` (desconto) → `20` (valor absoluto)
  - `"Grátis"` (frete grátis) → `0`
- `produtos.js` → mapa id → nome (`P001` → `Camiseta Essencial` …), usado para montar os `aria-label`. Os dados vêm da tabela do `CLAUDE.md`.
- `config.js` → `BASE_URL`.
- `api.hooks.js` → `Before({ tags: '@api' })` cria os clientes de API com `request.newContext({ baseURL, extraHTTPHeaders: { 'Content-Type': 'application/json' } })`; `After({ tags: '@api' })` faz `dispose()`.
- `ui.hooks.js` → `Before({ tags: '@ui' })` cria os Page Objects em `this.pages` (`catalog`, `cart`, `checkout`, `confirmation`, `header`, `summary`). Roda depois do `Before` do `world.js`, que abre o navegador.
- `evidence.hooks.js` (já implementado) → num `After` para cenários `@ui`:
  - sempre que o cenário **falhar** ou tiver tag `@bug-XX`, tira `page.screenshot({ fullPage: true })`, anexa ao relatório com `this.attach(..., 'image/png')` e salva em `docs/05-evidencias/automacao/<CT-XX>_<navegador>_<status>.png` (ex.: `CT-20_chromium_falhou.png`);
  - o ID vem da tag `@CT-XX` do cenário (`pickle.tags`). Em `Scenario Outline`, acrescenta a posição do exemplo, contando todos os blocos `Examples` em ordem: `<CT-XX>-ex<N>_<navegador>_<status>.png` (ex.: `CT-02-ex2_chromium_falhou.png`). Assim cada exemplo tem o seu print, como cada um tem a sua linha no `docs/03-execucao.md`.
  Assim cada execução gera a evidência do bug sem print manual.
  - em cenário `@api` que **falhou** e tem `@bug-XX`, salva todas as requisições e respostas do cenário, com o esperado × obtido, em `docs/05-evidencias/automacao/<CT-XX>_api.json` (Outline: `<CT-XX>-ex<N>_api.json`). A pasta `reports/` não vai para o repositório; esse arquivo é a evidência versionada.
- `response.js` → guarda a resposta no World (`this.response`, `this.responseBody`, `this.exchanges`) e anexa requisição + resposta ao relatório em toda chamada de API.
- `scenario-id.js` → monta o ID usado nos nomes de evidência (`CT-XX` ou `CT-XX-ex<N>`).

## 6. Escrevendo cenários
- Toda tag de cenário: `@CT-XX @CAXX @ui|@api @manual|@automatizado`. Quando nenhum critério CA se aplica, use no lugar do `@CAXX`:
  - `@regra-loja`: regras da loja anteriores ao card (nome com sobrenome, e-mail válido, CEP com 8 dígitos, pagamento na entrega), em `checkout.feature`;
  - `@contrato-api`: o que vem só da seção "API" e da tabela de códigos de erro da documentação (formato de erro, 400/404/405/422 sem CA, endpoints de produtos), em `api-erros.feature`.
  Um cenário que exercita um CA e uma dessas regras leva as duas tags (ex.: CT-60 tem `@CA01 @regra-loja`).
- Valores esperados concretos e calculados pela regra do `CLAUDE.md`. Use as combinações de produtos que já estão lá para os valores-limite.
- `Scenario Outline` + `Examples` quando só os dados mudam (ex.: variações de maiúsculas e espaços do cupom, CEPs inválidos). O Gherkin remove os espaços das bordas das células: para um valor com espaço no início ou no fim, ponha as aspas dentro da célula (`" bemVindo10 "`) e escreva o passo sem aspas (`And the coupon <cupom>`), como no CT-04 de `features/cupom.feature`.
- Divisão entre camadas (não repita na UI o que a API já verifica):
  - **API** testa as regras e os valores: valores-limite, desconto, frete, faltante, total, arredondamento e códigos de erro. Prefira `Scenario Outline` para variar os dados.
  - **UI** testa só o que o cliente vê e faz: o que aparece na tela (mensagens, "Grátis", aviso "Faltam R$ X", cupom aplicado, botões travados) e as ações que mudam o carrinho (+, −, remover, aplicar e remover cupom). Poucos valores, só os representativos.
  - Um bug confirmado nas duas camadas ganha um cenário em cada uma.
- Não crie cenário que trate como defeito algo listado em "NÃO é bug" no `CLAUDE.md`.
- Ambiguidade: escreva com a interpretação adotada, coloque `# Interpretação: ...` acima do cenário e registre em `docs/00-exploracao.md` (seção "Análise da documentação", como um novo item DOC-XX).

```gherkin
Feature: Frete grátis
  Como cliente da Verzel Store
  Eu quero ganhar frete grátis em compras a partir de R$ 200,00
  Para pagar menos nas minhas compras

  # UI: o que o cliente vê ao mudar o carrinho
  # Interpretação (DOC-15): com frete grátis, o aviso "Faltam R$ X" não é exibido.
  @CT-22 @CA06 @ui @automatizado
  Scenario: Frete passa a ser grátis ao aumentar a quantidade no carrinho
    Given I have "P001" with quantity 3 in the cart       # clica N vezes em "Adicionar ao carrinho" na vitrine
    When I increase the quantity of "P001" 1 time
    Then the subtotal should be "239.60"
    And the shipping should be free
    And the total should be "239.60"
    And the free shipping notice should not be shown

  # API: regras e valores, com os dados variando nos Examples
  @CT-26 @CA08 @CA09 @api @automatizado
  Scenario Outline: API calcula desconto e frete com cupom
    Given the cart items:
      | produto    | quantidade |
      | <produto1> | <qtd1>     |
      | <produto2> | <qtd2>     |
    And the coupon "BEMVINDO10"
    When I calculate the cart via API
    Then the response status should be 200
    And the response field "desconto" should be "<desconto>"
    And the response field "frete" should be "<frete>"
    And the response field "valorFaltanteFreteGratis" should be "<faltante>"
    And the response field "total" should be "<total>"

    Examples: CA08 - frete grátis mesmo com o total abaixo de R$ 200,00
      | produto1 | qtd1 | produto2 | qtd2 | desconto | frete | faltante | total  |
      | P003     | 1    | P006     | 1    | 21.98    | 0.00  | 0.00     | 197.82 |

    Examples: CA09 - desconto não incide sobre o frete
      | produto1 | qtd1 | produto2 | qtd2 | desconto | frete | faltante | total  |
      | P001     | 1    | P004     | 1    | 10.98    | 19.90 | 90.20    | 118.72 |
```
O exemplo resume `features/frete.feature`; lá estão os cenários completos.

## 7. Rodar e registrar
- Um cenário: `npx cucumber-js --tags "@CT-24"`. Uma feature: `npx cucumber-js features/frete.feature`.
- Timeout = revise o locator. Nunca use `waitForTimeout`.
- **Falhou porque o sistema contraria a documentação → é bug.** Não mude o esperado para passar. Então:
  1. Adicione a tag `@bug-XX` ao cenário.
  2. Crie a entrada em `docs/04-bugs.md`:
     ```
     ### BUG-XX — <título curto>
     - Severidade: Crítica | Alta | Média | Baixa
     - Cenário: CT-XX | Regra: CAXX | Camada: UI/API
     - Passos para reproduzir: 1. ... 2. ...
     - Resultado esperado: ... (cite a documentação)
     - Resultado obtido: ...
     - Evidência: docs/05-evidencias/automacao/<CT-XX>_<navegador>_falhou.png (UI) ou docs/05-evidencias/automacao/<CT-XX>_api.json (API); em Outline, <CT-XX>-ex<N>
     ```
  3. Atualize a linha do cenário em `docs/03-execucao.md`: `| CT-XX | título | CAXX | UI/API | manual/automatizado | <Chromium> | <Firefox> | <WebKit> | evidência | BUG-XX |`, com Passou/Falhou/Bloqueado em cada navegador ("—" = não executado). Cenários de API rodam só pelo Chromium e ficam com "—" no Firefox e no WebKit. Em `Scenario Outline`, use **uma linha por exemplo** (ex.: `CT-24 · 199,90`), para cada resultado ter evidência própria.
- Evidências automáticas em `docs/05-evidencias/automacao/` (seção 5); prints e chamadas manuais em `docs/05-evidencias/exploracao/`.

## 8. Resumo ao terminar
- Arquivos criados ou alterados.
- Tabela: ID | cenário | regra | camada | manual/automatizado | resultado.
- Interpretações adotadas.
- Bugs encontrados (ID e título).

## Não fazer
- `expect` em Page Object ou cliente de API
- `waitForTimeout`
- Repetir regras de negócio fora do `CLAUDE.md`
- Ajustar o esperado para o teste passar quando o sistema está errado
- Reportar como bug o que está em "NÃO é bug"
- Testes de carga, estresse ou segurança (ambiente compartilhado)
- Alterar cenários existentes, `world.js`, `config.js` ou `cucumber.js` sem perguntar
- Reusar um `@CT-XX` ou sair da faixa de IDs da feature
