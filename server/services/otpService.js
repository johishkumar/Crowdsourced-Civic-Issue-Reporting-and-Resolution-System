const twilio = require('twilio');

let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken && accountSid.startsWith('AC')) {
      twilioClient = twilio(accountSid, authToken);
    }
  }
  return twilioClient;
};

const getVerifyServiceSid = () => process.env.TWILIO_VERIFY_SERVICE_SID;

/**
 * Send OTP via Twilio Verify
 * @param {string} phone - E.164 format e.g. +918508614016
 */
const sendSmsOtp = async (phone) => {
  const client = getTwilioClient();
  const serviceSid = getVerifyServiceSid();

  if (!client || !serviceSid) {
    // Dev fallback — print OTP hint to console
    console.log(`[DEV MODE] Twilio Verify not configured. Skipping real SMS to ${phone}.`);
    return;
  }

  await client.verify.v2
    .services(serviceSid)
    .verifications.create({ to: phone, channel: 'sms' });
};

/**
 * Verify OTP via Twilio Verify
 * @param {string} phone - E.164 format
 * @param {string} code  - 6-digit code entered by user
 * @returns {{ valid: boolean }}
 */
const verifySmsOtp = async (phone, code) => {
  const client = getTwilioClient();
  const serviceSid = getVerifyServiceSid();

  if (!client || !serviceSid) {
    throw new Error('Twilio Verify is not configured.');
  }

  const check = await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({ to: phone, code });

  return { valid: check.status === 'approved' };
};

module.exports = { sendSmsOtp, verifySmsOtp };
