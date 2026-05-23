const express = require('express');
const { createBooking, getMyBookings } = require('../controllers/bookingController.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

router.route('/').post(protect, createBooking);
router.route('/mine').get(protect, getMyBookings);

module.exports = router;