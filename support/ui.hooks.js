const { Before } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const S = require('../pages/selectors');
const CatalogPage = require('../pages/CatalogPage');
const CartPage = require('../pages/CartPage');
const CheckoutPage = require('../pages/CheckoutPage');
const ConfirmationPage = require('../pages/ConfirmationPage');
const Header = require('../pages/components/Header');
const Summary = require('../pages/components/Summary');

// todo cenário de UI começa na vitrine, com a grade dos 8 produtos carregada
Before({ tags: '@ui' }, async function () {
    this.pages = {
        catalog: new CatalogPage(this.page),
        cart: new CartPage(this.page),
        checkout: new CheckoutPage(this.page),
        confirmation: new ConfirmationPage(this.page),
        header: new Header(this.page),
        summary: new Summary(this.page)
    };
    await this.pages.catalog.open();
    await expect(this.pages.catalog.grid).toBeVisible();
    await expect(this.pages.catalog.gridItems).toHaveCount(S.textos.quantidadeDeProdutosNaVitrine);
});
