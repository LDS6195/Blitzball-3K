import React from 'react';

export const Button = ({ Icon, label, onClick, variant = 'primary', className = '', children, disabled = false }) => {
  const colors = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-gray-900',
    secondary: 'bg-gray-600 hover:bg-gray-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-md ${colors[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label && <span>{label}</span>}
      {children}
    </button>
  );
};
