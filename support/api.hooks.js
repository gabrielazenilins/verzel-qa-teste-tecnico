const { Before, After } = require('@cucumber/cucumber');
const { request } = require('@playwright/test');
const { BASE_URL } = require('./config');
const ProdutosApi = require('../api/ProdutosApi');
const CarrinhoApi = require('../api/CarrinhoApi');
const PedidosApi = require('../api/PedidosApi');
const RawApi = require('../api/RawApi');

Before({ tags: '@api' }, async function () {
    this.apiContext = await request.newContext({
        baseURL: BASE_URL,
        extraHTTPHeaders: { 'Content-Type': 'application/json' }
    });
    this.api = {
        produtos: new ProdutosApi(this.apiContext),
        carrinho: new CarrinhoApi(this.apiContext),
        pedidos: new PedidosApi(this.apiContext),
        raw: new RawApi(this.apiContext)
    };
    this.requestBody = {};
});

After({ tags: '@api' }, async function () {
    await this.apiContext?.dispose();
});
