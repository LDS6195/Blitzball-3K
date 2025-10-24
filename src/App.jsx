import React, { useReducer, useState, useEffect } from 'react';
import { gameReducer } from './state';
import { initializeNewGame } from './engine';
import {
  Sidebar,
  TopBar,
  Dashboard,
  TeamManagement,
  LeagueStandings,
  ScheduleView,
  PlayoffBracketView,
  LeagueHistory,
  TeamHistory,
  MatchSimScreen,
  OffSeasonReSigning,
  OffSeasonFreeAgency,
  OffSeasonDraft,
  OffSeasonProgression,
  PlayerCard,
  BoxScoreModal,
  AwardsModal,
  TeamRosterModal,
  OffSeasonRetirementsModal,
  MessageModal,
} from './components';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    const savedGame = localStorage.getItem('blitzSimSave');
    try {
      if (savedGame) { return JSON.parse(savedGame); }
    } catch (e) {
      console.error("Failed to parse saved game:", e);
      localStorage.removeItem('blitzSimSave');
    }
    return initializeNewGame();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    localStorage.setItem('blitzSimSave', JSON.stringify(state));
  }, [state]);

  const handleNewGame = () => {
    setIsLoading(true);
    dispatch({ type: 'START_NEW_GAME' });
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleNav = (page) => { dispatch({ type: 'NAVIGATE', payload: page }); };

  const userTeam = state.league.teams.find(t => t.id === state.game.userTeamId);
  if (!userTeam) {
    dispatch({ type: 'START_NEW_GAME' });
    return <div>Loading...</div>;
  }

  const renderPage = () => {
    const { ui } = state;
    switch (ui.currentPage) {
      case 'HOME': return <Dashboard state={state} dispatch={dispatch} />;
      case 'TEAM': return <TeamManagement state={state} dispatch={dispatch} />;
      case 'STANDINGS': return <LeagueStandings state={state} dispatch={dispatch} />;
      case 'SCHEDULE': return <ScheduleView state={state} dispatch={dispatch} />;
      case 'PLAYOFFS': return <PlayoffBracketView state={state} dispatch={dispatch} />;
      case 'LEAGUE_HISTORY': return <LeagueHistory state={state} />;
      case 'TEAM_HISTORY': return <TeamHistory state={state} />;
      case 'SIM_MATCH': return <MatchSimScreen state={state} dispatch={dispatch} matchId={ui.matchId} />;
      // Off-Season Pages
      case 'OFF_SEASON_RE_SIGNING': return <OffSeasonReSigning state={state} dispatch={dispatch} />;
      case 'OFF_SEASON_FREE_AGENCY': return <OffSeasonFreeAgency state={state} dispatch={dispatch} />;
      case 'OFF_SEASON_DRAFT': return <OffSeasonDraft state={state} dispatch={dispatch} />;
      case 'OFF_SEASON_PROGRESSION': return <OffSeasonProgression state={state} dispatch={dispatch} />;
      default: return <Dashboard state={state} dispatch={dispatch} />;
    }
  };

  // Modal State
  const modalPlayer = state.ui.modal?.type === 'PLAYER' ? state.league.players[state.ui.modal.playerId] : null;
  const modalMatch = state.ui.modal?.type === 'BOX_SCORE' ? state.ui.modal.match : null;
  const showAwards = state.ui.modal?.type === 'AWARDS';
  const modalTeamId = state.ui.modal?.type === 'TEAM_ROSTER' ? state.ui.modal.teamId : null;
  const showRetirements = state.ui.modal?.type === 'RETIREMENTS';
  const messageText = state.ui.modal?.type === 'MESSAGE' ? state.ui.modal.text : null;


  if (isLoading) {
    return (<div className="bg-gray-950 min-h-screen flex items-center justify-center text-white"><h1 className="text-3xl font-bold animate-pulse">Loading New Game...</h1></div>);
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 font-sans">
      <Sidebar onNav={handleNav} onNewGame={handleNewGame} isExpanded={isSidebarExpanded} currentPage={state.ui.currentPage} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar userTeam={userTeam} season={state.game.currentSeason} onToggleSidebar={() => setIsSidebarExpanded(prev => !prev)} isExpanded={isSidebarExpanded} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </main>
      </div>

      {/* Modals */}
      {modalPlayer && <PlayerCard player={modalPlayer} state={state} onClose={() => dispatch({ type: 'MODAL_CLOSE' })} />}
      {modalMatch && <BoxScoreModal match={modalMatch} state={state} dispatch={dispatch} />}
      {showAwards && <AwardsModal state={state} dispatch={dispatch} />}
      {modalTeamId && <TeamRosterModal teamId={modalTeamId} state={state} dispatch={dispatch} />}
      {showRetirements && <OffSeasonRetirementsModal state={state} dispatch={dispatch} />}
      {messageText && <MessageModal text={messageText} onClose={() => dispatch({ type: 'MODAL_CLOSE' })} />}
    </div>
  );
}
