// TEMPORÁRIO: passos de features/smoke.feature. Remover junto com a feature.
const { Given, When, Then } = require('@cucumber/cucumber')
const { expect } = require('@playwright/test')
const { BASE_URL } = require('../support/config')

Given('I open the store home page', async function(){
    await this.page.goto(BASE_URL)
})

Then('the page title should be {string}', async function(title){
    await expect(this.page).toHaveTitle(title)
})

When('I request the product list via API', async function(){
    this.response = await this.api.produtos.list()
    this.responseBody = await this.response.json()
})

Then('the product list response should have status {int} and {int} products', async function(status, count){
    expect(this.response.status()).toBe(status)
    expect(this.responseBody).toHaveLength(count)
})
