import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`blitz-card shadow-lg ${className}`}>
    {children}
  </div>
);
