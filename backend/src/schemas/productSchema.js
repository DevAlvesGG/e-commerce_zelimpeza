const { z } = require('zod');

    const createProductSchema = z.object({
        name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
        description: z.string().optional(),
        price: z.number().nonnegative('Preço não pode ser negativo'),
        stockQuantity: z.number().int().nonnegative('Estoque não pode ser negativo').optional(),
        imageUrl: z.string().url('URL de imagem inválida').optional().nullable(),
    }).strict(); 

module.exports = { createProductSchema };