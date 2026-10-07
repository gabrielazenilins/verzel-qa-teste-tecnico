// Passos compartilhados entre as features (vocabulário da seção 3 da skill).
const { Given, When, Then } = require('@cucumber/cucumber')
const { expect } = require('@playwright/test')
const { storeResponse, attachResponse, getField, parseExpected } = require('../support/response')

// ---------------------------------------------------------------- API: montagem do corpo

// A coluna "quantidade" é lida como literal JSON: 1.5 → número decimal, "2" (com aspas) → texto.
Given('the cart items:', async function(table){
    this.requestBody.itens = table.hashes().map(row => ({
        produtoId: row.produto,
        quantidade: JSON.parse(row.quantidade)
    }))
})

// Sem trim: os espaços fazem parte do caso testado (CA02).
Given('the coupon {string}', async function(cupom){
    this.requestBody.cupom = cupom
})

Given('the customer with name {string}, email {string} and zip code {string}', async function(nome, email, cep){
    this.requestBody.cliente = { nome, email, cep }
})

// ---------------------------------------------------------------- API: envio

When('I calculate the cart via API', async function(){
    const response = await this.api.carrinho.calcular(this.requestBody)
    await storeResponse(this, response, { metodo: 'POST', rota: '/api/carrinho/calcular', corpo: this.requestBody })
})

When('I create the order via API', async function(){
    const response = await this.api.pedidos.criar(this.requestBody)
    await storeResponse(this, response, { metodo: 'POST', rota: '/api/pedidos', corpo: this.requestBody })
})

When('I send a {string} request to {string}', async function(metodo, rota){
    const response = await this.api.raw.send(metodo, rota)
    await storeResponse(this, response, { metodo, rota })
})

// Corpo cru, sem serialização; '' = requisição sem corpo.
When('I send a {string} request to {string} with body {string}', async function(metodo, rota, corpo){
    const response = await this.api.raw.send(metodo, rota, corpo === '' ? undefined : corpo)
    await storeResponse(this, response, { metodo, rota, corpo })
})

When('I attach the response to the report', async function(){
    attachResponse(this)
})

// ---------------------------------------------------------------- API: verificações

Then('the response status should be {int}', async function(status){
    expect(this.response.status(), 'status HTTP').toBe(status)
})

// Comparação exata (toBe), para pegar erro de ponto flutuante (CA11).
Then('the response field {string} should be {string}', async function(campo, esperado){
    expect(getField(this.responseBody, campo), `campo "${campo}"`).toBe(parseExpected(esperado))
})

Then('the response field {string} should match {string}', async function(campo, padrao){
    expect(String(getField(this.responseBody, campo)), `campo "${campo}"`).toMatch(new RegExp(padrao))
})

Then('the error code should be {string} on field {string}', async function(codigo, campo){
    expect(getField(this.responseBody, 'erro.codigo')).toBe(codigo)
    expect(getField(this.responseBody, 'erro.campo')).toBe(campo)
})

Then('the response should be a list with exactly the ids {string}', async function(ids){
    expect(Array.isArray(this.responseBody), 'a resposta deveria ser uma lista').toBe(true)
    const esperados = ids.split(',').map(id => id.trim()).sort()
    const obtidos = this.responseBody.map(item => item.id).sort()
    expect(obtidos).toEqual(esperados)
})

// Compara em centavos: os campos já são conferidos com toBe; aqui só a coerência da fórmula.
Then('the response total should be subtotal minus discount plus shipping', async function(){
    const { subtotal, desconto, frete, total } = this.responseBody
    // Sem isso, dois campos ausentes dariam NaN === NaN e o passo passaria.
    for (const [campo, valor] of Object.entries({ subtotal, desconto, frete, total })){
        expect(typeof valor, `campo "${campo}" deveria ser número`).toBe('number')
    }
    const centavos = v => Math.round(v * 100)
    expect(centavos(total)).toBe(centavos(subtotal) - centavos(desconto) + centavos(frete))
})

// Lê o número como a API o devolveu: 23.970000000000002 tem mais de 2 casas.
Then('every monetary value in the response should have at most 2 decimal places', async function(){
    const body = this.responseBody
    const valores = {
        subtotal: body.subtotal,
        desconto: body.desconto,
        frete: body.frete,
        valorFaltanteFreteGratis: body.valorFaltanteFreteGratis,
        total: body.total
    }
    ;(body.itens || []).forEach((item, i) => {
        valores[`itens.${i}.precoUnitario`] = item.precoUnitario
        valores[`itens.${i}.total`] = item.total
    })
    const comMaisDeDuasCasas = Object.entries(valores)
        .filter(([, valor]) => !/^-?\d+(\.\d{1,2})?$/.test(String(valor)))
    expect(comMaisDeDuasCasas, 'valores com mais de 2 casas decimais').toEqual([])
})

// ---------------------------------------------------------------- UI: preparação do carrinho

const { parseMoney } = require('../support/money')

// Clica em "Adicionar ao carrinho" na vitrine e espera o contador do cabeçalho subir a cada clique.
async function addFromCatalog(world, id, vezes){
    const { catalog, header } = world.pages
    for (let i = 0; i < vezes; i++){
        const antes = Number(await header.cartCounter.innerText())
        await catalog.add(id)
        await expect(header.cartCounter).toHaveText(String(antes + 1))
    }
}

async function openCartWith(world, itens){
    const { catalog, header, cart } = world.pages
    await catalog.open()
    for (const { produto, quantidade } of itens) await addFromCatalog(world, produto, quantidade)
    await header.openCart()
    await expect(cart.heading).toHaveText('Carrinho')
}

Given('I am on the products page', async function(){
    await this.pages.catalog.open()
    await expect(this.pages.catalog.heading).toHaveText('Produtos')
})

// Monta o carrinho pela vitrine e termina na tela do carrinho.
Given('I have {string} with quantity {int} in the cart', async function(produto, quantidade){
    await openCartWith(this, [{ produto, quantidade }])
})

Given('I have the following items in the cart:', async function(table){
    const itens = table.hashes().map(row => ({ produto: row.produto, quantidade: Number(row.quantidade) }))
    await openCartWith(this, itens)
})

// Fica na vitrine (usado para verificar o limite no card do produto).
When('I add {string} to the cart {int} time(s)', async function(produto, vezes){
    await addFromCatalog(this, produto, vezes)
})

// ---------------------------------------------------------------- UI: ações no carrinho e no checkout

When('I apply the coupon {string}', async function(cupom){
    await this.pages.cart.applyCoupon(cupom)
})

When('I remove the coupon', async function(){
    await this.pages.cart.removeCoupon()
    await expect(this.pages.cart.couponInput).toBeVisible()
})

// Espera a quantidade exibida mudar a cada clique (cada clique recalcula o carrinho na API).
When('I increase the quantity of {string} {int} time(s)', async function(produto, vezes){
    const { cart } = this.pages
    for (let i = 0; i < vezes; i++){
        const antes = Number(await cart.quantity(produto).innerText())
        await cart.increase(produto)
        await expect(cart.quantity(produto)).toHaveText(String(antes + 1))
    }
})

When('I decrease the quantity of {string} {int} time(s)', async function(produto, vezes){
    const { cart } = this.pages
    for (let i = 0; i < vezes; i++){
        const antes = Number(await cart.quantity(produto).innerText())
        await cart.decrease(produto)
        await expect(cart.quantity(produto)).toHaveText(String(antes - 1))
    }
})

When('I remove {string} from the cart', async function(produto){
    await this.pages.cart.remove(produto)
    await expect(this.pages.cart.quantity(produto)).toHaveCount(0)
})

When('I go to checkout', async function(){
    await this.pages.cart.goToCheckout()
    await expect(this.pages.checkout.heading).toHaveText('Finalizar compra')
})

When('I fill the customer data with name {string}, email {string} and zip code {string}', async function(nome, email, cep){
    await this.pages.checkout.fillCustomer(nome, email, cep)
})

When('I confirm the order', async function(){
    await this.pages.checkout.confirm()
})

// ---------------------------------------------------------------- UI: verificações

// Valores da tela convertidos com money.js; expect.poll espera o recálculo do carrinho terminar.
async function expectSummaryValue(world, nome, esperado){
    await expect.poll(async () => parseMoney(await world.pages.summary.getValueText(nome)), { message: `valor "${nome}" na tela` })
        .toBe(Number(esperado))
}

Then('the subtotal should be {string}', async function(valor){
    await expectSummaryValue(this, 'subtotal', valor)
})

// O desconto aparece como "- R$ 23,97" (hífen ASCII, conferido na tela em 07/10/2026); money.js devolve o valor absoluto.
Then('the discount should be {string}', async function(valor){
    await expectSummaryValue(this, 'desconto', valor)
})

Then('the shipping should be {string}', async function(valor){
    await expectSummaryValue(this, 'frete', valor)
})

// DOC-15: com frete grátis a tela mostra a palavra "Grátis", e não "R$ 0,00".
Then('the shipping should be free', async function(){
    await expect(this.pages.summary.value('frete')).toHaveText('Grátis')
})

Then('the total should be {string}', async function(valor){
    await expectSummaryValue(this, 'total', valor)
})

Then('the free shipping notice should be {string}', async function(texto){
    await expect(this.pages.cart.shippingNotice).toHaveText(texto)
})

Then('the free shipping notice should not be shown', async function(){
    await expect(this.pages.cart.shippingNotice).toHaveCount(0)
})

Then('the coupon message should be {string}', async function(texto){
    await expect(this.pages.cart.couponMessage).toHaveText(texto)
})

// DOC-02: o texto de sucesso é da interface; o passo confere só que o cupom aparece como aplicado.
Then('the coupon {string} should be shown as applied', async function(codigo){
    await expect(this.pages.cart.couponApplied).toContainText(codigo)
    await expect(this.pages.cart.removeCouponBtn).toBeVisible()
})

Then('the coupon field should not be shown', async function(){
    await expect(this.pages.cart.couponInput).toHaveCount(0)
})

Then('the increase button of {string} should be disabled', async function(produto){
    await expect(this.pages.cart.increaseButton(produto)).toBeDisabled()
})

Then('I should see the limit message for {string}', async function(produto){
    await expect(this.pages.cart.quantity(produto)).toHaveText('5')
    await expect(this.pages.cart.limitMessage(produto)).toBeVisible()
})

Then('the add button of {string} should be disabled', async function(produto){
    await expect(this.pages.catalog.addButton(produto)).toBeDisabled()
})

// Só verifica que o aviso de limite aparece (classe produto-aviso-limite), sem cobrar o texto (DOC-02).
Then('I should see the limit notice of {string} on the products page', async function(produto){
    await expect(this.pages.catalog.notice(produto)).toHaveClass(/produto-aviso-limite/)
})

Then('the field {string} should show the error {string}', async function(campo, mensagem){
    await expect(this.pages.checkout.fieldError(campo)).toHaveText(mensagem)
})

Then('I should still be on the checkout page', async function(){
    await expect(this.page).toHaveURL(/\/checkout$/)
    await expect(this.pages.checkout.heading).toHaveText('Finalizar compra')
})

Then('I should see the order confirmation with a number in the format VZ-000000', async function(){
    await expect(this.page).toHaveURL(/\/pedido-confirmado$/)
    await expect(this.pages.confirmation.seal).toHaveText('Pedido confirmado')
    await expect(this.pages.confirmation.orderNumber).toHaveText(/^VZ-\d{6}$/)
})

// Sem navegar num Then: o contador do cabeçalho mostra o total de unidades no carrinho.
Then('the cart should be empty', async function(){
    await expect(this.pages.header.cartCounter).toHaveText('0')
})
