const S = require('../selectors');

// resumo de valores do carrinho, checkout e confirmação; devolve o texto cru ("R$ 239,70", "Grátis")
class Summary {
    constructor(page) {
        this.page = page;
    }

    value(nome) {
        return this.page.locator(S.fill(S.seletores.valorResumo, { nome })).first();
    }

    async getValueText(nome) {
        return this.value(nome).innerText();
    }
}
module.exports = Summary;
