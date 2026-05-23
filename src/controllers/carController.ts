import { Car } from '../models/Car';

export const getCars = async (req: any, res: any) => {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCarById = async (req: any, res: any) => {
  try {
    const car = await Car.findById(req.params.id).populate('addedBy', 'name');
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCar = async (req: any, res: any) => {
  try {
    const car = new Car({
      ...req.body,
      addedBy: req.user._id,
    });

    const createdCar = await car.save();
    res.status(201).json(createdCar);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCar = async (req: any, res: any) => {
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
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCar = async (req: any, res: any) => {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
