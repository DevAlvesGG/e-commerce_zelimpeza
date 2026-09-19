const productService = require('../services/productService')

// listar produtos
async function listProducts(req, res, next) {
    try {
        const productsList = await productService.listAll();
        return res.status(200).json(productsList);
    } catch (error) {
        next(error);
    }
}

// pegar um product
async function getOneProduct(req, res, next) {
    try {
        const { id } = req.params;
        const product = await productService.getById(id);
        return res.status(200).json(product);
    } catch (error) {
        next(error);
    }
}

// criar um product
async function createProduct(req, res, next) {
    try {
        const { name, description, price, stockQuantity, imageUrl } = req.body;
        if (!name || price === undefined ) {
            return res.status(400).json({ message: 'Nome e Valor são obrigatórios para o Sistema.'})
        }
        const product = await productService.create({name, description, price, stockQuantity, imageUrl});
        return res.status(201).json(product);
    } catch (error) {
        next(error);
    }
} 

module.exports = { listProducts, getOneProduct, createProduct }