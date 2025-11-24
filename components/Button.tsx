import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 border text-base font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // Updated Primary to use Terra (Rust) for high contrast visibility
    primary: "border-transparent text-white bg-terra-500 hover:bg-terra-600 focus:ring-terra-500 shadow-terra-200/50",
    // Secondary uses Sage-200 (Light Green) with Dark Green text
    secondary: "border-transparent text-sage-900 bg-sage-200 hover:bg-sage-300 focus:ring-sage-500",
    // Outline uses Sage borders
    outline: "border-sage-300 text-sage-700 bg-white hover:bg-sage-50 focus:ring-sage-500"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;