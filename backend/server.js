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

const router = require('./routes/reportRoutes');


const requestRoutes = require('./routes/requestRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const criminalRoutes = require('./routes/criminalRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const suspectRoutes = require('./routes/suspectRoutes');

const accidentRoutes = require('./routes/accidentRoutes');
const caseRoutes = require('./routes/caseRoutes');
const itCaseRoutes = require('./routes/itCaseRoutes');

dotenv.config();

const app = express();

// Initialize DB connection (don't await at module level for serverless)
let dbConnected = false;
connectDB()
  .then(() => {
    dbConnected = true;
    console.log('[INIT] MongoDB connected successfully');
  })
  .catch(err => {
    console.error('[INIT] Failed to connect to MongoDB:', err.message);
    // Don't crash - allow healthcheck to respond
  });

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// Allow default vite host (5173) and alternative 5174 used by some dev setups
const CORS_WHITELIST = new Set([CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174']);
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g., server-to-server, curl)
      if (!origin) return callback(null, true);
      if (CORS_WHITELIST.has(origin)) return callback(null, true);
      try {
        const url = new URL(origin);
        // Allow any vercel.app subdomain (preview/production)
        if (url.hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch (_e) {
        // ignore parsing errors
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
  })
);
// Ensure preflight requests are handled early (regex avoids path-to-regexp '*' issue)
app.options(/.*/, cors());

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Simple request logger for debugging (temporary)
app.use((req, _res, next) => {
  console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files from uploads directory (disabled on Vercel serverless)
if (!process.env.VERCEL) {
  // Create uploads directory if it doesn't exist (only for non-serverless environments)
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} else {
  console.warn('[INIT] Running on Vercel serverless – local disk uploads are disabled.');
}

app.get('/api/health', (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

// Diagnostic endpoint to check environment
app.get('/api/diagnostics', (_req, res) => {
  const mongooseState = require('mongoose').connection.readyState;
  res.json({
    env: {
      hasMongoUri: !!process.env.MONGO_URI,
      mongoUriLength: process.env.MONGO_URI?.length || 0,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasClientUrl: !!process.env.CLIENT_URL,
      clientUrl: process.env.CLIENT_URL,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
    },
    mongodb: {
      connected: mongooseState === 1,
      state: mongooseState,
      stateLabel: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongooseState],
      dbConnected: dbConnected,
    },
    timestamp: new Date().toISOString()
  });
});

// Favicon: avoid noisy 500s from automatic browser requests
app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.use('/api/auth', authRoutes);
app.use('/api/officers', officerRoutes);

app.use('/api/reports', reportRoutes);


app.use('/api/requests', requestRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/criminals', criminalRoutes);
// Disable upload endpoints on Vercel since persistent disk is not available
if (!process.env.VERCEL) {
  app.use('/api/uploads', uploadRoutes);
} else {
  app.use('/api/uploads', (_req, res) =>
    res.status(501).json({ message: 'File uploads are disabled on this deployment.' })
  );
}
app.use('/api/suspects', suspectRoutes);


//tharusha Routes

// app.use('/api/reports', router);

//Enuri Routes

app.use('/api/accidents', accidentRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/it-cases', itCaseRoutes);
app.use('/api/reporting', reportingRoutes);
app.get('/', (_req, res) => res.send('Police360 API running'));

// 404 handler - must be after all routes
app.use((req, res) => {
  console.warn('[404] Route not found', { method: req.method, url: req.originalUrl });
  return res.status(404).json({ message: 'Route not found' });
});

// Error handler - must be last
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  if (err.type === 'entity.too.large')
    return res.status(413).json({ message: 'Payload too large' });
  if (err.message === 'Not allowed by CORS')
    return res.status(403).json({ message: 'CORS policy violation' });
  res.status(500).json({ 
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message 
  });
});



const PORT = process.env.PORT || 8000;
// When run directly (node backend/server.js) start the server.
// When required by a serverless wrapper (Vercel / tests), export the app.
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} else {
  module.exports = app;
}