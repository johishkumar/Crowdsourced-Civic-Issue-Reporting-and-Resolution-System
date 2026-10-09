import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Mail, Phone, Globe, User, Shield, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PROVIDER_CONFIG = {
  google: { label: 'Google', icon: '🔵', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  apple: { label: 'Apple ID', icon: '⚫', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  phone: { label: 'Mobile OTP', icon: '🟠', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  email: { label: 'Email & Password', icon: '🟢', color: 'bg-green-50 text-green-700 border-green-200' },
};

const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 bg-white/60 rounded-2xl p-4 border border-white/80">
    <div className="flex-shrink-0 w-9 h-9 bg-navy-800/10 rounded-xl flex items-center justify-center">
      <Icon className="w-4 h-4 text-navy-800" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-navy-800 break-all">{value || '—'}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-navy-800 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const provider = PROVIDER_CONFIG[user.provider] || PROVIDER_CONFIG.email;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="min-h-screen bg-cream-200 flex items-center justify-center p-4">
      <motion.div
        className="auth-card w-full max-w-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-700">Authenticated</span>
          </div>
          <motion.button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-navy-800/20 text-navy-800 text-sm font-medium hover:bg-navy-800 hover:text-cream-200 transition-all duration-200"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>

        {/* Profile */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-8 pb-7 border-b border-black/5">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-navy-800 flex items-center justify-center text-cream-200 text-2xl font-bold flex-shrink-0 shadow-md">
              {(user.name || user.phone || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-navy-800">
              Welcome, {user.name || 'User'}!
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Your account is active and secured</p>
            <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${provider.color}`}>
              <span>{provider.icon}</span>
              {provider.label}
            </span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          <InfoCard icon={User} label="Full Name" value={user.name} />
          {user.email && <InfoCard icon={Mail} label="Email Address" value={user.email} />}
          {user.phone && <InfoCard icon={Phone} label="Phone Number" value={user.phone} />}
          <InfoCard icon={Globe} label="Login Provider" value={provider.label} />
          <InfoCard icon={Shield} label="Account Verified" value={user.isVerified ? 'Yes ✅' : 'No ❌'} />
          <InfoCard icon={Calendar} label="Member Since" value={joinDate} />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
