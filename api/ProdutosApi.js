class ProdutosApi {
    constructor(request){
        this.request = request
    }
    async list(){
        return this.request.get('/api/produtos')
    }
    async getById(id){
        return this.request.get(`/api/produtos/${id}`)
    }
}
module.exports = ProdutosApi
