const Job = require('../models/Job');
geocodeAddress = require('../utils/geocoding');

const createJob = async (req, res) => {
  try {
    const {
      title, category, budget, startDate, endDate, address, description,
    } = req.body;

    // Geocode alamat menjadi koordinat
    const location = await geocodeAddress(address);

    // Pastikan geocoding berhasil sebelum menyimpan pekerjaan
    if (!location) {
      return res.status(400).json({ message: 'Geocoding failed for the provided address.' });
    }

    const newJob = new Job({
      title,
      description,
      category,
      budget,
      startDate,
      endDate,
      address,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      createdBy: req.user.username,
      status: 'Open', // Set status to Open when creating a new job
      createdAt: new Date(), // Add timestamp of job creation
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
