const express = require('express');
const router = express.Router();
const controller = require('../controllers/ministry.controller');
const validateObjectId = require('../middleware/validateObjectId');
const {createUploadMiddleware} = require('../middleware/upload');
//const compressImage = require('../middleware/compressImage');

const ministryUpload = createUploadMiddleware([
  { name: 'headImage', maxCount: 1 },
]);


/**
 * @swagger
 * tags:
 *   name: Ministries
 *   description: Ministry management API
 */

/**
 * @swagger
 * /api/v1/ministries:
 *   get:
 *     summary: Retrieve a paginated list of ministries
 *     tags: [Ministries]
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
 *         description: Search by title, description, or headName
 *     responses:
 *       200:
 *         description: Successfully retrieved ministries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ministry'
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
router.get('/', controller.getMinistries);

/**
 * @swagger
 * /api/v1/ministries/{id}:
 *   get:
 *     summary: Get a ministry by ID
 *     tags: [Ministries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ministry ID
 *     responses:
 *       200:
 *         description: The ministry description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ministry'
 *       404:
 *         description: Ministry not found
 *       500:
 *         description: Server Error
 */
router.get('/:id', validateObjectId, controller.getMinistryById);

/**
 * @swagger
 * /api/v1/ministries:
 *   post:
 *     summary: Create a new ministry
 *     tags: [Ministries]
 *     consumes: multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, desc]
 *             properties:
 *               title: { type: string }
 *               desc: { type: string }
 *               headName: { type: string }
 *               headImage: { type: string, format: binary }
 *               headTitle: { type: string }
 *               icon: { type: string }
 *               color: { type: string }
 *               bg: { type: string }
 *               border: { type: string }
 *               fullDesc: { type: string }
 *               actions: { type: string, description: 'JSON-stringified array of actions' }
 *     responses:
 *       201: { description: Ministry created }
 */
router.post('/', ministryUpload, controller.createMinistry);

/**
 * @swagger
 * /api/v1/ministries/{id}:
 *   put:
 *     summary: Update a ministry by ID
 *     tags: [Ministries]
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
 *               title: { type: string }
 *               desc: { type: string }
 *               headName: { type: string }
 *               headImage: { type: string, format: binary }
 *               headTitle: { type: string }
 *               icon: { type: string }
 *               color: { type: string }
 *               bg: { type: string }
 *               border: { type: string }
 *               fullDesc: { type: string }
 *               actions: { type: string }
 *     responses:
 *       200: { description: Ministry updated }
 */
router.put('/:id', validateObjectId, ministryUpload, controller.updateMinistry);

/**
 * @swagger
 * /api/v1/ministries/{id}:
 *   delete:
 *     summary: Soft delete a ministry by ID
 *     tags: [Ministries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ministry ID
 *     responses:
 *       200:
 *         description: Ministry successfully deleted
 *       404:
 *         description: Ministry not found
 *       500:
 *         description: Server Error
 */
router.delete('/:id', validateObjectId, controller.deleteMinistry);

module.exports = router;