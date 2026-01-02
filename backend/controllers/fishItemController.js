const FishItem = require('../models/FishItem');
const Cart = require('../models/Cart');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

exports.addFishItem = async (req, res) => {
  try {
    console.log('addFishItem request body:', req.body); // Debug log
    console.log('addFishItem uploaded file:', req.file); // Debug log
    const { name, price, stock, description } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fishItem = new FishItem({ name, price, stock, description, photoUrl });
    await fishItem.validate();
    await fishItem.save();
    res.status(201).json(fishItem);
  } catch (error) {
    console.error('Error in addFishItem:', error.message);
    res.status(400).json({ message: 'Invalid fish item data', errors: error.message });
  }
};

exports.getFishItems = async (req, res) => {
  try {
    const fishItems = await FishItem.find({ stock: { $gt: 0 } });
    res.json(fishItems);
  } catch (error) {
    console.error('Error in getFishItems:', error.message);
    res.status(500).json({ message: 'Failed to fetch fish items', error: error.message });
  }
};

exports.getFishItemById = async (req, res) => {
  try {
    const fishItem = await FishItem.findById(req.params.id);
    if (!fishItem) return res.status(404).json({ message: 'Fish item not found' });
    res.json(fishItem);
  } catch (error) {
    console.error('Error in getFishItemById:', error.message);
    res.status(500).json({ message: 'Failed to fetch fish item', error: error.message });
  }
};

exports.updateFishItem = async (req, res) => {
  try {
    console.log('updateFishItem request body:', req.body); // Debug log
    console.log('updateFishItem uploaded file:', req.file); // Debug log
    const fishItem = await FishItem.findById(req.params.id);
    if (!fishItem) return res.status(404).json({ message: 'Fish item not found' });

    const { name, price, stock, description } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : fishItem.photoUrl;
    Object.assign(fishItem, { name, price, stock, description, photoUrl });
    await fishItem.validate();
    await fishItem.save();
    res.json(fishItem);
  } catch (error) {
    console.error('Error in updateFishItem:', error.message);
    res.status(400).json({ message: 'Invalid update data', errors: error.message });
  }
};

exports.deleteFishItem = async (req, res) => {
  try {
    const fishItem = await FishItem.findById(req.params.id);
    if (!fishItem) return res.status(404).json({ message: 'Fish item not found' });
    
    const inCart = await Cart.findOne({ 'items.fishItemId': fishItem._id });
    if (inCart) return res.status(400).json({ message: 'Cannot delete item in customer cart' });

    await FishItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fish item deleted' });
  } catch (error) {
    console.error('Error in deleteFishItem:', error.message);
    res.status(500).json({ message: 'Failed to delete fish item', error: error.message });
  }
};

// Search Fish Items
exports.searchFishItems = async (req, res) => {
  try {
    const { name, description } = req.query;
    console.log('searchFishItems query:', { name, description }); // Debug log
    const query = {};
    if (name) query.name = { $regex: name, $options: 'i' };
    if (description) query.description = { $regex: description, $options: 'i' };
    const fishItems = await FishItem.find(query).lean();
    res.json(fishItems);
  } catch (error) {
    console.error('Error in searchFishItems:', error.message);
    res.status(500).json({ message: 'Failed to search fish items', error: error.message });
  }
};

// Low Stock Report
exports.getLowStockReport = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const lowStockItems = await FishItem.find({ stock: { $lte: threshold } })
      .select('name stock price description')
      .lean();
    res.json(lowStockItems);
  } catch (error) {
    console.error('Error in getLowStockReport:', error.message);
    res.status(500).json({ message: 'Failed to fetch low stock report', error: error.message });
  }
};

// Export multer upload middleware for routes
exports.upload = upload;

module.exports = exports;