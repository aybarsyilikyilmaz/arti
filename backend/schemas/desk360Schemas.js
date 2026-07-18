const { z } = require('zod');

// Desk360 cevap gövdesi: işletme eşleşmesi için chatId veya phone zorunlu
const webhookSchema = z
  .object({
    chatId: z.string().trim().max(100).optional(),
    phone: z.string().trim().max(20).optional(),
    message: z.string({ message: 'Mesaj metni zorunludur.' }).min(1).max(1000),
  })
  .refine((d) => d.chatId || d.phone, {
    message: 'chatId veya phone alanlarından biri zorunludur.',
    path: ['chatId'],
  });

module.exports = { webhookSchema };
