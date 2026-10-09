import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Apple logo SVG
const AppleLogo = () => (
  <svg width="16" height="18" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-38.8-155.5-127.4C46 790.8 0 663.1 0 541.8 0 347.4 112.3 244.5 222.3 244.5c70.8 0 129.5 46.4 173.1 46.4 41.4 0 106.9-49 185.2-49 29.4 0 108.2 2.6 168.3 73.7zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
  </svg>
);

const AppleButton = ({ onClick, loading }) => {
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
        <AppleLogo />
      )}
      <span>{loading ? 'Connecting...' : 'Apple ID'}</span>
    </motion.button>
  );
};

export default AppleButton;
