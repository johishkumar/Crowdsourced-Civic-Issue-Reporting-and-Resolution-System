import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingButton = ({
  loading,
  children,
  loadingText = 'Please wait...',
  onClick,
  type = 'button',
  className = 'auth-btn',
  disabled,
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={className}
      whileHover={!loading && !disabled ? { y: -2 } : {}}
      whileTap={!loading && !disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default LoadingButton;
