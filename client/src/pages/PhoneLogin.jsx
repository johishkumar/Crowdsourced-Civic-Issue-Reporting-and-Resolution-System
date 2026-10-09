import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingButton from '../components/LoadingButton';

const RESEND_COOLDOWN = 60; // seconds

const PhoneLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1 = enter phone, 2 = enter OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  const formatPhone = (raw) => {
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length === 10) return `+91${cleaned}`;
    if (raw.startsWith('+')) return raw.replace(/\s/g, '');
    return `+${cleaned}`;
  };

  const validatePhone = () => {
    const cleaned = phone.replace(/\D/g, '');
    if (!phone || cleaned.length < 10) {
      setPhoneError('Please enter a valid mobile number.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const sendOtp = async () => {
    if (!validatePhone()) return;
    const formatted = formatPhone(phone);
    setLoading(true);
    try {
      await api.post('/auth/send-mobile-otp', { phone: formatted });
      toast.success('OTP sent successfully!');
      setStep(2);
      setCooldown(RESEND_COOLDOWN);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    const formatted = formatPhone(phone);
    setResendLoading(true);
    try {
      await api.post('/auth/resend-mobile-otp', { phone: formatted });
      toast.success('New OTP sent!');
      setCooldown(RESEND_COOLDOWN);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((d, i) => { if (i < 6) newOtp[i] = d; });
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    const formatted = formatPhone(phone);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-mobile-otp', { phone: formatted, otp: otpString });
      login(data.user);
      toast.success('Login successful! 🎉');
      navigate('/dashboard');
    } catch (err) {
      setOtpError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-200 flex items-center justify-center p-4">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => step === 2 ? (setStep(1), setOtp(['','','','','',''])) : navigate('/login')}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors text-navy-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-navy-800' : 'bg-gray-200'}`} />
            <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-navy-800' : 'bg-gray-200'}`} />
          </div>
          <div className="w-9" />
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500 text-white mb-4">
            <Smartphone className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-navy-800">
            {step === 1 ? 'Enter Mobile Number' : 'Verify OTP'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1
              ? 'We\'ll send a 6-digit code to your number'
              : `Code sent to ${phone}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <div className="mb-4">
                <label htmlFor="phone-input" className="auth-label">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="auth-input w-16 flex items-center justify-center font-semibold text-navy-800 cursor-default select-none flex-shrink-0">
                    +91
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                    className={`auth-input flex-1 ${phoneError ? 'border-red-400' : ''}`}
                    maxLength={15}
                    autoFocus
                  />
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
              </div>

              <LoadingButton
                onClick={sendOtp}
                loading={loading}
                loadingText="Sending OTP..."
                className="auth-btn bg-navy-800 text-cream-200 border-navy-800"
              >
                <Smartphone className="w-4 h-4" />
                Send OTP
              </LoadingButton>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              {/* OTP Boxes */}
              <div className="flex gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`otp-input ${digit ? 'filled' : ''} ${otpError ? 'border-red-400' : ''}`}
                    autoFocus={i === 0}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>
              {otpError && <p className="text-red-500 text-xs text-center mb-3">{otpError}</p>}

              <LoadingButton
                onClick={verifyOtp}
                loading={loading}
                loadingText="Verifying..."
                className="auth-btn bg-navy-800 text-cream-200 border-navy-800 mb-4"
              >
                <CheckCircle2 className="w-4 h-4" />
                Verify OTP
              </LoadingButton>

              {/* Resend */}
              <div className="text-center">
                {cooldown > 0 ? (
                  <p className="text-sm text-gray-400">Resend OTP in <strong>{cooldown}s</strong></p>
                ) : (
                  <button
                    onClick={resendOtp}
                    disabled={resendLoading}
                    className="inline-flex items-center gap-1.5 text-sm text-navy-800 font-medium hover:underline underline-offset-2 disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                    {resendLoading ? 'Resending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PhoneLogin;
