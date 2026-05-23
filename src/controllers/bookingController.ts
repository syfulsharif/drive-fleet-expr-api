import { Booking } from '../models/Booking';
import { Car } from '../models/Car';

export const createBooking = async (req: any, res: any) => {
  try {
    const {
      carId,
      startDate,
      endDate,
      totalPrice,
    } = req.body;

    if (!carId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ message: 'All booking fields are required' });
    }

    const booking = new Booking({
      user: req.user._id,
      car: carId,
      startDate,
      endDate,
      totalPrice,
      status: 'confirmed'
    });

    const createdBooking = await booking.save();
    
    // Increment bookingCount for the car using $inc
    await Car.findByIdAndUpdate(carId, { $inc: { bookingCount: 1 } });

    res.status(201).json(createdBooking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyBookings = async (req: any, res: any) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('car');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
