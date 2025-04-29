const express = require('express');
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar
} = require('../controllers/cars');

// Include other resource routers
const rentalRouter = require('./rentals');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - name
 *         - model
 *         - pricePerDay
 *         - picture
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the car
 *         name:
 *           type: string
 *           description: Name of the car
 *         model:
 *           type: string
 *           description: Model name of the car
 *         tel:
 *           type: string
 *           description: Contact telephone number for the car
 *         pricePerDay:
 *           type: number
 *           description: Rental price per day
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: When the car data was last updated
 *         demandFactor:
 *           type: number
 *           description: Demand factor multiplier for dynamic pricing
 *         picture:
 *           type: string
 *           description: URL to the car's picture
 *         rating:
 *           type: number
 *           description: Rating from 1 to 5
 *         tier:
 *           type: string
 *           enum: [Bronze, Diamond, Gold, Ruby, Silver]
 *           description: Tier classification of the car
 *         rentals:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Rental'
 *           description: List of related rentals (virtual)
 *       example:
 *         id: 609bda561452242d88d36e37
 *         name: Corolla
 *         model: 2020
 *         tel: "02-1234567"
 *         pricePerDay: 45.99
 *         lastUpdated: "2025-04-28T10:00:00.000Z"
 *         demandFactor: 1.2
 *         picture: "http://example.com/car.jpg"
 *         rating: 4.5
 *         tier: "Gold"
 *         rentals: []
 */

/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: The cars managing API
 */

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Returns the list of all cars
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: The list of cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 */

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get a car by id
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The car id
 *     responses:
 *       200:
 *         description: The car description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: The car was not found
 */

/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Create a new car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               model:
 *                 type: string
 *               tel:
 *                 type: string
 *               pricePerDay:
 *                 type: number
 *               picture:
 *                 type: string
 *               demandFactor:
 *                 type: number
 *               rating:
 *                 type: number
 *               tier:
 *                 type: string
 *                 enum: [Bronze, Diamond, Gold, Ruby, Silver]
 *             required: [name, model, pricePerDay, picture]
 *     responses:
 *       201:
 *         description: The car was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /cars/{id}:
 *   put:
 *     summary: Update the car by the id
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The car id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: The car was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: The car was not found
 *       500:
 *         description: Some error happened
 */

/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     summary: Remove the car by id
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The car id
 *     responses:
 *       200:
 *         description: The car was deleted
 *       404:
 *         description: The car was not found
 */

// Re-route into other resource routers
router.use('/:carId/rentals', rentalRouter);

router.route('/')
  .get(getCars)
  .post(protect, authorize('admin'), createCar);

router.route('/:id')
  .get(getCar)
  .put(protect, authorize('admin'), updateCar)
  .delete(protect, authorize('admin'), deleteCar);

module.exports = router;
