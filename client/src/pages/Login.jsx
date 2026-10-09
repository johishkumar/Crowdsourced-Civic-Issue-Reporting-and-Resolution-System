import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/GoogleButton';
import AppleButton from '../components/AppleButton';
import PhoneOtpButton from '../components/PhoneOtpButton';
import EmailLoginForm from '../components/EmailLoginForm';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const { user, loading } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const handleAppleLogin = () => {
    setAppleLoading(true);
    window.location.href = `${BACKEND_URL}/api/auth/apple`;
  };

  return (
    <div className="min-h-screen bg-cream-200 flex items-center justify-center p-4">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-800 text-cream-200 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Social Login Row (side by side on desktop, stacked on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />
          <AppleButton onClick={handleAppleLogin} loading={appleLoading} />
        </div>

        {/* Phone OTP */}
        <div className="mt-3">
          <PhoneOtpButton
            onClick={() => (window.location.href = '/phone-login')}
          />
        </div>

        {/* Divider */}
        <div className="divider mt-6">
          <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase whitespace-nowrap">
            or login with email
          </span>
        </div>

        {/* Email Login Form */}
        <EmailLoginForm />
      </motion.div>
    </div>
  );
};

export default Login;
