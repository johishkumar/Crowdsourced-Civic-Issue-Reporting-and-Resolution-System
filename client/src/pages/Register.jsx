import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingButton from '../components/LoadingButton';

const Register = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required.';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address.';
    if (!form.password || form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user);
      toast.success('Account created successfully! 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, type, name, placeholder, icon: Icon, show, onToggle }) => (
    <div>
      <label htmlFor={id} className="auth-label">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          id={id}
          name={name}
          type={show !== undefined ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          className={`auth-input pl-10 ${onToggle ? 'pr-12' : ''} ${errors[name] ? 'border-red-400' : ''}`}
          autoComplete={type === 'password' ? 'new-password' : name}
        />
        {onToggle && (
          <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-800" tabIndex={-1}>
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-200 flex items-center justify-center p-4">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-800 text-cream-200 mb-4">
            <User className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join us — it's free</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field id="name" label="Full Name" type="text" name="name" placeholder="Your full name" icon={User} />
          <Field id="email" label="Email" type="email" name="email" placeholder="Enter your email" icon={Mail} />
          <Field id="password" label="Password" type="password" name="password" placeholder="Min. 8 characters" icon={Lock} show={showPassword} onToggle={() => setShowPassword(s => !s)} />
          <Field id="confirmPassword" label="Confirm Password" type="password" name="confirmPassword" placeholder="Repeat your password" icon={Lock} show={showConfirm} onToggle={() => setShowConfirm(s => !s)} />

          <LoadingButton type="submit" loading={loading} loadingText="Creating account..." className="auth-btn bg-navy-800 text-cream-200 border-navy-800 hover:bg-navy-700">
            Create Account
          </LoadingButton>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-navy-800 font-semibold hover:underline underline-offset-2">
              Sign In
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
