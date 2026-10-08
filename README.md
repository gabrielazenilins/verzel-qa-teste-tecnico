# Verzel Store: teste técnico QA Júnior

Esta é a minha entrega do teste técnico de QA Júnior da Verzel. Testei o card VZS-142 (versão 2.3.0) da [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev/), que traz cupom de desconto e frete grátis. Explorei a loja na mão, analisei a documentação, escrevi os cenários em BDD e automatizei todos com Playwright + Cucumber, na tela e na API.

## Resultados

- 27 cenários (10 de UI e 17 de API), que viram 57 execuções por causa dos exemplos de `Scenario Outline`.
- A UI rodou em Chromium, Firefox e WebKit. A API não depende de navegador, então rodou uma vez, no Chromium.
- 85 rodadas: 76 passaram e 9 falharam. Todas as falhas são de bug registrado (BUG-01, BUG-03 e BUG-04).
- A comparação visual da tela do carrinho (CT-21) deu 0 pixels diferentes da referência nos três navegadores.
- Os 14 exemplos de UI também têm resultado manual no Google Chrome 154: 12 vieram da exploração e 2 eu executei na mão, com GIF. 13 passaram e o CT-20 falhou pelo BUG-01. Está em [Execução manual no Google Chrome 154](docs/03-execucao.md#execução-manual-no-google-chrome-154).

### Bugs encontrados

Os dois mais graves:

- BUG-01 (Alta): a loja cobra frete com subtotal de exatamente R$ 200,00. O CA06 diz que o frete é grátis "a partir de R$ 200,00, inclusive", mas a API devolve frete de R$ 19,90 e a tela mostra "Faltam R$ 0,00 para o frete grátis.". O erro chega até o pedido (`POST /api/pedidos`) e acontece nos três navegadores.
- BUG-03 (Alta): a API aceita mais de 5 unidades por produto. O CA10 diz que o limite vale "para a interface e para a API". A tela trava em 5, mas a API calcula o carrinho com 6 unidades e confirma o pedido.

E dois de severidade baixa:

- BUG-02: o layout quebra em larguras pequenas. O menu some no celular e também com a janela do navegador estreitada. Fica fora do escopo do card.
- BUG-04: o checkout aceita um nome só com símbolos (`@@ @@`) como nome e sobrenome e confirma o pedido. A API também aceita (201), e o CT-64 falha por causa disso.

Os passos, o esperado × obtido e as evidências de cada bug estão em [docs/04-bugs.md](docs/04-bugs.md).

## Como rodar

Precisa de Node.js (testei com o Node.js 24) e de internet, porque os testes rodam na loja publicada.

```bash
npm install                    # instala as dependências e os navegadores do Playwright

npm run test:chromium          # todos os cenários no Chromium (UI e API)
npm run test:firefox           # só UI no Firefox
npm run test:webkit            # só UI no WebKit
npm run test:all               # os três em sequência (a API roda uma vez, no Chromium)
npm run test:api               # só API, no Chromium
npm run test:ui                # só UI, no Chromium
npm run test:visual:update     # grava as imagens de referência da comparação visual
npm run test:visual            # só a comparação visual do carrinho (CT-21), nos três navegadores
```

Para rodar um cenário ou um grupo, filtro pelas tags:

```bash
npx cucumber-js --tags "@CT-20"                # um cenário, no Chromium
npx cucumber-js --tags "@bug-01"               # os cenários de um bug
npm run test:firefox -- -- --tags "@CT-20"     # um cenário em outro navegador
```

O `--` aparece duas vezes de propósito. O primeiro é do npm e passa o resto da linha para o script. O segundo é do `scripts/run-browsers.js` e separa os navegadores das opções do Cucumber. Com um só, o script acha que `--tags` é um navegador e para com erro.

Para ver o navegador abrindo:

```bash
HEADLESS=false npm run test:chromium               # bash
$env:HEADLESS="false"; npm run test:chromium       # PowerShell
```

### Relatórios e evidências

Cada navegador gera o seu relatório em `reports/cucumber-report-<navegador>.html`. Nos cenários de API vai junto a requisição e a resposta. Nos de UI, o navegador e a versão. Quando um cenário com bug falha, a evidência fica em `docs/05-evidencias/automacao/`: um print na UI e um JSON com requisição e resposta na API.

A pasta `reports/` não vai para o repositório. Por isso guardei os relatórios HTML da execução final (08/10/2026), com todos os cenários, em [docs/05-evidencias/automacao/relatorios/](docs/05-evidencias/automacao/relatorios/), um por navegador.

Rodar os testes reescreve as evidências de `docs/05-evidencias/automacao/` (prints e JSON dos cenários com bug, com data e número de pedido novos). As que estão no repositório são da execução final de 08/10/2026. Para voltar a elas depois de rodar: `git checkout -- docs/05-evidencias/automacao/`.

Os comandos terminam com falha enquanto o BUG-01, o BUG-03 e o BUG-04 estiverem abertos. Isso é esperado: os cenários desses bugs têm as tags `@bug-01`, `@bug-03` e `@bug-04` e continuam esperando o que a documentação diz.

### Comparação visual

No CT-21 comparo a tela inteira do carrinho (cabeçalho, itens, resumo e rodapé) com uma imagem de referência de cada navegador, em `docs/05-evidencias/visual/carrinho_<navegador>.png`. O carrinho é sempre o mesmo, com os produtos do CT-21, e a janela tem 1280×800.

Se mais de 0,5% dos pixels mudar, o teste falha e salva a diferença em `carrinho_<navegador>_diff.png`.

As imagens de referência que estão no repositório foram geradas no Windows. Em outro sistema operacional as fontes podem renderizar diferente, e aí o CT-21 falha sem ter bug nenhum. Nesse caso, rode `npm run test:visual:update` antes, para gerar as referências da sua máquina.

As referências já estão no repositório. Se apagar alguma, o CT-21 falha avisando que ela não existe. Para gerar de novo, rode `npm run test:visual:update` e confira as imagens antes de usar. Se alguma parte da tela mudar a cada execução, coloque o seletor dela em `visual.mascaras`, no `pages/selectors.json`. Hoje essa lista está vazia.

## Onde está cada entrega

- Exploração manual e análise da documentação (DOC-01 a DOC-17): [docs/00-exploracao.md](docs/00-exploracao.md)
- Plano de teste: [docs/01-plano-de-teste.md](docs/01-plano-de-teste.md)
- Matriz de rastreabilidade (regra × cenário): [docs/02-matriz-rastreabilidade.md](docs/02-matriz-rastreabilidade.md)
- Cenários em Gherkin: [features/](features/)
- Resultado da execução, por navegador: [docs/03-execucao.md](docs/03-execucao.md)
- Bugs: [docs/04-bugs.md](docs/04-bugs.md)
- Evidências (prints, JSON de API, relatórios HTML da execução final e GIFs da execução manual): [docs/05-evidencias/](docs/05-evidencias/)

## Estrutura

```
features/          cenários em Gherkin, um arquivo por regra (cupom, frete, quantidade, checkout, erros da API)
steps/             passos: api.steps.js (API), ui.steps.js (UI) e common.steps.js (passos das duas camadas; hoje vazio)
pages/             Page Objects (vitrine, carrinho, checkout, confirmação, cabeçalho, resumo de valores) e selectors.json (textos e seletores)
api/               clientes da API (produtos, carrinho, pedidos e requisição livre)
support/           configuração, hooks (navegador, vitrine, API, evidências) e helpers (valores em reais, produtos, comparação visual)
scripts/           execução em mais de um navegador (run-browsers.js) e geração das referências visuais (update-visual.js)
docs/              plano, matriz, exploração, execução, bugs, evidências e a documentação de referência
.claude/           skill e agente revisor que usei com o Claude Code (ver "Uso de IA")
cucumber.js        configuração do Cucumber (ignora @manual, um relatório por navegador)
```

## Uso de IA

Usei IA como apoio. As decisões foram minhas.

- Claude (conversa): para planejar a abordagem e revisar o que eu ia fazendo.
- Claude Code: para escrever e automatizar os cenários. Para isso criei dois recursos:
  - uma skill própria ([.claude/skills/cenarios-verzel-store/](.claude/skills/cenarios-verzel-store/SKILL.md)), com o padrão de escrita, os seletores que confirmei na exploração, o vocabulário dos passos e o fluxo de registro de bugs;
  - um agente revisor ([.claude/agents/revisor-bdd.md](.claude/agents/revisor-bdd.md)), que eu rodava antes de cada commit para conferir tags, IDs, valores esperados e se os documentos batiam entre si.
- O [CLAUDE.md](CLAUDE.md) guarda as regras do card e as convenções do repositório, para a IA consultar sempre a mesma fonte.

Revisei cada ponto e decidi o que entrava: quais cenários eram críticos, como interpretar as dúvidas da documentação e o que era bug. Quando um teste falhava porque a loja fez algo diferente da documentação, eu não mudava o esperado. Olhava a resposta e registrava o bug.
