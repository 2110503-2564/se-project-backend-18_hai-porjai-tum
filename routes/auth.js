const express = require('express');
const { register, login, getMe, logout } = require('../controllers/auth');
const router = express.Router();
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *         tel:
 *           type: string
 *           description: Telephone number
 *         address:
 *           type: string
 *           description: Address
 *         role:
 *           type: string
 *           description: Role (user or admin)
 *       example:
 *         name: "Jane Doe"
 *         email: "jane.doe@example.com"
 *         password: "password123"
 *         tel: "0123456789"
 *         address: "123 Main St"
 *         role: "user"
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *       example:
 *         email: "jane.doe@example.com"
 *         password: "password123"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *           description: JWT token
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: User ID
 *             name:
 *               type: string
 *               description: User's name
 *             email:
 *               type: string
 *               description: User's email
 *             role:
 *               type: string
 *               description: User's role
 *             payment:
 *               type: number
 *               description: Accumulated payment
 *       example:
 *         success: true
 *         token: "ey..."
 *         user:
 *           id: "609bda561452242d88d36e37"
 *           name: "Jane Doe"
 *           email: "jane.doe@example.com"
 *           role: "user"
 *           payment: 0
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: User authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout user and clear cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.get('/logout', logout);

module.exports = router;
