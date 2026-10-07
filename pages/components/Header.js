// Cabeçalho, presente em todas as telas.
class Header {
    constructor(page){
        this.page = page
        this.cartLink = page.getByRole('link', { name: /^Carrinho/ })
        // Soma de unidades no carrinho (P001 ×3 → "3")
        this.cartCounter = page.locator('.contador-carrinho')
    }
    async openCart(){
        await this.cartLink.click()
    }
}
module.exports = Header
