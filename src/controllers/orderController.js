const orderService = require('../services/orderService');

async function checkout(req, res, next) {
  try {
    const userId = req.user.id; // vem do authMiddleware (payload do JWT)
    const { items } = req.body;

    const order = await orderService.checkout({ userId, items });
    return res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

async function myOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const orders = await orderService.getMyOrders(userId);
    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}

module.exports = { checkout, myOrders };