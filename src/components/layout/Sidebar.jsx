import React from 'react';
import { Home, Shirt, List, CalendarDays, Trophy, BarChart, BookOpen, FilePlus } from 'lucide-react';

export const Sidebar = ({ onNav, onNewGame, isExpanded, currentPage }) => {
  const NavLink = ({ Icon, label, page }) => (
    <button
      onClick={() => onNav(page)}
      className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
        currentPage === page
          ? 'bg-cyan-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      } ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}`}
    >
      <Icon className="w-6 h-6 shrink-0" />
      {isExpanded && <span className="font-medium">{label}</span>}
    </button>
  );

  return (
    <div
      className={`flex flex-col h-screen bg-gray-900 text-white shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      <div className={`flex items-center p-4 h-20 border-b border-gray-700 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        {isExpanded && (
          <h1 className="text-2xl font-bold text-cyan-400">
            BlitzSim
          </h1>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-2">
        <NavLink Icon={Home} label="Home" page="HOME" />
        <NavLink Icon={Shirt} label="My Team" page="TEAM" />
        <NavLink Icon={List} label="Standings" page="STANDINGS" />
        <NavLink Icon={CalendarDays} label="Schedule" page="SCHEDULE" />
        <NavLink Icon={Trophy} label="Playoffs" page="PLAYOFFS" />
        <NavLink Icon={BarChart} label="League History" page="LEAGUE_HISTORY" />
        <NavLink Icon={BookOpen} label="Team History" page="TEAM_HISTORY" />
      </nav>

      <div className="p-3 border-t border-gray-700">
        <button
          onClick={onNewGame}
          className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 text-white bg-red-600 hover:bg-red-500 ${
            isExpanded ? 'justify-start space-x-3' : 'justify-center'
          }`}
        >
          <FilePlus className="w-6 h-6 shrink-0" />
          {isExpanded && <span className="font-medium">New Game</span>}
        </button>
      </div>
    </div>
  );
};
