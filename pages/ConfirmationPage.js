// Pedido confirmado (/pedido-confirmado).
class ConfirmationPage {
    constructor(page){
        this.page = page
        this.seal        = page.locator('.confirmacao-selo')
        this.orderNumber = page.locator('.numero-pedido')
    }
    async getOrderNumberText(){
        return this.orderNumber.innerText()
    }
}
module.exports = ConfirmationPage
