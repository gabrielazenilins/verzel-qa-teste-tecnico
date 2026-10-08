const { setWorldConstructor, setDefaultTimeout, Before, After, World } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('@playwright/test');

setDefaultTimeout(30 * 1000);

const BROWSERS = { chromium, firefox, webkit };
const BROWSER = (process.env.BROWSER || 'chromium').toLowerCase();
if (!BROWSERS[BROWSER]) {
    throw new Error(`BROWSER inválido: "${process.env.BROWSER}". Use chromium, firefox ou webkit.`);
}

class CustomWorld extends World {
    constructor(options) {
        super(options);
        this.browserName = BROWSER;
        this.browser = null;
        this.context = null;
        this.page = null;
        this.api = null;
        this.requestBody = {};
        this.response = null;
        this.responseBody = null;
    }
}
setWorldConstructor(CustomWorld);

// navegador novo por cenário, então o carrinho sempre começa vazio
Before({ tags: 'not @api' }, async function () {
    this.browser = await BROWSERS[BROWSER].launch({ headless: process.env.HEADLESS !== 'false' });
    this.context = await this.browser.newContext({ locale: 'pt-BR' });
    this.page = await this.context.newPage();
    this.log(`Navegador: ${BROWSER} ${this.browser.version()}`);
});

// roda por último (este arquivo é carregado primeiro), depois do print de evidência
After({ tags: 'not @api' }, async function () {
    await this.context?.close();
    await this.browser?.close();
});

module.exports = { BROWSER };
