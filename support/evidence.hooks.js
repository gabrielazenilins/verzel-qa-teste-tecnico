const fs = require('fs')
const path = require('path')
const { After, Status } = require('@cucumber/cucumber')
const { scenarioId, hasBugTag } = require('./scenario-id')

const EVIDENCE_DIR = path.join(__dirname, '..', 'docs', '05-evidencias', 'automacao')
const STATUS = { [Status.PASSED]: 'passou', [Status.FAILED]: 'falhou' }

// Cenário de UI que falhou ou tem @bug-XX: anexa o print ao relatório e salva em
// docs/05-evidencias/automacao/<CT-XX>_<navegador>_<status>.png
// (Scenario Outline: <CT-XX>-ex<N>_<navegador>_<status>.png, N = posição do exemplo)
After({ tags: '@ui' }, async function({ gherkinDocument, pickle, result }){
    const status = STATUS[result?.status]
    if (!this.page || !status || (status === 'passou' && !hasBugTag(pickle))) return

    const screenshot = await this.page.screenshot({ fullPage: true })
    this.attach(screenshot, 'image/png')

    fs.mkdirSync(EVIDENCE_DIR, { recursive: true })
    const id = scenarioId(gherkinDocument, pickle)
    fs.writeFileSync(path.join(EVIDENCE_DIR, `${id}_${this.browserName}_${status}.png`), screenshot)
})

// Primeira linha do erro + Expected/Received do expect, sem os códigos de cor do terminal.
function resumoDaFalha(message = ''){
    const texto = message.replace(/\u001b\[[0-9;]*m/g, '')
    const linha = re => (texto.match(re) || [])[1]?.trim()
    return {
        mensagem: texto.split('\n')[0],
        esperado: linha(/Expected:\s*(.*)/),
        obtido: linha(/Received:\s*(.*)/)
    }
}

// Cenário de API com @bug-XX que falhou: salva as requisições e respostas em
// docs/05-evidencias/automacao/<CT-XX>_api.json (Outline: <CT-XX>-ex<N>_api.json).
// A pasta reports/ não vai para o repositório; este arquivo é a evidência versionada do bug.
After({ tags: '@api' }, function({ gherkinDocument, pickle, result }){
    if (result?.status !== Status.FAILED || !hasBugTag(pickle) || !this.exchanges?.length) return

    const evidence = {
        cenario: pickle.name,
        tags: pickle.tags.map(t => t.name),
        executadoEm: new Date().toISOString(),
        falha: resumoDaFalha(result.message),
        chamadas: this.exchanges
    }
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true })
    const id = scenarioId(gherkinDocument, pickle)
    fs.writeFileSync(path.join(EVIDENCE_DIR, `${id}_api.json`), JSON.stringify(evidence, null, 2) + '\n')
})
