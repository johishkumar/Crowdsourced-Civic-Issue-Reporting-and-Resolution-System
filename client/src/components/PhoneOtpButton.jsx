import { motion } from 'framer-motion';
import { Smartphone, Loader2 } from 'lucide-react';

const PhoneOtpButton = ({ onClick, loading }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="auth-btn"
      whileHover={!loading ? { y: -2 } : {}}
      whileTap={!loading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Smartphone className="w-[18px] h-[18px] text-orange-500" strokeWidth={2} />
      )}
      <span>{loading ? 'Please wait...' : 'Verify Mobile & Login via OTP'}</span>
    </motion.button>
  );
};

export default PhoneOtpButton;
