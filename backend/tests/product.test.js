const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prismaClient');
const cleanDatabase = require('./helpers/cleanDatabase');
const createUserAndLogin = require('./helpers/createUserAndLogin');

describe('Produtos (/api/products)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/products', () => {
    it('deve retornar lista vazia quando não há produtos', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('deve retornar todos os produtos cadastrados', async () => {
      await prisma.product.createMany({
        data: [
          { name: 'Produto A', price: 10, stockQuantity: 5 },
          { name: 'Produto B', price: 20, stockQuantity: 3 },
        ],
      });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/products/:id', () => {
    it('deve retornar um produto existente', async () => {
      const product = await prisma.product.create({
        data: { name: 'Produto X', price: 15, stockQuantity: 10 },
      });

      const response = await request(app).get(`/api/products/${product.id}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Produto X');
    });

    it('deve retornar 404 para produto inexistente', async () => {
      const response = await request(app).get('/api/products/99999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Produto não encontrado.');
    });
  });

  describe('POST /api/products', () => {
    it('deve rejeitar criação sem token de autenticação', async () => {
      const response = await request(app).post('/api/products').send({
        name: 'Produto Sem Token',
        price: 10,
      });

      expect(response.status).toBe(401);
    });

    it('deve rejeitar criação de usuário client (sem permissão)', async () => {
      const { cookie } = await createUserAndLogin({ email: 'client@teste.com', role: 'client' });

      const response = await request(app)
        .post('/api/products')
        .set('Cookie', cookie)
        .send({ name: 'Produto Client', price: 10 });

      expect(response.status).toBe(403);
    });

    it('deve criar produto com sucesso quando admin', async () => {
      const { cookie } = await createUserAndLogin({ email: 'client@teste.com', role: 'admin' });

      const response = await request(app)
        .post('/api/products')
        .set('Cookie', cookie)
        .send({
          name: 'Produto Admin',
          description: 'Criado via teste',
          price: 99.9,
          stockQuantity: 15,
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Produto Admin');
      expect(response.body.stockQuantity).toBe(15);
    });

    it('deve rejeitar payload com campo desconhecido (proteção Zod)', async () => {
      const { cookie } = await createUserAndLogin({ email: 'client@teste.com', role: 'admin' });

      const response = await request(app)
        .post('/api/products')
        .set('Cookie', cookie)
        .send({
          name: 'Produto Errado',
          price: 10,
          stokQuantity: 5, // erro de digitação proposital
        });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar preço negativo', async () => {
      const { cookie } = await createUserAndLogin({ email: 'client@teste.com', role: 'admin' });

      const response = await request(app)
        .post('/api/products')
        .set('Cookie', cookie)
        .send({ name: 'Produto Preço Inválido', price: -10 });

      expect(response.status).toBe(400);
    });
  });
});