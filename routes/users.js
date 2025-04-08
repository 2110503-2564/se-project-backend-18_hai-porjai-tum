const express = require('express');
const { updateUserPayment } = require('../controllers/user');

const router = express.Router();
const { protect } = require('../middleware/auth');

// Self-update route (only needs to be logged in)
router.put('/update', protect, updateUserPayment);

module.exports = router;
