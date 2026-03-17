const StatsService = require('../services/stats.service');
const { success }  = require('../utils/response');
const { logger }   = require('../config/logger');

/**
 * GET /api/stats
 *
 * Returns cached total + weekly counts for every content type on the
 * admin dashboard. A single request replaces the 7 separate list calls
 * the dashboard previously made.
 *
 * Response shape:
 * {
 *   ministries:  { total: number, week: number },
 *   sermons:     { total: number, week: number },
 *   blogs:       { total: number, week: number },
 *   prayers:     { total: number, week: number },
 *   events:      { total: number, week: number },
 *   testimonies: { total: number, week: number },
 *   projects:    { total: number, week: number },
 * }
 */
exports.getStats = async (req, res, next) => {
  const startTime = Date.now();
  try {
    logger.info('Dashboard stats requested', { ip: req.ip });

    const data = await StatsService.getSummary();

    logger.info('Dashboard stats returned', { durationMs: Date.now() - startTime });

    success(res, data);
  } catch (err) {
    logger.error('Failed to fetch dashboard stats', { error: err.message, stack: err.stack });
    next(err);
  }
};