// Pedido confirmado (/pedido-confirmado).
class ConfirmationPage {
    constructor(page){
        this.page = page
        this.seal        = page.locator('.confirmacao-selo')
        this.orderNumber = page.locator('.numero-pedido')
        // "Obrigado, Maria. Seu pedido foi registrado e o pagamento será feito na entrega."
        this.paymentOnDelivery = page.getByText('o pagamento será feito na entrega')
    }
    async getOrderNumberText(){
        return this.orderNumber.innerText()
    }
}
module.exports = ConfirmationPage
