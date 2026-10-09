const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, setTokenCookie } = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('../services/emailService');
const { sendSmsOtp, verifySmsOtp } = require('../services/otpService');
const { isDbConnected } = require('../config/db');

// ─────────────────────────────────────────────────────────────
// EMAIL / PASSWORD AUTH
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      provider: 'email',
      isVerified: true,
    });

    const token = generateToken(user._id, user.email);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.provider !== 'email' || !user.password) {
      return res.status(400).json({
        success: false,
        message: `This account was registered with ${user.provider}. Please use that login method.`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.email);
    setTokenCookie(res, token);

    // Remove password from response
    const userObj = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: userObj,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// FORGOT / RESET PASSWORD
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond with success to prevent email enumeration
    if (!user || user.provider !== 'email') {
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      console.error('Email send error:', emailError.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent.' });
    }

    res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password/:token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user._id, user.email);
    setTokenCookie(res, jwtToken);

    res.status(200).json({ success: true, message: 'Password reset successfully.', token: jwtToken });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// MOBILE OTP
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/send-mobile-otp
 */
const sendMobileOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^\+?[1-9]\d{9,14}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
    }

    // Twilio Verify handles OTP generation, delivery, and expiry automatically
    await sendSmsOtp(phone);

    res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('[sendMobileOtp] Error:', error.message);
    // Friendly message for trial account restriction
    if (error.code === 60203 || (error.message && error.message.includes('unverified'))) {
      return res.status(403).json({
        success: false,
        message: 'This number is not verified in your Twilio trial account. Please verify it at console.twilio.com → Verified Caller IDs.',
      });
    }
    next(error);
  }
};

/**
 * POST /api/auth/verify-mobile-otp
 */
const verifyMobileOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
    }

    // Twilio Verify checks the code — no local storage needed
    const { valid } = await verifySmsOtp(phone, otp);

    if (!valid) {
      return res.status(400).json({ success: false, message: 'Incorrect or expired OTP. Please try again.' });
    }

    // OTP verified — find or create user
    const useDb = isDbConnected();

    if (useDb) {
      let user = await User.findOne({ phone });
      if (!user) {
        user = await User.create({ phone, provider: 'phone', isVerified: true, name: `User ${phone.slice(-4)}` });
      }
      const token = generateToken(user._id, user.email);
      setTokenCookie(res, token);
      return res.status(200).json({ success: true, message: 'Login successful.', user, token });
    } else {
      // No DB — build lightweight session
      const fakeId = crypto.createHash('sha256').update(phone).digest('hex').slice(0, 24);
      const user = { _id: fakeId, phone, provider: 'phone', isVerified: true, name: `User ${phone.slice(-4)}` };
      const token = generateToken(fakeId, null);
      setTokenCookie(res, token);
      return res.status(200).json({ success: true, message: 'Login successful.', user, token });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-mobile-otp
 * Delegates to sendMobileOtp
 */
const resendMobileOtp = sendMobileOtp;

// ─────────────────────────────────────────────────────────────
// GOOGLE OAuth callback handler (called by Passport)
// ─────────────────────────────────────────────────────────────

const googleCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id, req.user.email);
    setTokenCookie(res, token);
    res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
  }
};

// ─────────────────────────────────────────────────────────────
// APPLE OAuth callback handler
// ─────────────────────────────────────────────────────────────

const appleCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id, req.user.email);
    setTokenCookie(res, token);
    res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=apple_auth_failed`);
  }
};

module.exports = {
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
};
