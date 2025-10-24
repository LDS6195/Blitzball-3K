import React from 'react';

export const StatBar = ({ label, value, max = 99 }) => {
  const width = `${(value / max) * 100}%`;
  let color = 'bg-cyan-500';
  if (value > 80) color = 'bg-green-500';
  else if (value > 60) color = 'bg-yellow-500';
  else if (value < 40) color = 'bg-red-500';
  return (
    <div className="flex items-center space-x-2">
      <span className="w-8 font-bold text-sm text-gray-300">{label}</span>
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden"><div className={`h-full rounded-full ${color} transition-all duration-300`} style={{ width }}></div></div>
      <span className="w-8 font-bold text-sm text-white text-right">{value}</span>
    </div>
  );
};
