const Job = require('../models/Job');

const checkJobOwnership = async (req, res, next) => {
  try {
    const jobId = req.params.id;

    // Temukan pekerjaan berdasarkan ID
    const job = await Job.findById(jobId);

    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can edit and delete jobs.' });
    }

    // Periksa apakah pekerjaan ditemukan
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Periksa apakah pengguna adalah pembuat pekerjaan
    if (job.createdBy !== req.user.username) {
      return res.status(403).json({ message: 'Access denied. You are not the creator of this job.' });
    }

    // Setel objek pekerjaan ke dalam request agar dapat diakses di endpoint selanjutnya
    req.job = job;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = checkJobOwnership;
