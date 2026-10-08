const S = require('../selectors');

class Header {
    constructor(page) {
        this.page = page;
        this.cartLink = page.getByRole('link', { name: new RegExp(S.seletores.linkCarrinho) });
        this.cartCounter = page.locator(S.seletores.contadorCarrinho); // soma as unidades, não os produtos
    }

    async getCartCountText() {
        return this.cartCounter.innerText();
    }

    async waitForCartCount(quantidade) {
        await this.page.waitForFunction(
            ([seletor, esperado]) => document.querySelector(seletor)?.textContent.trim() === esperado,
            [S.seletores.contadorCarrinho, String(quantidade)]
        );
    }

    async openCart() {
        await this.cartLink.click();
    }
}
module.exports = Header;
