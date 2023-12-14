const express = require('express');
const jobController = require('../controllers/jobController');
const authenticateToken = require('../middleware/authenticateToken');
const checkJobOwnership = require('../middleware/jobOwnership');

const router = express.Router();

// Mendapatkan semua pekerjaan
router.get('/all', jobController.getAllJobs);

router.get('/countByCategory', jobController.countByCategory);

// Pencarian pekerjaan
router.get('/search', authenticateToken, jobController.searchJobs);

// Membuat pekerjaan baru
router.post('/create', authenticateToken, jobController.createJob);

// Job detail by id
router.get('/detail/:id', jobController.jobDetail);

// update jobs
router.put('/:id', authenticateToken, checkJobOwnership, jobController.editJobById);

// delete job
router.delete('/:id', authenticateToken, checkJobOwnership, jobController.deleteJobById);

// Apply for a job
router.post('/:id/apply', authenticateToken, jobController.applyForJob);

// Update job status to finish
router.put('/:id/finish', authenticateToken, checkJobOwnership, jobController.updateJobStatus);

module.exports = router;
