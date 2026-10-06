const fs = require('fs')
const path = require('path')
const { After, Status } = require('@cucumber/cucumber')

const EVIDENCE_DIR = path.join(__dirname, '..', 'docs', '05-evidencias', 'automacao')
const STATUS = { [Status.PASSED]: 'passou', [Status.FAILED]: 'falhou' }

// Posição (1, 2, 3...) do exemplo de um Scenario Outline, contando todos os blocos Examples
// em ordem; null quando o cenário não é Outline.
function exampleNumber(gherkinDocument, pickle){
    const [scenarioId, rowId] = pickle.astNodeIds
    if (!rowId) return null
    const children = gherkinDocument.feature.children.flatMap(c => c.rule ? c.rule.children : [c])
    const scenario = children.find(c => c.scenario?.id === scenarioId)?.scenario
    const rows = scenario ? scenario.examples.flatMap(e => e.tableBody) : []
    const index = rows.findIndex(r => r.id === rowId)
    return index === -1 ? null : index + 1
}

// Cenário de UI que falhou ou tem @bug-XX: anexa o print ao relatório e salva em
// docs/05-evidencias/automacao/<CT-XX>_<navegador>_<status>.png
// (Scenario Outline: <CT-XX>-ex<N>_<navegador>_<status>.png, N = posição do exemplo)
After({ tags: '@ui' }, async function({ gherkinDocument, pickle, result }){
    const tags = pickle.tags.map(t => t.name)
    const hasBug = tags.some(t => /^@bug-/i.test(t))
    const status = STATUS[result?.status]
    if (!this.page || !status || (status === 'passou' && !hasBug)) return

    const screenshot = await this.page.screenshot({ fullPage: true })
    this.attach(screenshot, 'image/png')

    const ctTag = tags.find(t => /^@CT-\d+$/i.test(t))
    const baseId = ctTag
        ? ctTag.slice(1).toUpperCase()
        : pickle.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\W+/g, '-').toLowerCase()
    const example = exampleNumber(gherkinDocument, pickle)
    const id = example ? `${baseId}-ex${example}` : baseId
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true })
    fs.writeFileSync(path.join(EVIDENCE_DIR, `${id}_${this.browserName}_${status}.png`), screenshot)
})
