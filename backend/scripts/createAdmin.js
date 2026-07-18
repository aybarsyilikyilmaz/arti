// Kullanım: node scripts/createAdmin.js admin@arti.dev "cok-guclu-sifre-12" [superadmin|operator]
// Admin hesapları yalnızca sunucu erişimi olan biri tarafından oluşturulabilir.
const env = require('../config/env');
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');

async function main() {
  const [email, password, role = 'operator'] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Kullanım: node scripts/createAdmin.js <email> <sifre> [superadmin|operator]');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('Admin şifresi en az 12 karakter olmalı.');
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);
  const existing = await AdminUser.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error('Bu e-posta ile bir admin zaten var.');
    process.exit(1);
  }
  const admin = await AdminUser.create({ email, password, role });
  console.log(`Admin oluşturuldu: ${admin.email} (${admin.role})`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err.message); process.exit(1); });
