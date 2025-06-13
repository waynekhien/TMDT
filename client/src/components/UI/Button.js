import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-xl
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600
      hover:from-primary-600 hover:to-primary-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-primary-500
    `,
    secondary: `
      bg-gradient-to-r from-secondary-500 to-secondary-600
      hover:from-secondary-600 hover:to-secondary-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-secondary-500
    `,
    outline: `
      border-2 border-primary-500 text-primary-600
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      focus:ring-primary-500
    `,
    ghost: `
      text-neutral-600 dark:text-neutral-300
      hover:bg-neutral-100 dark:hover:bg-neutral-800
      focus:ring-neutral-500
    `,
    danger: `
      bg-gradient-to-r from-error-500 to-error-600
      hover:from-error-600 hover:to-error-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-error-500
    `,
    success: `
      bg-gradient-to-r from-success-500 to-success-600
      hover:from-success-600 hover:to-success-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-success-500
    `,
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-3',
    xl: 'px-8 py-4 text-xl gap-3',
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const buttonContent = (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </div>
    </>
  );

  return (
    <motion.button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button;
