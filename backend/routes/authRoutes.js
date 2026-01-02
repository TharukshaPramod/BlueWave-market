const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/me', authController.protect, authController.getMe);
router.put('/me', authController.protect, authController.updateMe);

// Admin-only routes (require authentication and admin role)
router.get('/users', authController.protect, authController.restrictToAdmin, authController.getAllUsers);
router.put('/users/:id', authController.protect, authController.restrictToAdmin, authController.updateUser);
router.delete('/users/:id', authController.protect, authController.restrictToAdmin, authController.deleteUser);

module.exports = router;