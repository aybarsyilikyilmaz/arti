const { z } = require('zod');

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// İşletmenin günlük kutu ilanı
const upsertBoxSchema = z
  .object({
    basePrice: z.number({ message: 'Taban Fiyat zorunludur.' }).positive('Fiyat pozitif olmalı.').max(100000),
    originalPrice: z.number({ message: 'Normal fiyat zorunludur.' }).positive().max(100000),
    initialStock: z.number({ message: 'Stok adedi zorunludur.' }).int().min(1, 'En az 1 kutu.').max(500),
    contents: z.array(z.enum(['unlu', 'sicak', 'meze', 'manav', 'karisik', 'vegan', 'tatli', 'sandvic', 'sarkuteri', 'et', 'glutensiz', 'fastfood', 'donut', 'ekler', 'sushi']))
      .min(1, 'En az bir içerik seçin.')
      .max(2, 'Uygulamada karışık görünmemesi için en fazla 2 içerik seçilebilir.'),
    pickupStart: z.string().regex(TIME_RE, 'Saat SS:DD biçiminde olmalı.'),
    pickupEnd: z.string().regex(TIME_RE, 'Saat SS:DD biçiminde olmalı.'),
  })
  .refine((d) => d.basePrice < d.originalPrice, {
    message: 'İndirimli fiyat normal fiyattan düşük olmalı.',
    path: ['basePrice'],
  })
  .refine((d) => d.pickupEnd > d.pickupStart, {
    message: 'Teslim bitiş saati başlangıçtan sonra olmalı.',
    path: ['pickupEnd'],
  });

// Konuma göre kutu arama (query parametreleri)
const nearbyQuerySchema = z.object({
  lng: z.coerce.number().min(-180).max(180).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  radiusKm: z.coerce.number().positive().max(50).default(10),
});

const checkoutSchema = z.object({
  boxId: z.string({ message: 'Kutu seçimi zorunludur.' }).regex(/^[0-9a-f]{24}$/i, 'Geçersiz kutu kimliği.'),
});

const verifyQrSchema = z.object({
  qrToken: z.string({ message: 'QR kodu zorunludur.' }).min(10).max(300),
});

module.exports = { upsertBoxSchema, nearbyQuerySchema, checkoutSchema, verifyQrSchema };
