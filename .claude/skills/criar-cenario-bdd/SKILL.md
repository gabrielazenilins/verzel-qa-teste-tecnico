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

> ## ⚠️ PENDÊNCIAS — AJUSTAR ANTES DE USAR
> Tudo marcado com **⚠️ AJUSTAR** nesta skill é provisório e foi escrito sem ver a interface.
> Depois da exploração manual, revise:
> - [ ] Nomes e rotas das telas (seção 2.1)
> - [ ] Seletores/locators dos Page Objects (seção 4)
> - [ ] Textos de botões e rótulos usados nos exemplos (seção 4)
> - [ ] Como a quantidade é alterada na UI: botão +/−, campo numérico ou select (seção 3)
> - [ ] Onde o cupom é aplicado: carrinho ou checkout (seções 2.1 e 4)
> - [ ] Formato em que a UI exibe valores, para o helper `money.js` (seção 5)
> Quando terminar, apague os marcadores ⚠️ AJUSTAR e esta caixa.

## 0. Antes de qualquer tarefa
1. Leia o `CLAUDE.md`.
2. Liste `features/`, `steps/`, `pages/`, `api/` e `support/` para saber o que já existe.
3. Confira o maior `@CT-XX` já usado na faixa da feature (seção 2.3).
4. Se o pedido não deixar claro qual regra, tela ou endpoint testar, pergunte.

## 1. Stack e configuração
- Playwright + Cucumber, JavaScript **CommonJS** (`require` / `module.exports`).
- `support/world.js` abre e fecha o navegador por cenário. Cada cenário começa com contexto novo, portanto **carrinho vazio** (o carrinho fica só na aba). Não crie passos de "limpar carrinho".
- `support/config.js` exporta `BASE_URL` (`process.env.BASE_URL` com fallback para a URL da loja). Nunca escreva a URL em outro arquivo.
- `cucumber.js` exclui `@manual` da execução (`tags: 'not @manual'`).
- Não altere `world.js`, `config.js` nem `cucumber.js` sem perguntar.

## 2. Mapa do projeto

### 2.1 Telas e Page Objects (`pages/`)
| Page Object | Tela | Rota | Responsabilidade |
|---|---|---|---|
| `CatalogPage` | Lista de produtos | `/` ⚠️ AJUSTAR | listar produtos, adicionar ao carrinho, abrir o carrinho |
| `CartPage` | Carrinho | `/carrinho` ⚠️ AJUSTAR | itens, quantidade, remover item, cupom (⚠️ AJUSTAR se o cupom ficar no checkout), subtotal, desconto, frete, valor faltante, total |
| `CheckoutPage` | Finalização | `/checkout` ⚠️ AJUSTAR | nome, e-mail, CEP, mensagens de validação, confirmar pedido |
| `ConfirmationPage` | Confirmação | ⚠️ AJUSTAR | número do pedido, resumo de valores |
| `components/Header.js` | Cabeçalho | todas | contador do carrinho, links Produtos/Documentação/Carrinho |

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
Given I have "P005" with quantity 2 in the cart
Given I have the following items in the cart:
  | produto | quantidade |
  | P002    | 1          |
  | P004    | 2          |
When I apply the coupon "BEMVINDO10"
When I remove the coupon
When I change the quantity of "P001" to 3          # ⚠️ AJUSTAR conforme o controle de quantidade da UI
When I go to checkout
When I fill the customer data with name "Maria Silva", email "maria@exemplo.com" and zip code "01310-100"
When I confirm the order
Then the subtotal should be "239.70"
Then the discount should be "23.97"
Then the shipping should be "0.00"
Then the total should be "215.73"
Then the amount missing for free shipping should be "0.20"
Then the coupon message should be "Cupom inválido."
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
- Locators no constructor, preferindo `getByRole`, `getByLabel`, `getByTestId`. Evite XPath e seletor por posição.
- Métodos de ação e de leitura (`getTotalText()`), **sem `expect`**.
- Leituras de valor devolvem o texto cru; a conversão para número é feita no step com `money.js`.
- Se a tela já tiver Page Object, acrescente métodos em vez de recriar.

```js
const { BASE_URL } = require('../support/config')

class CartPage {
    constructor(page){
        this.page = page
        // ⚠️ AJUSTAR: todos os locators abaixo são provisórios
        this.couponInput    = page.getByLabel('Cupom')
        this.applyCoupon_   = page.getByRole('button', { name: 'Aplicar' })
        this.removeCoupon_  = page.getByRole('button', { name: 'Remover cupom' })
        this.couponMessage  = page.getByTestId('cupom-mensagem')
        this.subtotal       = page.getByTestId('subtotal')
        this.discount       = page.getByTestId('desconto')
        this.shipping       = page.getByTestId('frete')
        this.missingFree    = page.getByTestId('faltante-frete-gratis')
        this.total          = page.getByTestId('total')
        this.checkoutButton = page.getByRole('button', { name: 'Finalizar compra' })
    }
    async open(){
        await this.page.goto(`${BASE_URL}/carrinho`)   // ⚠️ AJUSTAR rota
    }
    async applyCoupon(code){
        await this.couponInput.fill(code)
        await this.applyCoupon_.click()
    }
    async removeCoupon(){
        await this.removeCoupon_.click()
    }
    async getTotalText(){
        return this.total.innerText()
    }
    async goToCheckout(){
        await this.checkoutButton.click()
    }
}
module.exports = CartPage
```

## 5. Helpers (`support/`)
- `money.js` → `parseMoney('R$ 1.234,56')` devolve `1234.56`. ⚠️ AJUSTAR conforme o formato real exibido na UI (com ou sem "R$", separador de milhar).
- `config.js` → `BASE_URL`.
- `api.hooks.js` → `Before({ tags: '@api' })` cria os clientes de API com `request.newContext({ baseURL, extraHTTPHeaders: { 'Content-Type': 'application/json' } })`; `After({ tags: '@api' })` faz `dispose()`.
- Em falha de cenário `@ui`, anexe screenshot com `this.attach(await this.page.screenshot(), 'image/png')` (num `After` em arquivo próprio, sem mexer no `world.js`).

## 6. Escrevendo cenários
- Toda tag de cenário: `@CT-XX @CAXX @ui|@api @manual|@automatizado`.
- Valores esperados concretos e calculados pela regra do `CLAUDE.md`. Use as combinações de produtos que já estão lá para os valores-limite.
- `Scenario Outline` + `Examples` quando só os dados mudam (ex.: variações de maiúsculas e espaços do cupom, CEPs inválidos).
- Sempre que a regra valer para UI e API, crie um cenário de cada camada.
- Não crie cenário que trate como defeito algo listado em "NÃO é bug" no `CLAUDE.md`.
- Ambiguidade: escreva com a interpretação adotada, coloque `# Interpretação: ...` acima do cenário e registre em `docs/01-plano-de-teste.md` (seção Interpretações).

```gherkin
Feature: Frete grátis
  Como cliente da Verzel Store
  Eu quero ganhar frete grátis em compras a partir de R$ 200,00
  Para pagar menos nas minhas compras

  @CT-24 @CA08 @ui @automatizado
  Scenario: Frete continua grátis quando o cupom deixa o valor abaixo de R$ 200,00
    Given I have "P005" with quantity 2 in the cart
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
- Marcadores ⚠️ AJUSTAR que continuam pendentes.

## Não fazer
- `expect` em Page Object ou cliente de API
- `waitForTimeout`
- Repetir regras de negócio fora do `CLAUDE.md`
- Ajustar o esperado para o teste passar quando o sistema está errado
- Reportar como bug o que está em "NÃO é bug"
- Testes de carga, estresse ou segurança (ambiente compartilhado)
- Alterar cenários existentes, `world.js`, `config.js` ou `cucumber.js` sem perguntar
- Reusar um `@CT-XX` ou sair da faixa de IDs da feature
