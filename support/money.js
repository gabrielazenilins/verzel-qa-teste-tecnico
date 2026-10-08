// "R$ 1.234,56" → 1234.56, "- R$ 20,00" → 20, "Grátis" → 0
function parseMoney(text) {
    if (typeof text === 'number') return text;
    const raw = String(text).trim();
    if (/^grátis$/i.test(raw)) return 0;
    // tira espaços, "R$" e o sinal do desconto (hífen ou "−")
    const clean = raw.replace(/\s|R\$|[-\u2212]/g, '');
    const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
    const value = Number(normalized);
    if (normalized === '' || Number.isNaN(value)) throw new Error(`Valor monetário inválido: "${text}"`);
    return Math.round(value * 100) / 100;
}

module.exports = { parseMoney };
