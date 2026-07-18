// Ödeme sağlayıcı seçimi (adapter pattern, PLAN.md §3.2).
// Her sağlayıcı aynı arayüzü uygular:
//   initCheckout(order)  -> { paymentRef, paymentPageUrl }
//   verifyResult(token)  -> { ok, paymentRef }   (sunucudan sunucuya teyit)
//   refund(order)        -> { ok }
// iyzico anahtarları temin edilince iyzicoProvider eklenir; kod tarafında
// yalnızca PAYMENT_PROVIDER env değeri değişir.
const env = require('../../config/env');
const mockProvider = require('./mockProvider');

const providers = { mock: mockProvider };

const provider = providers[env.paymentProvider];
if (!provider) {
  throw new Error(`Bilinmeyen ödeme sağlayıcı: ${env.paymentProvider}`);
}

module.exports = provider;
