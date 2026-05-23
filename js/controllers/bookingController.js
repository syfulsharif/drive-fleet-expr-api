const { Booking } = require('../models/Booking.js');
const { Car } = require('../models/Car.js');

const createBooking = async (req, res) => {
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
    
    await Car.findByIdAndUpdate(carId, { $inc: { bookingCount: 1 } });

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('car');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings };