// Desk360 WhatsApp gönderim katmanı (PLAN.md §3.4).
// DESK360_API_URL tanımlı değilse simülatör modu: mesaj yalnızca loglanır.
// Gerçek API dokümantasyonu geldiğinde yalnızca bu dosya güncellenir.
const env = require('../config/env');
const logger = require('../utils/logger');

const DAILY_PROMPT =
  'Merhaba! 🌱 Bugün gün sonunda fazladan paketiniz olacak mı? ' +
  'Varsa sadece sayıyı yazmanız yeterli (örn: 5). — Artı';

async function sendDailyPrompt(business) {
  if (!env.desk360ApiUrl) {
    logger.info(
      { business: business.name, phone: business.whatsappPhone, chatId: business.desk360ChatId },
      '[desk360-simülatör] Günlük WhatsApp sorusu gönderildi'
    );
    return { ok: true, simulated: true };
  }

  const res = await fetch(`${env.desk360ApiUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.desk360ApiKey}`,
    },
    body: JSON.stringify({
      chatId: business.desk360ChatId,
      phone: business.whatsappPhone,
      text: DAILY_PROMPT,
    }),
  });

  if (!res.ok) {
    logger.error({ business: business.name, status: res.status }, 'Desk360 gönderim hatası');
    return { ok: false };
  }
  return { ok: true };
}

module.exports = { sendDailyPrompt, DAILY_PROMPT };
