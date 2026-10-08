const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { parseMoney } = require('../support/money');
const { compareWithReference, MAX_DIFF_RATIO } = require('../support/visual');
const S = require('../pages/selectors');

// Carrinho

// o Before @ui já abriu a vitrine, aqui só confere
Given('I am on the products page', async function () {
    await expect(this.pages.catalog.heading).toHaveText(S.textos.tituloVitrine);
});

Given('I have {string} with quantity {int} in the cart', async function (produto, quantidade) {
    await this.pages.cart.openWithItems([{ produto, quantidade }]);
});

Given('I have the following items in the cart:', async function (table) {
    const itens = table.hashes().map(row => ({ produto: row.produto, quantidade: Number(row.quantidade) }));
    await this.pages.cart.openWithItems(itens);
});

// fica na vitrine
When('I add {string} to the cart {int} time(s)', async function (produto, vezes) {
    await this.pages.catalog.addToCart(produto, vezes);
});

// Ações

When('I apply the coupon {string}', async function (cupom) {
    const { cart } = this.pages;
    await cart.applyCoupon(cupom);
    // espera o cupom aplicado ou a mensagem de erro antes de seguir
    await expect(cart.couponApplied.or(cart.couponMessage.filter({ hasText: /\S/ }))).toBeVisible();
});

When('I remove the coupon', async function () {
    await this.pages.cart.removeCoupon();
    await expect(this.pages.cart.couponInput).toBeVisible();
});

When('I increase the quantity of {string} {int} time(s)', async function (produto, vezes) {
    const { cart } = this.pages;
    for (let i = 0; i < vezes; i++) {
        const antes = Number(await cart.quantity(produto).innerText());
        await cart.increase(produto);
        await expect(cart.quantity(produto)).toHaveText(String(antes + 1)); // espera o recálculo
    }
});

When('I decrease the quantity of {string} {int} time(s)', async function (produto, vezes) {
    const { cart } = this.pages;
    for (let i = 0; i < vezes; i++) {
        const antes = Number(await cart.quantity(produto).innerText());
        await cart.decrease(produto);
        await expect(cart.quantity(produto)).toHaveText(String(antes - 1));
    }
});

When('I remove {string} from the cart', async function (produto) {
    await this.pages.cart.remove(produto);
    await expect(this.pages.cart.quantity(produto)).toHaveCount(0);
});

When('I go to checkout', async function () {
    await this.pages.cart.goToCheckout();
    await expect(this.pages.checkout.heading).toHaveText(S.textos.tituloCheckout);
});

When('I fill the customer data with name {string}, email {string} and zip code {string}', async function (nome, email, cep) {
    await this.pages.checkout.fillCustomer(nome, email, cep);
});

When('I confirm the order', async function () {
    await this.pages.checkout.confirm();
});

// Verificações

// espera o valor da tela chegar no esperado; enquanto não for valor (recalculando), tenta de novo
async function expectSummaryValue(world, nome, esperado) {
    await expect
        .poll(
            async () => {
                const texto = await world.pages.summary.getValueText(nome);
                try {
                    return parseMoney(texto);
                } catch {
                    return texto;
                }
            },
            { message: `valor "${nome}" na tela` }
        )
        .toBe(Number(esperado));
}

Then('the subtotal should be {string}', async function (valor) {
    await expectSummaryValue(this, 'subtotal', valor);
});

Then('the discount should be {string}', async function (valor) {
    await expectSummaryValue(this, 'desconto', valor);
});

Then('the shipping should be {string}', async function (valor) {
    await expectSummaryValue(this, 'frete', valor);
});

// DOC-15: frete grátis aparece como "Grátis", não "R$ 0,00"
Then('the shipping should be free', async function () {
    await expect(this.pages.summary.value('frete')).toHaveText(S.textos.freteGratis);
});

Then('the total should be {string}', async function (valor) {
    await expectSummaryValue(this, 'total', valor);
});

Then('the free shipping notice should be {string}', async function (texto) {
    await expect(this.pages.cart.shippingNotice).toHaveText(texto);
});

// vem depois de um passo de valor, que já esperou o recálculo
Then('the free shipping notice should not be shown', async function () {
    await expect(this.pages.cart.shippingNotice).toHaveCount(0);
});

Then('the coupon message should be {string}', async function (texto) {
    await expect(this.pages.cart.couponMessage).toHaveText(texto);
});

// DOC-02: confere só o código do cupom, não o texto da interface
Then('the coupon {string} should be shown as applied', async function (codigo) {
    await expect(this.pages.cart.couponApplied).toContainText(codigo);
    await expect(this.pages.cart.removeCouponBtn).toBeVisible();
});

Then('the coupon field should not be shown', async function () {
    await expect(this.pages.cart.couponInput).toHaveCount(0);
});

Then('the increase button of {string} should be disabled', async function (produto) {
    await expect(this.pages.cart.increaseButton(produto)).toBeDisabled();
});

Then('I should see the limit message for {string}', async function (produto) {
    await expect(this.pages.cart.quantity(produto)).toHaveText('5');
    await expect(this.pages.cart.limitMessage(produto)).toBeVisible();
});

Then('the add button of {string} should be disabled', async function (produto) {
    await expect(this.pages.catalog.addButton(produto)).toBeDisabled();
});

// confere a classe do aviso, sem cobrar o texto (DOC-02)
Then('I should see the limit notice of {string} on the products page', async function (produto) {
    await expect(this.pages.catalog.notice(produto)).toBeVisible();
    await expect(this.pages.catalog.notice(produto)).toHaveClass(/produto-aviso-limite/);
});

Then('the field {string} should show the error {string}', async function (campo, mensagem) {
    await expect(this.pages.checkout.fieldError(campo)).toHaveText(mensagem);
});

Then('I should still be on the checkout page', async function () {
    await expect(this.page).toHaveURL(/\/checkout$/);
    await expect(this.pages.checkout.heading).toHaveText(S.textos.tituloCheckout);
    await expect(this.pages.confirmation.seal).toHaveCount(0);
});

Then('I should see the order confirmation with a number in the format VZ-000000', async function () {
    await expect(this.page).toHaveURL(/\/pedido-confirmado$/);
    await expect(this.pages.confirmation.seal).toHaveText(S.textos.seloConfirmacao);
    await expect(this.pages.confirmation.orderNumber).toHaveText(/^VZ-\d{6}$/);
});

Then('I should see that the payment will be made on delivery', async function () {
    await expect(this.pages.confirmation.paymentOnDelivery).toBeVisible();
});

// confere pelo contador do cabeçalho, sem sair da tela
Then('the cart should be empty', async function () {
    await expect(this.pages.header.cartCounter).toHaveText('0');
});

// Comparação visual

Then('the cart page should match the visual reference {string}', async function (nome) {
    await expect(this.pages.cart.heading).toHaveText(S.textos.tituloCarrinho);
    const screenshot = await this.pages.cart.visualScreenshot();
    this.attach(screenshot, 'image/png');
    const resultado = await compareWithReference(screenshot, nome, this.browserName);
    if (resultado.updated) {
        this.log(`Referência visual gravada: ${resultado.referencePath}`);
        return;
    }
    this.log(`Comparação visual: ${resultado.diffPixels} pixels diferentes (${(resultado.ratio * 100).toFixed(3)}%)`);
    expect(resultado.ratio, `diferença visual acima de ${MAX_DIFF_RATIO * 100}%; diff em ${resultado.diffPath}`).toBeLessThanOrEqual(
        MAX_DIFF_RATIO
    );
});
