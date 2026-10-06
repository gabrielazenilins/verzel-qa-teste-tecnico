# Plano de Teste — Verzel Store (VZS-142)

## Objetivo

Verificar se a entrega do card VZS-142 (v2.3.0), que trata de cupom de desconto e frete grátis, atende aos critérios CA01 a CA11 na interface e na API. Também testo o checkout, porque é nele que o total calculado vira pedido. As regras estão na [documentação](referencias/documentacao-v2.3.0.md) e não repito aqui. Quando a documentação deixa dúvida, sigo a interpretação registrada em [Análise da documentação](00-exploracao.md#análise-da-documentação) (DOC-01 a DOC-15).

## Escopo

**Dentro**
- Cupom no carrinho: aplicar, recusar, remover e trocar (CA01 a CA05).
- Frete fixo, frete grátis e o aviso de quanto falta (CA06 a CA09).
- Fórmula do total e arredondamento (CA11).
- Limite de 5 unidades por produto (CA10).
- Checkout: validação de nome, e-mail e CEP, e a confirmação do pedido.
- API: `GET /api/produtos`, `GET /api/produtos/{id}`, `POST /api/carrinho/calcular`, `POST /api/pedidos` e a tabela de códigos de erro.

**Fora**
- O que a própria documentação exclui: login, cadastro, pagamento online e consulta de pedidos.
- Testes de carga, estresse e segurança, porque o ambiente é compartilhado com outros candidatos.
- Layout no celular. Registrei o BUG-02 durante a exploração, mas ele não faz parte do card.
- O limite de data de validade do cupom (DOC-13).

## Estratégia

A documentação diz que "os cálculos são feitos pela API e a interface apenas exibe o resultado". Por isso divido assim:

- **API, onde ficam as regras de valor.** É aqui que testo com mais profundidade os valores-limite do frete, o desconto, a fórmula e o arredondamento. Comparo números exatos, o que também pega erro de ponto flutuante (DOC-12). Também ficam só na API os casos que a tela não deixa reproduzir: quantidades 0, negativas ou acima de 5 (a tela só tem botões + e −), o 422 de cupom em `/pedidos` (DOC-14), a normalização do CEP (DOC-03) e todos os códigos de erro.
- **UI, onde fica o comportamento da tela.** Aqui cubro o que só existe na tela: a mensagem do cupom, o cupom aplicado com o botão "Remover cupom" (CA05), o aviso "Faltam R$ X para o frete grátis.", os botões + e − travando em 5 e em 1, as mensagens do checkout e a confirmação. Para os valores, verifico se a tela mostra o que a API calculou em alguns casos representativos, sem repetir todas as combinações.
- **Nas duas camadas:** CA01, CA02 (DOC-07), CA03/CA04, o limite de R$ 200,00 do CA06 e o CA10. São as regras centrais do card, e um defeito em qualquer uma das camadas chega ao cliente.

Automatizo com Playwright + Cucumber. Marco como `@manual` só o que não compensa automatizar, como checagens visuais. Quando um cenário falha porque o sistema contraria a documentação, não ajusto o esperado: abro o bug e marco o cenário com `@bug-XX`.

**Navegadores.** Rodo os cenários de UI em Chromium, Firefox e WebKit, os três motores que cobrem Chrome/Edge, Firefox e Safari. A regra de cálculo está na API, então o resultado esperado é o mesmo nos três. O que muda entre eles é a renderização e o comportamento da tela, como os botões desabilitados no limite de 5 e as mensagens de validação. Se um cenário falha em um só navegador, registro o bug indicando em qual. Os cenários de API não dependem de navegador.

**Status de execução**
- **Passou:** o resultado foi igual ao esperado.
- **Falhou:** o sistema respondeu diferente do esperado. Vira bug em [04-bugs.md](04-bugs.md).
- **Bloqueado:** não foi possível executar, por exemplo com a loja fora do ar.

## Mapa de cenários

Ver docs/02-matriz-rastreabilidade.md (a ser criada com as features)

## Dados de teste e valores-limite

Os produtos, preços e cupons são fixos (tabela em [CLAUDE.md](../CLAUDE.md#dados-de-teste)). Escolhi as combinações que ficam em volta dos limites:

| Caso | Carrinho | Subtotal | O que verifica |
|---|---|---|---|
| Logo abaixo | P001 + P002 | 199,80 | frete 19,90, faltam 0,20 |
| No limite − 0,10 | P005 + P008 + P004 | 199,90 | frete 19,90, faltam 0,10 |
| **No limite** | P005 ×2 | 200,00 | frete grátis (hoje falha: BUG-01) |
| Acima | P001 + P004 + P005 | 209,80 | frete grátis |
| Exemplo da documentação | P002 + P004 ×2 | 239,70 | desconto 23,97, total 215,73 |
| CA08 com cupom | P001 + P004 + P005 + BEMVINDO10 | 209,80 | total 188,82, frete continua grátis |
| CA09 | P005 ×1 + BEMVINDO10 | 100,00 | desconto 10,00 só nos produtos, total 109,90 |

- **Cupons:** `BEMVINDO10` em maiúsculas, minúsculas, misto e com espaços; `VERAO2026` (expirado); `XYZ123` (inexistente); `BEM VINDO10` (espaço no meio); vazio e só com espaços (DOC-06).
- **Quantidade:** 1 e 5 (válidos); 0, −1 e 6 (inválidos, pela API).
- **Cliente:** Maria Silva / maria@exemplo.com / 01310-100. Os casos de CEP, nome e e-mail inválidos vêm da exploração (seção 5) e da DOC-08.

## Ambiente e como rodar

- Loja: https://verzel-store.qa-test-verzel-store.workers.dev (pode ser trocada pela variável `BASE_URL`).
- Windows 11, Node 24, Playwright 1.63 e Cucumber 13.
- Automação: Chromium 153, Firefox 155 e WebKit 26.6, nas versões que vêm com o Playwright. O navegador é escolhido pela variável `BROWSER` (`chromium` é o padrão).
- Exploração manual: Google Chrome 154.0.8037.98.

```
npm install                          # instala as dependências e os três navegadores
npm test                             # tudo, menos @manual, no Chromium
npm run test:firefox                 # tudo no Firefox (também test:chromium e test:webkit)
npm run test:all                     # Chromium, Firefox e WebKit, um depois do outro
npm run test:api                     # só API
npm run test:ui                      # só UI
npx cucumber-js --tags "@CT-24"      # um cenário
$env:HEADLESS="false"; npm test      # PowerShell, com o navegador visível
```

Cada navegador gera o seu relatório em `reports/cucumber-report-<navegador>.html`, e cada cenário de UI registra o navegador e a versão usados. Quando um cenário de UI falha ou tem `@bug-XX`, o print é anexado ao relatório e salvo em `docs/05-evidencias/automacao/CT-XX_<navegador>_<passou|falhou>.png`.

## Riscos e limitações

- **Ambiente compartilhado.** Muitos candidatos usam a mesma loja ao mesmo tempo. Não faço teste de carga, e cada cenário começa com o carrinho vazio, sem depender de outro. Se a loja ficar lenta ou fora do ar, o resultado é "Bloqueado", não "Falhou".
- **Sem `data-testid`.** Uso `aria-label`, `id` e `data-valor` (OBS-04). O botão "Adicionar ao carrinho" é igual em todos os cards, então localizo o card pelo título antes de clicar. Se a estrutura do card mudar, esses seletores quebram. Os `aria-label` usam o nome do produto, por isso deixei a conversão id → nome num único arquivo.
- **422 de cupom em `/pedidos` não é alcançável pela UI** (DOC-14). A tela não leva um cupom recusado para o checkout, então essa regra só é testada pela API.
- **Validade do cupom (DOC-13).** Os cupons são fixos, então só testo um cupom já expirado. A virada de data (último dia válido × primeiro dia expirado) e o fuso horário ficam sem cobertura.
- **Arredondamento (DOC-12).** Nenhuma combinação de produtos gera uma terceira casa decimal. Cubro o CA11 verificando que nenhum valor da resposta passa de 2 casas.
- **Textos não documentados (DOC-09).** As mensagens do checkout foram tiradas da tela. Se mudarem, o teste quebra sem que seja necessariamente um bug.
## Critérios de saída

- Cada critério de CA01 a CA11 tem pelo menos um cenário, automatizado ou manual com justificativa, rastreado na matriz.
- Todos os cenários automatizados foram executados e estão registrados em [03-execucao.md](03-execucao.md).
- Nenhum cenário falha sem explicação: ou corrijo o teste, ou a falha tem `@bug-XX` e o bug está em [04-bugs.md](04-bugs.md) com passos, esperado × obtido e evidência.
- Nenhum cenário instável (que passa e falha sem mudança no sistema).

## Entregas

| Documento | Conteúdo |
|---|---|
| [00-exploracao.md](00-exploracao.md) | Exploração manual, observações e análise da documentação (DOC-01 a DOC-15) |
| [01-plano-de-teste.md](01-plano-de-teste.md) | Este plano |
| 02-matriz-rastreabilidade.md | Critério × cenário × camada (a ser criada) |
| [03-execucao.md](03-execucao.md) | Resultado de cada cenário |
| [04-bugs.md](04-bugs.md) | Bugs com passos, esperado × obtido e evidência |
| [05-evidencias/](05-evidencias/) | Prints e respostas da API |
| [features/](../features/) | Cenários Gherkin |
