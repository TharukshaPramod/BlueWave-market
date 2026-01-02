const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const upload = require('../middleware/upload');
const { protect, restrictToAdmin } = require('../middleware/authMiddleware');

router.post('/checkout', protect, upload, paymentController.checkout);
router.get('/all', protect, restrictToAdmin, paymentController.getAllPayments);
router.get('/search/all', protect, restrictToAdmin, paymentController.searchAllPayments);
router.get('/search/:customerId', protect, paymentController.searchPayments);
router.get('/:customerId', protect, paymentController.getPayments);
router.put('/:id', protect, restrictToAdmin, paymentController.updatePayment);
router.delete('/:id', protect, restrictToAdmin, paymentController.deletePayment);

module.exports = router;