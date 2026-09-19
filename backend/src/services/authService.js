const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');
// -------------imports--------------

// POST /register

async function register({ name, email, password}) {
    // 1. Verifica se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if(existingUser) {
        const error = new Error('Email já cadastrado.');
        error.statusCode = 409; // Conflict
        throw error;
    }
    // // 2. Gera o hash da senha (nunca salvamos a senha original)
    const passwordHash = await bcrypt.hash(password, 10);// 10 = salt rounds (custo do hash)

    // 3. Cria o usuário no banco via Prisma
    const user = await prisma.user.create({
        data: { name, email, passwordHash  }
    })
    // 4. Retorna apenas dados seguros
    return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// POST /login 
async function login({ email, password }) {
    // 1. Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({where: { email }})
    if(!user) {
        const error = new Error('Credenciais inválidas.');
        error.statusCode = 401; // Unauthorized
        throw error;
    }
    // 2. Compara a senha enviada com o hash salvo
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if(!isPasswordValid) {
        const error = new Error('Credenciais inválidas.');
        error.statusCode = 401; // Unauthorized
        throw error;
    }
    // 3. Gera o token JWT contendo id, name e role
    const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    return { token };
}

module.exports = { register, login };