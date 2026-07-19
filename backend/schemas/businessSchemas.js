const { z } = require('zod');

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHONE_RE = /^[0-9+()\s-]{7,20}$/;

const optionalTrimmed = (max) => z.string().trim().max(max).optional();

const registerSchema = z
  .object({
    // Adım 1 — İşletme profili
    name: z.string({ message: 'İşletme adı zorunludur.' }).trim()
      .min(2, 'İşletme adı en az 2 karakter olmalı.')
      .max(120, 'İşletme adı en fazla 120 karakter olabilir.'),
    businessType: z.enum(['restoran', 'firin', 'market', 'kafe', 'manav', 'kasap', 'otel', 'diger'], {
      message: 'Geçersiz işletme türü.',
    }),
    branchType: z.enum(['tek', 'zincir']).default('tek'),

    // Adım 2 — Yasal & iletişim
    legalName: optionalTrimmed(200),
    taxOffice: optionalTrimmed(100),
    taxNumber: z.string().trim().regex(/^\d{10,11}$/, 'Vergi numarası 10 (VKN) veya 11 (TCKN) haneli olmalı.').optional(),
    mersisNumber: optionalTrimmed(30),
    city: optionalTrimmed(60),
    district: optionalTrimmed(60),
    neighborhood: optionalTrimmed(80),
    address: z.string({ message: 'Adres zorunludur.' }).trim()
      .min(5, 'Adres en az 5 karakter olmalı.')
      .max(500, 'Adres en fazla 500 karakter olabilir.'),
    phone: z.string({ message: 'İşletme telefonu zorunludur.' }).trim()
      .regex(PHONE_RE, 'Geçerli bir telefon numarası girin.'),
    contactName: optionalTrimmed(120),
    contactRole: z.enum(['sahibi', 'mudur', 'operasyon', 'diger']).default('sahibi'),
    contactPhone: z.string().trim().regex(PHONE_RE, 'Geçerli bir yetkili telefonu girin.').optional(),

    // Adım 3 — Kurtarma ayarları
    dailyBoxCount: z.enum(['1-2', '3-5', '6-10', '10+']).default('1-2'),
    boxContents: z.array(z.enum(['unlu', 'sicak', 'meze', 'manav', 'karisik', 'vegan', 'tatli', 'sandvic', 'sarkuteri', 'et', 'glutensiz', 'fastfood']))
      .max(2, 'En fazla 2 kutu içeriği seçilebilir.').default([]),
    pickupStart: z.string().regex(TIME_RE, 'Saat SS:DD biçiminde olmalı.').optional(),
    pickupEnd: z.string().regex(TIME_RE, 'Saat SS:DD biçiminde olmalı.').optional(),

    // Adım 4 — Hesap
    email: z.string({ message: 'E-posta zorunludur.' }).trim().toLowerCase()
      .email('Geçerli bir e-posta adresi girin.'),
    password: z.string({ message: 'Şifre zorunludur.' })
      .min(8, 'Şifre en az 8 karakter olmalı.')
      .max(128, 'Şifre en fazla 128 karakter olabilir.'),

    // Harita konumu (opsiyonel): [boylam, enlem]
    coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]).optional(),

    // KVKK açık rıza (PLAN.md §7)
    kvkkConsent: z.literal(true, { message: 'KVKK aydınlatma metnini onaylamanız gerekir.' }),
  })
  .refine(
    (d) => !d.pickupStart || !d.pickupEnd || d.pickupEnd > d.pickupStart,
    { message: 'Teslim bitiş saati başlangıçtan sonra olmalı.', path: ['pickupEnd'] }
  );

const loginSchema = z.object({
  email: z.string({ message: 'E-posta zorunludur.' }).trim().toLowerCase()
    .email('Geçerli bir e-posta adresi girin.'),
  password: z.string({ message: 'Şifre zorunludur.' }).min(1, 'Şifre zorunludur.').max(128),
});

module.exports = { registerSchema, loginSchema };

// Panel ayarları — HH:MM saat formatı, mantık kuralları zod'da (PLAN.md §6.8)
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const profileSchema = z
  .object({
    defaultPackageCount: z.number().int().min(0, 'Negatif olamaz.').max(200, 'En fazla 200.').optional(),
    defaultPrice: z.number().min(1, 'En az 1 TL.').max(100000).optional(),
    defaultOriginalPrice: z.number().min(1, 'En az 1 TL.').max(100000).optional(),
    pickupStart: z.string().regex(HHMM, 'Saat SS:DD formatında olmalı.').optional(),
    pickupEnd: z.string().regex(HHMM, 'Saat SS:DD formatında olmalı.').optional(),
    whatsappPhone: z.string().trim().max(20).optional(),
    contactPhone: z.string().trim().max(20).optional(),
    boxContents: z.array(z.enum(['unlu', 'sicak', 'meze', 'manav', 'karisik', 'vegan', 'tatli', 'sandvic', 'sarkuteri', 'et', 'glutensiz', 'fastfood']))
      .max(2, 'En fazla 2 kutu içeriği seçilebilir.').optional(),
    description: z.string().trim().max(500, 'Açıklama en fazla 500 karakter olabilir.').optional(),
  })
  .refine((d) => !(d.pickupStart && d.pickupEnd) || d.pickupStart < d.pickupEnd, {
    message: 'Teslim bitişi başlangıçtan sonra olmalı.',
  })
  .refine((d) => !(d.defaultPrice && d.defaultOriginalPrice) || d.defaultPrice < d.defaultOriginalPrice, {
    message: 'İndirimli fiyat, normal fiyattan düşük olmalı.',
  });

module.exports.profileSchema = profileSchema;
