const express = require('express');
const { body } = require('express-validator');
const companyController = require('../controllers/companyController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/me', companyController.getMyCompany);
router.patch('/me', [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('businessNumber').optional().trim(),
  body('subscriptionPlan').optional().trim(),
  body('subscriptionExpiry').optional().isISO8601(),
], companyController.updateMyCompany);

module.exports = router;
