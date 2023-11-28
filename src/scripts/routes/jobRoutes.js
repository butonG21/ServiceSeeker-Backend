const express = require('express');
const jobController = require('../controllers/jobController');
const authenticateToken = require('../middleware/authenticateToken');
const checkJobOwnership = require('../middleware/jobOwnership');

const router = express.Router();

// Membuat pekerjaan baru
router.post('/create', authenticateToken, jobController.createJob);

// Mendapatkan semua pekerjaan
router.get('/all', jobController.getAllJobs);

// Pencarian pekerjaan
router.post('/search', authenticateToken, jobController.searchJobs);

// Job detail by id
router.get('/detail', jobController.jobDetail);

// update jobs
router.put('/edit', authenticateToken, checkJobOwnership, jobController.editJobById);

// delete job
router.delete('/delete', authenticateToken, checkJobOwnership, jobController.deleteJobById);

module.exports = router;
