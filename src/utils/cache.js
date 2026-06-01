/*
// src/utils/cache.js
const redis = require('redis');
const { logger } = require('../config/logger');

// Render injects the internal string via the REDIS_URL environment variable
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = redis.createClient({
  url: redisUrl
});

client.on('error', (err) => logger.error('Redis Client Connection Error:', err));
client.on('connect', () => logger.info('Successfully connected to Redis instance.'));

// Immediately-invoked function to establish connection asynchronously
(async () => {
  try {
    await client.connect();
  } catch (err) {
    logger.error('Failed to initialize Redis client connection:', err);
  }
})();

module.exports = {
  async get(key) {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error(`Cache read failure for key [${key}]:`, err.message);
      return null; // Fail-silent: fall back to DB on cache error
    }
  },

  async set(key, value, ttlSeconds = 300) {
    try {
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
      logger.error(`Cache write failure for key [${key}]:`, err.message);
    }
  },

  async del(key) {
    try {
      await client.del(key);
    } catch (err) {
      logger.error(`Cache deletion failure for key [${key}]:`, err.message);
    }
  },

  async delByPattern(pattern) {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        logger.debug(`Evicted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (err) {
      logger.error(`Pattern eviction failure for [${pattern}]:`, err.message);
    }
  }
};
*/

// src/utils/cache.js
const redis = require('redis');
const { logger } = require('../config/logger');

// Grab the URL from the environment (Render will provide this)
const redisUrl = process.env.REDIS_URL;

let client = null;
let isCacheEnabled = false;

if (redisUrl) {
  const clientOptions = { url: redisUrl };

  // Render external TLS support (if you ever connect from outside Render)
  if (redisUrl.startsWith('rediss://')) {
    clientOptions.socket = {
      tls: true,
      rejectUnauthorized: false
    };
  }

  client = redis.createClient(clientOptions);

  // Catch errors to prevent server crashes, but suppress spammy ECONNREFUSED logs
  client.on('error', (err) => {
    if (err.code !== 'ECONNREFUSED') {
      logger.error('Redis Client Error:', err.message);
    }
  });

  client.on('connect', () => {
    logger.info('✅ Successfully connected to Redis instance.');
    isCacheEnabled = true;
  });

  // Attempt connection
  (async () => {
    try {
      await client.connect();
    } catch (err) {
      logger.warn('⚠️ Redis failed to connect. Falling back to DB-only mode.');
      isCacheEnabled = false;
    }
  })();
} else {
  // No URL provided (Local Development) - gracefully bypass
  logger.info('ℹ️ No REDIS_URL provided. Cache is disabled (DB-only mode).');
}

module.exports = {
  async get(key) {
    if (!isCacheEnabled) return null; // Immediately bypass if disabled
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error(`Cache read failure for key [${key}]:`, err.message);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 300) {
    if (!isCacheEnabled) return;
    try {
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
      logger.error(`Cache write failure for key [${key}]:`, err.message);
    }
  },

  async del(key) {
    if (!isCacheEnabled) return;
    try {
      await client.del(key);
    } catch (err) {
      logger.error(`Cache deletion failure for key [${key}]:`, err.message);
    }
  },

  async delByPattern(pattern) {
    if (!isCacheEnabled) return;
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        logger.debug(`Evicted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (err) {
      logger.error(`Pattern eviction failure for [${pattern}]:`, err.message);
    }
  }
};