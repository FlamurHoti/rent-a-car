const { Router } = require('express');

const authRoutes        = require('./auth');
const companyRoutes     = require('./companies');
const carRoutes         = require('./cars');
const reservationRoutes = require('./reservations');
const dashboardRoutes   = require('./dashboard');
const paymentRoutes     = require('./payments');
const marketplaceRoutes = require('./marketplace');

const router = Router();

router.use('/auth',         authRoutes);
router.use('/companies',    companyRoutes);
router.use('/cars',         carRoutes);
router.use('/reservations', reservationRoutes);
router.use('/dashboard',    dashboardRoutes);
router.use('/payments',     paymentRoutes);
router.use('/public',       marketplaceRoutes);

module.exports = router;