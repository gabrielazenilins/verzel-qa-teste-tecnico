const fs = require('fs');
const path = require('path');
const { After, Status } = require('@cucumber/cucumber');
const { scenarioId, hasBugTag } = require('./scenario-id');

const EVIDENCE_DIR = path.join(__dirname, '..', 'docs', '05-evidencias', 'automacao');
const STATUS = { [Status.PASSED]: 'passou', [Status.FAILED]: 'falhou' };

// UI: print quando falha ou tem @bug-XX → automacao/CT-XX_<navegador>_<status>.png
After({ tags: '@ui' }, async function ({ gherkinDocument, pickle, result }) {
    const status = STATUS[result?.status];
    if (!this.page || !status || (status === 'passou' && !hasBugTag(pickle))) return;

    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');

    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    const id = scenarioId(gherkinDocument, pickle);
    fs.writeFileSync(path.join(EVIDENCE_DIR, `${id}_${this.browserName}_${status}.png`), screenshot);
});

// primeira linha do erro e o Expected/Received do expect, sem as cores do terminal
function resumoDaFalha(message = '') {
    const texto = message.replace(/\u001b\[[0-9;]*m/g, '');
    const linha = re => (texto.match(re) || [])[1]?.trim();
    return {
        mensagem: texto.split('\n')[0],
        esperado: linha(/Expected:\s*(.*)/),
        obtido: linha(/Received:\s*(.*)/)
    };
}

// API: quando um cenário com @bug-XX falha → automacao/CT-XX_api.json (reports/ não vai para o GitHub)
After({ tags: '@api' }, function ({ gherkinDocument, pickle, result }) {
    if (result?.status !== Status.FAILED || !hasBugTag(pickle) || !this.exchanges?.length) return;

    const evidence = {
        cenario: pickle.name,
        tags: pickle.tags.map(t => t.name),
        executadoEm: new Date().toISOString(),
        falha: resumoDaFalha(result.message),
        chamadas: this.exchanges
    };
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    const id = scenarioId(gherkinDocument, pickle);
    fs.writeFileSync(path.join(EVIDENCE_DIR, `${id}_api.json`), JSON.stringify(evidence, null, 2) + '\n');
});
