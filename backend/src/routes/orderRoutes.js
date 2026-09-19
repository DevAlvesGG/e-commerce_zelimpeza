const { Router } = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { checkoutSchema } = require('../schemas/orderSchema');

const routes = Router();

routes.post('/',authMiddleware, validate(checkoutSchema), orderController.checkout);
routes.get('/my-orders', authMiddleware, orderController.myOrders);

module.exports = routes;