# Bugs encontrados — Verzel Store (VZS-142 v2.3.0)

| ID | Título | Severidade | Regra | Status |
|---|---|---|---|---|
| BUG-01 | API cobra frete com subtotal de exatamente R$ 200,00 | Alta | CA06 | Aberto |
| BUG-02 | Menu de navegação some em telas de celular | Baixa | — (fora do card) | Aberto |

---

### BUG-01 — API cobra frete com subtotal de exatamente R$ 200,00
- **Severidade:** Alta. Regra principal da entrega; o cliente paga R$ 19,90 que não deveria pagar.
- **Regra:** CA06 ("O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive") e tabela de cálculo ("R$ 0,00 quando o subtotal é igual ou maior que R$ 200,00").
- **Camada:** API (`POST /api/carrinho/calcular`), refletido na UI
- **Cenários:** CT-XX (preencher quando os cenários forem numerados)
- **Ambiente:** https://verzel-store.qa-test-verzel-store.workers.dev · Google Chrome 154.0.8037.98 · 06/10/2026

**Passos para reproduzir**
1. Na vitrine, clicar 2 vezes em "Adicionar ao carrinho" da Mochila Urbana 20L (P005, R$ 100,00).
2. Abrir o carrinho.

**Resultado esperado**
- Tela: Subtotal R$ 200,00 · Frete **Grátis** · Total **R$ 200,00** · sem o aviso "Faltam R$ ... para o frete grátis" (mesmo comportamento visto com subtotal de R$ 209,80).
- API: `"frete": 0`, `"freteGratis": true`, `"valorFaltanteFreteGratis": 0`, `"total": 200`.

**Resultado obtido**
- Tela: Subtotal R$ 200,00 · Frete **R$ 19,90** · Total **R$ 219,90** · aviso "Faltam R$ 0,00 para o frete grátis." (contraditório: falta zero, mas o frete é cobrado).
- API (request `{"itens":[{"produtoId":"P005","quantidade":2}]}`):
  ```json
  { "subtotal": 200, "desconto": 0, "frete": 19.9, "freteGratis": false,
    "valorFaltanteFreteGratis": 0, "total": 219.9, "cupom": null }
  ```
- A tela só exibe o que a API devolve: o defeito está no cálculo da API.

**Mesmo defeito com cupom (P005 ×2 + BEMVINDO10)**
- Esperado: subtotal 200,00 · desconto 20,00 · frete 0,00 · total **180,00**
- Obtido: subtotal 200,00 · desconto 20,00 · frete 19,90 · total **199,90** · "Faltam R$ 0,00 para o frete grátis."

**Evidências**
- `docs/05-evidencias/exploracao/EXP-4-01_frete-200-payload.png` (tela + request no Network)
- `docs/05-evidencias/exploracao/EXP-4-01_frete-200-response.png` (tela + response no Network)
- `docs/05-evidencias/exploracao/EXP-4-04_frete-200-com-cupom.png`

**Observações**
- Acima do limite a regra funciona: P001 + P004 + P005 (R$ 209,80) → frete "Grátis"; com BEMVINDO10 → desconto R$ 20,98, frete grátis, total R$ 188,82 (CA08 atendido).
- Abaixo do limite também: R$ 199,90 e R$ 199,80 cobram R$ 19,90 e informam R$ 0,10 e R$ 0,20 faltantes.
- O defeito está só no valor-limite: indica comparação `subtotal > 200` em vez de `subtotal >= 200`.
- Como o erro está na API, ele também deve afetar `POST /api/pedidos` (mesmo resumo de valores). Confirmar com um cenário de API.

---

### BUG-02 — Menu de navegação some em telas de celular
- **Severidade:** Baixa. Fora do escopo do card VZS-142; registrado como achado da exploração.
- **Camada:** UI (responsividade)
- **Ambiente:** DevTools, emulação Pixel 9 e dobráveis · Google Chrome 154.0.8037.98

**Passos para reproduzir**
1. Abrir a loja e ativar o modo dispositivo do DevTools (Pixel 9).
2. Observar o cabeçalho.

**Resultado esperado**
- Acesso a Produtos, Documentação e Carrinho, seja visível ou num menu recolhido.

**Resultado obtido**
- Só ficam visíveis a marca (link para a página inicial) e o Carrinho. Os links "Produtos" e "Documentação" continuam no HTML, mas não aparecem, e não há menu alternativo. Em largura de iPad Mini o cabeçalho volta ao normal.

**Evidências**
- `docs/05-evidencias/exploracao/EXP-8-01_cabecalho-pixel9.png`
- `docs/05-evidencias/exploracao/EXP-8-02_cabecalho-ipad-mini.png`

---

## Observações (não são bugs)
- **Campo de cupom vazio:** a loja mostra "Informe um cupom.". A mensagem não está na documentação; comportamento aceitável.
- **Validações do checkout:** aparecem só ao clicar em "Confirmar pedido", não ao sair do campo.
- **Cupom inválido ou expirado no checkout:** a interface não leva o cupom para o checkout, então o erro 422 de `/api/pedidos` só é testável pela API.
- **Carrinho e cupom após F5:** são mantidos (ficam na aba, como diz a documentação).