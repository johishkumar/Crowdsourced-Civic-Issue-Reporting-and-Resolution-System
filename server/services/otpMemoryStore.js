/**
 * In-memory OTP store — used when MongoDB is not configured.
 * Entries are auto-expired after 5 minutes via a cleanup interval.
 *
 * Structure: Map<phone, { otpHash, expiresAt, attempts, lastSentAt }>
 */
const bcrypt = require('bcryptjs');

const store = new Map();

// Clean up expired entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of store.entries()) {
    if (record.expiresAt < now) store.delete(phone);
  }
}, 2 * 60 * 1000);

const inMemoryOtpStore = {
  /** Find an OTP record by phone number */
  findOne: async (phone) => store.get(phone) || null,

  /** Upsert (create or update) an OTP record */
  upsert: async (phone, { otpHash, expiresAt, attempts = 0, lastSentAt = new Date() }) => {
    store.set(phone, { otpHash, expiresAt: new Date(expiresAt).getTime(), attempts, lastSentAt: new Date(lastSentAt) });
  },

  /** Increment attempt counter */
  incrementAttempts: async (phone) => {
    const rec = store.get(phone);
    if (rec) { rec.attempts += 1; store.set(phone, rec); }
  },

  /** Delete an OTP record */
  deleteOne: async (phone) => store.delete(phone),

  /** Verify a plain OTP against the stored hash */
  verify: async (phone, plainOtp) => {
    const rec = store.get(phone);
    if (!rec) return { found: false };
    if (rec.expiresAt < Date.now()) {
      store.delete(phone);
      return { found: true, expired: true };
    }
    if (rec.attempts >= 3) {
      store.delete(phone);
      return { found: true, tooManyAttempts: true };
    }
    const match = await bcrypt.compare(plainOtp, rec.otpHash);
    if (!match) {
      rec.attempts += 1;
      store.set(phone, rec);
      return { found: true, valid: false, remaining: 3 - rec.attempts };
    }
    store.delete(phone);
    return { found: true, valid: true };
  },
};

module.exports = inMemoryOtpStore;
