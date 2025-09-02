const express = require('express');
const { body } = require('express-validator');
const reservationController = require('../controllers/reservationController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/availability', reservationController.checkAvailability);

router.use(authenticate);

const createValidation = [
  body('carId').notEmpty(),
  body('customerName').trim().notEmpty(),
  body('customerPhone').trim().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('notes').optional().trim(),
];
const updateValidation = [
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
  body('customerName').optional().trim().notEmpty(),
  body('customerPhone').optional().trim().notEmpty(),
  body('notes').optional().trim(),
];

router.get('/', reservationController.list);
router.get('/:id', reservationController.getById);
router.post('/', createValidation, reservationController.create);
router.patch('/:id', updateValidation, reservationController.update);
router.delete('/:id', reservationController.remove);

module.exports = router;
