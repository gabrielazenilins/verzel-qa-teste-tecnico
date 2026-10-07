Feature: Limite de quantidade por produto
  Como loja
  Eu quero limitar cada produto a 5 unidades por pedido
  Para cumprir a regra de quantidade máxima na tela e na API

  # Regra: CA10 (docs/referencias/documentacao-v2.3.0.md). Vale para a interface e para a API.
  # A API verifica a regra e os códigos de erro; a UI verifica o que o cliente vê ao chegar no limite.

  # ---------------------------------------------------------------- UI

  @CT-50 @CA10 @ui @automatizado
  Scenario: Carrinho trava o botão + ao chegar a 5 unidades
    Given I have "P001" with quantity 1 in the cart
    When I increase the quantity of "P001" 4 times
    Then the increase button of "P001" should be disabled
    And I should see the limit message for "P001"
    And the subtotal should be "299.50"

  # O texto do aviso não está na documentação (DOC-02): o cenário só verifica que o aviso de limite aparece.
  @CT-51 @CA10 @ui @automatizado
  Scenario: Vitrine trava o botão Adicionar ao carrinho ao chegar a 5 unidades
    Given I am on the products page
    When I add "P001" to the cart 5 times
    Then the add button of "P001" should be disabled
    And I should see the limit notice of "P001" on the products page

  # ---------------------------------------------------------------- API (POST /api/carrinho/calcular)

  # A coluna "quantidade" é lida como valor JSON: 1.5 vai como número decimal e "2" (com aspas) vai como texto.
  # Na linha aceita (5), "campo"/"valor" conferem o subtotal; nas recusadas, o código e o campo do erro.
  # Interpretação: "2" como texto é recusado, sem conversão para número ("a quantidade não é um número inteiro").
  # Interpretação: em QUANTIDADE_MAXIMA_EXCEDIDA, erro.campo segue o exemplo da documentação para
  # QUANTIDADE_INVALIDA ("itens[0].quantidade"), o único código com exemplo de campo.
  @CT-52 @CA10 @api @automatizado
  Scenario Outline: API aceita até 5 unidades e recusa quantidade acima do limite ou inválida
    Given the cart items:
      | produto | quantidade   |
      | P001    | <quantidade> |
    When I calculate the cart via API
    Then the response status should be <status>
    And the response field "<campo>" should be "<valor>"
    And the response field "<campo2>" should be "<valor2>"

    Examples: Limite aceito
      | quantidade | status | campo    | valor  | campo2 | valor2 |
      | 5          | 200    | subtotal | 299.50 | total  | 299.50 |

    Examples: Acima do limite
      | quantidade | status | campo       | valor                      | campo2     | valor2              |
      | 6          | 422    | erro.codigo | QUANTIDADE_MAXIMA_EXCEDIDA | erro.campo | itens[0].quantidade |

    Examples: Quantidade inválida
      | quantidade | status | campo       | valor               | campo2     | valor2              |
      | 0          | 422    | erro.codigo | QUANTIDADE_INVALIDA | erro.campo | itens[0].quantidade |
      | -1         | 422    | erro.codigo | QUANTIDADE_INVALIDA | erro.campo | itens[0].quantidade |
      | 1.5        | 422    | erro.codigo | QUANTIDADE_INVALIDA | erro.campo | itens[0].quantidade |
      | "2"        | 422    | erro.codigo | QUANTIDADE_INVALIDA | erro.campo | itens[0].quantidade |
