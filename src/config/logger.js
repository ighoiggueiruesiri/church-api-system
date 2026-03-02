const winston = require('winston');
require('winston-mongodb'); // Enables MongoDB transport

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),   // Full stack traces
    winston.format.json()                     // Structured for DB
  ),
  defaultMeta: { service: 'ministry-api' },
  transports: [
    // Console (always visible during development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // MongoDB — this is where EVERYTHING goes
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      collection: 'app_logs',
      tryReconnect: true,
      options: { useUnifiedTopology: true },
      level: 'http',                    // Stores http, info, warn, error
      storeHost: true,
      decolorize: true,
      expireAfterSeconds: 60 * 60 * 24 * 30   // Auto-delete logs after 30 days (optional but recommended)
    })
  ]
});

// Special stream so Morgan can write HTTP logs to Winston → DB
const morganStream = {
  write: (message) => logger.http(message.trim())
};

module.exports = { logger, morganStream };