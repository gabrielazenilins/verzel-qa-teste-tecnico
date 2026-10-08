// Gera (ou regrava) as imagens de referência da comparação visual nos três navegadores:
// roda os cenários @visual com VISUAL_UPDATE=1. Funciona igual no PowerShell, cmd e bash.
//   npm run test:visual:update
const { spawnSync } = require('child_process')
const path = require('path')

const runBrowsers = path.join(__dirname, 'run-browsers.js')
const run = spawnSync(process.execPath, [runBrowsers, 'chromium', 'firefox', 'webkit', '--', '--tags', '@visual'], {
    stdio: 'inherit',
    env: { ...process.env, VISUAL_UPDATE: '1' }
})
process.exit(run.status === null ? 1 : run.status)
