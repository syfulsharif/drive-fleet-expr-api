import express from 'express';
import { getCars, getCarById, createCar, updateCar, deleteCar } from '../controllers/carController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getCars)
  .post(protect, createCar);

router.route('/:id')
  .get(getCarById)
  .put(protect, updateCar)
  .delete(protect, deleteCar);

export default router;
