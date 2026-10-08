const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const VISUAL_DIR = path.join(__dirname, '..', 'docs', '05-evidencias', 'visual');
const PIXEL_THRESHOLD = 0.1;
const MAX_DIFF_RATIO = 0.005; // até 0,5% dos pixels diferentes

// compara o print com docs/05-evidencias/visual/<nome>_<navegador>.png
// com VISUAL_UPDATE=1 grava a referência em vez de comparar
async function compareWithReference(screenshot, nome, navegador) {
    const referencePath = path.join(VISUAL_DIR, `${nome}_${navegador}.png`);
    fs.mkdirSync(VISUAL_DIR, { recursive: true });

    if (process.env.VISUAL_UPDATE === '1') {
        fs.writeFileSync(referencePath, screenshot);
        return { updated: true, referencePath };
    }
    if (!fs.existsSync(referencePath)) {
        throw new Error(`Referência visual não encontrada: ${referencePath}. Gere com "npm run test:visual:update".`);
    }

    const atual = PNG.sync.read(screenshot);
    const referencia = PNG.sync.read(fs.readFileSync(referencePath));
    if (atual.width !== referencia.width || atual.height !== referencia.height) {
        throw new Error(
            `Tamanho diferente da referência: atual ${atual.width}x${atual.height}, referência ${referencia.width}x${referencia.height} (${referencePath}).`
        );
    }

    // pixelmatch só existe como ESM, por isso o import()
    const pixelmatch = (await import('pixelmatch')).default;
    const diff = new PNG({ width: atual.width, height: atual.height });
    const diffPixels = pixelmatch(referencia.data, atual.data, diff.data, atual.width, atual.height, { threshold: PIXEL_THRESHOLD });
    const ratio = diffPixels / (atual.width * atual.height);

    let diffPath = null;
    if (ratio > MAX_DIFF_RATIO) {
        diffPath = path.join(VISUAL_DIR, `${nome}_${navegador}_diff.png`);
        fs.writeFileSync(diffPath, PNG.sync.write(diff));
    }
    return { updated: false, referencePath, diffPixels, ratio, diffPath };
}

module.exports = { compareWithReference, MAX_DIFF_RATIO };
