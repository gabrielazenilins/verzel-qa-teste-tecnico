Feature: Cupom de desconto
  Como cliente da Verzel Store
  Eu quero aplicar um cupom de desconto no carrinho
  Para pagar menos nas minhas compras

  # Regras: CA01 a CA05 (docs/referencias/documentacao-v2.3.0.md).
  # A API verifica as regras e os valores; a UI verifica o que o cliente vê e faz no carrinho.

  # ---------------------------------------------------------------- UI (carrinho)

  # Interpretação (DOC-02): na tela, o texto de sucesso é o da interface ("Cupom BEMVINDO10 aplicado."),
  # não a mensagem da API. Os valores precisam bater com os da API.
  @CT-01 @CA01 @CA05 @ui @automatizado
  Scenario: Cupom válido mostra o desconto e esconde o campo de cupom
    Given I have the following items in the cart:
      | produto | quantidade |
      | P002    | 1          |
      | P004    | 2          |
    When I apply the coupon "BEMVINDO10"
    Then the coupon "BEMVINDO10" should be shown as applied
    And the coupon field should not be shown
    And the discount should be "23.97"
    And the total should be "215.73"

  @CT-02 @CA03 @CA04 @ui @automatizado
  Scenario Outline: Cupom recusado mostra o motivo e não dá desconto
    Given I have "P005" with quantity 1 in the cart
    When I apply the coupon "<cupom>"
    Then the coupon message should be "<mensagem>"
    And the total should be "119.90"

    Examples: CA03 - cupom inexistente
      | cupom  | mensagem        |
      | XYZ123 | Cupom inválido. |

    Examples: CA04 - cupom expirado
      | cupom     | mensagem        |
      | VERAO2026 | Cupom expirado. |

  # Só existe um cupom válido; aplicar o VERAO2026 depois de remover mostra que o campo aceita outro cupom.
  @CT-03 @CA05 @ui @automatizado
  Scenario: Para trocar de cupom, o cliente remove o atual e aplica outro
    Given I have the following items in the cart:
      | produto | quantidade |
      | P002    | 1          |
      | P004    | 2          |
    And I apply the coupon "BEMVINDO10"
    When I remove the coupon
    And I apply the coupon "VERAO2026"
    Then the coupon message should be "Cupom expirado."
    And the subtotal should be "239.70"
    And the total should be "239.70"

  # ---------------------------------------------------------------- API (POST /api/carrinho/calcular)

  # Interpretação (DOC-07): o CA02 vale também para a API, que devolve o código normalizado.
  # O cupom fica entre aspas na própria célula porque o Gherkin remove os espaços das bordas das células.
  @CT-04 @CA01 @CA02 @api @automatizado
  Scenario Outline: API aplica 10% de desconto com o BEMVINDO10 em qualquer forma aceita
    Given the cart items:
      | produto | quantidade |
      | P002    | 1          |
      | P004    | 2          |
    And the coupon <cupom>
    When I calculate the cart via API
    Then the response status should be 200
    And the response field "subtotal" should be "239.70"
    And the response field "desconto" should be "23.97"
    And the response field "total" should be "215.73"
    And the response field "cupom.codigo" should be "BEMVINDO10"
    And the response field "cupom.aplicado" should be "true"
    And the response field "cupom.mensagem" should be "Cupom aplicado: 10% de desconto nos produtos."

    Examples: CA01 - código como na documentação
      | cupom        |
      | "BEMVINDO10" |

    Examples: CA02 - maiúsculas, minúsculas e espaços no início e no fim
      | cupom          |
      | "bemvindo10"   |
      | " bemVindo10 " |

  # Os textos "Cupom inválido." e "Cupom expirado." são os definidos nos CA03 e CA04 e vêm em cupom.mensagem.
  # verao2026 cruza CA02 e CA04: o cupom expirado em minúsculas também precisa cair em "Cupom expirado.".
  @CT-05 @CA03 @CA04 @api @automatizado
  Scenario Outline: API recusa cupom inexistente ou expirado sem erro e sem desconto
    Given the cart items:
      | produto | quantidade |
      | P005    | 1          |
    And the coupon "<cupom>"
    When I calculate the cart via API
    Then the response status should be 200
    And the response field "desconto" should be "0.00"
    And the response field "total" should be "119.90"
    And the response field "cupom.aplicado" should be "false"
    And the response field "cupom.mensagem" should be "<mensagem>"

    Examples: CA03 - cupom inexistente
      | cupom  | mensagem        |
      | XYZ123 | Cupom inválido. |

    Examples: CA04 - cupom expirado
      | cupom     | mensagem        |
      | VERAO2026 | Cupom expirado. |

    @CA02
    Examples: CA02 e CA04 - cupom expirado em minúsculas
      | cupom     | mensagem        |
      | verao2026 | Cupom expirado. |

  # ---------------------------------------------------------------- API (POST /api/pedidos)

  # DOC-14: pela tela não dá para chegar a este erro (OBS-03), então ele só é testado na API.
  @CT-06 @CA03 @CA04 @api @automatizado
  Scenario Outline: Pedido com cupom inexistente ou expirado é recusado com 422
    Given the cart items:
      | produto | quantidade |
      | P005    | 1          |
    And the coupon "<cupom>"
    And the customer with name "Maria Silva", email "maria@exemplo.com" and zip code "01310-100"
    When I create the order via API
    Then the response status should be 422
    And the response field "erro.codigo" should be "<codigo>"

    Examples: CA03 - cupom inexistente
      | cupom  | codigo         |
      | XYZ123 | CUPOM_INVALIDO |

    Examples: CA04 - cupom expirado
      | cupom     | codigo         |
      | VERAO2026 | CUPOM_EXPIRADO |
