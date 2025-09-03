const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const marketplaceController = require('../controllers/marketplaceController');

const router = express.Router();

const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const bookingRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many booking attempts, please try again later.' },
});

router.use(publicRateLimit);

router.get('/companies', marketplaceController.listCompanies);
router.get('/companies/:companyId/cars', marketplaceController.listCars);
router.get('/companies/:companyId/cars/:carId', marketplaceController.getCar);

const createReservationValidation = [
  body('companyId').notEmpty().withMessage('companyId is required'),
  body('carId').notEmpty().withMessage('carId is required'),
  body('customerName').trim().notEmpty().withMessage('Customer name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('customerPhone').trim().notEmpty().withMessage('Customer phone is required')
    .matches(/^\+?[0-9\s\-(). ]{7,20}$/).withMessage('Please enter a valid phone number (e.g. +383 44 123 456)'),
  body('customerEmail').optional({ checkFalsy: true }).trim().isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long'),
];
router.post('/reservations', bookingRateLimit, createReservationValidation, marketplaceController.createReservation);

module.exports = router;
