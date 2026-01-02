const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const validateRequest = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, validateRequest, cartController.addToCart);
router.get('/:customerId', protect, cartController.getCart);
router.put('/', protect, validateRequest, cartController.updateCart);
router.delete('/:customerId/:fishItemId', protect, cartController.deleteFromCart);

module.exports = router;