// Kutu içeriği kategorileri — TEK kaynak (panel sayfaları buradan okur).
// Backend enum'larıyla birebir aynı anahtarlar: models/Business.js,
// models/SurpriseBox.js, schemas/businessSchemas.js, schemas/boxSchemas.js
// short: çip etiketi · long: mağaza detayındaki madde imli liste satırı
export const MAX_CONTENTS = 2; // uygulamada karışık görünmesin

export const BOX_CONTENTS = [
  { key: 'unlu', short: 'Unlu Mamül', long: 'Unlu mamüller ve hamur işleri', emoji: '🍞' },
  { key: 'tatli', short: 'Tatlı & Pasta', long: 'Tatlılar ve dilim pastalar', emoji: '🍰' },
  { key: 'ekler', short: 'Ekler', long: 'Ekler ve sütlü tatlılar', emoji: '🥐' },
  { key: 'donut', short: 'Donut', long: 'Çeşitli soslu donutlar', emoji: '🍩' },
  { key: 'sandvic', short: 'Sandviç', long: 'Sandviç ve kahvaltılıklar', emoji: '🥪' },
  { key: 'sicak', short: 'Sıcak Yemek', long: 'Sıcak yemek seçenekleri', emoji: '🍲' },
  { key: 'sushi', short: 'Sushi', long: 'Taze sushi ve Asya mutfağı', emoji: '🍣' },
  { key: 'meze', short: 'Meze', long: 'Meze ve aperatifler', emoji: '🫒' },
  { key: 'manav', short: 'Manav', long: 'Mevsim taze meyve ve sebzeler', emoji: '🍎' },
  { key: 'sarkuteri', short: 'Şarküteri', long: 'Şarküteri ve süt ürünleri', emoji: '🧀' },
  { key: 'et', short: 'Et & Tavuk', long: 'Et ve tavuk ürünleri', emoji: '🥩' },
  { key: 'fastfood', short: 'Fast Food', long: 'Pizza, burger ve fast food', emoji: '🍕' },
  { key: 'glutensiz', short: 'Glutensiz', long: 'Glutensiz seçenekler', emoji: '🌾' },
  { key: 'vegan', short: 'Vegan', long: 'Vegan seçenekler', emoji: '🥦' },
  { key: 'karisik', short: 'Karışık', long: 'Karışık sürpriz içerik', emoji: '🎁' },
];
