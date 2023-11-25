const Job = require('../models/Job');

const createJob = async (req, res) => {
  try {
    const {
      title, category, budget, duration, location,
    } = req.body;

    // hanya role tertentu yang dapat membuat pekerjaan
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can create jobs.' });
    }

    // Pastikan untuk mengonversi lokasi ke format yang sesuai dengan schema
    const newJob = new Job({
      title,
      category,
      budget,
      duration,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      employer: req.user.username,
    });

    await newJob.save();

    res.status(201).json({ message: 'Job created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const searchJobs = async (req, res) => {
  try {
    const {
      category, location, radius, budgetRange,
    } = req.body;

    const jobs = await Job.find({
      category,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude],
          },
          $maxDistance: radius * 1000, // radius dalam meter
        },
      },
      budget: { $gte: budgetRange.min, $lte: budgetRange.max },
    });

    res.json({ success: true, jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = { createJob, getAllJobs, searchJobs };
