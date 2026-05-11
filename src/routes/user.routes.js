const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/user.middleware');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:       { type: string }
 *         name:      { type: string }
 *         email:     { type: string, format: email }
 *         role:      { type: string, enum: [user, editor, admin] }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:  { $ref: '#/components/schemas/User' }
 *         token: { type: string, description: JWT access token }
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & user management
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: 'string', description: 'User full name' }
 *               email: { type: 'string', format: 'email', description: 'User email address' }
 *               password: { type: 'string', minLength: 6, description: 'Must be at least 6 characters' }
 *               role: { type: 'string', enum: ['user', 'editor', 'admin'], default: 'user' }
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or Email already in use
 */
router.post('/register', controller.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: 'string', format: 'email' }
 *               password: { type: 'string' }
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', controller.login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get own profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Profile retrieved, content: { application/json: { schema: { $ref: '#/components/schemas/User' } } } }
 *       401: { description: Not authenticated }
 */
router.get('/me', protect, controller.getMe);

/**
 * @swagger
 * /api/v1/auth/me:
 *   put:
 *     summary: Update own profile (name, email, or password — role change not permitted)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:     { type: string }
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Profile updated, content: { application/json: { schema: { $ref: '#/components/schemas/User' } } } }
 *       400: { description: Validation error or email already in use }
 *       401: { description: Not authenticated }
 */
router.put('/me', protect, controller.updateMe);

/**
 * @swagger
 * /api/v1/auth/users:
 *   get:
 *     summary: Get all active users (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/users', protect, authorize('admin'), controller.getUsers);

/**
 * @swagger
 * /api/v1/auth/users/{id}:
 *   get:
 *     summary: Get a single user by ID (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/users/:id', protect, authorize('admin'), controller.getUser);

/**
 * @swagger
 * /api/v1/auth/users/{id}:
 *   put:
 *     summary: Update user details or password (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               role: { type: string, enum: ['user', 'editor', 'admin'] }
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Forbidden - Requires Admin role
 */
router.put('/users/:id', protect, authorize('admin'), controller.updateUser);

/**
 * @swagger
 * /api/v1/auth/users/{id}:
 *   delete:
 *     summary: Soft delete a user (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User successfully deleted
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', protect, authorize('admin'), controller.deleteUser);

module.exports = router;