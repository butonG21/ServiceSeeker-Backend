/* eslint-disable max-len */
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Job = require('../models/Job');
const geocodeAddress = require('../utils/geocoding');
const upload = require('../middleware/multerConfig');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username fullName email role ratings createdAt');

    const formattedUsers = users.map((user) => ({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      rating: user.ratings,
      createdAt: user.createdAt,
    }));

    res.json({
      success: true,
      status: 'success',
      data: formattedUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, status: 'error', message: 'Internal server error' });
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

    // Perbarui fullName jika firstName atau lastName diubah
    if (req.body.firstName || req.body.lastName) {
      user.fullName = `${req.body.firstName} ${req.body.lastName}`.trim();
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

const uploadProfileImage = async (req, res) => {
  try {
    const { username } = req.params;

    // Cari pengguna berdasarkan username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    upload.single('profileImage')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'Error uploading image.' });
      }

      const imageUrl = req.file ? req.file.path : null;

      // Update the profileImage field in the user document
      user.profileImage = imageUrl;

      // Save the updated user with the new profileImage
      const updatedUser = await user.save();

      res.status(200).json({ success: true, message: 'Image uploaded successfully', user: updatedUser });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Tambahkan fungsi-fungsi lain seperti mengupdate profil pengguna, dll.

module.exports = {
  getUserDetails,
  getUserJobs,
  getAllUsers,
  updateUserProfile,
  changeUserPassword,
  uploadProfileImage,
};
