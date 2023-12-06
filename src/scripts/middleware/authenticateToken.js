const verifyToken = require('./verifyToken');

const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token is missing.' });
  }

  try {
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    if (error.message === 'Access denied. Token is blacklisted.') {
      // Ubah respons jika token telah dinonaktifkan
      return res.status(401).json({ message: 'Access denied. You have Logout.' });
    }
    // Respons lainnya sesuai dengan kesalahan lainnya
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
