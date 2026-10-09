const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  sendMobileOtp,
  verifyMobileOtp,
  resendMobileOtp,
  googleCallback,
  appleCallback,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Rate Limiters ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please wait.' },
});

// ─── Validators ────────────────────────────────────────────────
const registerValidators = [
  body('name').trim().notEmpty().withMessage('Full name is required.'),
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match.');
    return true;
  }),
];

const loginValidators = [
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

// ─── Email / Password Routes ───────────────────────────────────
router.post('/register', authLimiter, registerValidators, register);
router.post('/login', authLimiter, loginValidators, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// ─── Password Reset ────────────────────────────────────────────
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// ─── Mobile OTP ────────────────────────────────────────────────
router.post('/send-mobile-otp', otpLimiter, sendMobileOtp);
router.post('/verify-mobile-otp', otpLimiter, verifyMobileOtp);
router.post('/resend-mobile-otp', otpLimiter, resendMobileOtp);

// ─── Google OAuth ──────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_failed' }),
  googleCallback
);

// ─── Apple Sign-In ─────────────────────────────────────────────
router.get(
  '/apple',
  passport.authenticate('apple')
);
router.post(
  '/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: '/login?error=apple_failed' }),
  appleCallback
);

module.exports = router;
