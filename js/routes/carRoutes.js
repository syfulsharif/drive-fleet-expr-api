const express = require('express');
const { getCars, getCarById, createCar, updateCar, deleteCar } = require('../controllers/carController.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

router.route('/')
  .get(getCars)
  .post(protect, createCar);

router.route('/:id')
  .get(getCarById)
  .put(protect, updateCar)
  .delete(protect, deleteCar);

module.exports = router;