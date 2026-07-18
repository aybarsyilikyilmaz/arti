const pino = require('pino');
const env = require('../config/env');

// Üretimde salt JSON (log toplayıcılar için), geliştirmede renkli okunur çıktı
const logger = pino({
  level: process.env.LOG_LEVEL || (env.isProd ? 'info' : 'debug'),
  ...(env.isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
      }),
});

module.exports = logger;
