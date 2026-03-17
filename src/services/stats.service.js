const Ministry    = require('../models/ministry');
const Sermon      = require('../models/sermon');
const Blog        = require('../models/blog');
const Prayer      = require('../models/prayerRequest');
const Event       = require('../models/event');
const Testimony   = require('../models/testimony');
const Project     = require('../models/project');

const { logger } = require('../config/logger');

// ─── Simple in-memory cache ───────────────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let _cache = { data: null, expiresAt: 0 };

class StatsService {

  /**
   * Returns total counts + "added in the last 7 days" counts for every
   * content type used on the admin dashboard.
   *
   * Results are held in memory for CACHE_TTL_MS before the next DB hit.
   * Call StatsService.invalidate() from any create/delete controller to
   * bust the cache immediately when content changes.
   */
  async getSummary() {
    const now = Date.now();

    // ── Return cached result if still fresh ──────────────────────────────────
    if (_cache.data && now < _cache.expiresAt) {
      logger.debug('Dashboard stats served from cache');
      return _cache.data;
    }

    logger.info('Refreshing dashboard stats cache');

    const baseQuery = { deletedAt: null };
    const weekAgo   = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const weekQuery = { deletedAt: null, createdAt: { $gte: weekAgo } };

    // ── Fire every count in parallel ─────────────────────────────────────────
    const [
      ministriesTotal,  ministriesWeek,
      sermonsTotal,     sermonsWeek,
      blogsTotal,       blogsWeek,
      prayersTotal,     prayersWeek,
      eventsTotal,      eventsWeek,
      testimoniesTotal, testimoniesWeek,
      projectsTotal,    projectsWeek,
    ] = await Promise.all([
      Ministry.countDocuments(baseQuery),   Ministry.countDocuments(weekQuery),
      Sermon.countDocuments(baseQuery),     Sermon.countDocuments(weekQuery),
      Blog.countDocuments(baseQuery),       Blog.countDocuments(weekQuery),
      Prayer.countDocuments(baseQuery),     Prayer.countDocuments(weekQuery),
      Event.countDocuments(baseQuery),      Event.countDocuments(weekQuery),
      Testimony.countDocuments(baseQuery),  Testimony.countDocuments(weekQuery),
      Project.countDocuments(baseQuery),    Project.countDocuments(weekQuery),
    ]);

    const data = {
      ministries:  { total: ministriesTotal,  week: ministriesWeek  },
      sermons:     { total: sermonsTotal,     week: sermonsWeek     },
      blogs:       { total: blogsTotal,       week: blogsWeek       },
      prayers:     { total: prayersTotal,     week: prayersWeek     },
      events:      { total: eventsTotal,      week: eventsWeek      },
      testimonies: { total: testimoniesTotal, week: testimoniesWeek },
      projects:    { total: projectsTotal,    week: projectsWeek    },
    };

    // ── Store in cache ────────────────────────────────────────────────────────
    _cache = { data, expiresAt: now + CACHE_TTL_MS };

    logger.info('Dashboard stats cache refreshed', {
      expiresAt: new Date(_cache.expiresAt).toISOString(),
    });

    return data;
  }

  /** Call this after any create / delete so the next request gets fresh data. */
  invalidate() {
    _cache = { data: null, expiresAt: 0 };
    logger.debug('Dashboard stats cache invalidated');
  }
}

module.exports = new StatsService();