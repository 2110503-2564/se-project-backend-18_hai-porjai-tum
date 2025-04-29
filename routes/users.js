const express = require('express');
const { updateUserPayment, setUserPayment, getUsers } = require('../controllers/users');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPayment:
 *       type: object
 *       required:
 *         - payment
 *       properties:
 *         payment:
 *           type: number
 *           description: Amount to increment or set for the user
 *       example:
 *         payment: 100.50
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated user ID
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email
 *         role:
 *           type: string
 *           description: User role (user or admin)
 *         payment:
 *           type: number
 *           description: Accumulated payment amount
 *       example:
 *         id: "609bda561452242d88d36e37"
 *         name: "Jane Doe"
 *         email: "jane.doe@example.com"
 *         role: "user"
 *         payment: 250.00
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User payment management API
 */

/**
 * @swagger
 * /update:
 *   put:
 *     summary: Increment current user's payment
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPayment'
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid payment value
 *       401:
 *         description: Unauthorized
 */
router.put('/update', protect, updateUserPayment);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/users', protect, authorize('admin'), getUsers);

/**
 * @swagger
 * /{id}/setpayment:
 *   post:
 *     summary: Set payment amount for a specific user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPayment'
 *     responses:
 *       200:
 *         description: Payment set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid payment value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/:id/setpayment', protect, authorize('admin'), setUserPayment);

module.exports = router;
