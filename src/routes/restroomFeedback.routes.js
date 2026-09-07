const express = require('express');
const router = express.Router();
const controller = require('../controllers/restroomFeedback.controller');
const validateObjectId = require('../middleware/validateObjectId');
const { protect, authorize } = require('../middleware/user.middleware');

/**
 * @swagger
 * tags:
 *   name: RestroomFeedback
 *   description: Restroom / lavatory facility feedback API
 */

/**
 * @swagger
 * /api/v1/restroom-feedback:
 *   get:
 *     summary: Retrieve a paginated list of restroom feedback entries
 *     tags: [RestroomFeedback]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Max 100
 *       - in: query
 *         name: searchTerm
 *         schema: { type: string }
 *         description: Search by location, comments, or name
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: minRating
 *         schema: { type: integer }
 *       - in: query
 *         name: issue
 *         schema: { type: string, enum: [cleanliness, supplies, plumbing, odor, other] }
 *     responses:
 *       200: { description: Successfully retrieved feedback }
 *       500: { description: Server Error }
 */
router.get('/', controller.getRestroomFeedback);

/**
 * @swagger
 * /api/v1/restroom-feedback/summary:
 *   get:
 *     summary: Get aggregate stats (average rating, total count)
 *     tags: [RestroomFeedback]
 *     responses:
 *       200: { description: Summary stats }
 *       500: { description: Server Error }
 */
router.get('/summary', controller.getRestroomFeedbackSummary);

/**
 * @swagger
 * /api/v1/restroom-feedback/{id}:
 *   get:
 *     summary: Get a feedback entry by ID
 *     tags: [RestroomFeedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: The feedback entry }
 *       404: { description: Not found }
 *       500: { description: Server Error }
 */
router.get('/:id', validateObjectId, controller.getRestroomFeedbackById);

/**
 * @swagger
 * /api/v1/restroom-feedback:
 *   post:
 *     summary: Submit new restroom feedback
 *     tags: [RestroomFeedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [location, rating]
 *             properties:
 *               location: { type: string }
 *               rating:   { type: integer, minimum: 1, maximum: 5 }
 *               issues:
 *                 type: array
 *                 items: { type: string, enum: [cleanliness, supplies, plumbing, odor, other] }
 *               comments: { type: string }
 *               name:     { type: string }
 *               email:    { type: string }
 *     responses:
 *       201: { description: Feedback submitted successfully }
 *       400: { description: Validation error }
 *       500: { description: Server Error }
 */
router.post('/', controller.createRestroomFeedback);

/**
 * @swagger
 * /api/v1/restroom-feedback/{id}:
 *   delete:
 *     summary: Soft delete a feedback entry by ID (admin only)
 *     tags: [RestroomFeedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted successfully }
 *       404: { description: Not found }
 *       500: { description: Server Error }
 */
router.delete('/:id', protect, authorize('admin'), validateObjectId, controller.deleteRestroomFeedback);

module.exports = router;