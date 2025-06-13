import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const variants = {
    default: `
      border border-neutral-300 dark:border-neutral-600
      bg-white dark:bg-neutral-800
      focus:border-primary-500 focus:ring-primary-500
    `,
    filled: `
      border-0 bg-neutral-100 dark:bg-neutral-700
      focus:bg-white dark:focus:bg-neutral-600
      focus:ring-primary-500
    `,
    underlined: `
      border-0 border-b-2 border-neutral-300 dark:border-neutral-600
      bg-transparent rounded-none
      focus:border-primary-500 focus:ring-0
    `,
  };

  const baseInputClasses = `
    w-full rounded-xl transition-all duration-200
    text-neutral-900 dark:text-neutral-100
    placeholder-neutral-500 dark:placeholder-neutral-400
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${sizes[size]}
    ${icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : ''}
    ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`
            absolute top-1/2 transform -translate-y-1/2 text-neutral-400
            ${iconPosition === 'left' ? 'left-4' : 'right-4'}
          `}>
            {icon}
          </div>
        )}
        
        <motion.input
          ref={ref}
          className={baseInputClasses}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          {...props}
        />
      </div>
      
      {(error || helperText) && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm ${
            error 
              ? 'text-error-600 dark:text-error-400' 
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          {error || helperText}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
