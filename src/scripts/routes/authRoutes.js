const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Registrasi pengguna
router.post('/register', authController.registerValidationRules, authController.validate, authController.register);

// Login
router.post('/login', authController.login);

module.exports = router;
