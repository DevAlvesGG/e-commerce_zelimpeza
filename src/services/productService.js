const prisma = require('../config/prismaClient')

// function para listar todos os produtos
async function listAll() {
    return prisma.product.findMany({ orderBy: {id: 'asc'}}); //findMany() - para retornar tudo de product
};

//function para pegar produtos por id
async function getById(id) {
    const product = prisma.product.findUnique({ where: { id: Number(id) }}) //findUnique() - para localizar um unico dado de product
    if(!product) {
        const error = new Error('Produto não encontrado');
        error.statusCode = 404;
        throw error;
    }
    return product;
};

//function para criar produto
async function create({ name, description, price, stockQuantity, imageUrl }) {
    if(price < 0) {
        const error = new Error('O preço nãp pode ser negativo');
        error.statusCode = 400;
        throw error;
    }
    return prisma.product.create({ 
        data: {
            name,
            description,
            price,
            stockQuantity,
            imageUrl
        },
    }) //create() para criar novos products
};

module.exports = { listAll, getById, create };