const serverless = require('serverless-http');
// Require the app exported from backend/server.js
const app = require('../backend/server');

module.exports = serverless(app);
