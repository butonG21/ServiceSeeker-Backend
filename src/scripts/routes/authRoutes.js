const express = require('express');
const authController = require('../controllers/authController');
const { check, validationResult } = require('express-validator');

const router = express.Router();

// Registrasi pengguna
router.post('/register', [
  check('username').isLength({ min: 5 }),
  check('password').isLength({ min: 5 }),
  check('role').isIn(['employer', 'job_seeker']),
  check('fullName').optional().isString(),
  check('phoneNumber').optional().isString(),
], authController.register);

// Login
router.post('/login', authController.login);

module.exports = router;
