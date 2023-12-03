const bcrypt = require('bcrypt');
const User = require('../models/User');
const Job = require('../models/Job');
const geocodeAddress = require('../utils/geocoding');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserJobs = async (req, res) => {
  try {
    const { username } = req.params;
    const jobs = await Job.find({ createdBy: username });
    console.log(username);

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Cari pengguna berdasarkan username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Dapatkan data profil yang akan diubah dari request body
    const dataToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      // tambahkan bidang lain yang ingin diubah
    };

    // Periksa apakah tidak ada properti yang diubah
    if (Object.values(dataToUpdate).every((value) => value === undefined)) {
      return res.status(400).json({
        status: 'Failed',
        message: 'No data updated.',
      });
    }

    // Iterasi melalui data yang akan diubah dan update hanya jika ada nilai
    Object.entries(dataToUpdate).forEach(([key, value]) => {
      if (value !== undefined) {
        user[key] = value; // Ganti req.user menjadi user
      }
    });

    // Jika alamat diubah, update juga koordinat lokasi
    if (req.body.address) {
      const newLocation = await geocodeAddress(req.body.address);
      // Pastikan lokasi atau alamat valid
      if (!newLocation) {
        return res.status(400).json({
          status: 'Failed',
          message: 'Invalid address or location.',
        });
      }
      if (newLocation) {
        user.location.coordinates = [newLocation.longitude, newLocation.latitude];
      }
    }

    // Simpan perubahan ke dalam database
    await user.save(); // Ganti req.user.save() menjadi user.save()

    res.json({
      success: true,
      status: 'success',
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { username } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Cari pengguna berdasarkan username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Periksa kecocokan password saat ini
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash password baru
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password pengguna
    user.password = hashedNewPassword;

    // Simpan perubahan
    await user.save();

    res.json({ message: 'User password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Tambahkan fungsi-fungsi lain seperti mengupdate profil pengguna, dll.

module.exports = {
  getUserDetails,
  getUserJobs,
  getAllUsers,
  updateUserProfile,
  changeUserPassword,
};
