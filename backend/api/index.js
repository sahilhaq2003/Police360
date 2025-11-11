// Vercel serverless entry point for backend
// Each request is passed to the Express app exported by server.js
const app = require('../server');

module.exports = app;
