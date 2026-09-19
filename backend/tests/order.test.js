const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prismaClient');
const cleanDatabase = require('./helpers/cleanDatabase');
const createUserAndLogin = require('./helpers/createUserAndLogin');

describe('Pedidos (/api/orders)', () => {
  let clientToken;
  let product;

  beforeEach(async () => {
    await cleanDatabase();

    // Usuário client para todos os testes de checkout
    const { token } = await createUserAndLogin({ email: 'cliente@teste.com', role: 'client' });
    clientToken = token;

    // Produto base com estoque conhecido
    product = await prisma.product.create({
      data: { name: 'Produto Checkout', price: 50, stockQuantity: 5 },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/orders', () => {
    it('deve rejeitar checkout sem token de autenticação', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ items: [{ productId: product.id, quantity: 1 }] });

      expect(response.status).toBe(401);
    });

    it('deve rejeitar carrinho vazio', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ items: [] });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar checkout de produto inexistente', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ items: [{ productId: 999999, quantity: 1 }] });

      expect(response.status).toBe(404);
    });

    it('deve realizar checkout com sucesso e debitar o estoque', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ items: [{ productId: product.id, quantity: 2 }] });

      expect(response.status).toBe(201);
      expect(response.body.totalAmount).toBe('100'); // 2 x 50
      expect(response.body.status).toBe('paid');
      expect(response.body.orderItems).toHaveLength(1);
      expect(response.body.orderItems[0].unitPrice).toBe('50'); // preço histórico

      // Confirma que o estoque foi debitado de verdade no banco
      const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
      expect(updatedProduct.stockQuantity).toBe(3); // 5 - 2
    });

    it('deve rejeitar checkout com estoque insuficiente e NÃO alterar o estoque (rollback)', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ items: [{ productId: product.id, quantity: 9999 }] });

      expect(response.status).toBe(409);

      // Prova do rollback: o estoque deve continuar EXATAMENTE como estava antes
      const unchangedProduct = await prisma.product.findUnique({ where: { id: product.id } });
      expect(unchangedProduct.stockQuantity).toBe(5); // inalterado
    });

    it('deve calcular corretamente o total de um carrinho com múltiplos itens', async () => {
      const secondProduct = await prisma.product.create({
        data: { name: 'Segundo Produto', price: 30, stockQuantity: 10 },
      });

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          items: [
            { productId: product.id, quantity: 1 },      // 1 x 50 = 50
            { productId: secondProduct.id, quantity: 2 }, // 2 x 30 = 60
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.totalAmount).toBe('110'); // 50 + 60
      expect(response.body.orderItems).toHaveLength(2);
    });
  });

  describe('GET /api/orders/my-orders', () => {
    it('deve rejeitar sem token de autenticação', async () => {
      const response = await request(app).get('/api/orders/my-orders');
      expect(response.status).toBe(401);
    });

    it('deve retornar lista vazia quando o usuário não tem pedidos', async () => {
      const response = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('deve retornar apenas os pedidos do usuário autenticado (não de outros)', async () => {
      // Pedido do cliente principal
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ items: [{ productId: product.id, quantity: 1 }] });

      // Um segundo usuário, sem pedidos
      const { token: otherToken } = await createUserAndLogin({ email: 'outro@teste.com', role: 'client' });

      const response = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]); // o outro usuário não deve ver o pedido do primeiro
    });
  });

    describe('Concorrência no Checkout (race condition)', () => {
    it('deve permitir apenas UMA compra bem-sucedida quando duas requisições simultâneas disputam a última unidade em estoque', async () => {
        // Produto com apenas 1 unidade — o "prêmio" que os dois clientes vão disputar
        const scarceProduct = await prisma.product.create({
        data: { name: 'Produto Escasso', price: 100, stockQuantity: 1 },
        });

        // Dois clientes diferentes, tentando comprar a mesma unidade ao mesmo tempo
        const { token: tokenA } = await createUserAndLogin({ email: 'clienteA@teste.com', role: 'client' });
        const { token: tokenB } = await createUserAndLogin({ email: 'clienteB@teste.com', role: 'client' });

        const checkoutPayload = { items: [{ productId: scarceProduct.id, quantity: 1 }] };

        // Promise.all dispara as duas requisições "ao mesmo tempo", sem esperar uma terminar
        const [responseA, responseB] = await Promise.all([
        request(app).post('/api/orders').set('Authorization', `Bearer ${tokenA}`).send(checkoutPayload),
        request(app).post('/api/orders').set('Authorization', `Bearer ${tokenB}`).send(checkoutPayload),
        ]);

        const statuses = [responseA.status, responseB.status].sort();

        // Uma das duas deve ter sucesso (201), a outra deve falhar por estoque insuficiente (409)
        expect(statuses).toEqual([201, 409]);

        // Prova definitiva: o estoque final deve ser 0, NUNCA negativo
        const finalProduct = await prisma.product.findUnique({ where: { id: scarceProduct.id } });
        expect(finalProduct.stockQuantity).toBe(0);
    });
    });
});