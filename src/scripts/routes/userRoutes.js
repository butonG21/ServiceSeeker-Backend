const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.get('/all', authenticateToken, userController.getAllUsers);

// Mendapatkan detail User
router.get('/:username', authenticateToken, userController.getUserDetails);

router.get('/:username/jobs', authenticateToken, userController.getUserJobs);

module.exports = router;
