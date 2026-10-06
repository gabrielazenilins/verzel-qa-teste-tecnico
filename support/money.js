// Converte o texto de um valor monetário em número com 2 casas.
// Aceita 'R$ 1.234,56', '1.234,56', '23,97', '23.97' e '-R$ 23,97'.
// ⚠️ AJUSTAR conforme o formato real exibido na UI
function parseMoney(text){
    if (typeof text === 'number') return text
    const clean = String(text).replace(/\s|R\$/g, '')
    const normalized = clean.includes(',')
        ? clean.replace(/\./g, '').replace(',', '.')
        : clean
    const value = Number(normalized)
    if (Number.isNaN(value)) throw new Error(`Valor monetário inválido: "${text}"`)
    return Math.round(value * 100) / 100
}

module.exports = { parseMoney }
