import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingButton from '../components/LoadingButton';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
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
        {!sent ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-800 text-cream-200 mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-navy-800">Forgot Password</h1>
              <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-email" className="auth-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className={`auth-input pl-10 ${error ? 'border-red-400' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              <LoadingButton type="submit" loading={loading} loadingText="Sending..." className="auth-btn bg-navy-800 text-cream-200 border-navy-800 hover:bg-navy-700">
                Send Reset Link
              </LoadingButton>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-navy-800/70 hover:text-navy-800 transition-colors font-medium">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <motion.div
            className="text-center py-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy-800 mb-2">Check Your Inbox</h2>
            <p className="text-gray-500 text-sm mb-6">
              A password reset link has been sent to <strong>{email}</strong>. It'll expire in 30 minutes.
            </p>
            <Link to="/login" className="auth-btn inline-flex w-auto px-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
