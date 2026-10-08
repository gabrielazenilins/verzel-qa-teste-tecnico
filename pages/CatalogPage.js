const { BASE_URL } = require('../support/config');
const S = require('./selectors');
const Header = require('./components/Header');

class CatalogPage {
    constructor(page) {
        this.page = page;
        this.header = new Header(page);
        this.heading = page.locator(S.seletores.tituloVitrine);
        this.grid = page.locator(S.seletores.gradeProdutos);
        this.gridItems = page.locator(S.seletores.itemDaGrade);
    }

    async open() {
        await this.page.goto(BASE_URL);
    }

    isOpen() {
        return new URL(this.page.url()).pathname === '/';
    }

    // o botão é igual em todos os cards, então acha o card pelo nome do produto
    addButton(id) {
        return this.page
            .locator(S.seletores.cardProduto)
            .filter({ has: this.page.locator(S.fill(S.seletores.nomeProduto, { id })) })
            .getByRole('button', { name: S.botoes.adicionarAoCarrinho });
    }

    notice(id) {
        return this.page.locator(S.fill(S.seletores.avisoProduto, { id }));
    }

    async addToCart(id, vezes = 1) {
        for (let i = 0; i < vezes; i++) {
            const antes = Number(await this.header.getCartCountText());
            await this.addButton(id).click();
            await this.header.waitForCartCount(antes + 1); // espera o contador atualizar
        }
    }
}
module.exports = CatalogPage;
