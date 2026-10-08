const S = require('./selectors');

class CheckoutPage {
    constructor(page) {
        this.page = page;
        this.heading = page.getByRole('heading', { level: 1 });
        this.nameInput = page.locator(S.fill(S.seletores.campoCliente, { campo: 'nome' }));
        this.emailInput = page.locator(S.fill(S.seletores.campoCliente, { campo: 'email' }));
        this.cepInput = page.locator(S.fill(S.seletores.campoCliente, { campo: 'cep' }));
        this.confirmBtn = page.getByRole('button', { name: S.botoes.confirmarPedido });
    }

    // campo: "nome", "email" ou "cep"
    fieldError(campo) {
        return this.page.locator(S.fill(S.seletores.erroCampoCliente, { campo }));
    }

    async fillCustomer(nome, email, cep) {
        await this.nameInput.fill(nome);
        await this.emailInput.fill(email);
        await this.cepInput.fill(cep);
    }

    async confirm() {
        await this.confirmBtn.click();
    }
}
module.exports = CheckoutPage;
