// Mapa id → nome dos produtos (tabela "Dados de teste" do CLAUDE.md).
// Os aria-label da loja usam o nome, não o id.
const PRODUTOS = {
    P001: 'Camiseta Essencial',
    P002: 'Calça Jeans Slim',
    P003: 'Tênis Casual Urbano',
    P004: 'Boné Aba Curva',
    P005: 'Mochila Urbana 20L',
    P006: 'Kit 3 Pares de Meias',
    P007: 'Jaqueta Corta-Vento',
    P008: 'Garrafa Térmica 750ml'
}

function nomeDoProduto(id){
    const nome = PRODUTOS[id]
    if (!nome) throw new Error(`Produto desconhecido: "${id}"`)
    return nome
}

module.exports = { PRODUTOS, nomeDoProduto }
