const { z } = require('zod');

const registerSchema = z.object({
  name: z.string({ message: 'İsim zorunludur.' }).trim()
    .min(2, 'İsim en az 2 karakter olmalı.')
    .max(80, 'İsim en fazla 80 karakter olabilir.'),
  email: z.string({ message: 'E-posta zorunludur.' }).trim().toLowerCase()
    .email('Geçerli bir e-posta adresi girin.'),
  phone: z.string().trim().regex(/^[0-9+()\s-]{7,20}$/, 'Geçerli bir telefon numarası girin.').optional(),
  password: z.string({ message: 'Şifre zorunludur.' })
    .min(8, 'Şifre en az 8 karakter olmalı.')
    .max(128, 'Şifre en fazla 128 karakter olabilir.'),
  kvkkConsent: z.literal(true, { message: 'KVKK aydınlatma metnini onaylamanız gerekir.' }),
});

const loginSchema = z.object({
  email: z.string({ message: 'E-posta zorunludur.' }).trim().toLowerCase()
    .email('Geçerli bir e-posta adresi girin.'),
  password: z.string({ message: 'Şifre zorunludur.' }).min(1, 'Şifre zorunludur.').max(128),
});

module.exports = { registerSchema, loginSchema };
