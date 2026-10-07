const { Before } = require('@cucumber/cucumber')
const CatalogPage = require('../pages/CatalogPage')
const CartPage = require('../pages/CartPage')
const CheckoutPage = require('../pages/CheckoutPage')
const ConfirmationPage = require('../pages/ConfirmationPage')
const Header = require('../pages/components/Header')
const Summary = require('../pages/components/Summary')

// Roda depois do Before do world.js (carregado primeiro), que já abriu o navegador.
Before({ tags: '@ui' }, async function(){
    this.pages = {
        catalog: new CatalogPage(this.page),
        cart: new CartPage(this.page),
        checkout: new CheckoutPage(this.page),
        confirmation: new ConfirmationPage(this.page),
        header: new Header(this.page),
        summary: new Summary(this.page)
    }
})
