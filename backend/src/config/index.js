require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  if (isProduction) {
    throw new Error('JWT_SECRET must be set in production.');
  }
  console.warn('WARNING: JWT_SECRET not set. Using insecure default — set JWT_SECRET in .env for safety.');
}

if (jwtSecret && jwtSecret.length < 32) {
  if (isProduction) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }
  console.warn('WARNING: JWT_SECRET is too short (min 32 chars). This is insecure.');
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: jwtSecret || 'dev-only-insecure-fallback-secret-32ch',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
