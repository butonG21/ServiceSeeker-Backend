// models/reviewModel.js

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  rating: {
    type: Number, required: true, min: 1, max: 5,
  },
  comment: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.String, ref: 'User', required: true }, // ID pengguna (employer) yang memberikan penilaian
  createdFor: { type: mongoose.Schema.Types.String, ref: 'User', required: true }, // ID pengguna (job seeker) yang menyelesaikan pekerjaan
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
