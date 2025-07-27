const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // <-- your connection file

dotenv.config(); // Load .env file

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
