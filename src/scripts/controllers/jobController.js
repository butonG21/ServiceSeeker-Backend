/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
const mongoose = require('mongoose');
const Job = require('../models/Job');
const geocodeAddress = require('../utils/geocoding');
const { paginateResults, validatePage } = require('../utils/paginations');

const createJob = async (req, res) => {
  try {
    const {
      title, category, budget, endDate, address, description,
    } = req.body;

    // hanya role tertentu yang dapat membuat pekerjaan
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        status: ' Failed',
        message: 'Access denied. Only employers can create jobs.',
      });
    }

    // Geocode alamat menjadi koordinat
    const location = await geocodeAddress(address);

    // memastikan geocoding berhasil sebelum menyimpan pekerjaan
    if (!location) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Geocoding failed for the provided address.',
      });
    }

    const newJob = new Job({
      title,
      description,
      category,
      budget,
      address,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      createdBy: req.user.username,
      status: 'Open',
      createdAt: new Date().toISOString(),
      endDate,
    });

    // Validasi EndDate
    const currentDate = new Date();
    const jobEndDate = new Date(endDate);

    if (jobEndDate < currentDate) {
      return res.status(400).json({
        status: ' Failed',
        message: 'End date must be equal to or greater than the current date.',
      });
    }

    await newJob.save();

    res.status(201).json({
      status: ' Success',
      message: 'Job created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: ' Failed',
      message: 'Internal server error',
    });
  }
};

// validasi nilai status
const validateStatus = (status) => {
  const allowedStatusValues = ['Open', 'Process', 'Finish', 'all'];

  if (!allowedStatusValues.includes(status)) {
    throw new Error('Invalid status value');
  }
};

// validasi nilai sort
const validateSort = (sort) => {
  const allowedSortValues = ['asc', 'desc'];

  if (sort && !allowedSortValues.includes(sort)) {
    throw new Error('Invalid sort value');
  }
};

const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      category,
      sort,
      status = 'Open',
    } = req.query;

    // Validasi nilai halaman
    validatePage(page);

    // Validasi nilai status
    validateStatus(status);

    // Validasi nilai sort
    validateSort(sort);

    // Buat objek query untuk pencarian
    const query = {};
    if (category) {
      query.category = category;
    }

    if (status !== 'all') {
      query.status = status;
    }

    const jobsQuery = Job.find(query);

    // Tambahkan fitur pengurutan jika sort parameter tersedia
    if (sort) {
      const sortOrder = sort === 'asc' ? 1 : -1;
      jobsQuery.sort({ createdAt: sortOrder }); // Gantilah dengan kolom yang sesuai
    }

    const jobs = await jobsQuery.exec();

    const pageSize = 10;

    const paginatedJobs = paginateResults(jobs, page, pageSize);

    // jumlah pekerjaan
    const totalJobs = jobs.length;

    res.json({
      totalJobs,
      page,
      pageSize,
      jobs: paginatedJobs,
    });
  } catch (error) {
    if (
      error.message.includes('Invalid page value')
      || error.message.includes('Invalid status value')
      || error.message.includes('Invalid sort value')
    ) {
      res.status(400).json({
        status: 'Failed',
        message: error.message,
      });
    } else {
      console.error(error);
      res.status(500).json({
        status: 'Failed',
        message: 'Internal Server Error',
      });
    }
  }
};

const searchJobs = async (req, res) => {
  try {
    const {
      title, category, address, radius, budgetRange, page = 1, sort, status = 'Open',
    } = req.query;

    const searchRadius = radius || 10;
    const pageSize = 10;

    let userLocation;

    // hanya pengguna yang login yang dapat menggunakan fitur ini
    if (!req.user || !req.user.location) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only logged-in users can use this feature.',
      });
    }

    // Jika alamat pengguna tersedia dalam permintaan, konversi alamat ke koordinat
    if (address) {
      userLocation = await geocodeAddress(address);
    } else {
      // Jika alamat tidak tersedia dalam permintaan, gunakan lokasi dari database
      userLocation = { latitude: req.user.location.coordinates[1], longitude: req.user.location.coordinates[0] };
    }

    // Pastikan lokasi atau alamat valid
    if (!userLocation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address or location.',
      });
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

    const jobsQuery = Job.find(query).select('-__v');
    if (sort) {
      const sortOrder = sort === 'asc' ? 1 : -1;
      jobsQuery.sort({ createdAt: sortOrder });
    }

    if (status !== 'all') {
      query.status = status;
    }

    const jobs = await jobsQuery.exec();

    const paginatedJobs = paginateResults(jobs, page, pageSize);
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
    paginatedJobs.jobs.forEach((job) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        job.location.coordinates[1],
        job.location.coordinates[0],
      );
      job.distance = distance;
    });

    res.json({
      success: true,
      totalJobs: jobs.length,
      page,
      pageSize,
      jobs: paginatedJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const jobDetail = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Pastikan jobId tidak kosong
    if (!jobId) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Job ID is required.',
      });
    }

    // Pastikan jobId adalah ObjectId yang valid
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Invalid Job ID.',
      });
    }

    // Temukan pekerjaan berdasarkan ID
    const job = await Job.findById(jobId);

    // Periksa apakah pekerjaan ditemukan
    if (!job) {
      return res.status(404).json({
        status: ' Failed',
        message: 'Job not found.',
      });
    }

    // Tampilkan detail pekerjaan
    res.json({ success: true, job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const editJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Pastikan jobId tidak kosong
    if (!jobId) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Job ID is required.',
      });
    }

    // Pastikan jobId adalah ObjectId yang valid
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Invalid Job ID.',
      });
    }
    const job = await Job.findById(jobId);

    // Periksa apakah pekerjaan dalam status "Open"
    if (job.status !== 'Open') {
      return res.status(400).json({ message: 'Job cannot be edited. It is not in Open status.' });
    }

    // Periksa apakah tidak ada data yang dikirimkan dalam body request
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: ' Failed',
        message: 'No data provided for update.',
      });
    }

    // Dapatkan data pekerjaan yang akan diubah dari request body
    const dataToUpdate = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      budget: req.body.budget,
      endDate: req.body.endDate,
      address: req.body.address,
      updatedAt: new Date().toISOString(),
    };

    // Periksa apakah tidak ada properti yang diubah
    if (Object.values(dataToUpdate).every((value) => value === undefined)) {
      return res.status(400).json({
        status: ' Failed',
        message: 'No data updated.',
      });
    }

    // Iterasi melalui data yang akan diubah dan update hanya jika ada nilai
    Object.entries(dataToUpdate).forEach(([key, value]) => {
      if (value !== undefined) {
        req.job[key] = value;
      }
    });
    // Jika alamat diubah, update juga koordinat lokasi
    if (req.body.address) {
      const newLocation = await geocodeAddress(req.body.address);
      // Pastikan lokasi atau alamat valid
      if (!newLocation) {
        return res.status(400).json({
          status: ' Failed',
          message: 'Invalid address or location.',
        });
      }
      if (newLocation) {
        req.job.location.coordinates = [newLocation.longitude, newLocation.latitude];
      }
    }

    // Simpan perubahan ke dalam database
    await req.job.save();

    res.json({
      success: true,
      status: ' success',
      message: 'Job updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const deleteJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Pastikan jobId tidak kosong
    if (!jobId) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Job ID is required.',
      });
    }

    // Pastikan jobId adalah ObjectId yang valid
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Invalid Job ID.',
      });
    }

    // Hapus pekerjaan dari database
    await Job.findByIdAndDelete(jobId);

    res.json({
      success: true,
      status: ' success',
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Temukan pekerjaan berdasarkan ID
    const job = await Job.findById(jobId);

    // Pastikan jobId tidak kosong
    if (!jobId) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Job ID is required.',
      });
    }

    // Pastikan jobId adalah ObjectId yang valid
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Invalid Job ID.',
      });
    }

    // Periksa apakah pekerjaan ditemukan
    if (!job) {
      return res.status(404).json({
        status: ' Failed',
        message: 'Job not found.',
      });
    }

    // Periksa apakah status pekerjaan adalah "Open"
    if (job.status !== 'Open') {
      return res.status(400).json({
        status: ' Failed',
        message: 'Job cannot be applied. It is not in Open status.',
      });
    }

    // Periksa apakah user memiliki role "job_seeker"
    if (req.user.role !== 'job_seeker') {
      return res.status(403).json({
        status: ' Failed',
        message: 'Access denied. Only job_seekers can apply for jobs.',
      });
    }

    // Periksa apakah job_seeker sudah mengajukan pekerjaan sebelumnya
    if (job.TakenBY) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Job has already been assigned.',
      });
    }

    // Setel assignedTo dengan ID job_seeker yang mengambil pekerjaan
    job.TakenBY = req.user.username;

    // Setel status pekerjaan menjadi "In Progress"
    job.status = 'Process';

    // Simpan perubahan ke dalam database
    await job.save();

    res.json({
      success: true,
      status: 'success',
      message: 'Job applied successfully',
      jobId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Temukan pekerjaan berdasarkan ID
    const job = await Job.findById(jobId);

    // Pastikan jobId tidak kosong
    if (!jobId) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Job ID is required.',
      });
    }

    // Pastikan jobId adalah ObjectId yang valid
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        status: ' Failed',
        message: 'Invalid Job ID.',
      });
    }

    // Periksa apakah pekerjaan ditemukan
    if (!job) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Job not found.',
      });
    }

    // Periksa apakah status pekerjaan saat ini adalah "Process"
    if (job.status !== 'Process') {
      return res.status(400).json({
        status: 'Failed',
        message: 'Job status must be "Process" to mark it as finished.',
      });
    }

    // Setel status pekerjaan menjadi "Finish"
    job.status = 'Finish';

    // Simpan perubahan ke dalam database
    await job.save();

    res.json({
      success: true,
      status: 'Success',
      message: 'Job status updated to "Finish" successfully.',
      jobId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  searchJobs,
  jobDetail,
  editJobById,
  deleteJobById,
  applyForJob,
  updateJobStatus,
};
