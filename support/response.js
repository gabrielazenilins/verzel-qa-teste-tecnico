// Guarda a última resposta da API no World, anexa requisição + resposta ao relatório
// e lê campos da resposta por caminho com ponto ("cupom.mensagem", "itens.0.total").

async function storeResponse(world, response, request){
    world.response = response
    world.responseText = await response.text()
    try {
        world.responseBody = JSON.parse(world.responseText)
    } catch {
        world.responseBody = undefined
    }
    world.lastRequest = request
    world.exchanges = world.exchanges || []
    world.exchanges.push({
        requisicao: request,
        status: response.status(),
        resposta: world.responseBody !== undefined ? world.responseBody : world.responseText
    })
    attachResponse(world)
}

// Anexa a requisição e a resposta como JSON (evidência dos cenários @api).
// Não anexa a mesma resposta duas vezes.
function attachResponse(world){
    if (!world.response || world.attachedResponse === world.response) return
    const evidence = {
        requisicao: world.lastRequest,
        status: world.response.status(),
        resposta: world.responseBody !== undefined ? world.responseBody : world.responseText
    }
    world.attach(JSON.stringify(evidence, null, 2), 'application/json')
    world.attachedResponse = world.response
}

function getField(body, path){
    return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), body)
}

// Converte o valor esperado escrito no passo:
// número sem zero à esquerda ("23.97", "0.00", "-1") → number; "true"/"false" → boolean; o resto → texto.
// "01310100" continua texto (zero à esquerda), para comparar CEP.
function parseExpected(text){
    if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(text)) return Number(text)
    if (text === 'true') return true
    if (text === 'false') return false
    return text
}

module.exports = { storeResponse, attachResponse, getField, parseExpected }
