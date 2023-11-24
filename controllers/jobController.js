const Job = require('../models/Job');

const createJob = async (req, res) => {
  try {
    const { title, category, budget, duration, location } = req.body;

    const newJob = new Job({
        title,
        category,
        budget,
        duration,
        location: JSON.stringify(location),
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
      const { category, location, radius, budgetRange } = req.body;
  
      const jobs = await Job.find({
        category,
        location: {
          $geoWithin: {
$centerSphere: [
              JSON.parse(locationString).longitude, // Mengonversi kembali ke objek
              JSON.parse(locationString).latitude,  // Mengonversi kembali ke objek
              radius / 6371 // radius dalam radian (6371 adalah radius bumi dalam kilometer)
            ]
          }
        },
        budget: { $gte: budgetRange.min, $lte: budgetRange.max }
      });
  
      res.json({ success: true, jobs });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };

module.exports = { createJob, getAllJobs, searchJobs, };
