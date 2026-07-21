// Zamanlanmış işler (PLAN.md §1, §3.4).
// REDIS_URL tanımlıysa BullMQ kullanılır: PM2 cluster'da bile her iş kuyruktan
// tek tüketilir, çifte tetikleme yaşanmaz. Redis yoksa (yalnızca dev) uyarı
// vererek tek-instance in-process interval moduna düşer.
const env = require('../config/env');
const logger = require('../utils/logger');
const orderService = require('./orderService');
const outreachService = require('./outreachService');

const JOBS = [
  { name: 'expire-orders', everyMs: 60 * 1000, handler: () => orderService.expireStaleReservations() },
  // Günlük otomatik yayın: her gün temel kutuları şablondan açar (idempotent).
  // Sık ve ucuz çalışır; gün dönünce ilk tetikte o günün kutuları oluşur.
  { name: 'daily-publish', everyMs: 15 * 60 * 1000, handler: () => outreachService.publishDailyBoxes() },
  { name: 'whatsapp-outreach', everyMs: 5 * 60 * 1000, handler: () => outreachService.sweepOutreach() },
  { name: 'fallback-publish', everyMs: 5 * 60 * 1000, handler: () => outreachService.sweepFallback() },
];

const handlers = Object.fromEntries(JOBS.map((j) => [j.name, j.handler]));

// healthz için Redis durumu: 'up' | 'down' | 'n/a' (interval modu)
let activeQueue = null;
async function redisPing() {
  if (!activeQueue) return 'n/a';
  try {
    const client = await activeQueue.client;
    return (await client.ping()) === 'PONG' ? 'up' : 'down';
  } catch {
    return 'down';
  }
}

async function startBullMq() {
  const { Queue, Worker } = require('bullmq');
  const IORedis = require('ioredis');

  const makeConnection = () => new IORedis(env.redisUrl, { maxRetriesPerRequest: null });

  const queue = new Queue('arti-jobs', { connection: makeConnection() });
  activeQueue = queue;

  for (const job of JOBS) {
    // Tekrarlayan işler deterministik anahtarla kaydedilir; restart'ta çoğalmaz
    await queue.upsertJobScheduler(`sched-${job.name}`, { every: job.everyMs }, { name: job.name });
  }

  const worker = new Worker(
    'arti-jobs',
    async (job) => handlers[job.name]?.(),
    { connection: makeConnection(), concurrency: 1 }
  );
  worker.on('failed', (job, err) => logger.error({ job: job?.name, err }, 'Zamanlanmış iş hatası'));

  logger.info('Zamanlanmış işler BullMQ üzerinde aktif (Redis)');
  return {
    stop: async () => {
      activeQueue = null;
      await worker.close();
      await queue.close();
    },
  };
}

function startIntervals() {
  logger.warn('REDIS_URL tanımlı değil — işler tek-instance interval modunda (yalnızca dev için uygundur)');
  const timers = JOBS.map((job) => {
    const t = setInterval(async () => {
      try {
        await job.handler();
      } catch (err) {
        logger.error({ job: job.name, err }, 'Zamanlanmış iş hatası');
      }
    }, job.everyMs);
    t.unref();
    return t;
  });
  return { stop: async () => timers.forEach(clearInterval) };
}

async function startSchedulers() {
  let ctrl;
  if (env.redisUrl) {
    try {
      ctrl = await startBullMq();
    } catch (err) {
      logger.error({ err }, 'BullMQ başlatılamadı — interval moduna düşülüyor');
    }
  }
  ctrl = ctrl || startIntervals();

  // Açılışta bugünün kutularını hemen yayınla (gece çalışmasını kaçırmış olsak bile
  // sunucu ayağa kalkınca o günün kutuları hazır olur).
  outreachService.publishDailyBoxes().catch((err) => logger.error({ err }, 'İlk günlük yayın hatası'));

  return ctrl;
}

module.exports = { startSchedulers, redisPing };
