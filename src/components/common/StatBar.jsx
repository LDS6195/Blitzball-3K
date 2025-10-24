import React from 'react';

export const StatBar = ({ label, value, max = 99 }) => {
  const width = `${(value / max) * 100}%`;
  let color = 'bg-aqua-500';
  if (value > 80) color = 'bg-gold-500';
  else if (value > 60) color = 'bg-aqua-400';
  else if (value < 40) color = 'bg-red-600';
  return (
    <div className="flex items-center space-x-2">
      <span className="w-10 font-header font-bold text-xs text-aqua-400 tracking-gaming uppercase">{label}</span>
      <div className="flex-1 bg-ocean-950 border border-ocean-600 h-5">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width }}></div>
      </div>
      <span className="w-10 font-header font-bold text-sm text-white text-right">{value}</span>
    </div>
  );
};
