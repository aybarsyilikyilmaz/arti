// Geliştirme/test sağlayıcısı — gerçek para hareketi yoktur.
// Ödeme sayfası yerine bir referans döner; test akışında
// /api/v1/webhooks/payment ucuna HMAC imzalı sonuç POST edilerek tamamlanır.
const crypto = require('crypto');

// initCheckout: gerçek sağlayıcıda burada ödeme oturumu açılır
async function initCheckout(order) {
  const paymentRef = `mock_${order._id}_${crypto.randomBytes(8).toString('hex')}`;
  return {
    paymentRef,
    paymentPageUrl: `https://odeme.arti.local/mock/${paymentRef}`,
  };
}

// verifyResult: gerçek sağlayıcıda "client başarılı dedi"ye güvenilmez,
// sunucudan sunucuya sorgu yapılır. Mock'ta webhook imzası bu görevi görür.
async function verifyResult(paymentRef) {
  return { ok: typeof paymentRef === 'string' && paymentRef.startsWith('mock_'), paymentRef };
}

async function refund(_order) {
  return { ok: true };
}

module.exports = { name: 'mock', initCheckout, verifyResult, refund };
