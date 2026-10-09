import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Google multicolor SVG logo
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.55 0 6.31 1.54 8.22 2.82l6.07-5.92C34.59 3.36 29.74 1 24 1 14.72 1 6.87 6.55 3.19 14.39l7.07 5.49C12.06 13.41 17.55 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.5 24.5c0-1.62-.15-3.19-.43-4.7H24v8.9h12.67c-.55 2.97-2.19 5.5-4.67 7.2l7.18 5.58C43.35 37.6 46.5 31.58 46.5 24.5z"/>
    <path fill="#FBBC05" d="M10.26 28.12A14.63 14.63 0 0 1 9.5 24c0-1.43.2-2.82.56-4.12L3 14.39A23.54 23.54 0 0 0 .5 24c0 3.72.89 7.23 2.5 10.34l7.26-6.22z"/>
    <path fill="#34A853" d="M24 47c5.73 0 10.55-1.9 14.07-5.15l-7.18-5.58c-1.97 1.32-4.5 2.2-6.89 2.2-6.45 0-11.94-3.91-13.74-9.35L3 34.35C6.87 42.45 14.72 47 24 47z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const GoogleButton = ({ onClick, loading }) => {
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
        <GoogleLogo />
      )}
      <span>{loading ? 'Connecting...' : 'Google'}</span>
    </motion.button>
  );
};

export default GoogleButton;
