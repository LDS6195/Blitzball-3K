import React from 'react';

export const CardHeader = ({ children, className = '' }) => (
  <div className={`bg-ocean-900 px-4 py-3 border-b-2 border-ocean-600 ${className}`}>
    {children}
  </div>
);
