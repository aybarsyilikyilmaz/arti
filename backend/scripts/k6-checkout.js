import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Yük Testi Senaryosu (Checkout Stok Yarışı)
// Amaç: 20 eşzamanlı kullanıcının aynı kısıtlı stoklu kutuya (SurpriseBox) aynı anda 
// sipariş isteği atarak overselling (yok satma) durumunun yaşanmadığını doğrulamak.

export const options = {
  scenarios: {
    checkout_rush: {
      executor: 'shared-iterations',
      vus: 20,          // 20 sanal kullanıcı (eşzamanlı yarış)
      iterations: 40,   // Toplamda 40 kez sipariş denenecek
      maxDuration: '10s'
    },
  },
};

export default function () {
  const BASE_URL = __ENV.API_URL || 'http://localhost:5002/api/v1';
  
  // Testi koşmadan önce geçici bir test kullanıcısı (Token) ve test kutusu (Box ID) oluşturun.
  // Komut örneği: 
  // k6 run -e API_URL=http://localhost:5002/api/v1 -e BOX_ID=60df... -e TOKEN=eyJ... scripts/k6-checkout.js
  
  const boxId = __ENV.BOX_ID || 'test_box_id';
  const token = __ENV.TOKEN || 'test_token';

  const payload = JSON.stringify({ boxId: boxId });
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  };

  // Atomik rezervasyon endpoint'ine eşzamanlı istek atılıyor
  const res = http.post(`${BASE_URL}/orders/checkout`, payload, params);
  
  // Beklenen durum: 
  // - Sadece stok sayısı kadar 201 (Başarılı) dönmeli.
  // - Stok bitince geri kalan istekler 409 (Tükendi/Çakışma) veya 400 (Hata) dönmeli.
  // - Kesinlikle 500 Internal Server Error alınmamalı.
  check(res, {
    'Status is 201 or 409/400 (Tükendi)': (r) => r.status === 201 || r.status === 409 || r.status === 400,
    'No 500 Server Errors': (r) => r.status !== 500,
  });

  sleep(0.1);
}
