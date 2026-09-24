const { Router } = require('express');
const validate = require('../middleware/validate');
const routes = Router();
const authController = require('../controllers/authController');
const { registerSchema, loginSchema } = require('../schemas/authSchema');

routes.post('/register', validate(registerSchema), authController.register);
routes.post('/login', validate(loginSchema), authController.login);
routes.post('/logout', authController.logout)

module.exports = routes;