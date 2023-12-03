const User = require('../models/User');
const Job = require('../models/Job');

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
    const { id } = req.params;
    const user = await User.findById(id);

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
    const { userId } = req.params.id;
    const jobs = await Job.find({ employer: userId });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Tambahkan fungsi-fungsi lain seperti mengupdate profil pengguna, dll.

module.exports = { getUserDetails, getUserJobs, getAllUsers };
