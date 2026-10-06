class PedidosApi {
    constructor(request){
        this.request = request
    }
    async criar(body){
        return this.request.post('/api/pedidos', { data: body })
    }
}
module.exports = PedidosApi
