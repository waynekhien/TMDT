import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  shadow = 'soft',
  rounded = 'lg',
  background = 'white',
  border = false,
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const shadows = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    large: 'shadow-large',
    glow: 'shadow-glow',
  };

  const roundings = {
    none: '',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  };

  const backgrounds = {
    white: 'bg-white dark:bg-neutral-800',
    neutral: 'bg-neutral-50 dark:bg-neutral-900',
    transparent: 'bg-transparent',
    gradient: 'bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900',
  };

  const baseClasses = `
    ${backgrounds[background]}
    ${paddings[padding]}
    ${shadows[shadow]}
    ${roundings[rounded]}
    ${border ? 'border border-neutral-200 dark:border-neutral-700' : ''}
    transition-all duration-300 ease-in-out
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const hoverProps = hover ? {
    whileHover: { 
      y: -4,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...hoverProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
