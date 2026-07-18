const { z } = require('zod');

const loginSchema = z.object({
  email: z.string({ message: 'E-posta zorunludur.' }).trim().toLowerCase().email('Geçerli bir e-posta girin.'),
  password: z.string({ message: 'Şifre zorunludur.' }).min(1).max(128),
});

const listBusinessesQuerySchema = z.object({
  status: z.enum(['PENDING_APPROVAL', 'APPROVED', 'SUSPENDED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const listOutreachQuerySchema = z.object({
  status: z.enum(['SENT', 'REPLIED', 'PENDING_REVIEW', 'FALLBACK_PUBLISHED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const applyOutreachSchema = z.object({
  count: z.number({ message: 'Kutu adedi zorunludur.' }).int().min(1, 'En az 1.').max(200, 'En fazla 200.'),
});

module.exports = { loginSchema, listBusinessesQuerySchema, listOutreachQuerySchema, applyOutreachSchema };
