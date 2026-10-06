const { setWorldConstructor, setDefaultTimeout, Before, After, World } = require('@cucumber/cucumber')
const { chromium, firefox, webkit } = require('@playwright/test')

setDefaultTimeout(30 * 1000)

const BROWSERS = { chromium, firefox, webkit }
const BROWSER = (process.env.BROWSER || 'chromium').toLowerCase()
if (!BROWSERS[BROWSER]){
    throw new Error(`BROWSER inválido: "${process.env.BROWSER}". Use chromium, firefox ou webkit.`)
}

class CustomWorld extends World {
    constructor(options){
        super(options)
        this.browserName = BROWSER
        this.browser = null
        this.context = null
        this.page = null
        this.api = null
        this.requestBody = {}
        this.response = null
        this.responseBody = null
    }
}
setWorldConstructor(CustomWorld)

// Navegador novo por cenário de UI: contexto limpo = carrinho vazio
Before({ tags: 'not @api' }, async function(){
    this.browser = await BROWSERS[BROWSER].launch({ headless: process.env.HEADLESS !== 'false' })
    this.context = await this.browser.newContext({ locale: 'pt-BR' })
    this.page = await this.context.newPage()
    this.log(`Navegador: ${BROWSER} ${this.browser.version()}`)
})

// Este arquivo é carregado primeiro (cucumber.js), então este After roda por último,
// depois do evidence.hooks.js tirar o print
After({ tags: 'not @api' }, async function(){
    await this.context?.close()
    await this.browser?.close()
})

module.exports = { BROWSER }
