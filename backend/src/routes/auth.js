const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(authLimiter);

const registerValidation = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('companyEmail').trim().isEmail().withMessage('Valid company email required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('companyPhone').optional().trim(),
  body('companyAddress').optional().trim(),
  body('businessNumber').optional().trim(),
  body('subscriptionPlan').optional().trim(),
  body('subscriptionExpiry').optional().isISO8601(),
];
const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
