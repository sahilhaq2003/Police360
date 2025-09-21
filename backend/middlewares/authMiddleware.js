const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

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

const officerOnly = (req, res, next) => {
  if (req.user?.role !== 'Officer') return res.status(403).json({ message: 'Access denied: Officers only' });
  next();
};

const itOnly = (req, res, next) => {
  if (req.user?.role !== 'IT Officer') return res.status(403).json({ message: 'Access denied: IT Officers only' });
  next();
};

module.exports = { protect, adminOnly, officerOnly, itOnly };
