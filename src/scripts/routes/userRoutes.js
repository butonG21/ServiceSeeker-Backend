const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');
const authenticatedUser = require('../middleware/authenticateUser');

const router = express.Router();

router.get('/all', authenticateToken, userController.getAllUsers);

// Mendapatkan detail User
router.get('/:username', authenticateToken, userController.getUserDetails);

router.get('/:username/jobs', authenticateToken, authenticatedUser, userController.getUserJobs);

router.put('/:username/profile', authenticateToken, authenticatedUser, userController.updateUserProfile);

router.put('/:username/change-passwords', authenticateToken, authenticatedUser, userController.changeUserPassword);

router.post('/:username/upload-profile-image', authenticateToken, userController.uploadProfileImage);

module.exports = router;
