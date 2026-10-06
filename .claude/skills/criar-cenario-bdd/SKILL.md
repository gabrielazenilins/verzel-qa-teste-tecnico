---
name: cenarios-verzel-store
description: Levanta e automatiza cenários BDD da Verzel Store (cupom, frete grátis, quantidade, checkout e API) com Playwright + Cucumber, seguindo o padrão deste repositório. Use ao pedir cenários, Gherkin, steps, Page Objects ou testes de API da Verzel Store.
---

# Cenários BDD — Verzel Store

Skill específica deste repositório (teste técnico QA Júnior Verzel, card VZS-142).

**Divisão de responsabilidades:**
- `CLAUDE.md` (raiz) = O QUE o sistema deve fazer: regras CA01–CA11, fórmula do total, dados de teste, códigos de erro, o que NÃO é bug, fora de escopo.
- Esta skill = COMO escrever e organizar os testes.
- Nunca copie regras de negócio para esta skill nem para os testes "de cabeça": consulte o `CLAUDE.md` e, em caso de dúvida, `docs/referencias/documentacao-v2.3.0.pdf`.

> Locators e rotas confirmados na exploração manual de 06/10/2026 (`docs/00-roteiro-exploracao`).
> A loja não usa `data-testid`; use os ganchos estáveis listados na seção 4.

## 0. Antes de qualquer tarefa
1. Leia o `CLAUDE.md`.
2. Liste `features/`, `steps/`, `pages/`, `api/` e `support/` para saber o que já existe.
3. Confira o maior `@CT-XX` já usado na faixa da feature (seção 2.3).
4. Se o pedido não deixar claro qual regra, tela ou endpoint testar, pergunte.

## 1. Stack e configuração
- Playwright + Cucumber, JavaScript **CommonJS** (`require` / `module.exports`).
- `support/world.js` abre e fecha o navegador por cenário, escolhido pela variável `BROWSER` (`chromium` é o padrão, ou `firefox`/`webkit`). Para rodar nos três: `npm run test:all`. Cada cenário começa com contexto novo, portanto **carrinho vazio** (o carrinho fica só na aba). Não crie passos de "limpar carrinho".
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
| `features/calculo.feature` | fórmula do total, CA11 | CT-40 a CT-49 |
| `features/quantidade.feature` | CA10 | CT-50 a CT-59 |
| `features/checkout.feature` | nome, e-mail, CEP, confirmação | CT-60 a CT-79 |
| `features/api-erros.feature` | tabela de códigos de erro | CT-80 a CT-99 |

Steps: um arquivo por feature (`steps/<nome>.steps.js`) + `steps/common.steps.js` para os passos compartilhados (seção 3).

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
Then the free shipping notice should be "Faltam R$ 0,10 para o frete grátis."
Then the coupon message should be "Cupom inválido."
Then the coupon "BEMVINDO10" should be shown as applied
Then the increase button of "P001" should be disabled
Then I should see the limit message for "P001"
Then the field "cep" should show the error "Informe um CEP com 8 dígitos."
Then I should see the order confirmation with a number in the format VZ-000000
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
```
- `the response field` aceita caminho com ponto (`cupom.mensagem`) e converte o esperado: número (`"23.97"` → 23.97), booleano (`"true"`) ou texto. A comparação de números usa `toBe` (exata), para pegar erro de ponto flutuante (CA11).
- Os passos `Given` de API só montam o corpo em `this.requestBody`; quem envia é o `When`.

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
| Carrinho | aviso de limite | `.item-limite` ("Limite de 5 unidades por produto.") |
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

```js
const { BASE_URL } = require('../support/config')
const { nomeDoProduto } = require('../support/produtos')

class CartPage {
    constructor(page){
        this.page = page
        this.heading        = page.getByRole('heading', { level: 1 })
        this.couponInput    = page.locator('#campo-cupom')
        this.applyCouponBtn = page.getByRole('button', { name: 'Aplicar cupom' })
        this.removeCouponBtn= page.getByRole('button', { name: 'Remover cupom' })
        this.couponMessage  = page.locator('#mensagem-cupom')
        this.couponApplied  = page.locator('.cupom-aplicado')
        this.subtotal       = page.locator('[data-valor="subtotal"]')
        this.discount       = page.locator('[data-valor="desconto"]')
        this.shipping       = page.locator('[data-valor="frete"]')
        this.total          = page.locator('[data-valor="total"]')
        this.shippingNotice = page.locator('.aviso-frete')
        this.limitMessage   = page.locator('.item-limite')
        this.checkoutLink   = page.getByRole('link', { name: 'Finalizar compra' })
    }
    async open(){
        await this.page.goto(`${BASE_URL}/carrinho`)
    }
    increaseButton(id){
        return this.page.getByRole('button', { name: `Aumentar quantidade de ${nomeDoProduto(id)}` })
    }
    decreaseButton(id){
        return this.page.getByRole('button', { name: `Diminuir quantidade de ${nomeDoProduto(id)}` })
    }
    async increase(id, times = 1){
        for (let i = 0; i < times; i++) await this.increaseButton(id).click()
    }
    async remove(id){
        await this.page.getByRole('button', { name: `Remover ${nomeDoProduto(id)} do carrinho` }).click()
    }
    async applyCoupon(code){
        await this.couponInput.fill(code)
        await this.applyCouponBtn.click()
    }
    async removeCoupon(){
        await this.removeCouponBtn.click()
    }
    async getTotalText(){
        return this.total.innerText()
    }
    async goToCheckout(){
        await this.checkoutLink.click()
    }
}
module.exports = CartPage
```
Atenção: cada clique em +, −, aplicar ou remover dispara `POST /api/carrinho/calcular`. Antes de ler valores, espere a resposta (`page.waitForResponse('**/api/carrinho/calcular')`) ou use asserções com espera automática (`toHaveText`). Nunca `waitForTimeout`.

## 5. Helpers (`support/`)
- `money.js` → `parseMoney(texto)` converte os formatos exibidos na tela:
  - `"R$ 59,90"` → `59.9` · `"R$ 1.234,56"` → `1234.56`
  - `"- R$ 20,00"` (desconto) → `20` (valor absoluto)
  - `"Grátis"` (frete grátis) → `0`
- `produtos.js` → mapa id → nome (`P001` → `Camiseta Essencial` …), usado para montar os `aria-label`. Os dados vêm da tabela do `CLAUDE.md`.
- `config.js` → `BASE_URL`.
- `api.hooks.js` → `Before({ tags: '@api' })` cria os clientes de API com `request.newContext({ baseURL, extraHTTPHeaders: { 'Content-Type': 'application/json' } })`; `After({ tags: '@api' })` faz `dispose()`.
- `evidence.hooks.js` (já implementado) → num `After` para cenários `@ui`:
  - sempre que o cenário **falhar** ou tiver tag `@bug-XX`, tira `page.screenshot({ fullPage: true })`, anexa ao relatório com `this.attach(..., 'image/png')` e salva em `docs/05-evidencias/automacao/<CT-XX>_<navegador>_<status>.png` (ex.: `CT-24_chromium_falhou.png`);
  - o ID vem da tag `@CT-XX` do cenário (`pickle.tags`).
  Assim cada execução gera a evidência do bug sem print manual.

## 6. Escrevendo cenários
- Toda tag de cenário: `@CT-XX @CAXX @ui|@api @manual|@automatizado`.
- Valores esperados concretos e calculados pela regra do `CLAUDE.md`. Use as combinações de produtos que já estão lá para os valores-limite.
- `Scenario Outline` + `Examples` quando só os dados mudam (ex.: variações de maiúsculas e espaços do cupom, CEPs inválidos).
- Sempre que a regra valer para UI e API, crie um cenário de cada camada.
- Não crie cenário que trate como defeito algo listado em "NÃO é bug" no `CLAUDE.md`.
- Ambiguidade: escreva com a interpretação adotada, coloque `# Interpretação: ...` acima do cenário e registre em `docs/00-exploracao.md` (seção "Análise da documentação", como um novo item DOC-XX).

```gherkin
Feature: Frete grátis
  Como cliente da Verzel Store
  Eu quero ganhar frete grátis em compras a partir de R$ 200,00
  Para pagar menos nas minhas compras

  @CT-24 @CA08 @ui @automatizado
  Scenario: Frete continua grátis quando o cupom deixa o valor abaixo de R$ 200,00
    Given I have "P005" with quantity 2 in the cart       # clica N vezes em "Adicionar ao carrinho" na vitrine
    When I apply the coupon "BEMVINDO10"
    Then the subtotal should be "200.00"
    And the discount should be "20.00"
    And the shipping should be "0.00"
    And the total should be "180.00"
```

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
     - Evidência: docs/05-evidencias/CT-XX_<descricao>.png
     ```
  3. Atualize a linha do cenário em `docs/03-execucao.md`: `| CT-XX | título | CAXX | UI/API | manual/automatizado | Passou/Falhou/Bloqueado | evidência | BUG-XX |`
- Evidências em `docs/05-evidencias/`, nome `CT-XX_<descricao>.png` (ou `.json` para respostas de API).

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
