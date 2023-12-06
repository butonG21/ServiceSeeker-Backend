const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult, check } = require('express-validator');
const User = require('../models/User');
const geocodeAddress = require('../utils/geocoding');
const BlacklistToken = require('../models/blacklistToken');

const maxFirstNameLength = 20;
const maxLastNameLength = 20;

const registerValidationRules = [
  check('firstName').isLength({ min: 3, max: maxFirstNameLength }).escape().withMessage(`First name should not exceed ${maxFirstNameLength} characters.`),

  check('lastName').optional().isLength({ min: 3, max: maxLastNameLength }).escape()
    .withMessage(`Last name should not exceed ${maxLastNameLength} characters.`),

  check('username').escape().custom(async (username) => {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error('Username already exists.');
    }
    return true;
  }),

  check('email').custom(async (email) => {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error('Email is already in use.');
    }
    return true;
  }).isEmail().escape()
    .withMessage('Invalid email format.'),

  check('phone').isNumeric().withMessage('Invalid phone format. Only numbers are allowed.'),

  check('role').custom((role) => {
    if (!['employer', 'job_seeker'].includes(role)) {
      throw new Error('Invalid role. Please choose either "employer" or "job_seeker".');
    }
    return true;
  }),

  check('address').isLength({ max: 255 }).escape(),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

const register = async (req, res) => {
  try {
    // Validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructuring data dari body
    const {
      firstName, lastName, username, email, phone, role, password, address,
    } = req.body;

    // Geocode alamat menjadi koordinat
    const location = await geocodeAddress(address);

    // Pastikan geocoding berhasil sebelum melanjutkan
    if (!location) {
      return res.status(400).json({ message: 'Geocoding failed for the provided address.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Gabungkan firstName dan lastName menjadi fullName
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    // Buat pengguna baru
    const newUser = new User({
      firstName,
      lastName,
      fullName,
      username,
      email,
      phone,
      role,
      password: hashedPassword,
      address,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
    });

    // Simpan pengguna di database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    // Destructuring data dari body
    const { username, password } = req.body;

    // Temukan pengguna berdasarkan username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Periksa kecocokan password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Set objek req.user dengan data pengguna, termasuk alamat
    req.user = {
      username: user.username,
      role: user.role,
      address: user.address, // Tambahkan alamat ke objek req.user
    };

    // Buat dan kirim token JWT
    const token = jwt.sign({ username: user.username, role: user.role, location: user.location }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        username: user.username,
        role: user.role,
        address: user.address,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Tambahkan token ke daftar token yang dinonaktifkan
    await BlacklistToken.create({ token });

    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  registerValidationRules,
  validate,
};
