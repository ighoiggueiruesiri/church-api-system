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