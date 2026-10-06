# TEMPORÁRIO: valida a configuração do projeto (UI e API). Remover junto com steps/smoke.steps.js.
Feature: Smoke da estrutura do projeto
  Como QA
  Eu quero confirmar que a UI e a API estão acessíveis pelos testes
  Para validar a configuração do Playwright + Cucumber

  @smoke @ui
  Scenario: Loja abre com o título esperado
    Given I open the store home page
    Then the page title should be "Produtos | Verzel Store"

  @smoke @api
  Scenario: API lista os 8 produtos
    When I request the product list via API
    Then the product list response should have status 200 and 8 products
