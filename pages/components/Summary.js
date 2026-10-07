// Resumo de valores, igual no carrinho, no checkout e na confirmação ([data-valor=...]).
// Devolve o texto cru ("R$ 239,70", "- R$ 23,97", "Grátis"); a conversão é feita no step com money.js.
class Summary {
    constructor(page){
        this.page = page
    }
    // Cada tela tem um único resumo; o .first() só evita erro de modo estrito caso a loja repita o
    // atributo em outro lugar (conferido em 07/10/2026: um único [data-valor="total"] no carrinho).
    value(nome){
        return this.page.locator(`[data-valor="${nome}"]`).first()
    }
    async getValueText(nome){
        return this.value(nome).innerText()
    }
}
module.exports = Summary
