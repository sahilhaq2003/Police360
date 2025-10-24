const Officer = require('../models/Officer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login Officer/Admin
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const officer = await Officer.findOne({ username });

    if (!officer)
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!officer.isActive)
      return res.status(401).json({ message: 'Your account has been deactivated. Please contact your administrator.' });

    const isMatch = await bcrypt.compare(password, officer.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: officer._id, role: officer.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      officer: {
        id: officer._id,
        name: officer.name,
        role: officer.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
