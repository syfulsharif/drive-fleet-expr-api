import express from 'express';
import { createBooking, getMyBookings } from '../controllers/bookingController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').post(protect, createBooking);
router.route('/mine').get(protect, getMyBookings);

export default router;
