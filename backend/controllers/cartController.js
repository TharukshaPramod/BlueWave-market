const Cart = require('../models/Cart');
const FishItem = require('../models/FishItem');

exports.addToCart = async (req, res) => {
  try {
    const { customerId, fishItemId, quantity } = req.body;
    console.log('addToCart request body:', req.body); // Debug log

    // Validate input
    if (!customerId || !fishItemId || !quantity) {
      return res.status(400).json({ message: 'customerId, fishItemId, and quantity are required' });
    }

    let cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      cart = new Cart({ customer: customerId, items: [] });
    }

    const fishItem = await FishItem.findById(fishItemId);
    if (!fishItem) {
      return res.status(404).json({ message: 'Fish item not found' });
    }
    if (quantity > fishItem.stock) {
      return res.status(400).json({ message: 'Quantity exceeds stock' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === fishItemId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: fishItemId, quantity });
    }

    await cart.validate();
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error in addToCart:', error.message);
    res.status(400).json({ message: 'Invalid cart data', errors: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    console.log('Fetching cart for customerId:', req.params.customerId); // Debug log
    
    // Try to find cart with the provided customerId
    let cart = await Cart.findOne({ customer: req.params.customerId })
      .populate('items.product', 'name price description stock photoUrl');
    
    // If not found, try to find by string ID
    if (!cart) {
      console.log('Cart not found with ObjectId, trying string ID');
      cart = await Cart.findOne({ customer: req.params.customerId.toString() })
        .populate('items.product', 'name price description stock photoUrl');
    }
    
    if (!cart) {
      console.log('Cart not found for customerId:', req.params.customerId);
      return res.status(404).json({ message: 'Cart not found' });
    }

    const totalBill = cart.items.reduce((sum, item) => 
      sum + (item.quantity * item.product.price), 0);
    res.json({ ...cart.toObject(), totalBill });
  } catch (error) {
    console.error('Error in getCart:', error.message);
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { customerId, fishItemId, quantity } = req.body;
    console.log('updateCart request body:', req.body); // Debug log

    // Validate input
    if (!customerId || !fishItemId || quantity === undefined) {
      return res.status(400).json({ message: 'customerId, fishItemId, and quantity are required' });
    }

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === fishItemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    const fishItem = await FishItem.findById(fishItemId);
    if (quantity > fishItem.stock) {
      return res.status(400).json({ message: 'Quantity exceeds stock' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.validate();
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Error in updateCart:', error.message);
    res.status(400).json({ message: 'Invalid update data', errors: error.message });
  }
};

exports.deleteFromCart = async (req, res) => {
  try {
    const { customerId, fishItemId } = req.params;
    console.log('deleteFromCart request params:', req.params); // Debug log

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === fishItemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error in deleteFromCart:', error.message);
    res.status(500).json({ message: 'Failed to delete item', error: error.message });
  }
};

module.exports = exports;