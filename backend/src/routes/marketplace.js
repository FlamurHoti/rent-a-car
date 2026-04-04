const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/marketplaceController');
const validate = require('../middlewares/validateRequest');
const wrap = require('../middlewares/asyncHandler');

const router = express.Router();

const publicRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests, please try again later.' } });
const bookingRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many booking attempts, please try again later.' } });

router.use(publicRateLimit);

router.get('/companies', wrap(ctrl.listCompanies));
router.get('/companies/:companyId/cars', wrap(ctrl.listCars));
router.get('/companies/:companyId/cars/:carId', wrap(ctrl.getCar));

router.post('/reservations', bookingRateLimit, [
  body('companyId').notEmpty(),
  body('carId').notEmpty(),
  body('customerName').trim().notEmpty().isLength({ max: 100 }),
  body('customerPhone').trim().notEmpty().matches(/^\+?[0-9\s\-(). ]{7,20}$/),
  body('customerEmail').optional({ checkFalsy: true }).trim().isEmail().normalizeEmail(),
  body('startDate').isISO8601(), body('endDate').isISO8601(),
  body('notes').optional().trim().isLength({ max: 500 }),
], validate, wrap(ctrl.createReservation));

module.exports = router;
