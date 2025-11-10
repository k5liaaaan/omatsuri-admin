require('dotenv').config();

const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

module.exports = {
  frontendBaseUrl: FRONTEND_BASE_URL
};

