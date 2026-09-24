const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/prismaClient');

/**
 * Cria um usuário direto no banco (com senha já hasheada) e faz login
 * pela rota real, retornando o token pronto para uso nos testes.
 */
async function createUserAndLogin({ name = 'Usuário Teste', email, password = '123456', role = 'client' }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  const loginResponse = await request(app).post('/api/auth/login').send({ email, password });
  const cookie = loginResponse.headers['set-cookie'];

  return { user, cookie };
}

module.exports = createUserAndLogin;