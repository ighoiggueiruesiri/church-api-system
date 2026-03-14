const express = require('express');
const router = express.Router();
const controller = require('../controllers/sermon.controller');
const validateObjectId = require('../middleware/validateObjectId');
const {createUploadMiddleware} = require('../middleware/upload');
const compressImage = require('../middleware/compressImage');          

const sermonUpload = createUploadMiddleware([{ name: 'thumbnail', maxCount: 1 }]);

/**
 * @swagger
 * tags:
 *   name: Sermons
 *   description: Sermon management API
 */

/**
 * @swagger
 * /api/v1/sermons:
 *   get:
 *     summary: Retrieve a paginated list of sermons
 *     tags: [Sermons]
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
 *         description: Successfully retrieved sermons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sermon'
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
router.get('/', controller.getSermons);

/**
 * @swagger
 * /api/v1/sermons/{id}:
 *   get:
 *     summary: Get a sermon by ID
 *     tags: [Sermons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The sermon ID
 *     responses:
 *       200:
 *         description: The sermon description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sermon'
 *       404:
 *         description: Sermon not found
 *       500:
 *         description: Server Error
 */
router.get('/:id', validateObjectId, controller.getSermonById);

/**
 * @swagger
 * /api/v1/sermons:
 *   post:
 *     summary: Create a new sermon
 *     tags: [Sermons]
 *     consumes: multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/SermonInput'
 *     responses:
 *       201:
 *         description: Sermon created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sermon'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server Error
 */
router.post('/', sermonUpload, compressImage, controller.createSermon);

/**
 * @swagger
 * /api/v1/sermons/{id}:
 *   put:
 *     summary: Update sermon
 *     tags: [Sermons]
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
 *               title:     { type: string }
 *               pastor:    { type: string }
 *               date:      { type: string }
 *               thumbnail: { type: string, format: binary, description: 'Thumbnail image (JPEG/PNG/WebP, max 10MB) — auto-compressed to WebP' }
 *               videoId:   { type: string }
 *     responses:
 *       200:
 *         description: Sermon updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sermon'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sermon not found
 *       500:
 *         description: Server Error
 */
router.put('/:id', validateObjectId, sermonUpload, compressImage, controller.updateSermon);

/**
 * @swagger
 * /api/v1/sermons/{id}:
 *   delete:
 *     summary: Soft delete a sermon by ID
 *     tags: [Sermons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The sermon ID
 *     responses:
 *       200:
 *         description: Sermon successfully deleted
 *       404:
 *         description: Sermon not found
 *       500:
 *         description: Server Error
 */
router.delete('/:id', validateObjectId, controller.deleteSermon);

module.exports = router;