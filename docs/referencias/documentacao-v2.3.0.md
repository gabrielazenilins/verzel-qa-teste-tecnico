# Cupom de desconto e frete grátis

> Transcrição da página https://verzel-store.qa-test-verzel-store.workers.dev/documentacao, capturada em 06/10/2026.
> O original em PDF está em `docs/referencias/documentacao-v2.3.0.pdf`. Em caso de divergência, vale o original.

| Card | Versão | Publicado em | Status |
|---|---|---|---|
| VZS-142 | 2.3.0 | 30/09/2026 | Pronto para teste |

Esta entrega adiciona à Verzel Store a aplicação de cupons de desconto no carrinho e a regra de frete grátis. Os cálculos são feitos pela API e a interface apenas exibe o resultado.

## História

> Como cliente da Verzel Store, quero aplicar um cupom de desconto e ganhar frete grátis em compras maiores, para pagar menos nas minhas compras.

## Critérios de aceite

|Código|                            Critério de aceite                                                               |
|---|---|
| CA01 | O cupom BEMVINDO10 aplica 10% de desconto sobre o subtotal dos produtos.                                    |
| CA02 | O código do cupom não diferencia maiúsculas de minúsculas, e espaços no início e no fim  são ignorados.     |
| CA03 | Um cupom inexistente exibe a mensagem "Cupom inválido." e nenhum desconto é aplicado.                       |  
| CA04 | Um cupom fora da validade exibe a mensagem "Cupom expirado." e nenhum desconto é aplicado.                  |
| CA05 | Apenas um cupom pode ser aplicado por vez. Para trocar, o cliente remove o cupom atual e aplica outro.      |
| CA06 | O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive.                                |
| CA07 | Abaixo de R$ 200,00, é cobrado frete fixo de R$ 19,90 e o carrinho informa quanto falta para o frete grátis.|
| CA08 | A regra do frete grátis considera o subtotal antes do desconto do cupom.                                    |
| CA09 | O desconto do cupom não incide sobre o frete.                                                               |
| CA10 | Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API.          |
| CA11 | Todos os valores são arredondados para 2 casas decimais.                                                    |

## Regras de cálculo

O total do pedido segue a fórmula:

```
total = subtotal - desconto + frete
```

| Valor | Como é calculado |
|---|---|
| Subtotal | Soma de preço unitário vezes quantidade de cada item. |
| Desconto | Percentual do cupom aplicado sobre o subtotal. Zero quando não há cupom válido. |
| Frete | R$ 0,00 quando o subtotal é igual ou maior que R$ 200,00. Caso contrário, R$ 19,90. |
| Faltante para frete grátis | R$ 200,00 menos o subtotal, nunca menor que zero. |

Outras regras da loja que já existiam antes desta entrega:

- O nome do cliente precisa ter nome e sobrenome.
- O e-mail precisa ter um formato válido.
- O CEP precisa ter 8 dígitos, com ou sem hífen.
- O pagamento é feito na entrega, não existe etapa de pagamento online.

## Dados para teste

### Produtos

| Id  |       Produto         |   Preço  |
|---|---|---|
|P001 | Camiseta Essencial    | R$ 59,90 |
|P002 | Calça Jeans Slim      | R$ 139,90|
|P003 | Tênis Casual Urbano   | R$ 189,90|
|P004 | Boné Aba Curva        | R$ 49,90 |
|P005 | Mochila Urbana 20L    | R$ 100,00|
|P006 | Kit 3 Pares de Meias  | R$ 29,90 |
|P007 | Jaqueta Corta-Vento   | R$ 229,90|
|P008 | Garrafa Térmica 750ml | R$ 50,00 |

### Cupons

| Código   | Desconto |       Situação        |
|---|---|---|
|BEMVINDO10|   10%    |       Válido          |
|VERAO2026 |   15%    | Expirado em 31/03/2026|

## API

A API fica no mesmo endereço da loja, no caminho `/api`. Envie e receba sempre JSON, com o cabeçalho `Content-Type: application/json`. Valores monetários são números em reais, como `59.9` para R$ 59,90.

### GET /api/produtos
Lista todos os produtos. Responde `200`.
```json
[
  {
    "id": "P001",
    "nome": "Camiseta Essencial",
    "descricao": "Algodão penteado e corte reto.",
    "categoria": "Vestuário",
    "preco": 59.9
  }
]
```

### GET /api/produtos/{id}
Consulta um produto pelo id. Responde `200` com o produto ou `404` quando ele não existe.

### POST /api/carrinho/calcular

Calcula o carrinho sem gravar nada. O campo `cupom` é opcional. Um cupom inválido ou expirado não gera erro aqui: a resposta é `200`, sem desconto, e o motivo vem em `cupom.mensagem`.

Requisição:
```json
{
  "itens": [
    { "produtoId": "P002", "quantidade": 1 },
    { "produtoId": "P004", "quantidade": 2 }
  ],
  "cupom": "BEMVINDO10"
}
```
Resposta 200:
```json
{
  "itens": [
    { "produtoId": "P002", "nome": "Calça Jeans Slim", "precoUnitario": 139.9, "quantidade": 1, "total": 139.9 },
    { "produtoId": "P004", "nome": "Boné Aba Curva", "precoUnitario": 49.9, "quantidade": 2, "total": 99.8 }
  ],
  "subtotal": 239.7,
  "desconto": 23.97,
  "frete": 0,
  "freteGratis": true,
  "valorFaltanteFreteGratis": 0,
  "total": 215.73,
  "cupom": {
    "codigo": "BEMVINDO10",
    "aplicado": true,
    "mensagem": "Cupom aplicado: 10% de desconto nos produtos."
  }
}
```
### POST /api/pedidos

Valida e confirma um pedido. Responde `201` com o número do pedido no formato `VZ-000000` e o mesmo resumo de valores do cálculo do carrinho. Aqui, um cupom inválido ou expirado gera erro `422`.

Requisição:
```json
{
  "cliente": {
    "nome": "Maria Silva",
    "email": "maria@exemplo.com",
    "cep": "01310-100"
  },
  "itens": [
    { "produtoId": "P005", "quantidade": 1 }
  ],
  "cupom": "BEMVINDO10"
}
```
Resposta 201:
```json
{
  "numero": "VZ-482913",
  "criadoEm": "2026-09-30T14:22:05.120Z",
  "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310100" },
  "itens": [ ... ],
  "subtotal": 100,
  "desconto": 10,
  "frete": 19.9,
  "freteGratis": false,
  "valorFaltanteFreteGratis": 100,
  "total": 109.9,
  "cupom": { "codigo": "BEMVINDO10", "aplicado": true, "mensagem": "..." }
}
```

## Códigos de erro
Todo erro segue o mesmo formato:
```json
{
  "erro": {
    "codigo": "QUANTIDADE_INVALIDA",
    "mensagem": "A quantidade deve ser um número inteiro maior ou igual a 1.",
    "campo": "itens[0].quantidade"
  }
}
```

|Status |Código                    | Quando acontece                                                        |
|---|---|---|
|400    |JSON_INVALIDO             | O corpo da requisição não é um objeto JSON válido.                     |
|404	|ROTA_NAO_ENCONTRADA       | A rota não existe.                                                     |
|404	|PRODUTO_NAO_ENCONTRADO    | Consulta de produto com id inexistente.                                |
|405	|METODO_NAO_PERMITIDO      | A rota existe, mas não aceita o método HTTP usado.                     |
|422	|ITENS_OBRIGATORIOS        | A lista de itens está ausente ou vazia.                                |
|422	|ITEM_INVALIDO             | Um item não é um objeto com produtoId e quantidade.                    |
|422	|PRODUTO_NAO_ENCONTRADO    | Um item referencia um produto inexistente.                             |
|422	|ITEM_DUPLICADO            | O mesmo produto aparece mais de uma vez na lista de itens.             |
|422	|QUANTIDADE_INVALIDA       | A quantidade não é um número inteiro maior ou igual a 1.               |
|422	|QUANTIDADE_MAXIMA_EXCEDIDA| A quantidade de um produto é maior que 5.                              |
|422	|DADOS_INVALIDOS           | Um ou mais dados do cliente são inválidos. Os detalhes vêm em "campos".|
|422	|CUPOM_INVALIDO            | Pedido enviado com um cupom inexistente.                               |
|422	|CUPOM_EXPIRADO            | Pedido enviado com um cupom fora da validade.                          |

## Sobre este ambiente

A Verzel Store é um ambiente de teste usado por muitos candidatos ao mesmo tempo. Para que um teste não interfira no outro, algumas partes foram simplificadas de propósito. 
Os comportamentos abaixo são esperados e não devem ser reportados como bugs:

- O carrinho fica guardado apenas na aba do navegador. Outra aba, outro navegador ou uma janela anônima começam com o carrinho vazio.
- Os pedidos não são armazenados. O número gerado na confirmação é fictício e não existe consulta de pedidos.
- Nenhum e-mail é enviado e nenhuma cobrança é feita.
- Produtos, preços e cupons são fixos e iguais para todos. Não existe controle de estoque.
- A API não guarda nada entre uma chamada e outra: ela recebe os dados, calcula e responde.

Ficam fora do escopo deste teste: login, cadastro de clientes, pagamento online e consulta de pedidos.
