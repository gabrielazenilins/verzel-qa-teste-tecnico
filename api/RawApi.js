// Requisição livre para testar 400, 404 e 405 (método e corpo crus, sem serialização)
class RawApi {
    constructor(request){
        this.request = request
    }
    async send(method, path, rawBody){
        const options = { method }
        if (rawBody !== undefined) options.data = rawBody
        return this.request.fetch(path, options)
    }
}
module.exports = RawApi
