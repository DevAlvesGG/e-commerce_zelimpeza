const prisma = require('../../src/config/prismaClient');

async function cleanDatase() {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
}

module.exports = cleanDatase;