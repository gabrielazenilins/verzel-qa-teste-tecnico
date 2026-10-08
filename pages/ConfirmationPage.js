const S = require('./selectors');

class ConfirmationPage {
    constructor(page) {
        this.page = page;
        this.seal = page.locator(S.seletores.seloConfirmacao);
        this.orderNumber = page.locator(S.seletores.numeroPedido);
        this.paymentOnDelivery = page.getByText(S.textos.pagamentoNaEntrega);
    }

    async getOrderNumberText() {
        return this.orderNumber.innerText();
    }
}
module.exports = ConfirmationPage;
