// Roda o Cucumber em um ou mais navegadores, em sequência, definindo BROWSER para cada um.
// Funciona igual no PowerShell, cmd e bash (não depende de sintaxe de variável de ambiente do shell).
//   node scripts/run-browsers.js firefox
//   node scripts/run-browsers.js chromium firefox webkit -- --tags "@smoke"
const { spawnSync } = require('child_process')
const path = require('path')

const VALID = ['chromium', 'firefox', 'webkit']
const args = process.argv.slice(2)
const sep = args.indexOf('--')
const browsers = sep === -1 ? args : args.slice(0, sep)
const cucumberArgs = sep === -1 ? [] : args.slice(sep + 1)

const invalid = browsers.filter(b => !VALID.includes(b))
if (!browsers.length || invalid.length){
    console.error(`Uso: node scripts/run-browsers.js <${VALID.join('|')}>... [-- <opções do cucumber>]`)
    process.exit(2)
}

const cucumberBin = path.join(__dirname, '..', 'node_modules', '@cucumber', 'cucumber', 'bin', 'cucumber.js')
const results = browsers.map(browser => {
    console.log(`\n===== ${browser} =====`)
    const run = spawnSync(process.execPath, [cucumberBin, ...cucumberArgs], {
        stdio: 'inherit',
        env: { ...process.env, BROWSER: browser }
    })
    return { browser, ok: run.status === 0 }
})

if (results.length > 1){
    console.log('\n===== Resumo =====')
    results.forEach(r => console.log(`${r.browser.padEnd(9)} ${r.ok ? 'passou' : 'falhou'}`))
}
process.exit(results.every(r => r.ok) ? 0 : 1)
