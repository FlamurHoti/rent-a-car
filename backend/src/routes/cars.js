const express = require('express');
const { body } = require('express-validator');
const carController = require('../controllers/carController');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = express.Router();

// All routes require auth; multi-tenant filter by req.companyId in controller
router.use(authenticate);

const carValidation = [
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1990, max: 2030 }).withMessage('Year must be between 1990 and 2030'),
  body('plateNumber').trim().notEmpty().withMessage('Plate number is required'),
  body('fuelType').isIn(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG']).withMessage('Invalid fuel type'),
  body('transmission').isIn(['MANUAL', 'AUTOMATIC']).withMessage('Invalid transmission'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
  body('status').optional().isIn(['AVAILABLE', 'RESERVED', 'MAINTENANCE']),
  body('currentKm').optional().isInt({ min: 0 }),
  body('serviceDueKm').optional().isInt({ min: 0 }),
];

router.get('/', carController.list);
router.get('/:id', carController.getById);
router.post('/', carValidation, carController.create);
router.patch('/:id', [
  body('brand').optional().trim().notEmpty(),
  body('model').optional().trim().notEmpty(),
  body('year').optional().isInt({ min: 1990, max: 2030 }),
  body('plateNumber').optional().trim().notEmpty(),
  body('fuelType').optional().isIn(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG']),
  body('transmission').optional().isIn(['MANUAL', 'AUTOMATIC']),
  body('pricePerDay').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['AVAILABLE', 'RESERVED', 'MAINTENANCE']),
  body('currentKm').optional().isInt({ min: 0 }),
  body('serviceDueKm').optional().isInt({ min: 0 }),
], carController.update);
// Only OWNER can delete cars; STAFF cannot
router.delete('/:id', requireRole('OWNER'), carController.remove);

module.exports = router;
