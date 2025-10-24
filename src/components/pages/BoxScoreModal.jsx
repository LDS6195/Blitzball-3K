import React from 'react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';

export const BoxScoreModal = ({ match, state, dispatch }) => {
  if (!match) return null;
  const { league } = state;
  const homeTeam = league.teams.find(t => t.id === match.homeTeamId);
  const awayTeam = league.teams.find(t => t.id === match.awayTeamId);
  if (!homeTeam || !awayTeam) return null;
  const getStats = (team) => {
    const fieldPlayers = []; const goalkeepers = [];
    team.roster.forEach(pid => {
      const player = league.players[pid]; if (!player) return;
      const stats = match.playerStats ? (match.playerStats[pid] || {}) : {};
      const goals = stats.goals || 0; const assists = stats.assists || 0;
      const saves = stats.saves || 0; const stocks = stats.stocks || 0;
      const shotsFaced = stats.shotsFaced || 0;
      if (player.position === 'GK') {
        const savePct = (shotsFaced > 0 ? (saves / shotsFaced * 100) : 0).toFixed(1);
        goalkeepers.push({ name: player.name, saves, assists, savePct });
      } else {
        if (goals > 0 || assists > 0 || stocks > 0) {
          fieldPlayers.push({ name: player.name, pos: player.position, goals, assists, stocks });
        }
      }
    });
    fieldPlayers.sort((a, b) => (b.goals * 3 + b.assists * 2 + b.stocks) - (a.goals * 3 + a.assists * 2 + a.stocks));
    return { fieldPlayers, goalkeepers };
  };
  const homeStats = getStats(homeTeam);
  const awayStats = getStats(awayTeam);
  const FieldPlayerStatTable = ({ title, stats }) => (
    <div className="p-4 bg-gray-700 rounded-lg">
      <h4 className="text-xl font-semibold text-white mb-2">{title}</h4>
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-900"><tr><th scope="col" className="px-4 py-2">Player</th><th scope="col" className="px-4 py-2">Pos</th><th scope="col" className="px-4 py-2">G</th><th scope="col" className="px-4 py-2">A</th><th scope="col" className="px-4 py-2">St</th></tr></thead>
        <tbody>
          {stats.length === 0 && (<tr><td colSpan="5" className="px-4 py-3 text-center text-gray-400 italic">No stats recorded.</td></tr>)}
          {stats.map((p, i) => (<tr key={i} className="border-b border-gray-900"><th scope="row" className="px-4 py-2 font-medium text-white">{p.name}</th><td className="px-4 py-2">{p.pos}</td><td className="px-4 py-2">{p.goals}</td><td className="px-4 py-2">{p.assists}</td><td className="px-4 py-2">{p.stocks}</td></tr>))}
        </tbody>
      </table>
    </div>
  );
  const GoalkeeperStatTable = ({ title, stats }) => (
    <div className="p-4 bg-gray-700 rounded-lg">
      <h4 className="text-xl font-semibold text-white mb-2">{title}</h4>
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-900"><tr><th scope="col" className="px-4 py-2">Player</th><th scope="col" className="px-4 py-2">S</th><th scope="col" className="px-4 py-2">A</th><th scope="col" className="px-4 py-2">S%</th></tr></thead>
        <tbody>
          {stats.length === 0 && (<tr><td colSpan="4" className="px-4 py-3 text-center text-gray-400 italic">No stats recorded.</td></tr>)}
          {stats.map((p, i) => (<tr key={i} className="border-b border-gray-900"><th scope="row" className="px-4 py-2 font-medium text-white">{p.name}</th><td className="px-4 py-2">{p.saves}</td><td className="px-4 py-2">{p.assists}</td><td className="px-4 py-2">{p.savePct}%</td></tr>))}
        </tbody>
      </table>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl border border-cyan-500 shadow-2xl">
        <CardHeader className="flex justify-between items-center">
          <div className="text-center w-full"><h2 className="text-2xl font-bold text-white">{homeTeam.name} vs {awayTeam.name}</h2><span className="text-3xl font-bold text-cyan-400">{match.homeScore} - {match.awayScore}</span></div>
          <Button onClick={() => dispatch({ type: 'MODAL_CLOSE' })} variant="secondary" className="absolute top-4 right-4">Close</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4"><FieldPlayerStatTable title={`${homeTeam.name} Field Players`} stats={homeStats.fieldPlayers} /><GoalkeeperStatTable title={`${homeTeam.name} Goalkeeper`} stats={homeStats.goalkeepers} /></div>
          <div className="space-y-4"><FieldPlayerStatTable title={`${awayTeam.name} Field Players`} stats={awayStats.fieldPlayers} /><GoalkeeperStatTable title={`${awayTeam.name} Goalkeeper`} stats={awayStats.goalkeepers} /></div>
        </CardContent>
      </Card>
    </div>
  );
};
