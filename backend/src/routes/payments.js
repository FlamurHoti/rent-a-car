const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/paymentController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validateRequest');
const wrap = require('../middlewares/asyncHandler');

const router = express.Router();
router.use(authenticate);

router.get('/', wrap(ctrl.list));
router.get('/:id', wrap(ctrl.getById));
router.post('/', requireRole('OWNER'), [
  body('reservationId').notEmpty(),
  body('amount').isFloat({ min: 0.01, max: 999999 }),
  body('method').isIn(['CASH', 'BANK', 'ONLINE']),
], validate, wrap(ctrl.create));
router.patch('/:id', requireRole('OWNER'), [
  body('status').isIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
], validate, wrap(ctrl.update));

module.exports = router;
