const express = require('express');
const { body } = require('express-validator');
const carController = require('../controllers/carController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validateRequest');
const wrap = require('../middlewares/asyncHandler');

const router = express.Router();
router.use(authenticate);

const MAX_YEAR = new Date().getFullYear() + 1;

const carValidation = [
  body('brand').trim().notEmpty().withMessage('Brand is required').isLength({ max: 100 }),
  body('model').trim().notEmpty().withMessage('Model is required').isLength({ max: 100 }),
  body('year').isInt({ min: 1990, max: MAX_YEAR }).withMessage(`Year must be 1990–${MAX_YEAR}`),
  body('plateNumber').trim().notEmpty().withMessage('Plate number is required').isLength({ max: 20 }),
  body('fuelType').isIn(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG']),
  body('transmission').isIn(['MANUAL', 'AUTOMATIC']),
  body('pricePerDay').isFloat({ min: 0.01, max: 99999 }),
  body('status').optional().isIn(['AVAILABLE', 'RESERVED', 'MAINTENANCE']),
  body('currentKm').optional().isInt({ min: 0, max: 9999999 }),
  body('serviceDueKm').optional().isInt({ min: 0, max: 9999999 }),
  body('imageUrl').optional().trim().isLength({ max: 500 }),
];
const patchValidation = [
  body('brand').optional().trim().notEmpty().isLength({ max: 100 }),
  body('model').optional().trim().notEmpty().isLength({ max: 100 }),
  body('year').optional().isInt({ min: 1990, max: MAX_YEAR }),
  body('plateNumber').optional().trim().notEmpty().isLength({ max: 20 }),
  body('fuelType').optional().isIn(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG']),
  body('transmission').optional().isIn(['MANUAL', 'AUTOMATIC']),
  body('pricePerDay').optional().isFloat({ min: 0.01, max: 99999 }),
  body('status').optional().isIn(['AVAILABLE', 'RESERVED', 'MAINTENANCE']),
  body('currentKm').optional().isInt({ min: 0, max: 9999999 }),
  body('serviceDueKm').optional().isInt({ min: 0, max: 9999999 }),
  body('imageUrl').optional().trim().isLength({ max: 500 }),
];

router.get('/', wrap(carController.list));
router.get('/:id', wrap(carController.getById));
router.post('/', carValidation, validate, wrap(carController.create));
router.patch('/:id', patchValidation, validate, wrap(carController.update));
router.delete('/:id', requireRole('OWNER'), wrap(carController.remove));

module.exports = router;
