const { BASE_URL } = require('../support/config')

// Vitrine de produtos (/). Não há escolha de quantidade: cada clique soma 1 unidade.
class CatalogPage {
    constructor(page){
        this.page = page
        this.heading = page.locator('h2#titulo-vitrine')
    }
    async open(){
        await this.page.goto(BASE_URL)
    }
    // O botão é igual em todos os cards: acha o card pelo título do produto (#nome-P00X).
    addButton(id){
        return this.page.locator('.produto-corpo')
            .filter({ has: this.page.locator(`#nome-${id}`) })
            .getByRole('button', { name: 'Adicionar ao carrinho' })
    }
    // "3 no carrinho"; no limite, "Limite de 5 unidades atingido." com a classe produto-aviso-limite
    notice(id){
        return this.page.locator(`#aviso-${id}`)
    }
    async add(id){
        await this.addButton(id).click()
    }
}
module.exports = CatalogPage
