// Converte o texto de um valor monetário exibido na tela em número com 2 casas.
//   "R$ 59,90" → 59.9 · "R$ 1.234,56" → 1234.56
//   "- R$ 20,00" (desconto) → 20 (valor absoluto)
//   "Grátis" (frete grátis) → 0
function parseMoney(text){
    if (typeof text === 'number') return text
    const raw = String(text).trim()
    if (/^grátis$/i.test(raw)) return 0
    // Remove espaços, "R$" e o sinal do desconto: hífen ASCII (o que a loja usa hoje) ou "−" (U+2212)
    const clean = raw.replace(/\s|R\$|[-−]/g, '')
    const normalized = clean.includes(',')
        ? clean.replace(/\./g, '').replace(',', '.')
        : clean
    const value = Number(normalized)
    if (normalized === '' || Number.isNaN(value)) throw new Error(`Valor monetário inválido: "${text}"`)
    return Math.round(value * 100) / 100
}

module.exports = { parseMoney }
