# Exploração manual — Verzel Store

Antes de escrever os cenários, naveguei pela loja como um cliente para entender como ela funciona, anotar os elementos que vou usar na automação e ver se algo já quebrava de cara.

- **Data:** 06/10/2026
- **Navegador:** Google Chrome (Versão 154.0.8037.98 Windows), com o DevTools aberto na aba Network
- **Versão testada:** card VZS-142, v2.3.0

Os prints estão em `docs/05-evidencias/exploracao/` e os bugs, detalhados em [04-bugs.md](04-bugs.md). No fim do arquivo está a análise da documentação, com as inconsistências que encontrei e a interpretação que adotei em cada uma.

**O que encontrei, em resumo:** quase tudo se comportou como a documentação descreve. O problema principal está no frete: com subtotal de exatamente R$ 200,00, a loja ainda cobra R$ 19,90 (BUG-01). Também anotei um problema de layout no celular (BUG-02), que fica fora do escopo do card, e algumas observações. Depois, em 07/10, a automação da API encontrou o BUG-03: a API aceita mais de 5 unidades por produto, embora a tela trave em 5.

---

## 1. Vitrine

- A vitrine fica em `/` e a aba se chama "Produtos | Verzel Store".
- Os 8 produtos aparecem com nomes e preços iguais aos da documentação.
- Não dá para escolher a quantidade na vitrine. Cada clique em "Adicionar ao carrinho" soma 1 unidade, e o card avisa quantas já estão no carrinho ("3 no carrinho").
- Ao chegar a 5 unidades pela vitrine, o botão "Adicionar ao carrinho" daquele produto fica desabilitado e o card mostra "Limite de 5 unidades atingido.". Então o limite do CA10 também vale aqui, não só no carrinho.
- O contador do cabeçalho soma as unidades, não os produtos: com 3 camisetas, ele mostra 3.
- Não há `data-testid` na página. Para identificar cada produto, o card tem `id="nome-P00X"` no título e `id="aviso-P00X"` no aviso.

## 2. Carrinho

- Fica em `/carrinho`. Com o carrinho vazio, aparece "Seu carrinho está vazio" e um botão "Ver produtos".
- O resumo mostra Subtotal, Desconto, Frete e Total, e abaixo o aviso "Faltam R$ X para o frete grátis.".
- Formatos na tela: `R$ 59,90`; o desconto aparece como `- R$ 20,00`; e quando o frete é grátis o valor vira a palavra `Grátis`.
- A quantidade muda pelos botões − e +. Para tirar um item, uso "Remover". Também existe "Esvaziar carrinho".
- Cada mudança no carrinho dispara `POST /api/carrinho/calcular`. Comparei a resposta da API com a tela em alguns casos e os valores bateram.
- O carrinho continua lá depois de recarregar a página (F5), como a documentação diz.

**Limite de 5 unidades (CA10):** cheguei a 5 unidades sem problema, tanto pela vitrine quanto pelo carrinho. Nesse ponto aparece "Limite de 5 unidades por produto." e o botão + fica desabilitado. O botão − também trava em 1. Na vitrine acontece o mesmo: o botão do produto trava e aparece "Limite de 5 unidades atingido.". Reparei que as duas mensagens são um pouco diferentes ("Limite de 5 unidades por produto." no carrinho e "Limite de 5 unidades atingido." na vitrine), mas as duas são claras. Não há campo para digitar a quantidade, então não consegui testar valores como 0, -1 ou 6 pela tela. Esses ficaram para a API, no CT-52, que encontrou o BUG-03: a API aceita 6 unidades.

## 3. Cupom (CA01 a CA05)

O campo fica no carrinho, com o botão "Aplicar cupom". Usei P002 ×1 + P004 ×2 (subtotal R$ 239,70).

| # | O que fiz | Esperado | O que aconteceu | Resultado |
|---|---|---|---|---|
| 3-01 | `BEMVINDO10` | desconto 23,97, frete grátis, total 215,73 | total 215,73 | OK |
| 3-02 | `bemvindo10` | igual ao 3-01 | total 215,73 | OK |
| 3-03 | `  BEMVINDO10  ` | igual ao 3-01 | total 215,73 | OK |
| 3-04 | `BemVindo10` | igual ao 3-01 | total 215,73 | OK |
| 3-05 | `XYZ123` | "Cupom inválido." | "Cupom inválido." | OK |
| 3-06 | `VERAO2026` | "Cupom expirado." | "Cupom expirado." | OK |
| 3-07 | `BEM VINDO10` | considerei inválido | "Cupom inválido." | OK |
| 3-08 | campo vazio | não está na documentação | "Informe um cupom." | Observação |
| 3-09 | tentar outro cupom com um já aplicado | só um por vez | o campo some e aparece "Cupom BEMVINDO10 aplicado." com "Remover cupom" | OK |
| 3-10 | remover o cupom | volta para 239,70 | voltou | OK |
| 3-11 | `XYZ123` e depois `BEMVINDO10` | erro some e o desconto entra | funcionou | OK |

O cupom continua aplicado depois do F5. Também removi a calça com o cupom aplicado e o desconto foi recalculado: subtotal 99,80, desconto 9,98, frete 19,90, total 109,72 e "Faltam R$ 100,20 para o frete grátis.".

## 4. Frete grátis (CA06 a CA09)

| # | Carrinho | Cupom | Esperado | O que aconteceu | Resultado |
|---|---|---|---|---|---|
| 4-01 | P005 ×2 (R$ 200,00) | — | frete grátis, total 200,00 | frete 19,90, total 219,90 e "Faltam R$ 0,00 para o frete grátis." | **Falhou — BUG-01** |
| 4-02 | P005 + P008 + P004 (R$ 199,90) | — | frete 19,90, faltam 0,10 | igual | OK |
| 4-03 | P001 + P002 (R$ 199,80) | — | frete 19,90, faltam 0,20 | igual | OK |
| 4-04 | P005 ×2 (R$ 200,00) | BEMVINDO10 | desconto 20,00, frete grátis, total 180,00 | frete 19,90, total 199,90 e "Faltam R$ 0,00" | **Falhou — BUG-01** |
| 4-05 | P005 ×1 | BEMVINDO10 | desconto 10,00 só nos produtos, total 109,90 | igual | OK |
| 4-06 | P007 ×1 (R$ 229,90) | — | frete grátis | igual | OK |
| 4-07 | P006 ×1 (R$ 29,90) | — | frete 19,90, faltam 170,10 | igual | OK |
| 4-08 | P001 + P004 + P005 (R$ 209,80) | — | frete grátis | frete "Grátis" e o aviso de valor faltante some | OK |
| 4-09 | P001 + P004 + P005 (R$ 209,80) | BEMVINDO10 | desconto 20,98, frete grátis, total 188,82 | igual | OK |

O frete grátis funciona acima de R$ 200,00, e o caso 4-09 confirma o CA08: mesmo com o total caindo para R$ 188,82 depois do desconto, o frete continua grátis. O erro aparece só no valor exato de R$ 200,00. Abri a resposta da API no Network e ela já vem com `"frete": 19.9` e `"freteGratis": false`, então o problema está no cálculo da API, não na tela. Parece uma comparação "maior que" onde deveria ser "maior ou igual".

Prints: `EXP-4-01_frete-200-payload.png`, `EXP-4-01_frete-200-response.png` e `EXP-4-04_frete-200-com-cupom.png`.

## 5. Checkout

- Chego pelo link "Finalizar compra" do carrinho. A rota é `/checkout`, com o título "Finalizar compra" e um link para voltar ao carrinho.
- Campos: Nome completo, E-mail e CEP (com a dica "Somente números ou no formato 00000-000."). Logo abaixo: "O pagamento é feito na entrega."
- O resumo repete os valores do carrinho e lista os itens (ex.: "5x Kit 3 Pares de Meias — R$ 149,50").
- Não consegui chegar ao checkout com o carrinho vazio, porque o botão de finalizar não aparece.
- As mensagens de erro só aparecem depois de clicar em "Confirmar pedido", e não ao sair de cada campo.

| # | Campo | Digitei | Esperado | Mensagem | Resultado |
|---|---|---|---|---|---|
| 5-01 | Nome | `Maria` | erro | "Informe nome e sobrenome." | OK |
| 5-02 | Nome | `Maria Silva` | aceito | aceito | OK |
| 5-03 | Nome | vazio | erro | "Informe o nome completo." | OK |
| 5-04 | Nome | só espaços | erro | "Informe o nome completo." | OK |
| 5-05 | E-mail | `maria@` | erro | "Informe um e-mail válido." | OK |
| 5-06 | E-mail | `maria.exemplo.com` | erro | "Informe um e-mail válido." | OK |
| 5-07 | E-mail | `maria@exemplo.com` | aceito | aceito | OK |
| 5-08 | CEP | `01310-100` | aceito | aceito | OK |
| 5-09 | CEP | `01310100` | aceito | aceito | OK |
| 5-10 | CEP | `0131010` | erro | "Informe um CEP com 8 dígitos." | OK |
| 5-11 | CEP | `013101000` | erro | "Informe um CEP com 8 dígitos." | OK |
| 5-12 | CEP | `ABCDE-FGH` | erro | "Informe um CEP com 8 dígitos." | OK |

## 6. Confirmação

Finalizei uma compra com P005 ×1, `BEMVINDO10` e os dados da Maria Silva.

- A loja foi para `/pedido-confirmado` e mostrou "Pedido confirmado", o número **VZ-856317** e "Obrigado, Maria. Seu pedido foi registrado e o pagamento será feito na entrega.".
- Os valores bateram: subtotal 100,00, desconto 10,00, frete 19,90, total 109,90.
- No Network, `POST /api/pedidos` respondeu 201. O CEP voltou sem o hífen (`01310100`).
- O carrinho foi esvaziado depois do pedido, e voltar no navegador leva ao carrinho vazio.
- Cliquei duas vezes rápido em "Confirmar pedido" e só um pedido foi gerado.

## 7. Cupom inválido até o fim

Apliquei `VERAO2026` no carrinho. A API respondeu 200 com `"aplicado": false` e "Cupom expirado.", e o total ficou R$ 119,90, sem desconto. Ao seguir para o checkout, o cupom não foi junto, então pela interface não dá para chegar ao erro 422 que a documentação descreve para `/api/pedidos`. Testei esse caso direto na API (CT-05 e CT-06).

## 8. Geral

- Os links do cabeçalho funcionam em todas as telas.
- Não apareceu nenhum erro no Console.
- Não vi erro de digitação nem valores com casas decimais estranhas.
- **No celular:** simulando o Pixel 9 e modelos dobráveis no DevTools, o cabeçalho fica só com a marca e o Carrinho. Os links Produtos e Documentação somem e não há menu para acessá-los. Na largura do iPad Mini o cabeçalho volta ao normal. Registrei como BUG-02, de severidade baixa, porque não faz parte da entrega de cupom e frete.

---

## Achados

| ID | Tipo | O que é |
|---|---|---|
| BUG-01 | Bug (alta) | A API cobra frete com subtotal de exatamente R$ 200,00 (CA06) |
| BUG-02 | Bug (baixa, fora do card) | O menu some em telas de celular |
| BUG-03 | Bug (alta) | A API aceita mais de 5 unidades por produto (CA10). Encontrado em 07/10 pela automação da API |
| OBS-01 | Observação | Cupom vazio mostra "Informe um cupom.", mensagem que não está na documentação |
| OBS-02 | Observação | As validações do checkout só aparecem ao confirmar o pedido |
| OBS-03 | Observação | O cupom inválido não chega ao checkout; o erro 422 de `/api/pedidos` só dá para testar pela API |
| OBS-04 | Testabilidade | A página não tem `data-testid`; na automação usei `aria-label`, `id` e `data-valor` |

## Observações em detalhe

Nenhuma destas contradiz a documentação, por isso não registrei como bug. Mesmo assim, achei que valia anotar: algumas mostram lacunas na especificação e outras mudam a forma como vou testar.

### OBS-01 — Cupom vazio mostra "Informe um cupom."

**O que vi:** clicando em "Aplicar cupom" com o campo vazio, a loja não chama a API. Mostra direto "Informe um cupom." e marca o campo como inválido.

**Por que anotei:** a documentação só fala de cupom inexistente ("Cupom inválido.") e expirado ("Cupom expirado."). O caso do campo vazio não aparece em lugar nenhum. O comportamento me pareceu correto, mas a regra foi decidida pelo desenvolvimento, não pela especificação.

**O que fica em aberto:**
- Um cupom só com espaços (`"   "`) deveria cair aqui ou em "Cupom inválido."? Pela regra do CA02, os espaços são ignorados, então o resultado seria um cupom vazio.
- Pela API, como `/carrinho/calcular` responde a `"cupom": ""`? O campo é opcional, então o esperado seria tratar como se não houvesse cupom.

**Como fica:** como observação, fora dos cenários críticos. O campo vazio é uma validação da própria tela, que não envolve desconto nem frete; se ela falhar, a entrega de cupom e frete não tem um problema real. Não há cenário automatizado para o campo vazio, o cupom só com espaços nem o `"cupom": ""` na API.

### OBS-02 — Validações do checkout só aparecem ao confirmar

**O que vi:** posso preencher nome, e-mail e CEP errados e sair dos campos sem nenhum aviso. Os erros só aparecem quando clico em "Confirmar pedido", todos de uma vez.

**Por que anotei:** a documentação não diz quando a validação deve acontecer, então não é bug. Mas, para quem compra, descobrir três erros só no fim é pior do que ser avisado campo a campo. Fica como sugestão de melhoria.

**O que mais reparei:** a dica do CEP ("Somente números ou no formato 00000-000.") aparece desde o início, o que ajuda a evitar o erro. Em 07/10 (Chrome 154) conferi o que acontece ao corrigir um campo: a mensagem de erro **não some** sozinha. Ela só desaparece quando clico de novo em "Confirmar pedido". Ou seja, o cliente corrige o dado e continua vendo o aviso de erro até tentar confirmar outra vez.

**Como cobri:** no CT-61, os testes preenchem os campos e só verificam as mensagens depois de clicar em "Confirmar pedido". Se o teste esperasse a mensagem antes do clique, falharia mesmo com a loja funcionando como foi feita.

### OBS-03 — O cupom inválido não chega ao checkout

**O que vi:** apliquei `VERAO2026` no carrinho, recebi "Cupom expirado." e segui para o checkout. Lá o pedido aparece sem cupom e é confirmado normalmente.

**Por que anotei:** a documentação diz que `/api/pedidos` deve responder 422 (`CUPOM_EXPIRADO` ou `CUPOM_INVALIDO`) quando recebe um cupom inválido. Pela tela, não existe caminho para isso acontecer, porque a interface só leva adiante o cupom que foi aceito. Isso é bom para o cliente, mas significa que essa regra da API não é exercitada pela UI.

**O que fica em aberto:**
- Se o cupom fosse válido no carrinho e expirasse antes da confirmação, a tela trataria o 422? Não dá para reproduzir com os dados fixos do ambiente.

**Conferido em 07/10 (Chrome 154):** numa compra feita para esta conferência (3 Mochilas Urbanas 20L, não a compra da seção 6), com um cupom válido aplicado, o `POST /api/pedidos` enviado pela tela leva o cupom:
```json
{ "cliente": { ... }, "cupom": "BEMVINDO10", "itens": [ { "produtoId": "P005", "quantidade": 3 } ] }
```
O desconto chega ao pedido pela interface, e não só ao carrinho.

**Como cobri:** só pela API, com `VERAO2026` e um cupom inexistente: `/api/pedidos` deve responder 422 com o código certo (CT-06) e `/carrinho/calcular`, 200 sem desconto (CT-05), em `features/cupom.feature`. Assim a diferença de comportamento entre os dois endpoints fica testada. O comportamento da tela (o cupom recusado não vai para o checkout) fica como observação, fora dos cenários críticos.

### OBS-04 — Sem `data-testid`

**O que vi:** nenhum elemento da loja tem `data-testid`. Por outro lado, quase tudo tem um gancho estável:
- os botões têm `aria-label` descritivos, como "Aumentar quantidade de Camiseta Essencial" e "Remover Camiseta Essencial do carrinho";
- os valores do resumo têm `data-valor="subtotal"`, `"desconto"`, `"frete"` e `"total"`;
- os campos têm `id` (`campo-cupom`, `campo-nome`, `campo-email`, `campo-cep`), e as mensagens de erro também (`campo-cep-erro`).

**O ponto fraco:** o botão "Adicionar ao carrinho" é igual em todos os cards, sem `id` nem `aria-label` próprio. Para clicar no produto certo, preciso primeiro achar o card pelo título (`#nome-P002`) e depois procurar o botão dentro dele. Funciona, mas quebra se a estrutura do card mudar. Um `aria-label="Adicionar Calça Jeans Slim ao carrinho"` resolveria e ainda ajudaria leitores de tela.

**Outro detalhe:** os `aria-label` usam o nome do produto, não o id. Se um nome mudar, os seletores mudam junto. Na automação, centralizei a conversão id → nome num único arquivo, para não espalhar nomes pelo código.

### Sugestões de melhoria

Nada aqui é bug, nem faz parte do card VZS-142. São ideias que surgiram enquanto eu usava a loja como cliente. Deixo registradas para o time avaliar.

| ID | Onde | Sugestão | Por quê |
|---|---|---|---|
| MEL-01 | Checkout, campo CEP | Link "Não sei meu CEP" abrindo a busca dos Correios (buscacepinter.correios.com.br) em outra aba | Quem não lembra o CEP precisa sair da loja para procurar e pode desistir da compra. Um atalho resolve sem nenhuma integração nova. |
| MEL-02 | Checkout, endereço | Mostrar rua, bairro e cidade a partir do CEP digitado | Hoje o checkout pede só o CEP, sem endereço. Mostrar o endereço encontrado ajuda o cliente a perceber um CEP digitado errado antes de confirmar. |
| MEL-03 | Checkout, validações | Validar cada campo ao sair dele, e não só em "Confirmar pedido" (ver OBS-02) | O cliente descobre o erro na hora, campo a campo, em vez de receber três mensagens de uma vez no fim. Hoje, além disso, a mensagem continua na tela mesmo depois de o campo ser corrigido e só some no próximo clique em "Confirmar pedido" (conferido em 07/10, OBS-02). |
| MEL-04 | Vitrine | `aria-label` próprio no botão de cada produto, como "Adicionar Calça Jeans Slim ao carrinho" (ver OBS-04) | Leitores de tela hoje ouvem oito botões iguais. Também deixaria a automação mais simples e estável. |
| MEL-05 | Cabeçalho no celular | Menu recolhível (ícone ☰) com Produtos e Documentação (ver BUG-02) | Mantém o acesso às páginas sem ocupar espaço em telas pequenas. |
| MEL-06 | Carrinho, frete | Mensagem positiva ao atingir o frete grátis, como "Você ganhou frete grátis!" | Hoje o aviso "Faltam R$ X" só desaparece. O cliente pode nem perceber que ganhou o benefício. |
| MEL-07 | Carrinho, resumo | Linha "Você economizou R$ X" somando o desconto do cupom e o frete grátis | Junta os dois benefícios da entrega num número só, que é o objetivo da história: pagar menos. |
| MEL-08 | Carrinho, cupom | Mostrar a mensagem que a API já devolve ("Cupom aplicado: 10% de desconto nos produtos.") em vez de só "Cupom BEMVINDO10 aplicado." | Deixa claro que o desconto vale só para os produtos (CA09) e evita a dúvida "por que o frete continua sendo cobrado?". Ver DOC-02. |
| MEL-09 | Carrinho, "Esvaziar carrinho" | Pedir confirmação antes de esvaziar o carrinho | Hoje o botão apaga todos os itens direto, sem confirmação (conferido em 07/10). Um clique acidental faz o cliente perder tudo o que montou. |

### Conferências finais
Conferido à mão em 07/10/2026, no Google Chrome 154:
- [x] **OBS-02:** a mensagem de erro não some ao corrigir o campo; só desaparece ao clicar de novo em "Confirmar pedido". Registrado na OBS-02 e na MEL-03.
- [x] **OBS-03:** o `POST /api/pedidos` enviado pela tela leva o cupom (`"cupom": "BEMVINDO10"`); o desconto chega ao pedido pela interface. Registrado na OBS-03.
- [x] **"Esvaziar carrinho":** apaga todos os itens direto, sem pedir confirmação. Virou a sugestão MEL-09.

---

## Análise da documentação

Além de explorar a loja, li a documentação inteira procurando trechos que se contradizem, regras que faltam e pontos que podem ser lidos de mais de um jeito. O teste técnico pede que, nesses casos, eu registre a minha interpretação e siga em frente. É o que está abaixo.

Separei em quatro grupos:
- **Inconsistências:** a documentação diz coisas diferentes em lugares diferentes.
- **Lacunas:** a regra não existe, e o comportamento fica a critério de quem implementa.
- **Pontos difíceis de testar:** a regra existe, mas os dados do ambiente não permitem exercitá-la por completo.
- **Lacunas encontradas durante a automação:** lacunas que só apareceram depois da exploração, ao escrever e automatizar os cenários (DOC-15 a DOC-17).

Cada item termina com a interpretação que adotei e o cenário que a testa, ou o motivo de ficar sem teste.

---

### Inconsistências

#### DOC-01 — Erro de dados do cliente: `campo` ou `campos`?
- **Formato geral de erro:** `{ "erro": { "codigo", "mensagem", "campo" } }`, com `campo` no singular e como texto (ex.: `"itens[0].quantidade"`).
- **Linha do `DADOS_INVALIDOS`:** "Os detalhes vêm em **"campos"**", no plural.
- **Problema:** não fica claro se esse erro tem um formato diferente (uma lista em `campos`), se usa o mesmo `campo` de sempre, ou se traz os dois. Quem consome a API não sabe onde ler os detalhes.
- **Interpretação:** o `DADOS_INVALIDOS` traz uma lista em `erro.campos` com os campos inválidos, e os demais erros usam `erro.campo`.
- **Teste:** CT-63 (`features/checkout.feature`) envia nome, e-mail e CEP inválidos, cobra o status 422 e o código `DADOS_INVALIDOS` e anexa a resposta ao relatório. Depois que a execução confirmou o formato, o CT-63 passou a cobrá-lo: exige `erro.campos.0.campo = cliente.nome`. Os outros itens da lista (e-mail e CEP) não são conferidos.
- **Execução (07/10/2026, CT-63):** confirmou a inconsistência da documentação. O `DADOS_INVALIDOS` **não** traz `erro.campo`; traz `erro.campos`, uma lista de objetos `{ campo, mensagem }`, um por dado inválido:
  ```json
  { "erro": { "codigo": "DADOS_INVALIDOS", "mensagem": "Existem campos inválidos no pedido.",
      "campos": [ { "campo": "cliente.nome",  "mensagem": "Informe nome e sobrenome." },
                  { "campo": "cliente.email", "mensagem": "Informe um e-mail válido." },
                  { "campo": "cliente.cep",   "mensagem": "Informe um CEP com 8 dígitos." } ] } }
  ```
  O formato geral de erro da documentação (`campo` como texto) não vale para esse código, e a lista de objetos não aparece em nenhum exemplo. As mensagens são as mesmas que a tela mostra no checkout.

#### DOC-02 — "A interface apenas exibe o resultado", mas as mensagens são outras
- **Documentação:** "Os cálculos são feitos pela API e a interface apenas exibe o resultado."
- **Exploração:** com o cupom aceito, a API devolve `"mensagem": "Cupom aplicado: 10% de desconto nos produtos."`, mas a tela mostra "Cupom BEMVINDO10 aplicado.". A tela também mostra "Informe um cupom." para o campo vazio, sem chamar a API.
- **Problema:** a interface tem textos e validações próprias, que não estão documentados em lugar nenhum.
- **Interpretação:** os **valores** vêm da API e devem bater sempre. Os **textos** de sucesso e as validações locais são decisão da interface. Só cobro texto exato quando a documentação o define ("Cupom inválido.", "Cupom expirado.").

#### DOC-03 — O CEP é normalizado sem aviso
- **Exemplo de `POST /api/pedidos`:** a requisição envia `"cep": "01310-100"` e a resposta devolve `"cep": "01310100"`.
- **Problema:** nenhuma regra fala dessa normalização. Ela só aparece no exemplo.
- **Interpretação:** é esperado. O CEP é aceito com ou sem hífen e devolvido só com números.
- **Teste:** CT-62 (`features/checkout.feature`) envia as duas formas e verifica que a resposta vem nos dois casos como `01310100`.

#### DOC-04 — `PRODUTO_NAO_ENCONTRADO` com dois status
- **Tabela de erros:** o mesmo código aparece como **404** (consulta `GET /api/produtos/{id}`) e como **422** (item de carrinho ou pedido com produto inexistente).
- **Problema:** não está errado, mas quem trata erros pelo código precisa saber que o status muda conforme o endpoint.
- **Interpretação:** está correto como documentado.
- **Teste:** CT-80 (`features/api-erros.feature`), um exemplo para cada caso, validando código e status juntos.

#### DOC-05 — Exemplos incompletos
- No exemplo de `POST /api/pedidos`, aparecem `"itens": [ ... ]` e `"mensagem": "..."`.
- O campo `total` de cada item aparece no exemplo de `/carrinho/calcular`, mas não há regra dizendo como ele é calculado.
- **Interpretação:**
  - `itens[].total = precoUnitario × quantidade`, arredondado em 2 casas (CA11);
  - os itens e a mensagem do cupom em `/pedidos` seguem o mesmo formato de `/carrinho/calcular` ("o mesmo resumo de valores").
- **Teste:** CT-83 (`features/api-erros.feature`) verifica `itens[].total` = preço × quantidade. A comparação campo a campo entre `/pedidos` e `/carrinho/calcular` fica como observação, fora dos cenários críticos.

---

### Lacunas

#### DOC-06 — Cupom vazio ou só com espaços
- **Documentação:** só cobre cupom inexistente e expirado. O campo `cupom` é opcional na API.
- **Faltam:** o caso `"cupom": ""` e o caso `"cupom": "   "`, que, pelo CA02, vira vazio depois de tirar os espaços.
- **Interpretação:** na API, cupom vazio ou só com espaços conta como "sem cupom" (sem erro, sem desconto, `cupom` nulo ou não aplicado). Na tela, "Informe um cupom." (comportamento observado).
- **Teste:** nenhum. Fica como observação, fora dos cenários críticos (ver OBS-01). A interpretação acima vale se o caso for verificado manualmente.

#### DOC-07 — O CA02 vale também para a API?
- **CA02:** "O código do cupom não diferencia maiúsculas de minúsculas, e espaços no início e no fim são ignorados."
- **Problema:** não diz se a regra é da tela, da API ou das duas. Na exploração, a API recebeu `"verao2026"` e devolveu `"codigo": "VERAO2026"`, o que sugere que a API normaliza.
- **Interpretação:** vale para as duas, porque "os cálculos são feitos pela API".
- **Teste:** enviar `" bemVindo10 "` para `/carrinho/calcular` (CT-04, em `features/cupom.feature`).

#### DOC-08 — Regras de nome e e-mail pouco definidas
- **Documentação:** "nome e sobrenome" e "formato válido", sem detalhes.
- **Casos sem resposta:**
  - nome com espaço duplo (`Maria  Silva`);
  - sobrenome com uma letra (`Maria S`);
  - nomes com acento ou hífen (`José Ávila`, `Ana-Clara Souza`);
  - e-mail com `+` ou subdomínio (`maria+loja@exemplo.com.br`).
- **Interpretação:**
  - nome válido tem pelo menos duas palavras com letras, aceitando acento e hífen;
  - e-mail segue o formato comum `texto@dominio.ext`.
- **Teste:** nenhum. Fica como observação, fora dos cenários críticos: a regra não está definida, então um comportamento diferente não seria bug. O CT-61 cobre só os casos claramente inválidos (sem sobrenome, e-mail sem @).

#### DOC-09 — Mensagens de erro do checkout não documentadas
- **Na tela:** "Informe nome e sobrenome.", "Informe o nome completo.", "Informe um e-mail válido." e "Informe um CEP com 8 dígitos."
- **Na documentação:** nenhuma dessas mensagens, nem o texto que a API devolve em `DADOS_INVALIDOS`.
- **Interpretação:** os textos observados viram a referência dos testes, marcados como "comportamento observado". Se mudarem, o teste quebra, mas isso não é necessariamente um bug.
- **Teste:** CT-61 (`features/checkout.feature`), que usa essas mensagens como referência.

#### DOC-10 — Requisição sem `Content-Type: application/json`
- **Documentação:** "Envie e receba sempre JSON, com o cabeçalho `Content-Type: application/json`."
- **Falta:** dizer o que acontece se o cabeçalho não for enviado. Não há código de erro para isso na tabela.
- **Interpretação:** não testado: fica como observação, fora dos cenários críticos.
- **Teste:** nenhum. A documentação não define o comportamento, então não haveria esperado para cobrar.

#### DOC-11 — Métodos aceitos por rota
- **Documentação:** `405 METODO_NAO_PERMITIDO` para "rota existe, mas não aceita o método".
- **Falta:** a lista de métodos aceitos não é explícita. Deduzi pelos exemplos: `GET` nos produtos e `POST` no carrinho e nos pedidos.
- **Interpretação:** qualquer outro método numa rota existente deve responder 405 com `METODO_NAO_PERMITIDO`.
- **Teste:** CT-81 (`features/api-erros.feature`): `GET /api/carrinho/calcular`, `GET /api/pedidos` e `POST /api/produtos`, esperando 405.

---

### Pontos difíceis de testar

#### DOC-12 — O arredondamento (CA11) quase nunca é exercitado
- **CA11:** "Todos os valores são arredondados para 2 casas decimais." A documentação não diz o método (para cima, para baixo ou meio para cima).
- **Problema:** todos os preços terminam em ,90 ou ,00, e o único cupom válido é de 10%. Com isso, o desconto sempre fecha em no máximo 2 casas (ex.: 239,70 → 23,97). Não existe combinação de produtos que gere uma terceira casa para arredondar.
- **O que ainda dá para testar:** o risco real é de **ponto flutuante**. Em JavaScript, `239.7 * 0.1` dá `23.970000000000002`. Então verifico que a API devolve exatamente `23.97`, e não um número com sujeira nas casas decimais.
- **Interpretação:** o CA11 é coberto pela verificação de que todos os valores numéricos da resposta têm no máximo 2 casas decimais.
- **Teste:** CT-83 (`features/api-erros.feature`), que confere os valores exatos e que nenhum valor da resposta passa de 2 casas.

#### DOC-13 — Validade do cupom expirado
- **Documentação:** `VERAO2026` está "Expirado em 31/03/2026". Não há regra de início ou fim de validade, nem de fuso horário.
- **Problema:** como os cupons são fixos, não dá para testar o limite (último dia válido × primeiro dia expirado).
- **Interpretação:** só verifico o comportamento de um cupom já expirado. O limite de data fica registrado como não testável neste ambiente.
- **Teste:** cupom já expirado (`VERAO2026`) no CT-02, no CT-05 e no CT-06 (`features/cupom.feature`).

#### DOC-14 — Erro 422 de cupom em `/pedidos` não é alcançável pela tela
- Detalhado na OBS-03, acima: a interface não leva cupom inválido para o checkout.
- **Interpretação:** a regra vale para a API e é testada só nela; o comportamento da tela fica como observação (OBS-03).
- **Teste:** CT-06 (`features/cupom.feature`), com `XYZ123` e `VERAO2026`, esperando 422.

---

### Lacunas encontradas durante a automação

Estes três itens apareceram depois da exploração, ao escrever e automatizar os cenários. Por isso têm os números seguintes aos demais.

#### DOC-15 — O que o carrinho mostra quando o frete já é grátis
- **Documentação:** o CA07 diz que, abaixo de R$ 200,00, "o carrinho informa quanto falta para o frete grátis". A tabela de cálculo diz que o faltante é "R$ 200,00 menos o subtotal, nunca menor que zero". Nenhuma das duas diz o que a tela mostra quando o frete já é grátis.
- **Exploração:** com subtotal de R$ 209,80 (caso 4-08), o frete aparece como "Grátis" e o aviso some. Com R$ 200,00 (BUG-01), a tela mostra "Faltam R$ 0,00 para o frete grátis." junto do frete cobrado.
- **Interpretação:** com frete grátis, o valor do frete aparece como "Grátis" e o aviso "Faltam R$ X" não é exibido. "Faltam R$ 0,00" não é o comportamento esperado. Na API, o mesmo caso devolve `valorFaltanteFreteGratis: 0`.
- **Teste:** CT-20 e CT-22 verificam na tela que o aviso não aparece; CT-23 verifica o faltante zero na API com subtotal de exatamente R$ 200,00 (e o CT-24, acima do limite).
- **Texto do aviso:** a documentação só diz que "o carrinho informa quanto falta", sem definir o texto. Como na DOC-09, o texto observado na exploração ("Faltam R$ X para o frete grátis.") é usado como referência no CT-21. Se o texto mudar, o teste quebra, mas isso não é necessariamente um bug.

#### DOC-16 — Quantidade enviada como texto
- **Documentação:** `QUANTIDADE_INVALIDA` quando "a quantidade não é um número inteiro maior ou igual a 1". Não diz o que acontece com um número enviado como texto (`"quantidade": "2"`).
- **Problema:** a API pode recusar o texto ou convertê-lo para número e aceitar o pedido. As duas leituras são possíveis.
- **Interpretação:** `"2"` como texto é recusado com `QUANTIDADE_INVALIDA`, sem conversão. A regra fala em "número inteiro", e em todos os exemplos da documentação a quantidade é um número JSON.
- **Teste:** CT-52 · `"2"` (`features/quantidade.feature`).
- **Execução (07/10/2026):** **confirmada**. A API recusou `"2"` com 422 `QUANTIDADE_INVALIDA` no campo `itens[0].quantidade`.

#### DOC-17 — Campo do erro de quantidade acima do limite
- **Documentação:** o único exemplo de erro com `campo` é o de `QUANTIDADE_INVALIDA`, com `"campo": "itens[0].quantidade"`. Para `QUANTIDADE_MAXIMA_EXCEDIDA`, a tabela só traz o código e a descrição ("a quantidade de um produto é maior que 5").
- **Problema:** não fica definido qual `campo` acompanha o erro de quantidade acima do limite.
- **Interpretação:** segue o mesmo formato do exemplo, `"campo": "itens[0].quantidade"`, porque o erro é sobre o mesmo dado.
- **Teste:** CT-52 · 6 e CT-53 (`features/quantidade.feature`).
- **Execução (07/10/2026):** ainda não dá para conferir. Por causa do BUG-03, a API aceita as 6 unidades (200 em `/carrinho/calcular` e 201 em `/api/pedidos`) e não devolve erro nenhum, então não há `erro.campo` para comparar. A interpretação volta a ser verificada quando o BUG-03 for corrigido.

---

### Resumo

| ID | Tipo | Assunto | Interpretação adotada |
|---|---|---|---|
| DOC-01 | Inconsistência | `campo` × `campos` em `DADOS_INVALIDOS` | confirmada na execução: `erro.campos` é uma lista de `{ campo, mensagem }` |
| DOC-02 | Inconsistência | Interface com textos próprios | valores vêm da API; textos só onde a documentação define |
| DOC-03 | Inconsistência | CEP normalizado sem regra | aceito com ou sem hífen, devolvido só com números |
| DOC-04 | Inconsistência | Mesmo código com 404 e 422 | correto; testar código e status juntos |
| DOC-05 | Inconsistência | Exemplos com `...` | `itens[].total` = preço × quantidade (CT-83); a comparação com `/pedidos` ficou como observação |
| DOC-06 | Lacuna | Cupom vazio ou só espaços | conta como "sem cupom" na API (não testado, observação) |
| DOC-07 | Lacuna | CA02 na API | vale para a tela e para a API |
| DOC-08 | Lacuna | Regras de nome e e-mail | duas palavras com letras; formato comum de e-mail (casos duvidosos não testados, observação) |
| DOC-09 | Lacuna | Mensagens do checkout | textos observados como referência |
| DOC-10 | Lacuna | Sem `Content-Type` | não testado (observação) |
| DOC-11 | Lacuna | Métodos por rota | deduzidos dos exemplos; testar o 405 |
| DOC-12 | Difícil de testar | Arredondamento | verificar ponto flutuante e no máximo 2 casas |
| DOC-13 | Difícil de testar | Data de validade | limite de data não testável |
| DOC-14 | Difícil de testar | 422 de cupom em `/pedidos` | só pela API |
| DOC-15 | Lacuna | Aviso de frete com frete grátis | "Grátis" no frete e sem o aviso "Faltam R$ X" |
| DOC-16 | Lacuna | Quantidade enviada como texto | `"2"` é recusado com `QUANTIDADE_INVALIDA`, sem conversão (confirmada na execução) |
| DOC-17 | Lacuna | `campo` em `QUANTIDADE_MAXIMA_EXCEDIDA` | `itens[0].quantidade`, como no exemplo de `QUANTIDADE_INVALIDA` |
