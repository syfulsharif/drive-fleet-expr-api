import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Car title is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      required: [true, 'Car image URL is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for search functionality
carSchema.index({ title: 'text', brand: 'text', description: 'text' });

export const Car = mongoose.model('Car', carSchema);
