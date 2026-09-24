const request = require('supertest');
const app = require('../src/app.js');
const prisma = require('../src/config/prismaClient');
const cleanDatabase = require('./helpers/cleanDatabase.js');

describe('Autenticação (/api/auth)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Gustavo Teste',
          email: 'gustavo@teste.com',
          password: '123456',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('gustavo@teste.com');
      expect(response.body.role).toBe('client');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('deve rejeitar registro com e-mail duplicado', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Usuario 1',
        email: 'duplicado@teste.com',
        password: '123456',
      });

      const response = await request(app).post('/api/auth/register').send({
        name: 'Usuario 2',
        email: 'duplicado@teste.com',
        password: '123456',
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email já cadastrado.');
    });

    it('deve rejeitar registro com campo desconhecido (role)', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Hacker',
        email: 'hacker@teste.com',
        password: '123456',
        role: 'admin',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Login Teste',
        email: 'login@teste.com',
        password: '123456',
      });
    });

    it('deve autenticar com credenciais válidas e retornar um token', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@teste.com',
        password: '123456',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
+     expect(response.headers['set-cookie']).toBeDefined();

    });

    it('deve rejeitar login com senha incorreta', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@teste.com',
        password: 'senha_errada',
      });

      expect(response.status).toBe(401);
    });

    it('deve rejeitar login com e-mail inexistente', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'naoexiste@teste.com',
        password: '123456',
      });

      expect(response.status).toBe(401);
    });
  });
});