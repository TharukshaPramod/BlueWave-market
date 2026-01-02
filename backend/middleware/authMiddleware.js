const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Fixed: Removed duplicate 'const'

const protect = async (req, res, next) => {
  try {
    console.log('protect - Headers:', req.headers);
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('protect - No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('protect - Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('protect - Token verification failed:', error.message);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

const restrictToAdmin = (req, res, next) => {
  console.log('restrictToAdmin - User:', req.user);
  if (!req.user || req.user.role !== 'admin') {
    console.log('restrictToAdmin - Access denied, not an admin');
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

module.exports = { protect, restrictToAdmin };