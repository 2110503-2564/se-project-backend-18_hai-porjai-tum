const express = require('express');
const { updateUserPayment, setUserPayment, getUsers } = require('../controllers/user');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Self-update route (only needs to be logged in)
router.put('/update', protect, updateUserPayment);
router.get('/users', protect, authorize('admin'), getUsers)
router.post('/setpayment', protect, authorize('admin'), setUserPayment)

module.exports = router;
