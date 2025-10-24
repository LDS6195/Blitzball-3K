import React from 'react';

export const Button = ({ Icon, label, onClick, variant = 'primary', className = '', children, disabled = false }) => {
  const variantClasses = {
    primary: 'blitz-button-primary',
    secondary: 'blitz-button-secondary',
    danger: 'blitz-button-danger',
    success: 'blitz-button-gold',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center space-x-2 ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label && <span>{label}</span>}
      {children}
    </button>
  );
};
