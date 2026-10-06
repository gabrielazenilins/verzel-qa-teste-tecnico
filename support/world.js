const { setWorldConstructor, setDefaultTimeout, Before, After, Status, World } = require('@cucumber/cucumber')
const { chromium } = require('@playwright/test')

setDefaultTimeout(30 * 1000)

class CustomWorld extends World {
    constructor(options){
        super(options)
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
    this.browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' })
    this.context = await this.browser.newContext({ locale: 'pt-BR' })
    this.page = await this.context.newPage()
})

After({ tags: 'not @api' }, async function({ result }){
    if (result?.status === Status.FAILED && this.page){
        this.attach(await this.page.screenshot({ fullPage: true }), 'image/png')
    }
    await this.context?.close()
    await this.browser?.close()
})
