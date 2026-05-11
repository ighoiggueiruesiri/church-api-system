const express = require('express');
const router = express.Router();
const controller = require('../controllers/event.controller');
const validateObjectId = require('../middleware/validateObjectId');
const {createUploadMiddleware} = require('../middleware/upload');
//const compressImage = require('../middleware/compressImage');
const { protect, authorize } = require('../middleware/user.middleware');

const eventUpload = createUploadMiddleware([{ name: 'image', maxCount: 1 }]);

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management API
 */

/**
 * @swagger
 * /api/v1/Events:
 *   get:
 *     summary: Retrieve a paginated list of Events
 *     tags: [Events]
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
 *         description: Search by title or pastor
 *     responses:
 *       200:
 *         description: Successfully retrieved Events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     pages: { type: integer }
 *       500:
 *         description: Server Error
 */
router.get('/', controller.getEvents);

/**
 * @swagger
 * /api/v1/Events/{id}:
 *   get:
 *     summary: Get a Event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Event ID
 *     responses:
 *       200:
 *         description: The Event description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server Error
 */
router.get('/:id', validateObjectId, controller.getEventById);

/**
 * @swagger
 * /api/v1/Events:
 *   post:
 *     summary: Create a new Event
 *     tags: [Events]
 *     consumes: multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server Error
 */
router.post('/', protect, authorize('admin', 'editor'), eventUpload, controller.createEvent);

/**
 * @swagger
 * /api/v1/Events/{id}:
 *   put:
 *     summary: Update Event
 *     tags: [Events]
 *     consumes: multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:    { type: string }
 *               location: { type: string }
 *               image:    { type: string, format: binary, description: 'Event image (JPEG/PNG/WebP, max 10MB) — auto-compressed to WebP' }
 *               date:     { type: string }
 *               time:     { type: string }
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server Error
 */
router.put('/:id', protect, authorize('admin', 'editor'), validateObjectId, eventUpload, controller.updateEvent);

/**
 * @swagger
 * /api/v1/Events/{id}:
 *   delete:
 *     summary: Soft delete a Event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Event ID
 *     responses:
 *       200:
 *         description: Event successfully deleted
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server Error
 */
router.delete('/:id', protect, authorize('admin'), validateObjectId, controller.deleteEvent);

module.exports = router;