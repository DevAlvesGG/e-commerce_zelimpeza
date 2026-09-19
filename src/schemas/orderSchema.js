const { z } = require('zod');

const checkoutSchema = z.object({
    items: z.array(
        z.object({
            productId: z.number().int().positive('productId deve ser um numero positivo'),
            quantity: z.number().int().positive('quantity deve ser maior que zero')
        }).strict()
    )
    .min(1, 'O carrinho não pode estar vazio'),
}).strict();

module.exports = { checkoutSchema }