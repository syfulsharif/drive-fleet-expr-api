const { Car } = require('../models/Car.js');

const getCars = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { brand: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const cars = await Car.find({ ...keyword }).populate('addedBy', 'name');
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('addedBy', 'name');
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCar = async (req, res) => {
  try {
    const car = new Car({
      ...req.body,
      addedBy: req.user._id,
    });

    const createdCar = await car.save();
    res.status(201).json(createdCar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (car) {
      if (car.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
         return res.status(403).json({ message: 'Not authorized to update this car' });
      }
      Object.assign(car, req.body);
      const updatedCar = await car.save();
      res.json(updatedCar);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (car) {
      if (car.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
         return res.status(403).json({ message: 'Not authorized to delete this car' });
      }
      await car.deleteOne();
      res.json({ message: 'Car removed' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCars, getCarById, createCar, updateCar, deleteCar };