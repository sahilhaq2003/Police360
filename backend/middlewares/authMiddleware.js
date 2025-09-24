const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.warn('[AUTH] No token provided for protected route', { method: req.method, url: req.originalUrl });
    return res.status(401).json({ message: 'No token, unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

// Allow Admin or IT Officer
const adminOrIt = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'Admin' || role === 'IT Officer') return next();
  return res.status(403).json({ message: 'Access denied: Admin or IT only' });
};

const officerOnly = (req, res, next) => {
  if (req.user?.role !== 'Officer') return res.status(403).json({ message: 'Access denied: Officers only' });
  next();
};

const itOnly = (req, res, next) => {
  if (req.user?.role !== 'IT Officer') return res.status(403).json({ message: 'Access denied: IT Officers only' });
  next();
};

module.exports = { protect, adminOnly, adminOrIt, officerOnly, itOnly };
