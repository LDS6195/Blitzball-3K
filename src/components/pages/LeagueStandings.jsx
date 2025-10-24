import React from 'react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';

export const LeagueStandings = ({ state, dispatch }) => {
  const { league } = state;
  const sortedTeams = [...league.teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor);
  const playoffCutoff = 6;
  const handleTeamClick = (teamId) => { dispatch({ type: 'MODAL_OPEN', payload: { type: 'TEAM_ROSTER', teamId } }); };
  return (
    <Card>
      <CardHeader><h3 className="text-lg font-semibold text-white">League Standings - Season {state.game.currentSeason}</h3></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">#</th><th scope="col" className="px-6 py-3">Team</th>
                <th scope="col" className="px-6 py-3">W</th><th scope="col" className="px-6 py-3">D</th>
                <th scope="col" className="px-6 py-3">L</th><th scope="col" className="px-6 py-3">GF</th>
                <th scope="col" className="px-6 py-3">GA</th><th scope="col" className="px-6 py-3">GD</th>
                <th scope="col" className="px-6 py-3">Pts</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((t, index) => (
                <tr key={t.id} className={`border-b border-gray-700 ${t.id === state.game.userTeamId ? 'bg-cyan-900' : 'bg-gray-800'} ${index < playoffCutoff ? 'border-l-4 border-yellow-500' : ''}`}>
                  <td className="px-6 py-4 font-bold">{index + 1}</td>
                  <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap"><button onClick={() => handleTeamClick(t.id)} className="hover:underline font-semibold">{t.name}</button></th>
                  <td className="px-6 py-4">{t.wins}</td><td className="px-6 py-4">{t.draws}</td>
                  <td className="px-6 py-4">{t.losses}</td><td className="px-6 py-4">{t.goalsFor}</td>
                  <td className="px-6 py-4">{t.goalsAgainst}</td><td className="px-6 py-4">{t.goalsFor - t.goalsAgainst}</td>
                  <td className="px-6 py-4 font-bold text-lg">{t.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center space-x-2"><div className="w-4 h-4 bg-yellow-500 border-2 border-yellow-500"></div><span className="text-sm text-gray-400">Playoff Team</span></div>
        </div>
      </CardContent>
    </Card>
  );
};
