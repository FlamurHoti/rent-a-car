const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/companyController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validateRequest');
const wrap = require('../middlewares/asyncHandler');

const router = express.Router();
router.use(authenticate);

router.get('/me', wrap(ctrl.getMyCompany));
router.patch('/me', [
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('address').optional().trim().isLength({ max: 300 }),
  body('businessNumber').optional().trim().isLength({ max: 50 }),
  body('subscriptionPlan').optional().trim().isLength({ max: 50 }),
  body('subscriptionExpiry').optional().isISO8601(),
], validate, wrap(ctrl.updateMyCompany));

module.exports = router;
