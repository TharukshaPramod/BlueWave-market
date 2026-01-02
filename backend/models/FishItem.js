const mongoose = require('mongoose');

const fishItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fish name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
  },
  photoUrl: {
    type: String,
    default: null, // Optional field for photo path
  },
}, { timestamps: true });

module.exports = mongoose.model('FishItem', fishItemSchema);