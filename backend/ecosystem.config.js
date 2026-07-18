// PM2 üretim süreç tanımı (PLAN.md Faz 3).
// Cluster modda BullMQ job'ları kuyruktan tek tüketilir — çifte tetikleme olmaz.
// Kurulum (EC2):  pm2 start ecosystem.config.js --env production && pm2 save
// Log rotasyonu:  pm2 install pm2-logrotate
module.exports = {
  apps: [
    {
      name: 'arti-api',
      script: 'server.js',
      cwd: __dirname,
      exec_mode: 'cluster',
      instances: 2, // t3.small için 2; daha büyük makinede 'max'
      max_memory_restart: '400M',
      kill_timeout: 12000, // server.js zarif kapanışı 10 sn'de biter
      merge_logs: true,
      env_production: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1', // dış dünyaya yalnızca Nginx açılır
      },
    },
  ],
};
