const express = require('express');
const router  = express.Router();
const controller = require('../controllers/stats.controller');

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Dashboard summary statistics
 */

/**
 * @swagger
 * /api/v1/stats:
 *   get:
 *     summary: Get cached content counts for the admin dashboard
 *     tags: [Stats]
 *     description: >
 *       Returns total and "added this week" counts for every content type
 *       (ministries, sermons, blogs, prayer requests, events, testimonies,
 *       projects). Results are cached in memory for 5 minutes to avoid
 *       hammering the database on every dashboard load.
 *     responses:
 *       200:
 *         description: Stats returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     ministries:  { $ref: '#/components/schemas/StatEntry' }
 *                     sermons:     { $ref: '#/components/schemas/StatEntry' }
 *                     blogs:       { $ref: '#/components/schemas/StatEntry' }
 *                     prayers:     { $ref: '#/components/schemas/StatEntry' }
 *                     events:      { $ref: '#/components/schemas/StatEntry' }
 *                     testimonies: { $ref: '#/components/schemas/StatEntry' }
 *                     projects:    { $ref: '#/components/schemas/StatEntry' }
 *       500:
 *         description: Server Error
 *
 * components:
 *   schemas:
 *     StatEntry:
 *       type: object
 *       properties:
 *         total: { type: integer, description: 'All-time count (non-deleted)' }
 *         week:  { type: integer, description: 'Count added in the last 7 days' }
 */
router.get('/', controller.getStats);

module.exports = router;