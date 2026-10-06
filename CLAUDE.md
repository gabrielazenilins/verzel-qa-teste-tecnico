# Contexto de testes — Verzel Store (teste técnico QA Júnior)

## Sistema sob teste
- Loja: https://verzel-store.qa-test-verzel-store.workers.dev/
- API: mesma URL, caminho `/api`, sempre JSON (`Content-Type: application/json`). Valores monetários são números em reais (`59.9` = R$ 59,90).
- URL base em um único lugar: `process.env.BASE_URL` com fallback para a URL acima (`support/config.js`).
- Funcionalidade em teste: card **VZS-142**, versão 2.3.0 — cupom de desconto e frete grátis.
- Documentação de referência: `docs/referencias/documentacao-v2.3.0.pdf` (ler antes de levantar cenários).

## Regras (resumo da documentação; em caso de dúvida, vale o PDF)
- CA01 `BEMVINDO10` = 10% sobre o subtotal dos produtos.
- CA02 Código do cupom ignora maiúsculas/minúsculas e espaços no início e no fim.
- CA03 Cupom inexistente → "Cupom inválido." e sem desconto.
- CA04 Cupom fora da validade → "Cupom expirado." e sem desconto (`VERAO2026`, 15%, expirado em 31/03/2026).
- CA05 Um cupom por vez; para trocar, remove o atual e aplica outro.
- CA06 Frete grátis com subtotal >= R$ 200,00.
- CA07 Abaixo de R$ 200,00: frete fixo R$ 19,90 e o carrinho informa quanto falta (200 − subtotal, nunca < 0).
- CA08 Frete grátis considera o subtotal ANTES do desconto.
- CA09 Desconto não incide sobre o frete.
- CA10 Máximo 5 unidades por produto, na UI e na API.
- CA11 Todos os valores arredondados para 2 casas.
- Fórmula: `total = subtotal - desconto + frete`.
- Checkout: nome com nome e sobrenome; e-mail válido; CEP com 8 dígitos, com ou sem hífen; pagamento na entrega.
- `POST /api/carrinho/calcular`: cupom inválido/expirado → 200 sem desconto, motivo em `cupom.mensagem`.
- `POST /api/pedidos`: 201 com número `VZ-` + 6 dígitos; cupom inválido/expirado → 422.
- Erros: formato `{ "erro": { "codigo", "mensagem", "campo" } }`; códigos JSON_INVALIDO (400), ROTA_NAO_ENCONTRADA (404), PRODUTO_NAO_ENCONTRADO (404 no GET / 422 no POST), METODO_NAO_PERMITIDO (405), ITENS_OBRIGATORIOS, ITEM_INVALIDO, ITEM_DUPLICADO, QUANTIDADE_INVALIDA, QUANTIDADE_MAXIMA_EXCEDIDA, DADOS_INVALIDOS, CUPOM_INVALIDO, CUPOM_EXPIRADO (422).

## Dados de teste
| Id | Produto | Preço |
|---|---|---|
| P001 | Camiseta Essencial | 59,90 |
| P002 | Calça Jeans Slim | 139,90 |
| P003 | Tênis Casual Urbano | 189,90 |
| P004 | Boné Aba Curva | 49,90 |
| P005 | Mochila Urbana 20L | 100,00 |
| P006 | Kit 3 Pares de Meias | 29,90 |
| P007 | Jaqueta Corta-Vento | 229,90 |
| P008 | Garrafa Térmica 750ml | 50,00 |

Combinações úteis: P005×2 = 200,00 (limite exato) · P005+P008+P004 = 199,90 · P001+P002 = 199,80 · P002+P004×2 = 239,70 (exemplo da doc: desconto 23,97, total 215,73).
Cliente de exemplo: Maria Silva / maria@exemplo.com / 01310-100.

## NÃO é bug (simplificado de propósito)
- Carrinho guardado só na aba; outra aba/navegador/anônima começa vazio.
- Pedidos não são armazenados; número do pedido é fictício; não há consulta.
- Nenhum e-mail enviado, nenhuma cobrança feita.
- Produtos, preços e cupons fixos; sem estoque.
- A API não guarda estado entre chamadas.

## Fora de escopo
Login, cadastro, pagamento online, consulta de pedidos, testes de carga, estresse e segurança (ambiente compartilhado).

## Convenções deste repositório
- Playwright + Cucumber, JavaScript CommonJS.
- Keywords Gherkin em inglês; Feature e Scenario em português; steps em inglês.
- Tags: `@CT-XX` (ID do cenário), `@CAXX` (critério), `@ui`/`@api`, `@manual`/`@automatizado`, `@bug-XX` quando falhar por defeito.
- Valores exibidos na UI ("R$ 1.234,56") são convertidos para número com o helper `support/money.js` antes de comparar.
- Cenários: `features/`; execução e evidências: `docs/`; bugs: `docs/04-bugs.md`.
- Ambiguidades registradas em `docs/01-plano-de-teste.md` (seção Interpretações).
