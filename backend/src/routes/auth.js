const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validateRequest');
const wrap = require('../middlewares/asyncHandler');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true, legacyHeaders: false,
});
router.use(authLimiter);

const registerValidation = [
  body('companyName').trim().notEmpty().withMessage('Company name is required').isLength({ max: 200 }),
  body('companyEmail').trim().isEmail().withMessage('Valid company email required').normalizeEmail(),
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters'),
  body('companyPhone').optional().trim().isLength({ max: 30 }),
  body('companyAddress').optional().trim().isLength({ max: 300 }),
  body('businessNumber').optional().trim().isLength({ max: 50 }),
  body('subscriptionPlan').optional().trim().isLength({ max: 50 }),
  body('subscriptionExpiry').optional().isISO8601(),
];
const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').isLength({ max: 128 }),
];

router.post('/register', registerValidation, validate, wrap(authController.register));
router.post('/login', loginValidation, validate, wrap(authController.login));
router.get('/me', authenticate, wrap(authController.me));

module.exports = router;
