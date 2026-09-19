const { z } = require('zod');

    const registerSchema = z.object({
        name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
        email: z.string().email('E-mail inválido'),
        password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
    }).strict(); //rejeita campos extra, como 'role'

    const loginSchema = z.object({
        email: z.string().email('E-mail inválido'),
        password: z.string().min(1, 'Senha é obrigatória')
    }).strict();


module.exports = { registerSchema, loginSchema };