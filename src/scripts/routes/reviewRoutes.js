// routes/reviewRoutes.js

const express = require('express');
const reviewController = require('../controllers/reviewControler');
const authenticateToken = require('../middleware/authenticateToken');
// const checkJobOwnership = require('../middleware/jobOwnership');

const router = express.Router();

// Menambahkan ulasan
router.post('/add', authenticateToken, reviewController.addReview);

// Mendapatkan semua ulasan untuk job seeker tertentu
router.get('/jobseeker', authenticateToken, reviewController.getAllReviewsForJobSeeker);

module.exports = router;
