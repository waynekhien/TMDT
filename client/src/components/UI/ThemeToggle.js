import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-xl
        bg-neutral-100 dark:bg-neutral-800
        hover:bg-neutral-200 dark:hover:bg-neutral-700
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 180 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-primary-400" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
