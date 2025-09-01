/**
 * Single PrismaClient instance for the application.
 * Prevents connection exhaustion when multiple modules import PrismaClient.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = { prisma };
