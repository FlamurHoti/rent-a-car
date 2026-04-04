const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/reservationController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validateRequest');
const wrap = require('../middlewares/asyncHandler');

const router = express.Router();
const PHONE_REGEX = /^\+?[0-9\s\-(). ]{7,20}$/;

router.get('/availability', wrap(ctrl.checkAvailability));
router.use(authenticate);

const createValidation = [
  body('carId').notEmpty().withMessage('Car ID is required'),
  body('customerName').trim().notEmpty().isLength({ max: 100 }),
  body('customerPhone').trim().notEmpty().matches(PHONE_REGEX).withMessage('Invalid phone number'),
  body('startDate').isISO8601(), body('endDate').isISO8601(),
  body('notes').optional().trim().isLength({ max: 500 }),
];
const updateValidation = [
  body('startDate').optional().isISO8601(), body('endDate').optional().isISO8601(),
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
  body('customerName').optional().trim().notEmpty().isLength({ max: 100 }),
  body('customerPhone').optional().trim().notEmpty().matches(PHONE_REGEX),
  body('notes').optional().trim().isLength({ max: 500 }),
];

router.get('/', wrap(ctrl.list));
router.get('/:id', wrap(ctrl.getById));
router.post('/', createValidation, validate, wrap(ctrl.create));
router.patch('/:id', updateValidation, validate, wrap(ctrl.update));
router.delete('/:id', requireRole('OWNER'), wrap(ctrl.remove));

module.exports = router;
