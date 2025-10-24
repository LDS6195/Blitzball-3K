import React from 'react';
import { ChevronsLeft, Menu } from 'lucide-react';

export const TopBar = ({ userTeam, season, onToggleSidebar, isExpanded }) => (
  <header className="flex items-center justify-between h-20 bg-ocean-900 text-white p-4 shadow-lg border-b-2 border-ocean-700">
    <div className="flex items-center">
      <button onClick={onToggleSidebar} className="p-2 text-aqua-400 hover:bg-ocean-700 hover:text-aqua-300 mr-4 transition-colors">
        {isExpanded ? <ChevronsLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      <h1 className="text-xl md:text-2xl font-header font-bold tracking-gaming text-white">
        BLITZSIM: <span className="text-aqua-400">SPHERE LEAGUE</span>
      </h1>
    </div>
    <div className="flex items-center space-x-4">
      <span className="text-aqua-400 hidden md:block font-semibold">{userTeam.name}</span>
      <span className="font-header font-bold bg-ocean-700 border-2 border-gold-500 text-gold-400 px-3 py-1 text-sm tracking-gaming">
        SEASON {season}
      </span>
    </div>
  </header>
);
