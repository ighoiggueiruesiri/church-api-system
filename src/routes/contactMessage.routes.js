const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactMessage.controller');
const validateObjectId = require('../middleware/validateObjectId');

/**
 * @swagger
 * tags:
 *   name: ContactMessages
 *   description: Contact message management API
 */

/**
 * @swagger
 * /api/v1/contact-messages:
 *   get:
 *     summary: Retrieve a paginated list of contact messages
 *     tags: [ContactMessages]
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
 *         description: Search by name, email, or message text
 *     responses:
 *       200:
 *         description: Successfully retrieved contact messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContactMessage'
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
router.get('/', controller.getContactMessages);

/**
 * @swagger
 * /api/v1/contact-messages/{id}:
 *   get:
 *     summary: Get a contact message by ID
 *     tags: [ContactMessages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The contact message ID
 *     responses:
 *       200:
 *         description: The contact message by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactMessage'
 *       404:
 *         description: Contact message not found
 *       500:
 *         description: Server Error
 */
router.get('/:id', validateObjectId, controller.getContactMessageById);

/**
 * @swagger
 * /api/v1/contact-messages:
 *   post:
 *     summary: Submit a new contact message
 *     tags: [ContactMessages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactMessageInput'
 *     responses:
 *       201:
 *         description: Contact message submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactMessage'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server Error
 */
router.post('/', controller.createContactMessage);

/**
 * @swagger
 * /api/v1/contact-messages/{id}:
 *   delete:
 *     summary: Soft delete a contact message by ID
 *     tags: [ContactMessages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The contact message ID
 *     responses:
 *       200:
 *         description: Contact message successfully deleted
 *       404:
 *         description: Contact message not found
 *       500:
 *         description: Server Error
 */
router.delete('/:id', validateObjectId, controller.deleteContactMessage);

module.exports = router;
