const express = require('express');
const { authController } = require('../controllers');
const { protect, validateRegister, validateLogin } = require('../middleware');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;