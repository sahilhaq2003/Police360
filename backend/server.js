const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const officerRoutes = require('./routes/officerRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const reportingRoutes = require('./routes/reportingRoutes');

const requestRoutes = require('./routes/requestRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const criminalRoutes = require('./routes/criminalRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const suspectRoutes = require('./routes/suspectRoutes');


const accidentRoutes = require('./routes/accidentRoutes');
const caseRoutes = require('./routes/caseRoutes');


dotenv.config();
connectDB();

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// Allow default vite host (5173) and alternative 5174 used by some dev setups
const CORS_WHITELIST = [CLIENT_URL, 'http://localhost:5174'];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g., server-to-server, curl)
      if (!origin) return callback(null, true);
      if (CORS_WHITELIST.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/reports', reportRoutes);

app.use('/api/requests', requestRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/criminals', criminalRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/suspects', suspectRoutes);


//Enuri Routes

app.use('/api/accidents', accidentRoutes);
app.use('/api/cases', caseRoutes);
app.get('/', (_req, res) => res.send('Police360 API running'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large')
    return res.status(413).json({ message: 'Payload too large' });
  res.status(500).json({ message: 'Server error' });
});


app.use('/api/reporting', reportingRoutes);


app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large')
    return res.status(413).json({ message: 'Payload too large' });
  res.status(500).json({ message: 'Server error' });
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
