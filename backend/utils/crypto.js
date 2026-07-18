// KVKK field-level şifreleme (AES-256-GCM) + HMAC yardımcıları (PLAN.md §6-7)
const crypto = require('crypto');
const env = require('../config/env');

const ALG = 'aes-256-gcm';
const PREFIX = 'enc:v1:'; // format sürümü — anahtar rotasyonunda ayırt etmek için

// Düz metni "enc:v1:<iv>:<tag>:<cipher>" formatında şifreler
function encryptField(plain) {
  if (plain == null || plain === '') return plain;
  if (typeof plain === 'string' && plain.startsWith(PREFIX)) return plain; // zaten şifreli
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, env.encryptionKey, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

function decryptField(payload) {
  if (payload == null || payload === '' || !String(payload).startsWith(PREFIX)) return payload;
  const [ivHex, tagHex, dataHex] = String(payload).slice(PREFIX.length).split(':');
  const decipher = crypto.createDecipheriv(ALG, env.encryptionKey, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
}

// HMAC-SHA256 (webhook imzaları ve QR token imzası)
function hmacSign(data) {
  return crypto.createHmac('sha256', env.webhookSecret).update(data).digest('hex');
}

function hmacVerify(data, signature) {
  const expected = hmacSign(data);
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Refresh token'lar DB'de yalnızca hash olarak tutulur
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// Tek kullanımlık, imzalı QR verisi: "<orderId>.<nonce>.<imza>"
function makeQrToken(orderId) {
  const body = `${orderId}.${crypto.randomBytes(16).toString('hex')}`;
  return `${body}.${hmacSign(body)}`;
}

function verifyQrToken(qrToken) {
  const parts = String(qrToken || '').split('.');
  if (parts.length !== 3) return false;
  return hmacVerify(`${parts[0]}.${parts[1]}`, parts[2]);
}

module.exports = { encryptField, decryptField, hmacSign, hmacVerify, sha256, makeQrToken, verifyQrToken };
