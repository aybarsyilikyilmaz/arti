// k6 yük testi — checkout senaryosu (PLAN.md Faz 3, DEPLOY.md §9).
// Node ile DEĞİL, k6 ile koşulur:
//   K6_BASE=http://localhost:5002 K6_TOKEN=<user-jwt> K6_BOX_ID=<kutu-id> k6 run scripts/loadtest-checkout.js
// Gerçek sipariş üretir — üretim verisiyle değil, staging/test kutusuyla koş.
// 409 (stok tükendi) hata sayılmaz: atomik rezervasyonun beklenen cevabıdır.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.K6_BASE || 'http://localhost:5002';
const TOKEN = __ENV.K6_TOKEN || '';
const BOX_ID = __ENV.K6_BOX_ID || '';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // rampa: 0 → 50 sanal kullanıcı
    { duration: '1m', target: 50 },  // sabit yük
    { duration: '15s', target: 0 },  // soğuma
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // hedef: p95 < 500 ms
    checks: ['rate>0.99'],            // hata oranı < %1
  },
};

export default function () {
  if (!TOKEN || !BOX_ID) {
    // Token verilmemişse yalnızca healthz ile altyapı ölçülür
    const res = http.get(`${BASE}/healthz`);
    check(res, { 'healthz 200': (r) => r.status === 200 });
  } else {
    const res = http.post(
      `${BASE}/api/v1/orders/checkout`,
      JSON.stringify({ boxId: BOX_ID }),
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` } }
    );
    check(res, {
      // 201 rezervasyon, 409 tükendi, 429 rate limit — hepsi doğru davranış
      'checkout beklenen durum': (r) => [200, 201, 409, 429].includes(r.status),
    });
  }
  sleep(1);
}
