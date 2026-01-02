const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FishItem',
    required: [true, 'Product ID is required'],
    validate: {
      validator: async function(v) {
        const fishItem = await mongoose.model('FishItem').findById(v);
        return fishItem !== null;
      },
      message: 'Invalid product ID'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: async function(v) {
        const fishItem = await mongoose.model('FishItem').findById(this.product);
        return fishItem && v <= fishItem.stock;
      },
      message: 'Quantity exceeds available stock'
    }
  }
});

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);