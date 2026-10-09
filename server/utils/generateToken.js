const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} userId
 * @param {string} email
 * @returns {string} signed JWT
 */
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Set JWT as HTTP-only cookie
 * @param {object} res - Express response
 * @param {string} token - JWT token
 */
const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

module.exports = { generateToken, setTokenCookie };
