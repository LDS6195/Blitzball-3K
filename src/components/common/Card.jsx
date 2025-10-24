import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800 shadow-lg rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);
