import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  className = '',
  fullScreen = false 
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const colors = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white',
    neutral: 'border-neutral-500',
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <motion.div
          className={`
            ${sizes[size]} 
            border-4 border-neutral-200 dark:border-neutral-700 
            ${colors[color]} 
            border-t-transparent 
            rounded-full
          `}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Pulsing dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`
                w-2 h-2 rounded-full 
                ${color === 'primary' ? 'bg-primary-500' : 
                  color === 'secondary' ? 'bg-secondary-500' :
                  color === 'white' ? 'bg-white' : 'bg-neutral-500'}
              `}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {text && (
          <motion.p
            className="text-neutral-600 dark:text-neutral-400 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default Loading;
