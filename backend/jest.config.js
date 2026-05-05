/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 60000, // DB + HTTP round-trips can be slow on Neon free tier
  forceExit: true,    // Prevent Jest from hanging on open Prisma connections
  verbose: true,
};
