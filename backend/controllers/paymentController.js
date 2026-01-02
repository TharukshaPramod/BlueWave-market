const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const FishItem = require('../models/FishItem');
const Product = require('../models/FishItem');
const fs = require('fs').promises;
const path = require('path');
const { validationResult } = require('express-validator');

exports.checkout = async (req, res) => {
  try {
    console.log('Checkout request received:', {
      headers: req.headers,
      body: req.body,
      file: req.file
    });

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerId } = req.body;

    // Validate required fields
    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Payment slip is required' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only JPEG and PNG files are allowed' });
    }

    // Get cart items
    const cart = await Cart.findOne({ customer: customerId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total and validate stock
    let total = 0;
    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      total += product.price * item.quantity;
    }

    // Create payment record
    const payment = await Payment.create({
      customer: customerId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      total,
      paymentSlip: `/uploads/${req.file.filename.replace(/\\/g, '/')}`,
      status: 'pending'
    });

    // Update product stock
    for (const item of cart.items) {
      await FishItem.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { customer: customerId },
      { $set: { items: [] } }
    );

    console.log('Checkout completed successfully:', {
      paymentId: payment._id,
      total,
      itemsCount: cart.items.length
    });

    res.status(201).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ 
      message: 'Error processing checkout',
      error: error.message
    });
  }
};

exports.getPayments = async (req, res) => {
  try {
    console.log('Fetching payments for customer:', req.params.customerId);
    const payments = await Payment.find({ customer: req.params.customerId });
    console.log('Payments found for customer:', payments);
    res.json(payments);
  } catch (error) {
    console.error('Error in getPayments:', error.message);
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};

exports.searchPayments = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, date } = req.query;
    console.log('searchPayments query:', { customerId, status, date });

    let query = { customer: customerId };
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const payments = await Payment.find(query);
    console.log('Search payments result:', payments);
    res.json(payments);
  } catch (error) {
    console.error('Error in searchPayments:', error.message);
    res.status(500).json({ message: 'Failed to search payments', error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    Object.assign(payment, req.body);
    await payment.validate();
    await payment.save();
    res.json(payment);
  } catch (error) {
    console.error('Error in updatePayment:', error.message);
    res.status(400).json({ message: 'Invalid update data', errors: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;

    // Validate the payment ID format (MongoDB ObjectId)
    if (!paymentId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid payment ID format:', paymentId);
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    // Find and delete the payment in one step
    const payment = await Payment.findByIdAndDelete(paymentId);
    if (!payment) {
      console.log('Payment not found:', paymentId);
      return res.status(404).json({ message: 'Payment not found' });
    }
    console.log('Payment deleted from database:', payment);

    // If the payment has a payment slip, attempt to delete the file
    if (payment.paymentSlip) {
      console.log('Attempting to delete payment slip:', payment.paymentSlip);
      try {
        const filePath = path.join(__dirname, '..', payment.paymentSlip);
        console.log('Resolved file path:', filePath);
        await fs.unlink(filePath);
        console.log('Payment slip deleted successfully:', payment.paymentSlip);
      } catch (fileError) {
        console.error('Failed to delete payment slip file:', fileError);
        // Continue even if file deletion fails
      }
    }

    res.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('Error in deletePayment:', error);
    res.status(500).json({ message: 'Failed to delete payment', error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    console.log('getAllPayments - Starting to fetch payments');
    console.log('getAllPayments - User:', req.user);
    
    const payments = await Payment.find({})
      .populate('customer', 'fullName email')
      .populate('items.product', 'name price');
    
    console.log(`getAllPayments - Found ${payments.length} payments`);
    console.log('getAllPayments - First payment (if any):', payments[0]);
    
    res.json(payments);
  } catch (error) {
    console.error('getAllPayments - Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Failed to fetch payments', 
      error: error.message,
      details: error.stack
    });
  }
};

exports.searchAllPayments = async (req, res) => {
  try {
    console.log('searchAllPayments - Query:', req.query);
    const { status, date } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    console.log('searchAllPayments - Final query:', query);
    const payments = await Payment.find(query)
      .populate('customer', 'fullName email')
      .populate('items.product', 'name price');
    
    console.log(`searchAllPayments - Found ${payments.length} payments`);
    res.json(payments);
  } catch (error) {
    console.error('searchAllPayments - Error:', error);
    res.status(500).json({ message: 'Failed to search payments', error: error.message });
  }
};

module.exports = exports;