Feature: Contrato da API
  Como integrador da Verzel Store
  Eu quero que a API responda conforme a documentação
  Para tratar os erros pelo código e confiar nos valores calculados

  # Fonte: seções "API" e "Códigos de erro" de docs/referencias/documentacao-v2.3.0.md.
  # Os códigos de erro e os endpoints de produtos não pertencem a um critério CA; esses cenários usam @contrato-api.
  # O corpo vai entre aspas simples no passo porque o JSON usa aspas duplas. Corpo vazio ('') = requisição sem corpo.

  @CT-80 @contrato-api @api @automatizado
  Scenario Outline: API responde com o status e o código de erro documentados
    When I send a "<metodo>" request to "<rota>" with body '<corpo>'
    Then the response status should be <status>
    And the response field "erro.codigo" should be "<codigo>"

    Examples: Corpo e rota
      | metodo | rota                    | corpo     | status | codigo              |
      | POST   | /api/carrinho/calcular  | {invalido | 400    | JSON_INVALIDO       |
      | GET    | /api/rota-inexistente   |           | 404    | ROTA_NAO_ENCONTRADA |

    Examples: Produto inexistente (DOC-04: 404 na consulta, 422 no carrinho)
      | metodo | rota                   | corpo                                          | status | codigo                 |
      | GET    | /api/produtos/P999     |                                                | 404    | PRODUTO_NAO_ENCONTRADO |
      | POST   | /api/carrinho/calcular | {"itens":[{"produtoId":"P999","quantidade":1}]} | 422    | PRODUTO_NAO_ENCONTRADO |

    Examples: Lista de itens
      | metodo | rota                   | corpo                                                                                | status | codigo             |
      | POST   | /api/carrinho/calcular | {}                                                                                   | 422    | ITENS_OBRIGATORIOS |
      | POST   | /api/carrinho/calcular | {"itens":[]}                                                                         | 422    | ITENS_OBRIGATORIOS |
      | POST   | /api/carrinho/calcular | {"itens":["P001"]}                                                                   | 422    | ITEM_INVALIDO      |
      | POST   | /api/carrinho/calcular | {"itens":[{"produtoId":"P001","quantidade":1},{"produtoId":"P001","quantidade":1}]} | 422    | ITEM_DUPLICADO     |

  # Interpretação (DOC-11): os métodos aceitos não estão listados; pelos exemplos, GET nos produtos
  # e POST no carrinho e nos pedidos. Qualquer outro método numa rota existente deve dar 405.
  @CT-81 @contrato-api @api @automatizado
  Scenario Outline: API recusa método não aceito numa rota existente
    When I send a "<metodo>" request to "<rota>"
    Then the response status should be 405
    And the response field "erro.codigo" should be "METODO_NAO_PERMITIDO"

    Examples:
      | metodo | rota                   |
      | GET    | /api/carrinho/calcular |
      | GET    | /api/pedidos           |
      | POST   | /api/produtos          |

  # Dois pares When/Then num só cenário (lista e consulta), por serem o mesmo recurso.
  @CT-82 @contrato-api @api @automatizado
  Scenario: API lista os 8 produtos e consulta um produto pelo id
    When I send a "GET" request to "/api/produtos"
    Then the response status should be 200
    And the response should be a list with exactly the ids "P001, P002, P003, P004, P005, P006, P007, P008"
    When I send a "GET" request to "/api/produtos/P002"
    Then the response status should be 200
    And the response field "id" should be "P002"
    And the response field "nome" should be "Calça Jeans Slim"
    And the response field "preco" should be "139.90"

  # Interpretação (DOC-05): itens[].total = precoUnitario × quantidade.
  # Interpretação (DOC-12): nenhum valor monetário da resposta passa de 2 casas decimais (pega erro de
  # ponto flutuante, ex.: 239.7 × 0.1 = 23.970000000000002 em JavaScript).
  @CT-83 @CA11 @api @automatizado
  Scenario Outline: API calcula o total pela fórmula, com itens e valores em 2 casas decimais
    Given the cart items:
      | produto    | quantidade |
      | <produto1> | <qtd1>     |
      | <produto2> | <qtd2>     |
    And the coupon "BEMVINDO10"
    When I calculate the cart via API
    Then the response status should be 200
    And the response field "itens.0.total" should be "<item1>"
    And the response field "itens.1.total" should be "<item2>"
    And the response field "subtotal" should be "<subtotal>"
    And the response field "desconto" should be "<desconto>"
    And the response field "frete" should be "<frete>"
    And the response field "total" should be "<total>"
    And the response total should be subtotal minus discount plus shipping
    And every monetary value in the response should have at most 2 decimal places

    Examples: Exemplo da documentação, com frete grátis
      | produto1 | qtd1 | produto2 | qtd2 | item1  | item2 | subtotal | desconto | frete | total  |
      | P002     | 1    | P004     | 2    | 139.90 | 99.80 | 239.70   | 23.97    | 0.00  | 215.73 |

    Examples: Com frete cobrado
      | produto1 | qtd1 | produto2 | qtd2 | item1 | item2 | subtotal | desconto | frete | total  |
      | P001     | 1    | P004     | 1    | 59.90 | 49.90 | 109.80   | 10.98    | 19.90 | 118.72 |
