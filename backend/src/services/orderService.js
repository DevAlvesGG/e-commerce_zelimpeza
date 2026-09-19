const prisma = require('../config/prismaClient');

//REVISAR FUNCTION
async function checkout({ userId, items }) {
  if (!items || items.length === 0) {
    const error = new Error('O carrinho não pode estar vazio.');
    error.statusCode = 400;
    throw error;
  }

  // prisma.$transaction abre a transação (BEGIN) e faz COMMIT automático
  // ao final do callback, OU ROLLBACK automático se qualquer erro for lançado.
  const order = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        const error = new Error('Cada item deve ter productId e quantity (> 0) válidos.');
        error.statusCode = 400;
        throw error;
      }

      // SELECT ... FOR UPDATE: trava a linha do produto até o fim da transação,
      // impedindo que outra compra simultânea leia um estoque desatualizado.
      const rows = await tx.$queryRaw`
        SELECT id, price, stock_quantity
        FROM products
        WHERE id = ${productId}
        FOR UPDATE
      `;

      const product = rows[0];

      if (!product) {
        const error = new Error(`Produto ${productId} não encontrado.`);
        error.statusCode = 404;
        throw error;
      }

      if (product.stock_quantity < quantity) {
        const error = new Error(
          `Estoque insuficiente para o produto "${productId}". Disponível: ${product.stock_quantity}, solicitado: ${quantity}.`
        );
        error.statusCode = 409; // Conflict
        throw error; // lançar aqui reverte TUDO que já foi feito na transação até agora
      }

      const unitPrice = Number(product.price);
      const subtotal = unitPrice * quantity;
      totalAmount += subtotal;

      // Debita o estoque
      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: { decrement: quantity } },
      });

      orderItemsData.push({
        productId,
        quantity,
        unitPrice, // preço histórico, "congelado" no momento da compra
      });
    }

    // Cria o pedido e os itens do pedido em uma única escrita (nested write do Prisma)
    const createdOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: 'paid', // simplificação: consideramos pago no momento do checkout
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });

    return createdOrder;
  });

  return order;
}

async function getMyOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { checkout, getMyOrders };