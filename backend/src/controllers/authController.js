const authService = require('../services/authService');

async function register(req, res , next) {
    try {
        const { name, email, password } = req.body;
        
        if(!name || !email || !password) {
            return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' })
        }

        const user = await authService.register({ name, email, password });
        return res.status(201).json(user)
    }catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        
        if(!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' })
        }

        const result = await authService.login({ email, password });
        return res.status(200).json(result);

    }catch (error) {
        next(error);
    }
}

module.exports = { register, login };