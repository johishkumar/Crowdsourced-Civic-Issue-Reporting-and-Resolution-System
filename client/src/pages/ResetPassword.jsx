import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingButton from '../components/LoadingButton';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.password || form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
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
        {!done ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-800 text-cream-200 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-navy-800">Reset Password</h1>
              <p className="text-sm text-gray-500 mt-1">Create a strong new password</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {[
                { id: 'rp-password', name: 'password', label: 'New Password', show: showPass, toggle: () => setShowPass(s => !s) },
                { id: 'rp-confirm', name: 'confirmPassword', label: 'Confirm Password', show: showConfirm, toggle: () => setShowConfirm(s => !s) },
              ].map(({ id, name, label, show, toggle }) => (
                <div key={id}>
                  <label htmlFor={id} className="auth-label">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id={id}
                      name={name}
                      type={show ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form[name]}
                      onChange={handleChange}
                      className={`auth-input pl-10 pr-12 ${errors[name] ? 'border-red-400' : ''}`}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={toggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-800" tabIndex={-1}>
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                </div>
              ))}

              <LoadingButton type="submit" loading={loading} loadingText="Resetting..." className="auth-btn bg-navy-800 text-cream-200 border-navy-800">
                Reset Password
              </LoadingButton>
            </form>
          </>
        ) : (
          <motion.div className="text-center py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy-800 mb-2">Password Updated!</h2>
            <p className="text-gray-500 text-sm">Redirecting you to login...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
