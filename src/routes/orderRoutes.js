const { Router } = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const routes = Router();

routes.post('/',authMiddleware, orderController.checkout);
routes.get('/my-orders', authMiddleware, orderController.myOrders);

module.exports = routes;