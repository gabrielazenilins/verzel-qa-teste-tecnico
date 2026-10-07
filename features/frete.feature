Feature: Frete grátis
  Como cliente da Verzel Store
  Eu quero ganhar frete grátis em compras a partir de R$ 200,00
  Para pagar menos nas minhas compras

  # Regras: CA06 a CA09 (docs/referencias/documentacao-v2.3.0.md).
  # Valores-limite: docs/01-plano-de-teste.md, seção "Dados de teste e valores-limite".
  # A API verifica as regras e os valores; a UI verifica o que o cliente vê e faz no carrinho.

  # ---------------------------------------------------------------- UI (carrinho)

  # Interpretação (DOC-15): com frete grátis, o carrinho mostra "Grátis" no frete e não exibe
  # o aviso "Faltam R$ X".
  @CT-20 @CA06 @ui @automatizado @bug-01
  Scenario: Frete grátis com subtotal de exatamente R$ 200,00
    Given I have "P005" with quantity 2 in the cart
    Then the subtotal should be "200.00"
    And the shipping should be free
    And the total should be "200.00"
    And the free shipping notice should not be shown

  # Interpretação (DOC-02): o texto do aviso "Faltam R$ X para o frete grátis." é o da interface
  # (comportamento observado); a documentação só diz que o carrinho informa quanto falta.
  @CT-21 @CA07 @ui @automatizado
  Scenario: Frete cobrado e aviso de R$ 0,10 com subtotal de R$ 199,90
    Given I have the following items in the cart:
      | produto | quantidade |
      | P005    | 1          |
      | P008    | 1          |
      | P004    | 1          |
    Then the subtotal should be "199.90"
    And the shipping should be "19.90"
    And the total should be "219.80"
    And the free shipping notice should be "Faltam R$ 0,10 para o frete grátis."

  # Interpretação (DOC-15): com frete grátis, o aviso "Faltam R$ X" não é exibido.
  @CT-22 @CA06 @ui @automatizado
  Scenario: Frete passa a ser grátis ao aumentar a quantidade no carrinho
    Given I have "P001" with quantity 3 in the cart
    When I increase the quantity of "P001" 1 time
    Then the subtotal should be "239.60"
    And the shipping should be free
    And the total should be "239.60"
    And the free shipping notice should not be shown

  # ---------------------------------------------------------------- API (POST /api/carrinho/calcular)

  @CT-23 @CA06 @api @automatizado @bug-01
  Scenario: API dá frete grátis com subtotal de exatamente R$ 200,00
    Given the cart items:
      | produto | quantidade |
      | P005    | 2          |
    When I calculate the cart via API
    Then the response status should be 200
    And the response field "subtotal" should be "200.00"
    And the response field "frete" should be "0.00"
    And the response field "freteGratis" should be "true"
    And the response field "valorFaltanteFreteGratis" should be "0.00"
    And the response field "total" should be "200.00"

  @CT-24 @CA06 @CA07 @api @automatizado
  Scenario Outline: API calcula frete e valor faltante acima e abaixo de R$ 200,00
    Given the cart items:
      | produto    | quantidade |
      | <produto1> | <qtd1>     |
      | <produto2> | <qtd2>     |
    When I calculate the cart via API
    Then the response status should be 200
    And the response field "subtotal" should be "<subtotal>"
    And the response field "frete" should be "<frete>"
    And the response field "freteGratis" should be "<freteGratis>"
    And the response field "valorFaltanteFreteGratis" should be "<faltante>"
    And the response field "total" should be "<total>"

    Examples: Acima do limite
      | produto1 | qtd1 | produto2 | qtd2 | subtotal | frete | freteGratis | faltante | total  |
      | P003     | 1    | P006     | 1    | 219.80   | 0.00  | true        | 0.00     | 219.80 |
      | P002     | 1    | P004     | 2    | 239.70   | 0.00  | true        | 0.00     | 239.70 |

    Examples: Abaixo do limite
      | produto1 | qtd1 | produto2 | qtd2 | subtotal | frete | freteGratis | faltante | total  |
      | P004     | 1    | P008     | 3    | 199.90   | 19.90 | false       | 0.10     | 219.80 |
      | P001     | 1    | P002     | 1    | 199.80   | 19.90 | false       | 0.20     | 219.70 |
      | P006     | 1    | P004     | 1    | 79.80    | 19.90 | false       | 120.20   | 99.70  |

  @CT-25 @CA08 @api @automatizado @bug-01
  Scenario: API mantém frete grátis quando o cupom deixa o valor em R$ 180,00
    Given the cart items:
      | produto | quantidade |
      | P005    | 2          |
    And the coupon "BEMVINDO10"
    When I calculate the cart via API
    Then the response status should be 200
    And the response field "subtotal" should be "200.00"
    And the response field "desconto" should be "20.00"
    And the response field "frete" should be "0.00"
    And the response field "freteGratis" should be "true"
    And the response field "valorFaltanteFreteGratis" should be "0.00"
    And the response field "total" should be "180.00"

  # CA08: o frete grátis vale pelo subtotal antes do desconto, mesmo com o total abaixo de R$ 200,00.
  # CA09: o desconto incide só nos produtos (sobre o frete, daria 12,97 em vez de 10,98).
  # Nos dois casos, o faltante usa o subtotal antes do desconto.
  @CT-26 @CA08 @CA09 @api @automatizado
  Scenario Outline: API calcula desconto e frete com cupom
    Given the cart items:
      | produto    | quantidade |
      | <produto1> | <qtd1>     |
      | <produto2> | <qtd2>     |
    And the coupon "BEMVINDO10"
    When I calculate the cart via API
    Then the response status should be 200
    And the response field "subtotal" should be "<subtotal>"
    And the response field "desconto" should be "<desconto>"
    And the response field "frete" should be "<frete>"
    And the response field "freteGratis" should be "<freteGratis>"
    And the response field "valorFaltanteFreteGratis" should be "<faltante>"
    And the response field "total" should be "<total>"

    Examples: CA08 - frete grátis mesmo com o total abaixo de R$ 200,00
      | produto1 | qtd1 | produto2 | qtd2 | subtotal | desconto | frete | freteGratis | faltante | total  |
      | P003     | 1    | P006     | 1    | 219.80   | 21.98    | 0.00  | true        | 0.00     | 197.82 |

    Examples: CA09 - desconto não incide sobre o frete
      | produto1 | qtd1 | produto2 | qtd2 | subtotal | desconto | frete | freteGratis | faltante | total  |
      | P001     | 1    | P004     | 1    | 109.80   | 10.98    | 19.90 | false       | 90.20    | 118.72 |

  # ---------------------------------------------------------------- API (POST /api/pedidos)

  # O BUG-01 também chega ao pedido: na execução de 07/10/2026, o pedido saiu com 201, frete 19,9
  # e total 219,9 (evidência em docs/05-evidencias/automacao/CT-27_api.json; o número do pedido muda a cada execução).
  @CT-27 @CA06 @api @automatizado @bug-01
  Scenario: Pedido com subtotal de exatamente R$ 200,00 sai com frete grátis
    Given the cart items:
      | produto | quantidade |
      | P005    | 2          |
    And the customer with name "Maria Silva", email "maria@exemplo.com" and zip code "01310-100"
    When I create the order via API
    Then the response status should be 201
    And the response field "subtotal" should be "200.00"
    And the response field "frete" should be "0.00"
    And the response field "freteGratis" should be "true"
    And the response field "valorFaltanteFreteGratis" should be "0.00"
    And the response field "total" should be "200.00"
