const { z } = require('zod');

const summaryQuerySchema = z.object({
  days: z.coerce.number().int().min(1, 'En az 1 gün.').max(30, 'En fazla 30 gün.').default(7),
});

module.exports = { summaryQuerySchema };
