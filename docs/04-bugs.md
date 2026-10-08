# Bugs encontrados — Verzel Store (VZS-142 v2.3.0)

| ID | Título | Severidade | Regra | Status |
|---|---|---|---|---|
| BUG-01 | API cobra frete com subtotal de exatamente R$ 200,00 | Alta | CA06 (afeta também o CA08) | Aberto |
| BUG-02 | Layout quebra em larguras pequenas: o menu some no celular e com a janela do navegador estreitada | Baixa | — (fora do card) | Aberto |
| BUG-03 | API aceita mais de 5 unidades por produto (CA10) | Alta | CA10 | Aberto |
| BUG-04 | Tela e API aceitam nome só com símbolos como nome e sobrenome | Baixa | Regra da loja "nome e sobrenome" (DOC-08) | Aberto |

---

### BUG-01 — API cobra frete com subtotal de exatamente R$ 200,00
- **Severidade:** Alta. Regra principal da entrega; o cliente paga R$ 19,90 que não deveria pagar.
- **Regra:** CA06 ("O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive") e tabela de cálculo ("R$ 0,00 quando o subtotal é igual ou maior que R$ 200,00"). Afeta também o CA08: com cupom, o frete continua sendo cobrado (CT-25).
- **Camada:** API (`POST /api/carrinho/calcular` e `POST /api/pedidos`), refletido na UI
- **Cenários:** CT-20 (UI, CA06), CT-23 (API, CA06), CT-25 (API, CA08, com cupom) e CT-27 (API, `/api/pedidos`), em `features/frete.feature`
- **Ambiente:** https://verzel-store.qa-test-verzel-store.workers.dev · Google Chrome 154.0.8037.98 (exploração, 06/10/2026) · Chromium 153.0.8010.12, Firefox 155.0 e WebKit 26.6 via Playwright 1.63 (automação, 07/10/2026)
- **Navegadores:** o defeito ocorre nos três navegadores automatizados (CT-20 falhou em Chromium, Firefox e WebKit). Como o valor errado vem da API, não depende do navegador.

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

**O defeito também chega ao pedido (`POST /api/pedidos`)**
- Na execução automatizada de 07/10/2026 (CT-27), o pedido com P005 ×2 foi confirmado (201) com frete **19,9** e total **219,9**. A requisição e a resposta estão em `docs/05-evidencias/automacao/CT-27_api.json`.
- Ou seja, além de exibir o valor errado no carrinho, a loja confirma o pedido cobrando o frete.

**Evidências**
- `docs/05-evidencias/exploracao/EXP-4-01_frete-200-payload.png` (tela + request no Network)
- `docs/05-evidencias/exploracao/EXP-4-01_frete-200-response.png` (tela + response no Network)
- `docs/05-evidencias/exploracao/EXP-4-04_frete-200-com-cupom.png`
- `docs/05-evidencias/automacao/CT-23_api.json` (`/carrinho/calcular`, R$ 200,00)
- `docs/05-evidencias/automacao/CT-25_api.json` (`/carrinho/calcular`, R$ 200,00 com BEMVINDO10)
- `docs/05-evidencias/automacao/CT-27_api.json` (`/api/pedidos`, R$ 200,00). O número do pedido nesse arquivo é o da última execução e muda a cada vez, porque é fictício; os valores são os mesmos.
- `docs/05-evidencias/automacao/CT-20_chromium_falhou.png`, `CT-20_firefox_falhou.png` e `CT-20_webkit_falhou.png` (carrinho com P005 ×2: frete R$ 19,90, total R$ 219,90 e "Faltam R$ 0,00 para o frete grátis.", nos três navegadores)

**Observações**
- Acima do limite a regra funciona: P001 + P004 + P005 (R$ 209,80) → frete "Grátis"; com BEMVINDO10 → desconto R$ 20,98, frete grátis, total R$ 188,82 (CA08 atendido).
- Abaixo do limite também: R$ 199,90 e R$ 199,80 cobram R$ 19,90 e informam R$ 0,10 e R$ 0,20 faltantes.
- O defeito está só no valor-limite: indica comparação `subtotal > 200` em vez de `subtotal >= 200`.

---

### BUG-02 — Layout quebra em larguras pequenas
- **Severidade:** Baixa. Fora do escopo do card VZS-142; registrado como achado da exploração.
- **Camada:** UI (responsividade)
- **Ambiente:** Google Chrome 154.0.8037.98 · DevTools, emulação Pixel 9 e dobráveis (06/10/2026) · janela do navegador estreitada, com o DevTools aberto ao lado (07/10/2026)

**Passos para reproduzir**
1. Abrir a loja e ativar o modo dispositivo do DevTools (Pixel 9). Observar o cabeçalho.
2. Ou, sem o modo dispositivo: abrir o DevTools ao lado da página (ou estreitar a janela do navegador) até a área da loja ficar estreita. Observar o cabeçalho.

**Resultado esperado**
- Acesso a Produtos, Documentação e Carrinho, seja visível ou num menu recolhido.

**Resultado obtido**
- Só ficam visíveis a marca (link para a página inicial) e o Carrinho. Os links "Produtos" e "Documentação" continuam no HTML, mas não aparecem, e não há menu alternativo. Em largura de iPad Mini o cabeçalho volta ao normal.
- O problema não é só de celular: depende da largura da área visível. Com a janela do navegador estreitada (por exemplo, com o DevTools aberto ao lado), o cabeçalho quebra do mesmo jeito.

**Evidências**
- `docs/05-evidencias/exploracao/EXP-8-01_cabecalho-pixel9.png`
- `docs/05-evidencias/exploracao/EXP-8-02_cabecalho-ipad-mini.png`
- `docs/05-evidencias/exploracao/EXP-9-02_layout-largura-pequena.png` (janela do navegador estreitada)

---

### BUG-03 — API aceita mais de 5 unidades por produto (CA10)
- **Severidade:** Alta. A API confirma pedidos acima do limite: `POST /api/pedidos` com 6 unidades respondeu 201 e gerou o pedido.
- **Regra:** CA10 ("Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API.") e tabela de erros (`QUANTIDADE_MAXIMA_EXCEDIDA`, 422: "A quantidade de um produto é maior que 5.").
- **Camada:** API (`POST /api/carrinho/calcular` e `POST /api/pedidos`)
- **Cenários:** CT-52 · 6 (`/carrinho/calcular`) e CT-53 (`/api/pedidos`), em `features/quantidade.feature`, com `@bug-03`
- **Ambiente:** https://verzel-store.qa-test-verzel-store.workers.dev · Chromium 153.0.8010.12 via Playwright 1.63 e chamada manual · 07/10/2026

**Passos para reproduzir**
1. Enviar `POST /api/carrinho/calcular` com `{"itens":[{"produtoId":"P001","quantidade":6}]}`.
2. Enviar `POST /api/pedidos` com `{"itens":[{"produtoId":"P001","quantidade":6}],"cliente":{"nome":"Maria Silva","email":"maria@exemplo.com","cep":"01310-100"}}`.

**Resultado esperado**
- As duas chamadas: **422** com `"codigo": "QUANTIDADE_MAXIMA_EXCEDIDA"` e `"campo": "itens[0].quantidade"` (DOC-17).

**Resultado obtido**
- `/carrinho/calcular`: **200**, com o carrinho calculado normalmente:
  ```json
  { "itens": [{ "produtoId": "P001", "quantidade": 6, "total": 359.4 }],
    "subtotal": 359.4, "frete": 0, "freteGratis": true, "total": 359.4, "cupom": null }
  ```
- `/api/pedidos`: **201**, pedido **VZ-168925** confirmado com 6 unidades (subtotal 359,4, frete 0, total 359,4).

**Observações**
- A tela bloqueia em 5: no carrinho, o botão + fica desabilitado e aparece "Limite de 5 unidades por produto."; na vitrine, o botão "Adicionar ao carrinho" trava e aparece "Limite de 5 unidades atingido." (exploração, seções 1 e 2). O defeito está só na API, que não aplica a regra que a documentação diz valer "para a interface e para a API".
- Quantidades inválidas (0, -1, 1.5 e "2" como texto) são recusadas corretamente com `QUANTIDADE_INVALIDA` (CT-52).

**Evidências**
- `docs/05-evidencias/automacao/CT-52-ex2_api.json` (`/carrinho/calcular`, execução automatizada)
- `docs/05-evidencias/automacao/CT-53_api.json` (`/api/pedidos`, execução automatizada: 201 em vez de 422; o número do pedido muda a cada execução)
- `docs/05-evidencias/exploracao/BUG-03_pedidos-quantidade-6.json` (`/api/pedidos`, chamada manual que confirmou o bug no pedido; o bug foi encontrado pela automação, no CT-52 · 6)

---

### BUG-04 — Tela e API aceitam nome só com símbolos como nome e sobrenome
- **Severidade:** Baixa. Não afeta valores nem o cupom e o frete do card, mas deixa a loja confirmar um pedido com um nome que não identifica o cliente.
- **Regra:** regra da loja anterior ao card: "O nome do cliente precisa ter nome e sobrenome.". Interpretação: "nome e sobrenome" pressupõe letras (DOC-08: nome válido tem pelo menos duas palavras com letras, aceitando acento e hífen).
- **Camada:** UI (checkout) e API (`POST /api/pedidos`). A tela só repassa o nome: a validação que falta é a da API.
- **Cenários:** encontrado na exploração complementar (item 9-01 do `00-exploracao.md`) e confirmado na API por uma chamada manual. Na API, coberto pelo CT-64 (`features/checkout.feature`, `@bug-04`), ainda não executado.
- **Ambiente:** https://verzel-store.qa-test-verzel-store.workers.dev · Google Chrome 154.0.8037.98 · 07/10/2026

**Passos para reproduzir**
1. Na vitrine, adicionar 1 Mochila Urbana 20L, abrir o carrinho e clicar em "Finalizar compra".
2. Preencher o nome com `@@ @@`, o e-mail com `maria@exemplo.com` e o CEP com `01310-100`.
3. Clicar em "Confirmar pedido".
4. Na API: enviar `POST /api/pedidos` com `{"itens":[{"produtoId":"P005","quantidade":1}],"cliente":{"nome":"@@ @@","email":"maria@exemplo.com","cep":"01310-100"}}`.

**Resultado esperado**
- Tela: mensagem "Informe nome e sobrenome." no campo nome, e o pedido não é confirmado (como acontece com `Maria`, caso 5-01 da exploração).
- API: **422** com `"codigo": "DADOS_INVALIDOS"` e o nome em `erro.campos` (como no CT-63).

**Resultado obtido**
- Tela: a loja aceita cada grupo de símbolos como nome e sobrenome, e o pedido é confirmado.
- API: **201**, pedido **VZ-531910** criado com `"nome": "@@ @@"` (subtotal 100, frete 19,9, total 119,9).

**Evidências**
- `docs/05-evidencias/exploracao/EXP-9-01_nome-simbolos.png` (tela)
- `docs/05-evidencias/exploracao/BUG-04_pedidos-nome-simbolos.json` (API, chamada manual de 07/10/2026)

---

## Observações (não são bugs)
- **Campo de cupom vazio:** a loja mostra "Informe um cupom.". A mensagem não está na documentação; comportamento aceitável.
- **Validações do checkout (OBS-02):** aparecem só ao clicar em "Confirmar pedido", não ao sair do campo. E não somem ao corrigir o campo: só desaparecem no próximo clique em "Confirmar pedido" (conferido em 07/10; sugestão MEL-03).
- **Esvaziar carrinho (MEL-09):** apaga todos os itens direto, sem pedir confirmação (conferido em 07/10). Fica como sugestão de melhoria, não como bug.
- **Cupom inválido ou expirado no checkout:** a interface não leva o cupom para o checkout, então o erro 422 de `/api/pedidos` só é testável pela API.
- **Carrinho e cupom após F5:** são mantidos (ficam na aba, como diz a documentação).