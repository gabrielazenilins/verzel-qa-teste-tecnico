function toEvidence(world) {
    return {
        requisicao: world.lastRequest,
        status: world.response.status(),
        resposta: world.responseBody !== undefined ? world.responseBody : world.responseText
    };
}

// guarda a resposta e anexa ao relatório
async function storeResponse(world, response, request) {
    world.response = response;
    world.responseText = await response.text();
    try {
        world.responseBody = JSON.parse(world.responseText);
    } catch {
        world.responseBody = undefined;
    }
    world.lastRequest = request;
    world.exchanges = world.exchanges || [];
    world.exchanges.push(toEvidence(world));
    attachResponse(world);
}

function attachResponse(world) {
    // não anexa a mesma resposta duas vezes
    if (!world.response || world.attachedResponse === world.response) return;
    world.attach(JSON.stringify(toEvidence(world), null, 2), 'application/json');
    world.attachedResponse = world.response;
}

// lê campo por caminho com ponto: "cupom.mensagem", "itens.0.total"
function getField(body, path) {
    return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), body);
}

// "23.97" vira número, "true"/"false" viram boolean; "01310100" continua texto por causa do zero à esquerda
function parseExpected(text) {
    if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(text)) return Number(text);
    if (text === 'true') return true;
    if (text === 'false') return false;
    return text;
}

module.exports = { storeResponse, attachResponse, getField, parseExpected };
