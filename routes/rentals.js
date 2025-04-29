const express = require('express');
const { getRentals, getRental, addRental, updateRental, deleteRental } = require('../controllers/rentals');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Rental:
 *       type: object
 *       required:
 *         - pickupDate
 *         - returnDate
 *         - pickupLocation
 *         - returnLocation
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated rental ID
 *         pickupDate:
 *           type: string
 *           format: date
 *           description: Rental pickup date
 *         returnDate:
 *           type: string
 *           format: date
 *           description: Rental return date
 *         pickupLocation:
 *           type: string
 *           description: Pickup location
 *         returnLocation:
 *           type: string
 *           description: Return location
 *         user:
 *           type: string
 *           description: ID of the user who made the rental
 *         car:
 *           type: string
 *           description: ID of the rented car
 *         assumePrice:
 *           type: number
 *           description: Calculated price for the rental period
 *         createAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the rental was created
 *       example:
 *         id: "609bda561452242d88d36e37"
 *         pickupDate: "2025-05-01"
 *         returnDate: "2025-05-05"
 *         pickupLocation: "Downtown Branch"
 *         returnLocation: "Airport Branch"
 *         user: "609bda561452242d88d36e39"
 *         car: "609bda561452242d88d36e38"
 *         assumePrice: 229.95
 *         createAt: "2025-04-29T08:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Rentals
 *   description: Endpoints for managing rentals
 */

// Apply authentication
router.use(protect);

/**
 * @swagger
 * /rentals:
 *   get:
 *     summary: Get all rentals (admins) or current user's rentals
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of rental objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rental'
 *       401:
 *         description: Unauthorized
 */
router.route('/')
  .get(getRentals)
  /**
   * @swagger
   * /rentals:
   *   post:
   *     summary: Create a new rental
   *     tags: [Rentals]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Rental'
   *     responses:
   *       200:
   *         description: The created rental
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Rental'
   *       400:
   *         description: Bad request
   */
  .post(authorize('admin', 'user'), addRental);

/**
 * @swagger
 * /rentals/{id}:
 *   get:
 *     summary: Get a single rental by ID
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rental ID
 *     responses:
 *       200:
 *         description: Rental object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rental'
 *       404:
 *         description: Rental not found
 */
router.route('/:id')
  .get(getRental)
  /**
   * @swagger
   * /rentals/{id}:
   *   put:
   *     summary: Update a rental by ID
   *     tags: [Rentals]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Rental ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Rental'
   *     responses:
   *       200:
   *         description: Updated rental object
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Rental'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Rental not found
   */
  .put(authorize('admin', 'user'), updateRental)
  /**
   * @swagger
   * /rentals/{id}:
   *   delete:
   *     summary: Delete a rental by ID
   *     tags: [Rentals]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Rental ID
   *     responses:
   *       200:
   *         description: Empty success response
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Rental not found
   */
  .delete(authorize('admin', 'user'), deleteRental);

module.exports = router;
