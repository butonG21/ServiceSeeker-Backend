const express = require('express');
const jobController = require('../controllers/jobController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Membuat pekerjaan baru
router.post('/create', authenticateToken, jobController.createJob);

// Mendapatkan semua pekerjaan
router.get('/all', jobController.getAllJobs);

// Pencarian pekerjaan
router.post('/search', authenticateToken, jobController.searchJobs);

// Job detail by id
router.get('/:jobId', jobController.jobDetail);

module.exports = router;
