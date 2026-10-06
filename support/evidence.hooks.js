const fs = require('fs')
const path = require('path')
const { After, Status } = require('@cucumber/cucumber')

const EVIDENCE_DIR = path.join(__dirname, '..', 'docs', '05-evidencias', 'automacao')
const STATUS = { [Status.PASSED]: 'passou', [Status.FAILED]: 'falhou' }

// Cenário de UI que falhou ou tem @bug-XX: anexa o print ao relatório e salva em
// docs/05-evidencias/automacao/<CT-XX>_<navegador>_<status>.png
After({ tags: 'not @api' }, async function({ pickle, result }){
    const tags = pickle.tags.map(t => t.name)
    const hasBug = tags.some(t => /^@bug-/i.test(t))
    const status = STATUS[result?.status]
    if (!this.page || !status || (status === 'passou' && !hasBug)) return

    const screenshot = await this.page.screenshot({ fullPage: true })
    this.attach(screenshot, 'image/png')

    const ctTag = tags.find(t => /^@CT-\d+$/i.test(t))
    const id = ctTag
        ? ctTag.slice(1).toUpperCase()
        : pickle.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\W+/g, '-').toLowerCase()
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true })
    fs.writeFileSync(path.join(EVIDENCE_DIR, `${id}_${this.browserName}_${status}.png`), screenshot)
})
