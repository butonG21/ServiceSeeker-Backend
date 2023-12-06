const jwt = require('jsonwebtoken');
const BlacklistToken = require('../models/blacklistToken');

const verifyToken = (token) => new Promise((resolve, reject) => {
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return reject(new Error('Invalid token.'));
    }

    // Periksa apakah token ada dalam daftar hitam
    const isTokenBlacklisted = await BlacklistToken.exists({ token });

    if (isTokenBlacklisted) {
      return reject(new Error('Access denied. Token is blacklisted.'));
    }

    resolve(user);
  });
});

module.exports = verifyToken;
