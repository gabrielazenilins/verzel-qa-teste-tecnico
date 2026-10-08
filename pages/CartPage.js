const { BASE_URL } = require('../support/config');
const { nomeDoProduto } = require('../support/produtos');
const S = require('./selectors');
const CatalogPage = require('./CatalogPage');
const Header = require('./components/Header');

class CartPage {
    constructor(page) {
        this.page = page;
        this.header = new Header(page);
        this.heading = page.getByRole('heading', { level: 1 });
        this.couponInput = page.locator(S.seletores.campoCupom);
        this.applyCouponBtn = page.getByRole('button', { name: S.botoes.aplicarCupom });
        this.removeCouponBtn = page.getByRole('button', { name: S.botoes.removerCupom });
        this.couponMessage = page.locator(S.seletores.mensagemCupom);
        this.couponApplied = page.locator(S.seletores.cupomAplicado);
        this.shippingNotice = page.locator(S.seletores.avisoFrete);
        this.checkoutLink = page.getByRole('link', { name: S.botoes.finalizarCompra });
    }

    // monta o carrinho pela vitrine e abre o carrinho; itens: [{ produto: 'P001', quantidade: 2 }]
    async openWithItems(itens) {
        const catalog = new CatalogPage(this.page);
        if (!catalog.isOpen()) await catalog.open();
        for (const { produto, quantidade } of itens) await catalog.addToCart(produto, quantidade);
        await this.header.openCart();
        await this.page.getByRole('heading', { level: 1, name: S.textos.tituloCarrinho, exact: true }).waitFor();
    }

    item(id) {
        return this.page.locator(S.seletores.itemCarrinho).filter({ has: this.quantityGroup(id) });
    }

    limitMessage(id) {
        return this.item(id).locator(S.seletores.avisoLimiteCarrinho);
    }

    async open() {
        await this.page.goto(`${BASE_URL}/carrinho`);
    }

    quantityGroup(id) {
        return this.page.getByRole('group', { name: S.fill(S.botoes.grupoQuantidade, { nome: nomeDoProduto(id) }) });
    }

    increaseButton(id) {
        return this.page.getByRole('button', { name: S.fill(S.botoes.aumentarQuantidade, { nome: nomeDoProduto(id) }) });
    }

    decreaseButton(id) {
        return this.page.getByRole('button', { name: S.fill(S.botoes.diminuirQuantidade, { nome: nomeDoProduto(id) }) });
    }

    quantity(id) {
        return this.quantityGroup(id).locator('output');
    }

    async increase(id) {
        await this.increaseButton(id).click();
    }

    async decrease(id) {
        await this.decreaseButton(id).click();
    }

    async remove(id) {
        await this.page.getByRole('button', { name: S.fill(S.botoes.removerProduto, { nome: nomeDoProduto(id) }) }).click();
    }

    async applyCoupon(code) {
        await this.couponInput.fill(code);
        await this.applyCouponBtn.click();
    }

    async removeCoupon() {
        await this.removeCouponBtn.click();
    }

    async goToCheckout() {
        await this.checkoutLink.click();
    }

    // print da tela inteira para a comparação visual, sempre no mesmo estado
    async visualScreenshot() {
        await this.page.setViewportSize(S.visual.janela);
        await this.page.mouse.move(0, 0); // tira o hover do link "Carrinho"
        await this.page.evaluate(() => window.scrollTo(0, 0));
        await this.page.evaluate(async () => {
            await document.fonts.ready;
        });
        await this.page.waitForFunction(() => Array.from(document.images).every(img => img.complete));
        return this.page.screenshot({
            fullPage: true,
            animations: 'disabled',
            caret: 'hide',
            mask: S.visual.mascaras.map(seletor => this.page.locator(seletor))
        });
    }
}
module.exports = CartPage;
