const express = require('express');
const jobController = require('../controllers/jobController');
const authenticateToken = require('../middleware/authenticateToken');


const router = express.Router();

// Membuat pekerjaan baru
router.post('/create', jobController.createJob);

// Mendapatkan semua pekerjaan
router.get('/all', jobController.getAllJobs);

router.post('/search', authenticateToken, jobController.searchJobs);


module.exports = router;
