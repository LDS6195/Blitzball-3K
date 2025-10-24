import React from 'react';
import { ChevronsLeft, Menu } from 'lucide-react';

export const TopBar = ({ userTeam, season, onToggleSidebar, isExpanded }) => (
  <header className="flex items-center justify-between h-20 bg-gray-900 text-white p-4 shadow-lg border-b border-gray-700">
    <div className="flex items-center">
      <button onClick={onToggleSidebar} className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white mr-4">
        {isExpanded ? <ChevronsLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      <h1 className="text-xl md:text-2xl font-bold text-white">
        BlitzSim: Sphere League Manager
      </h1>
    </div>
    <div className="flex items-center space-x-4">
      <span className="text-gray-300 hidden md:block">{userTeam.name}</span>
      <span className="font-semibold bg-gray-700 px-3 py-1 rounded-full text-sm">
        Season {season}
      </span>
    </div>
  </header>
);
