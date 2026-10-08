const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { storeResponse, attachResponse, getField, parseExpected } = require('../support/response');

// Monta o corpo

// quantidade lida como JSON: 1.5 vai como número e "2" (com aspas) vai como texto
Given('the cart items:', async function (table) {
    this.requestBody.itens = table.hashes().map(row => ({
        produtoId: row.produto,
        quantidade: JSON.parse(row.quantidade)
    }));
});

// sem trim: os espaços fazem parte do teste (CA02)
Given('the coupon {string}', async function (cupom) {
    this.requestBody.cupom = cupom;
});

Given('the customer with name {string}, email {string} and zip code {string}', async function (nome, email, cep) {
    this.requestBody.cliente = { nome, email, cep };
});

// Envia

When('I calculate the cart via API', async function () {
    const response = await this.api.carrinho.calcular(this.requestBody);
    await storeResponse(this, response, { metodo: 'POST', rota: '/api/carrinho/calcular', corpo: this.requestBody });
});

When('I create the order via API', async function () {
    const response = await this.api.pedidos.criar(this.requestBody);
    await storeResponse(this, response, { metodo: 'POST', rota: '/api/pedidos', corpo: this.requestBody });
});

When('I send a {string} request to {string}', async function (metodo, rota) {
    const response = await this.api.raw.send(metodo, rota);
    await storeResponse(this, response, { metodo, rota });
});

// corpo cru; '' = sem corpo
When('I send a {string} request to {string} with body {string}', async function (metodo, rota, corpo) {
    const response = await this.api.raw.send(metodo, rota, corpo === '' ? undefined : corpo);
    await storeResponse(this, response, { metodo, rota, corpo });
});

When('I attach the response to the report', async function () {
    attachResponse(this);
});

// Verifica

Then('the response status should be {int}', async function (status) {
    expect(this.response.status(), 'status HTTP').toBe(status);
});

// toBe exato, para pegar erro de ponto flutuante (CA11)
Then('the response field {string} should be {string}', async function (campo, esperado) {
    expect(getField(this.responseBody, campo), `campo "${campo}"`).toBe(parseExpected(esperado));
});

Then('the response field {string} should match {string}', async function (campo, padrao) {
    expect(String(getField(this.responseBody, campo)), `campo "${campo}"`).toMatch(new RegExp(padrao));
});

Then('the error code should be {string} on field {string}', async function (codigo, campo) {
    expect(getField(this.responseBody, 'erro.codigo')).toBe(codigo);
    expect(getField(this.responseBody, 'erro.campo')).toBe(campo);
});

Then('the response should be a list with exactly the ids {string}', async function (ids) {
    expect(Array.isArray(this.responseBody), 'a resposta deveria ser uma lista').toBe(true);
    const esperados = ids
        .split(',')
        .map(id => id.trim())
        .sort();
    const obtidos = this.responseBody.map(item => item.id).sort();
    expect(obtidos).toEqual(esperados);
});

// compara em centavos; os campos já foram conferidos com toBe
Then('the response total should be subtotal minus discount plus shipping', async function () {
    const { subtotal, desconto, frete, total } = this.responseBody;
    // sem isso, dois campos ausentes dariam NaN === NaN e o passo passaria
    for (const [campo, valor] of Object.entries({ subtotal, desconto, frete, total })) {
        expect(typeof valor, `campo "${campo}" deveria ser número`).toBe('number');
    }
    const centavos = v => Math.round(v * 100);
    expect(centavos(total)).toBe(centavos(subtotal) - centavos(desconto) + centavos(frete));
});

// lê o número como veio da API: 23.970000000000002 tem mais de 2 casas
Then('every monetary value in the response should have at most 2 decimal places', async function () {
    const body = this.responseBody;
    const valores = {
        subtotal: body.subtotal,
        desconto: body.desconto,
        frete: body.frete,
        valorFaltanteFreteGratis: body.valorFaltanteFreteGratis,
        total: body.total
    };
    (body.itens || []).forEach((item, i) => {
        valores[`itens.${i}.precoUnitario`] = item.precoUnitario;
        valores[`itens.${i}.total`] = item.total;
    });
    const comMaisDeDuasCasas = Object.entries(valores).filter(([, valor]) => !/^-?\d+(\.\d{1,2})?$/.test(String(valor)));
    expect(comMaisDeDuasCasas, 'valores com mais de 2 casas decimais').toEqual([]);
});
