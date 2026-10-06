# Execução

Status: **Passou** (resultado igual ao esperado) · **Falhou** (o sistema respondeu diferente do esperado; vira bug) · **Bloqueado** (não foi possível executar). "—" = ainda não executado.

Nos `Scenario Outline`, cada exemplo tem a sua linha (ex.: `CT-26 · 199,90`), para cada resultado ter evidência própria.

## Frete grátis (`features/frete.feature`)

| ID | Cenário | Regra | Camada | Tipo | Resultado | Evidência | Bug |
|---|---|---|---|---|---|---|---|
| CT-20 | Frete grátis com subtotal de exatamente R$ 200,00 | CA06 | UI | automatizado | — | | BUG-01 |
| CT-21 | Frete cobrado e aviso de R$ 0,10 com subtotal de R$ 199,90 | CA07 | UI | automatizado | — | | |
| CT-22 | Frete continua grátis com cupom quando o subtotal passa de R$ 200,00 | CA08 | UI | automatizado | — | | |
| CT-23 | Frete passa a ser grátis ao aumentar a quantidade no carrinho | CA06 | UI | automatizado | — | | |
| CT-24 | Frete volta a ser cobrado ao remover um item do carrinho | CA07 | UI | automatizado | — | | |
| CT-25 | API dá frete grátis com subtotal de exatamente R$ 200,00 | CA06 | API | automatizado | — | | BUG-01 |
| CT-26 · 219,80 | API calcula frete e valor faltante (acima do limite) | CA06 | API | automatizado | — | | |
| CT-26 · 239,70 | API calcula frete e valor faltante (acima do limite) | CA06 | API | automatizado | — | | |
| CT-26 · 199,90 | API calcula frete e valor faltante (abaixo do limite) | CA07 | API | automatizado | — | | |
| CT-26 · 199,80 | API calcula frete e valor faltante (abaixo do limite) | CA07 | API | automatizado | — | | |
| CT-26 · 79,80 | API calcula frete e valor faltante (abaixo do limite) | CA07 | API | automatizado | — | | |
| CT-27 | API mantém frete grátis quando o cupom deixa o valor em R$ 180,00 | CA08 | API | automatizado | — | | BUG-01 |
| CT-28 · 219,80 | API calcula desconto e frete com cupom (CA08) | CA08 | API | automatizado | — | | |
| CT-28 · 109,80 | API calcula desconto e frete com cupom (CA09) | CA09 | API | automatizado | — | | |
| CT-29 | Pedido com subtotal de exatamente R$ 200,00 sai com frete grátis | CA06 | API | automatizado | — | | |
| CT-30 | Pedido com cupom não aplica o desconto sobre o frete | CA09 | API | automatizado | — | | |
