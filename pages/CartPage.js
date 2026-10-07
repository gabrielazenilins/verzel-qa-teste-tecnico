const { BASE_URL } = require('../support/config')
const { nomeDoProduto } = require('../support/produtos')

// Carrinho (/carrinho). Cada clique em +, −, remover, aplicar ou remover cupom chama
// POST /api/carrinho/calcular; os steps leem os valores com asserções que esperam (toHaveText / expect.poll).
class CartPage {
    constructor(page){
        this.page = page
        this.heading         = page.getByRole('heading', { level: 1 })
        this.couponInput     = page.locator('#campo-cupom')
        this.applyCouponBtn  = page.getByRole('button', { name: 'Aplicar cupom' })
        this.removeCouponBtn = page.getByRole('button', { name: 'Remover cupom' })
        this.couponMessage   = page.locator('#mensagem-cupom')
        this.couponApplied   = page.locator('.cupom-aplicado')
        this.shippingNotice  = page.locator('.aviso-frete')
        this.checkoutLink    = page.getByRole('link', { name: 'Finalizar compra' })
    }
    // Linha do produto no carrinho (li.item-carrinho), achada pelo grupo de quantidade do produto.
    item(id){
        return this.page.locator('li.item-carrinho')
            .filter({ has: this.page.getByRole('group', { name: `Quantidade de ${nomeDoProduto(id)}` }) })
    }
    // "Limite de 5 unidades por produto.", dentro da linha daquele produto
    limitMessage(id){
        return this.item(id).locator('.item-limite')
    }
    async open(){
        await this.page.goto(`${BASE_URL}/carrinho`)
    }
    increaseButton(id){
        return this.page.getByRole('button', { name: `Aumentar quantidade de ${nomeDoProduto(id)}` })
    }
    decreaseButton(id){
        return this.page.getByRole('button', { name: `Diminuir quantidade de ${nomeDoProduto(id)}` })
    }
    quantity(id){
        return this.page.getByRole('group', { name: `Quantidade de ${nomeDoProduto(id)}` }).locator('output')
    }
    async increase(id){
        await this.increaseButton(id).click()
    }
    async decrease(id){
        await this.decreaseButton(id).click()
    }
    async remove(id){
        await this.page.getByRole('button', { name: `Remover ${nomeDoProduto(id)} do carrinho` }).click()
    }
    async applyCoupon(code){
        await this.couponInput.fill(code)
        await this.applyCouponBtn.click()
    }
    async removeCoupon(){
        await this.removeCouponBtn.click()
    }
    async goToCheckout(){
        await this.checkoutLink.click()
    }
}
module.exports = CartPage
