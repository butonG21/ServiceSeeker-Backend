const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.get('/all', authenticateToken, userController.getAllUsers);

// Mendapatkan detail User
router.get('/:id', authenticateToken, userController.getUserDetails);

router.get('/:id/jobs', authenticateToken, userController.getUserJobs);

module.exports = router;
