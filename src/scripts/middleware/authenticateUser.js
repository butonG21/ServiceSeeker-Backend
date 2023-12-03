/* eslint-disable max-len */
const User = require('../models/User');

const checkAuthenticatedUser = async (req, res, next) => {
  try {
    const requestedUsername = req.params.username;

    const requestedUser = await User.findOne({ username: requestedUsername });

    if (!requestedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Periksa apakah pengguna yang terautentikasi sama dengan pengguna yang diminta
    if (req.user.username !== requestedUser.username) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.requestedUser = requestedUser;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
module.exports = checkAuthenticatedUser;
