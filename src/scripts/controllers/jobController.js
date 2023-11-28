/* eslint-disable max-len */
const Job = require('../models/Job');
const geocodeAddress = require('../utils/geocoding');

const createJob = async (req, res) => {
  try {
    const {
      title, category, budget, startDate, endDate, address, description,
    } = req.body;

    // hanya role tertentu yang dapat membuat pekerjaan
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can create jobs.' });
    }

    // Geocode alamat menjadi koordinat
    const location = await geocodeAddress(address);

    // memastikan geocoding berhasil sebelum menyimpan pekerjaan
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

// hanya menampilkan semua pekerjaan dengan status Open
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const searchJobs = async (req, res) => {
  try {
    const {
      title, category, address, radius, budgetRange,
    } = req.body;

    const searchRadius = radius || 10;

    let userLocation;

    // Jika alamat pengguna tersedia dalam permintaan, konversi alamat ke koordinat
    if (address) {
      userLocation = await geocodeAddress(address);
    } else if (req.user.location) {
      // Jika alamat tidak tersedia dalam permintaan, gunakan lokasi dari database
      userLocation = { latitude: req.user.location.coordinates[1], longitude: req.user.location.coordinates[0] };
      console.log(userLocation);
    }

    // Pastikan lokasi atau alamat valid
    if (!userLocation) {
      return res.status(400).json({ message: 'Invalid address or location.' });
    }

    // Selanjutnya, gunakan userLocation untuk pencarian pekerjaan
    const query = {
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [userLocation.longitude, userLocation.latitude],
          },
          $maxDistance: searchRadius * 1000, // radius dalam meter
        },
      },
    };

    // Tambahkan kategori ke query jika disertakan dalam permintaan
    if (category) {
      query.category = category;
    }

    // Tambahkan rentang anggaran ke query jika disertakan dalam permintaan
    if (budgetRange) {
      query.budget = { $gte: budgetRange.min, $lte: budgetRange.max };
    }

    // Tambahkan pencarian berdasarkan title jika disertakan dalam permintaan
    if (title) {
      query.title = { $regex: title, $options: 'i' }; // i untuk case-insensitive
    }

    const jobs = await Job.find(query);

    const deg2rad = (deg) => deg * (Math.PI / 180);

    // Fungsi untuk menghitung jarak antara dua titik koordinat menggunakan formula Haversine
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius bumi dalam kilometer
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Jarak dalam kilometer
      return distance.toFixed(2); // Mengambil dua desimal pertama
    };

    // Tambahkan informasi jarak ke setiap pekerjaan dalam hasil pencarian
    const jobsWithDistance = jobs.map((job) => {
      const distance = calculateDistance(userLocation.latitude, userLocation.longitude, job.location.coordinates[1], job.location.coordinates[0]);
      return { ...job._doc, distance };
    });

    res.json({ success: true, jobs: jobsWithDistance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const jobDetail = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Temukan pekerjaan berdasarkan ID
    const job = await Job.findById(jobId);

    // Periksa apakah pekerjaan ditemukan
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Tampilkan detail pekerjaan
    res.json({ success: true, job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  createJob, getAllJobs, searchJobs, jobDetail,
};
