// Favori işletme kutu yayınladığında kullanıcılara uygulama içi bildirim üretir.
// Kutu yayınlayan hiçbir akış bildirim hatasıyla KESİLMEZ — hata yalnızca loglanır.
const User = require('../models/User');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

async function notifyBoxPublished(business, box) {
  const fans = await User.find({ favorites: business._id }).select('_id');
  if (fans.length === 0) return 0;

  const price = box.price != null ? ` ${box.price} TL` : '';
  await Notification.insertMany(
    fans.map((u) => ({
      user: u._id,
      type: 'BOX_PUBLISHED',
      business: business._id,
      box: box._id,
      title: `${business.name} bugün kutu yayınladı!`,
      body: `Sürpriz kutu${price} — tükenmeden kap${box.pickupStart ? ` (teslim ${box.pickupStart}-${box.pickupEnd || ''})` : ''}.`,
    })),
    { ordered: false }
  );
  return fans.length;
}

// Yayın akışlarından çağrılan güvenli sarmalayıcı (fire-and-forget)
function notifyBoxPublishedSafe(business, box) {
  notifyBoxPublished(business, box)
    .then((n) => { if (n > 0) logger.info({ business: business.name, notified: n }, 'Kutu bildirimi gönderildi'); })
    .catch((err) => logger.error({ err, business: business?.name }, 'Kutu bildirimi üretilemedi'));
}

module.exports = { notifyBoxPublished, notifyBoxPublishedSafe };
