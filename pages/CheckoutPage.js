// Finalizar compra (/checkout). As mensagens de erro só aparecem depois de "Confirmar pedido" (OBS-02).
class CheckoutPage {
    constructor(page){
        this.page = page
        this.heading    = page.getByRole('heading', { level: 1 })
        this.nameInput  = page.locator('#campo-nome')
        this.emailInput = page.locator('#campo-email')
        this.cepInput   = page.locator('#campo-cep')
        this.confirmBtn = page.getByRole('button', { name: 'Confirmar pedido' })
    }
    // campo: "nome", "email" ou "cep"
    fieldError(campo){
        return this.page.locator(`#campo-${campo}-erro`)
    }
    async fillCustomer(nome, email, cep){
        await this.nameInput.fill(nome)
        await this.emailInput.fill(email)
        await this.cepInput.fill(cep)
    }
    async confirm(){
        await this.confirmBtn.click()
    }
}
module.exports = CheckoutPage
