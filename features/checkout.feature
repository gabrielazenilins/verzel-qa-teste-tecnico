Feature: Checkout e confirmação do pedido
  Como cliente da Verzel Store
  Eu quero informar meus dados e confirmar o pedido
  Para receber a compra e pagar na entrega

  # Regras da loja anteriores ao card (docs/referencias/documentacao-v2.3.0.md, "Regras de cálculo"):
  # nome com nome e sobrenome, e-mail válido, CEP com 8 dígitos com ou sem hífen, pagamento na entrega.
  # Como não são critérios CA, os cenários usam a tag @regra-loja.

  # ---------------------------------------------------------------- UI

  @CT-60 @CA01 @regra-loja @ui @automatizado
  Scenario: Compra completa com cupom, do carrinho à confirmação
    Given I have "P005" with quantity 1 in the cart
    And I apply the coupon "BEMVINDO10"
    When I go to checkout
    And I fill the customer data with name "Maria Silva", email "maria@exemplo.com" and zip code "01310-100"
    And I confirm the order
    Then I should see the order confirmation with a number in the format VZ-000000
    And the subtotal should be "100.00"
    And the discount should be "10.00"
    And the shipping should be "19.90"
    And the total should be "109.90"
    And the cart should be empty

  # Interpretação (DOC-09): as mensagens não estão na documentação; os textos observados na exploração
  # (seção 5) são a referência. As mensagens só aparecem depois de "Confirmar pedido" (OBS-02).
  @CT-61 @regra-loja @ui @automatizado
  Scenario Outline: Dado do cliente inválido mostra a mensagem do campo e não confirma o pedido
    Given I have "P005" with quantity 1 in the cart
    When I go to checkout
    And I fill the customer data with name "<nome>", email "<email>" and zip code "<cep>"
    And I confirm the order
    Then the field "<campo>" should show the error "<mensagem>"
    And I should still be on the checkout page

    Examples:
      | campo | nome        | email             | cep       | mensagem                      |
      | nome  | Maria       | maria@exemplo.com | 01310-100 | Informe nome e sobrenome.     |
      | email | Maria Silva | maria.exemplo.com | 01310-100 | Informe um e-mail válido.     |
      | cep   | Maria Silva | maria@exemplo.com | 0131010   | Informe um CEP com 8 dígitos. |
      | cep   | Maria Silva | maria@exemplo.com | 013101000 | Informe um CEP com 8 dígitos. |

  # ---------------------------------------------------------------- API (POST /api/pedidos)

  # Interpretação (DOC-03): o CEP é aceito com ou sem hífen e devolvido só com números.
  @CT-62 @regra-loja @api @automatizado
  Scenario Outline: API cria o pedido com número VZ- e CEP normalizado
    Given the cart items:
      | produto | quantidade |
      | P005    | 1          |
    And the customer with name "Maria Silva", email "maria@exemplo.com" and zip code "<cep>"
    When I create the order via API
    Then the response status should be 201
    And the response field "numero" should match "^VZ-\d{6}$"
    And the response field "cliente.cep" should be "01310100"
    And the response field "total" should be "119.90"

    Examples:
      | cep       |
      | 01310-100 |
      | 01310100  |

  # Interpretação (DOC-01): a documentação diz que os detalhes vêm em "campos", mas o formato geral de erro
  # usa "campo". O cenário cobra o status e o código e anexa o erro ao relatório, para registrar qual dos
  # dois vem de fato; a diferença, se houver, entra como divergência de documentação.
  @CT-63 @regra-loja @api @automatizado
  Scenario: API recusa pedido com dados do cliente inválidos
    Given the cart items:
      | produto | quantidade |
      | P005    | 1          |
    And the customer with name "Maria", email "maria@" and zip code "0131010"
    When I create the order via API
    And I attach the response to the report
    Then the response status should be 422
    And the response field "erro.codigo" should be "DADOS_INVALIDOS"
