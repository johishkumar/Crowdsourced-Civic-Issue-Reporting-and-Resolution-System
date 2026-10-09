const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Generate a secure random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
};

/**
 * Hash an OTP string using bcrypt
 * @param {string} otp
 * @returns {Promise<string>} hashed OTP
 */
const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

/**
 * Compare plain OTP with hashed OTP
 * @param {string} otp
 * @param {string} hashedOtp
 * @returns {Promise<boolean>}
 */
const verifyOtp = async (otp, hashedOtp) => {
  return bcrypt.compare(otp, hashedOtp);
};

module.exports = { generateOtp, hashOtp, verifyOtp };
