# Verzel Store — teste técnico QA Júnior

Este repositório é a minha entrega do teste técnico de QA Júnior da Verzel. Testei o card **VZS-142** (versão 2.3.0) da [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev/), que adiciona cupom de desconto e frete grátis à loja. Explorei a loja manualmente, analisei a documentação, escrevi os cenários em BDD e automatizei todos com Playwright + Cucumber, na interface e na API.

## Resultados

- **26 cenários** (10 de UI e 16 de API), que somam **56 execuções** por causa dos exemplos de `Scenario Outline`.
- **Navegadores:** a UI rodou em **Chromium, Firefox e WebKit**; a API, que não depende de navegador, rodou uma vez pelo Chromium.
- **84 rodadas: 76 passaram e 8 falharam**, todas por bug registrado. Nenhuma falha ficou sem explicação.
- **Execução manual:** os 14 exemplos de UI também têm resultado manual no Google Chrome 154 (12 pela exploração e 2 executados à mão, com GIF): 13 passaram e o CT-20 falhou pelo BUG-01. Detalhes em [Execução manual — Google Chrome 154](docs/03-execucao.md#execução-manual--google-chrome-154).

### Bugs encontrados

> **BUG-01 (Alta): a loja cobra frete com subtotal de exatamente R$ 200,00.** O CA06 diz que o frete é grátis "a partir de R$ 200,00, inclusive", mas a API devolve frete de R$ 19,90 e a tela mostra "Faltam R$ 0,00 para o frete grátis.". O erro também chega ao pedido (`POST /api/pedidos`) e acontece nos três navegadores.

> **BUG-03 (Alta): a API aceita mais de 5 unidades por produto.** O CA10 diz que o limite vale "para a interface e para a API". A tela trava em 5, mas a API calcula o carrinho com 6 unidades e confirma o pedido.

Também registrei dois bugs de severidade baixa:
- **BUG-02:** o layout quebra em larguras pequenas. O menu some no celular e também com a janela do navegador estreitada. Fica fora do escopo do card.
- **BUG-04:** o checkout aceita um nome só com símbolos (`@@ @@`) como nome e sobrenome e confirma o pedido. A API também aceita (201).

Todos os bugs, com passos, esperado × obtido e evidências, estão em [docs/04-bugs.md](docs/04-bugs.md).

## Como rodar

**Pré-requisitos:** Node.js (testado com Node.js 24) e acesso à internet, porque os testes rodam na loja publicada.

```bash
npm install            # instala as dependências e os navegadores do Playwright
```

| Comando | O que roda |
|---|---|
| `npm run test:chromium` | Todos os cenários no Chromium (UI e API) |
| `npm run test:firefox` | Só os cenários de UI no Firefox |
| `npm run test:webkit` | Só os cenários de UI no WebKit |
| `npm run test:all` | Os três acima, em sequência (a API roda uma vez, no Chromium) |
| `npm run test:api` / `npm run test:ui` | Só API ou só UI, no Chromium |

Para rodar um cenário ou um grupo, filtre pelas tags:

```bash
npx cucumber-js --tags "@CT-20"                   # um cenário, no Chromium
npx cucumber-js --tags "@bug-01"                  # os cenários de um bug
npm run test:firefox -- -- --tags "@CT-20"        # um cenário em outro navegador
```

O `--` aparece duas vezes de propósito. O primeiro é do npm: passa o resto da linha para o script. O segundo é do `scripts/run-browsers.js`: separa os nomes dos navegadores das opções do Cucumber. Com um só, o script entende `--tags` como nome de navegador e para com erro.

Para ver o navegador abrindo durante os testes:

| Terminal | Comando |
|---|---|
| bash | `HEADLESS=false npm run test:chromium` |
| PowerShell | `$env:HEADLESS="false"; npm run test:chromium` |

**Relatórios:** cada navegador gera `reports/cucumber-report-<navegador>.html`. Os cenários de API anexam a requisição e a resposta, e os de UI registram o navegador e a versão. Quando um cenário marcado com bug falha, a evidência é salva em `docs/05-evidencias/automacao/`: um print para UI e um JSON com requisição e resposta para API.

Os relatórios HTML da execução final (07/10/2026), com todos os cenários e não só os que falharam, estão versionados em [docs/05-evidencias/automacao/relatorios/](docs/05-evidencias/automacao/relatorios/), um por navegador. A pasta `reports/` não vai para o repositório.

> **Atenção:** rodar os testes reescreve as evidências em `docs/05-evidencias/automacao/` (prints e JSON dos cenários com bug, com data e número de pedido novos). As versionadas são as da execução final de 07/10/2026; depois de rodar, use `git checkout -- docs/05-evidencias/automacao/` para voltar a elas.

> Os comandos terminam com falha enquanto o BUG-01 e o BUG-03 estiverem abertos. Isso é esperado: os cenários desses bugs têm as tags `@bug-01` e `@bug-03` e continuam esperando o comportamento da documentação.

## Onde está cada entrega

| Entrega | Onde |
|---|---|
| Exploração manual e análise da documentação (DOC-01 a DOC-17) | [docs/00-exploracao.md](docs/00-exploracao.md) |
| Plano de teste | [docs/01-plano-de-teste.md](docs/01-plano-de-teste.md) |
| Matriz de rastreabilidade (regra × cenário) | [docs/02-matriz-rastreabilidade.md](docs/02-matriz-rastreabilidade.md) |
| Cenários em Gherkin | [features/](features/) |
| Resultado da execução, por navegador | [docs/03-execucao.md](docs/03-execucao.md) |
| Bugs | [docs/04-bugs.md](docs/04-bugs.md) |
| Evidências (prints, JSON de API, relatórios HTML da execução final e GIFs da execução manual) | [docs/05-evidencias/](docs/05-evidencias/) |

## Estrutura

```
features/          cenários em Gherkin, um arquivo por regra (cupom, frete, quantidade, checkout, erros da API)
steps/             definições dos passos
pages/             Page Objects (vitrine, carrinho, checkout, confirmação, cabeçalho, resumo de valores)
api/               clientes da API (produtos, carrinho, pedidos e requisição livre)
support/           configuração, hooks (navegador, API, evidências) e helpers (valores em reais, produtos)
scripts/           execução em mais de um navegador (run-browsers.js)
docs/              plano, matriz, exploração, execução, bugs, evidências e a documentação de referência
.claude/           skill e agente revisor usados com o Claude Code (ver "Uso de IA")
cucumber.js        configuração do Cucumber (ignora @manual, um relatório por navegador)
```

## Uso de IA

Usei IA como apoio, e as decisões foram minhas:

- **Claude (conversa):** para planejar a abordagem e revisar o que eu ia produzindo.
- **Claude Code:** para escrever e automatizar os cenários, com dois recursos que criei para este projeto:
  - uma **skill própria** ([.claude/skills/cenarios-verzel-store/](.claude/skills/cenarios-verzel-store/SKILL.md)), com o padrão de escrita, os seletores confirmados na exploração, o vocabulário dos passos e o fluxo de registro de bugs;
  - um **agente revisor** ([.claude/agents/revisor-bdd.md](.claude/agents/revisor-bdd.md)), que eu rodava antes de cada commit para conferir tags, IDs, valores esperados e coerência entre os documentos.
- O [CLAUDE.md](CLAUDE.md) guarda as regras do card e as convenções do repositório, para a IA consultar sempre a mesma fonte.

Revisei cada ponto e decidi o que entrava: quais cenários eram críticos, como interpretar as ambiguidades da documentação e o que era bug. Quando um teste falhava porque a loja se comportou diferente da documentação, eu não mudava o esperado. Analisava a resposta e registrava o bug.
