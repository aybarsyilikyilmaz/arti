// Tüm iş kuralları Europe/Istanbul gününe göre çalışır (sunucu UTC olabilir).
// 'sv-SE' locale'i YYYY-MM-DD formatı ürettiği için tercih edildi.
const IST_DAY = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' });

function todayIstanbul() {
  return IST_DAY.format(new Date()); // "2026-07-16"
}

const IST_HM = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Istanbul',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function nowIstanbulHM() {
  return IST_HM.format(new Date()); // "14:23"
}

// "18:00" gibi bir pickup saatine İstanbul saatiyle kaç dakika kaldığını döner.
// Saat geçtiyse negatif döner; gece yarısını aşan durumlar kapsam dışıdır
// (kutular aynı gün içinde teslim edilir).
function minutesUntilIstanbul(hm) {
  const [h1, m1] = String(hm).split(':').map(Number);
  const [h0, m0] = nowIstanbulHM().split(':').map(Number);
  return h1 * 60 + m1 - (h0 * 60 + m0);
}

module.exports = { todayIstanbul, nowIstanbulHM, minutesUntilIstanbul };
