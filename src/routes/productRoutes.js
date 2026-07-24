const { Router } = require('express');
const routes = Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


// Rotas públicas
    routes.get('/', productController.listProducts);// rota para listar produtos
    routes.get('/:id', productController.getOneProduct);// rota para selecionar um produto

// Rota privada — só admin autenticado pode cadastrar produto
    routes.post('/', authMiddleware, adminMiddleware, productController.createProduct);// rota para criar um produto


module.exports = routes;