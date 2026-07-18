const { z } = require('zod');

// Yalnızca görsel türlerine izin verilir; boyut sınırı PUT tarafında (5mb)
const presignSchema = z.object({
  kind: z.enum(['logo', 'cover', 'box'], { message: 'Görsel türü logo, cover veya box olmalı.' }),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    message: 'Yalnızca JPEG, PNG veya WebP yüklenebilir.',
  }),
});

const setImagesSchema = z
  .object({
    logoUrl: z.string().url('Geçerli bir URL girin.').max(500).optional(),
    coverUrl: z.string().url('Geçerli bir URL girin.').max(500).optional(),
  })
  .refine((d) => d.logoUrl || d.coverUrl, { message: 'En az bir görsel URL\'i gönderin.' });

module.exports = { presignSchema, setImagesSchema };
