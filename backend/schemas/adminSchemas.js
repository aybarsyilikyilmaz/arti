const { z } = require('zod');

const loginSchema = z.object({
  email: z.string({ message: 'E-posta zorunludur.' }).trim().toLowerCase().email('Geçerli bir e-posta girin.'),
  password: z.string({ message: 'Şifre zorunludur.' }).min(1).max(128),
});

const listBusinessesQuerySchema = z.object({
  status: z.enum(['PENDING_APPROVAL', 'APPROVED', 'SUSPENDED']).optional(),
  hasPendingUpdates: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const listOutreachQuerySchema = z.object({
  status: z.enum(['SENT', 'REPLIED', 'PENDING_REVIEW', 'FALLBACK_PUBLISHED', 'DISMISSED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const applyOutreachSchema = z.object({
  count: z.number({ message: 'Kutu adedi zorunludur.' }).int().min(1, 'En az 1.').max(200, 'En fazla 200.'),
});

// --- İşletme Detay (admin müdahale) şemaları ---

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHONE_RE = /^[0-9+()\s-]{7,20}$/;
const BOX_KEYS = ['unlu', 'sicak', 'meze', 'manav', 'karisik', 'vegan', 'tatli', 'sandvic', 'sarkuteri', 'et', 'glutensiz', 'fastfood', 'donut', 'ekler', 'sushi'];

// İşletme profileSchema'sının süper kümesi: admin yasal alanlara da dokunabilir.
// IBAN bilinçli olarak dışarıda — bu fazda admin yalnızca görüntüler.
const adminUpdateBusinessSchema = z
  .object({
    name: z.string().trim().min(2, 'İşletme adı en az 2 karakter olmalı.').max(120).optional(),
    branchName: z.string().trim().max(120).optional(),
    businessType: z.enum(['restoran', 'firin', 'market', 'kafe', 'manav', 'kasap', 'otel', 'diger']).optional(),
    branchType: z.enum(['tek', 'zincir']).optional(),
    legalName: z.string().trim().max(200).optional(),
    taxOffice: z.string().trim().max(100).optional(),
    taxNumber: z.string().trim().regex(/^\d{10,11}$/, 'Vergi numarası 10 (VKN) veya 11 (TCKN) haneli olmalı.').optional(),
    mersisNumber: z.string().trim().max(30).optional(),
    address: z.string().trim().min(5, 'Adres en az 5 karakter olmalı.').max(500).optional(),
    mapsUrl: z.string().trim().max(500).optional(),
    phone: z.string().trim().regex(PHONE_RE, 'Geçerli bir telefon numarası girin.').optional(),
    contactName: z.string().trim().max(120).optional(),
    contactPhone: z.string().trim().max(20).optional(),
    whatsappPhone: z.string().trim().max(20).optional(),
    description: z.string().trim().max(500, 'Açıklama en fazla 500 karakter olabilir.').optional(),
    defaultPackageCount: z.number().int().min(0).max(200).optional(),
    defaultPrice: z.number().min(1).max(100000).optional(),
    defaultOriginalPrice: z.number().min(1).max(100000).optional(),
    pickupStart: z.string().regex(TIME_RE, 'Saat SS:DD formatında olmalı.').optional(),
    pickupEnd: z.string().regex(TIME_RE, 'Saat SS:DD formatında olmalı.').optional(),
    boxContents: z.array(z.enum(BOX_KEYS)).max(2, 'En fazla 2 kutu içeriği seçilebilir.').optional(),
    commissionRate: z.number().min(0, 'Negatif olamaz.').max(50, 'En fazla %50.').optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Güncellenecek alan yok.' })
  .refine((d) => !(d.pickupStart && d.pickupEnd) || d.pickupStart < d.pickupEnd, {
    message: 'Teslim bitişi başlangıçtan sonra olmalı.',
  })
  .refine((d) => !(d.defaultPrice && d.defaultOriginalPrice) || d.defaultPrice < d.defaultOriginalPrice, {
    message: 'İndirimli fiyat, orijinal fiyattan küçük olmalı.',
  });

const adminCreateBusinessSchema = z.object({
  name: z.string({ message: 'İşletme adı zorunludur.' }).trim().min(2, 'İşletme adı en az 2 karakter olmalı.').max(120),
  email: z.string({ message: 'E-posta zorunludur.' }).trim().toLowerCase().email('Geçerli bir e-posta adresi girin.'),
  password: z.string({ message: 'Şifre zorunludur.' }).min(8, 'Şifre en az 8 karakter olmalı.'),
  branchName: z.string().trim().max(120).optional(),
  businessType: z.enum(['restoran', 'firin', 'market', 'kafe', 'manav', 'kasap', 'otel', 'diger']).default('restoran'),
  branchType: z.enum(['tek', 'zincir']).default('tek'),
  legalName: z.string().trim().max(200).optional(),
  taxOffice: z.string().trim().max(100).optional(),
  taxNumber: z.string().trim().regex(/^\d{10,11}$/, 'Vergi numarası 10 (VKN) veya 11 (TCKN) haneli olmalı.').optional(),
  mersisNumber: z.string().trim().max(30).optional(),
  address: z.string({ message: 'Adres zorunludur.' }).trim().min(5, 'Adres en az 5 karakter olmalı.').max(500),
  mapsUrl: z.string().trim().max(500).optional(),
  phone: z.string({ message: 'İşletme telefonu zorunludur.' }).trim().regex(PHONE_RE, 'Geçerli bir telefon numarası girin.'),
  contactName: z.string().trim().max(120).optional(),
  contactPhone: z.string().trim().max(20).optional(),
  whatsappPhone: z.string().trim().max(20).optional(),
  description: z.string().trim().max(500).optional(),
  defaultPackageCount: z.number().int().min(0).max(200).optional(),
  defaultPrice: z.number().min(1).max(100000).optional(),
  defaultOriginalPrice: z.number().min(1).max(100000).optional(),
  pickupStart: z.string().regex(TIME_RE, 'Saat SS:DD formatında olmalı.').optional(),
  pickupEnd: z.string().regex(TIME_RE, 'Saat SS:DD formatında olmalı.').optional(),
  boxContents: z.array(z.enum(BOX_KEYS)).max(2, 'En fazla 2 kutu içeriği seçilebilir.').optional(),
  commissionRate: z.number().min(0, 'Negatif olamaz.').max(50, 'En fazla %50.').optional(),
});

const listBusinessOrdersQuerySchema = z.object({
  status: z.enum(['RESERVED', 'PAID', 'PICKED_UP', 'EXPIRED', 'REFUNDED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Stok/fiyat müdahalesi: remaining hedef değerdir, controller atomik delta uygular
const adminBoxPatchSchema = z
  .object({
    basePrice: z.number().min(1, 'En az 1 TL.').max(100000).optional(),
    remaining: z.number().int().min(0, 'Negatif olamaz.').max(500, 'En fazla 500.').optional(),
  })
  .refine((d) => d.basePrice !== undefined || d.remaining !== undefined, {
    message: 'basePrice veya remaining alanlarından en az biri gerekli.',
  });

const payoutStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'PAID', 'FAILED'], { message: 'Geçersiz hakediş durumu.' }),
  reference: z.string().trim().max(120, 'Dekont referansı en fazla 120 karakter.').optional(),
});

// --- Platform geneli (Dashboard / Siparişler / Kullanıcılar / Finans / Yorumlar) ---

const listAllOrdersQuerySchema = z.object({
  status: z.enum(['RESERVED', 'PAID', 'PICKED_UP', 'EXPIRED', 'REFUNDED']).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const listUsersQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  banned: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createPayoutSchema = z.object({
  businessId: z.string({ message: 'İşletme kimliği zorunludur.' }).regex(/^[a-f0-9]{24}$/i, 'Geçersiz işletme kimliği.'),
  reference: z.string().trim().max(120, 'Dekont referansı en fazla 120 karakter.').optional(),
});

const listReviewsQuerySchema = z.object({
  maxRating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const adminUpdateEmployeeSchema = z
  .object({
    allowedPages: z.array(z.string().trim().max(50)).max(20).optional(),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalı.').max(128).optional(),
  })
  .refine((d) => d.allowedPages !== undefined || d.password !== undefined, {
    message: 'Güncellenecek alan yok.',
  });

module.exports = {
  loginSchema,
  listBusinessesQuerySchema,
  adminUpdateBusinessSchema,
  listBusinessOrdersQuerySchema,
  adminBoxPatchSchema,
  payoutStatusSchema,
  adminUpdateEmployeeSchema,
  listAllOrdersQuerySchema,
  listUsersQuerySchema,
  createPayoutSchema,
  listReviewsQuerySchema,
  adminCreateBusinessSchema,
};
