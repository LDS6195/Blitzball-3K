import React from 'react';
import { Home, Shirt, List, CalendarDays, Trophy, BarChart, BookOpen, FilePlus } from 'lucide-react';

export const Sidebar = ({ onNav, onNewGame, isExpanded, currentPage }) => {
  const NavLink = ({ Icon, label, page }) => (
    <button
      onClick={() => onNav(page)}
      className={`${
        currentPage === page
          ? 'blitz-nav-item-active'
          : 'blitz-nav-item text-gray-300'
      } ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {isExpanded && <span>{label}</span>}
    </button>
  );

  return (
    <div
      className={`flex flex-col h-screen bg-ocean-900 text-white shadow-2xl transition-all duration-300 border-r-2 border-ocean-700 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      <div className={`flex items-center p-4 h-20 border-b-2 border-ocean-700 bg-ocean-950 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        {isExpanded && (
          <h1 className="text-2xl font-header font-extrabold tracking-gaming text-aqua-400">
            BLITZSIM
          </h1>
        )}
        {!isExpanded && (
          <div className="text-2xl font-header font-extrabold text-aqua-400">
            B
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <NavLink Icon={Home} label="Home" page="HOME" />
        <NavLink Icon={Shirt} label="My Team" page="TEAM" />
        <NavLink Icon={List} label="Standings" page="STANDINGS" />
        <NavLink Icon={CalendarDays} label="Schedule" page="SCHEDULE" />
        <NavLink Icon={Trophy} label="Playoffs" page="PLAYOFFS" />
        <NavLink Icon={BarChart} label="League History" page="LEAGUE_HISTORY" />
        <NavLink Icon={BookOpen} label="Team History" page="TEAM_HISTORY" />
      </nav>

      <div className="p-3 border-t-2 border-ocean-700 bg-ocean-950">
        <button
          onClick={onNewGame}
          className={`flex items-center w-full p-3 transition-all duration-200 text-white bg-red-700 hover:bg-red-600 border-2 border-red-600 font-header font-semibold tracking-gaming uppercase text-xs ${
            isExpanded ? 'justify-start space-x-3' : 'justify-center'
          }`}
          style={{
            clipPath: 'polygon(0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px))'
          }}
        >
          <FilePlus className="w-5 h-5 shrink-0" />
          {isExpanded && <span>New Game</span>}
        </button>
      </div>
    </div>
  );
};
