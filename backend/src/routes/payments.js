const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', paymentController.list);
router.get('/:id', paymentController.getById);
router.post('/', [
  body('reservationId').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('method').isIn(['CASH', 'BANK', 'ONLINE']),
], paymentController.create);
// Only OWNER can mark payment as completed (enforced in controller if you want; here we allow STAFF to update other statuses, OWNER for COMPLETED)
router.patch('/:id', [
  body('status').isIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
], paymentController.update);

module.exports = router;
