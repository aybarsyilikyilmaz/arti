const { z } = require('zod');

// Yalnızca görsel türlerine izin verilir; boyut sınırı PUT tarafında (5mb)
const presignSchema = z.object({
  kind: z.enum(['logo', 'cover', 'box', 'detail'], { message: 'Görsel türü logo, cover, box veya detail olmalı.' }),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    message: 'Yalnızca JPEG, PNG veya WebP yüklenebilir.',
  }),
});

const setImagesSchema = z
  .object({
    logoUrl: z.string().url('Geçersiz URL.').max(500).optional(),
    coverUrl: z.string().url('Geçersiz URL.').max(500).optional(),
    detailUrl: z.string().url('Geçersiz URL.').max(500).optional(),
  })
  .refine((data) => data.logoUrl || data.coverUrl || data.detailUrl, {
    message: 'En az bir görsel URL\'si (logoUrl, coverUrl veya detailUrl) gönderilmelidir.',
  });

module.exports = { presignSchema, setImagesSchema };
