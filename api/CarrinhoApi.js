class CarrinhoApi {
    constructor(request){
        this.request = request
    }
    async calcular(body){
        return this.request.post('/api/carrinho/calcular', { data: body })
    }
}
module.exports = CarrinhoApi
