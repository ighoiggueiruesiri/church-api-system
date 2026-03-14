const express = require('express');
const router = express.Router();
const controller = require('../controllers/testimony.controller');
const validateObjectId = require('../middleware/validateObjectId');
const { createUploadMiddleware } = require('../middleware/upload');
const compressImage = require('../middleware/compressImage');

// avatar is optional — the field may carry an uploaded profile image
const testimonyUpload = createUploadMiddleware([{ name: 'avatar', maxCount: 1 }]);

/**
 * @swagger
 * tags:
 *   name: Testimonies
 *   description: Testimony management API
 */

/**
 * @swagger
 * /api/v1/testimonies:
 *   get:
 *     summary: Retrieve a paginated list of testimonies
 *     tags: [Testimonies]
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
 *         description: Search by name, role, or text
 *     responses:
 *       200:
 *         description: Successfully retrieved testimonies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Testimony'
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
router.get('/', controller.getTestimonies);

/**
 * @swagger
 * /api/v1/testimonies/{id}:
 *   get:
 *     summary: Get a testimony by ID
 *     tags: [Testimonies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The testimony ID
 *     responses:
 *       200:
 *         description: The testimony by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Testimony'
 *       404:
 *         description: Testimony not found
 *       500:
 *         description: Server Error
 */
router.get('/:id', validateObjectId, controller.getTestimonyById);

/**
 * @swagger
 * /api/v1/testimonies:
 *   post:
 *     summary: Create a new testimony
 *     tags: [Testimonies]
 *     consumes: multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/TestimonyInput'
 *     responses:
 *       201:
 *         description: Testimony created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Testimony'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server Error
 */
router.post('/', testimonyUpload, compressImage, controller.createTestimony);

/**
 * @swagger
 * /api/v1/testimonies/{id}:
 *   put:
 *     summary: Update a testimony
 *     tags: [Testimonies]
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
 *               name:   { type: string }
 *               role:   { type: string }
 *               text:   { type: string }
 *               avatar: { type: string, format: binary, description: 'Avatar image (JPEG/PNG/WebP, max 10MB) — auto-compressed to WebP' }
 *     responses:
 *       200:
 *         description: Testimony updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Testimony'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Testimony not found
 *       500:
 *         description: Server Error
 */
router.put('/:id', validateObjectId, testimonyUpload, compressImage, controller.updateTestimony);

/**
 * @swagger
 * /api/v1/testimonies/{id}:
 *   delete:
 *     summary: Soft delete a testimony by ID
 *     tags: [Testimonies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The testimony ID
 *     responses:
 *       200:
 *         description: Testimony successfully deleted
 *       404:
 *         description: Testimony not found
 *       500:
 *         description: Server Error
 */
router.delete('/:id', validateObjectId, controller.deleteTestimony);

module.exports = router;
