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

        const { token, user } = await authService.login({ email, password })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS obrigatório em produção
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 dia, em milissegundos
        })

        return res.status(200).json({ user })

    }catch (error) {
        next(error);
    }
}

function logout(req, res) {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logout realizado com sucesso.'})
}

function me(req, res) {
   // req.user já foi populado pelo authMiddleware, a partir do cookie validado
   return res.status(200).json({ user: req.user });

}

module.exports = { register, login, logout, me };