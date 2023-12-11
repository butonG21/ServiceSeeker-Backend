const Review = require('../models/Review');
const Job = require('../models/Job');
const User = require('../models/User');

const addReview = async (req, res) => {
  try {
    const { jobId, rating, comment } = req.body;

    // Periksa apakah review dengan jobId sudah ada
    const existingReview = await Review.findOne({ jobId });

    // Jika review sudah ada, kembalikan respons gagal
    if (existingReview) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Review for this job already exists.',
      });
    }

    // Temukan pekerjaan terkait
    const job = await Job.findById(jobId);

    // Periksa apakah pengguna adalah pembuat pekerjaan
    if (job.createdBy !== req.user.username) {
      return res.status(403).json({ message: 'Access denied. You are not the creator of this job.' });
    }

    // Periksa apakah pekerjaan telah selesai
    if (!job) {
      return res.status(400).json({ status: 'Failed', message: 'Job not found.' });
    }

    if (job.status !== 'Finish') {
      return res.status(404).json({ message: 'Job not finished yet.' });
    }

    // Buat ulasan baru
    const newReview = new Review({
      jobId,
      rating,
      comment,
      createdBy: req.user.username,
      createdFor: job.TakenBY,
    });

    await newReview.save();
    // Update rata-rata rating pada user
    const user = await User.findOne({ username: newReview.createdFor });
    user.ratings.totalRating += rating;
    user.ratings.numberOfReviews += 1;
    user.ratings.averageRating = user.ratings.totalRating / user.ratings.numberOfReviews;

    await user.save();

    res.status(201).json({ status: 'Success', message: 'Review added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
  }
};

const getAllReviewsForJobSeeker = async (req, res) => {
  try {
    const jobSeekerId = req.user.username;

    // Temukan semua ulasan yang ditujukan untuk job seeker
    const reviews = await Review.find({ createdFor: jobSeekerId });

    res.json({ status: 'Success', reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
  }
};

module.exports = { addReview, getAllReviewsForJobSeeker };
