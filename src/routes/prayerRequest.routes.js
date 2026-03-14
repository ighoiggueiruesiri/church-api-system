const express = require('express');
const router = express.Router();
const controller = require('../controllers/prayerRequest.controller');
const validateObjectId = require('../middleware/validateObjectId');

/**
 * @swagger
 * tags:
 *   name: PrayerRequests
 *   description: Prayer request management API
 */

/**
 * @swagger
 * /api/v1/prayer-requests:
 *   get:
 *     summary: Retrieve a paginated list of prayer requests
 *     tags: [PrayerRequests]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page (max 100)
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search by name, email, or request text
 *     responses:
 *       200:
 *         description: Successfully retrieved prayer requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PrayerRequest'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:  { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     pages: { type: integer }
 *       500:
 *         description: Server Error
 */
router.get('/', controller.getPrayerRequests);

/**
 * @swagger
 * /api/v1/prayer-requests/{id}:
 *   get:
 *     summary: Get a prayer request by ID
 *     tags: [PrayerRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The prayer request ID
 *     responses:
 *       200:
 *         description: The prayer request by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrayerRequest'
 *       404:
 *         description: Prayer request not found
 *       500:
 *         description: Server Error
 */
router.get('/:id', validateObjectId, controller.getPrayerRequestById);

/**
 * @swagger
 * /api/v1/prayer-requests:
 *   post:
 *     summary: Submit a new prayer request
 *     tags: [PrayerRequests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrayerRequestInput'
 *     responses:
 *       201:
 *         description: Prayer request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrayerRequest'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server Error
 */
router.post('/', controller.createPrayerRequest);

/**
 * @swagger
 * /api/v1/prayer-requests/{id}:
 *   delete:
 *     summary: Soft delete a prayer request by ID
 *     tags: [PrayerRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The prayer request ID
 *     responses:
 *       200:
 *         description: Prayer request successfully deleted
 *       404:
 *         description: Prayer request not found
 *       500:
 *         description: Server Error
 */
router.delete('/:id', validateObjectId, controller.deletePrayerRequest);

module.exports = router;
