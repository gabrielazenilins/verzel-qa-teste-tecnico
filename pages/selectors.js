const SELECTORS = require('./selectors.json');

// troca {nome}, {id} e {campo} pelos valores
function fill(template, values = {}) {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
        if (values[key] === undefined) throw new Error(`Falta o valor de {${key}} em "${template}"`);
        return values[key];
    });
}

module.exports = { ...SELECTORS, fill };
