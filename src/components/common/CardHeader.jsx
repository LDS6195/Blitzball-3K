import React from 'react';

export const CardHeader = ({ children, className = '' }) => (
  <div className={`bg-gray-900 px-4 py-3 border-b border-gray-700 ${className}`}>
    {children}
  </div>
);
