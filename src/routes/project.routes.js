const express = require('express');
const router = express.Router();
const controller = require('../controllers/project.controller');
const validateObjectId = require('../middleware/validateObjectId');
const { createUploadMiddleware } = require('../middleware/upload');
//const compressImage = require('../middleware/compressImage');

const projectUpload = createUploadMiddleware([{ name: 'image', maxCount: 1 }]);

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management API
 */

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Retrieve a paginated list of projects
 *     tags: [Projects]
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
 *         description: Search by title or description
 *     responses:
 *       200:
 *         description: Successfully retrieved projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
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
router.get('/', controller.getProjects);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     responses:
 *       200:
 *         description: The project by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server Error
 */
router.get('/:id', validateObjectId, controller.getProjectById);

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     consumes: multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server Error
 */
router.post('/', projectUpload, controller.createProject);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
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
 *               desc:  { type: string }
 *               image: { type: string, format: binary, description: 'Project image (JPEG/PNG/WebP, max 10MB) — auto-compressed to WebP' }
 *               link:  { type: string }
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server Error
 */
router.put('/:id', validateObjectId, projectUpload, controller.updateProject);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   delete:
 *     summary: Soft delete a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Project successfully deleted
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server Error
 */
router.delete('/:id', validateObjectId, controller.deleteProject);

module.exports = router;
