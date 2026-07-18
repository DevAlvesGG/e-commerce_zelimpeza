const { Router } = require('express');
const routes = Router();
const authController = require('../controllers/authController');

routes.post('/register', authController.register);
routes.post('/login', authController.login);

module.exports = routes;