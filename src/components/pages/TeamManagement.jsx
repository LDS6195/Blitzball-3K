import React from 'react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';

export const TeamManagement = ({ state, dispatch }) => {
  const { game, league } = state;
  const userTeam = league.teams.find(t => t.id === game.userTeamId);
  const teamPlayers = userTeam.roster.map(pid => league.players[pid]).filter(Boolean)
    .sort((a, b) => {
      const posOrder = { 'FWD': 1, 'MID': 2, 'DEF': 3, 'GK': 4 };
      return posOrder[a.position] - posOrder[b.position] || b.overall - a.overall;
    });
  const fieldPlayers = teamPlayers.filter(p => p.position !== 'GK');
  const goalkeepers = teamPlayers.filter(p => p.position === 'GK');
  return (
    <Card>
      <CardHeader><h3 className="text-lg font-semibold text-white">{userTeam.name} - Roster Management</h3></CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-xl font-semibold text-white mb-3">Field Players</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th><th scope="col" className="px-6 py-3">Pos</th>
                  <th scope="col" className="px-6 py-3">Age</th><th scope="col" className="px-6 py-3">OVR</th>
                  <th scope="col" className="px-6 py-3">Stats (G/A/St)</th><th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fieldPlayers.map(p => (
                  <tr key={p.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{p.name}</th>
                    <td className="px-6 py-4">{p.position}</td><td className="px-6 py-4">{p.age}</td>
                    <td className="px-6 py-4 font-bold">{p.overall}</td>
                    <td className="px-6 py-4">{`${p.seasonStats.goals}/${p.seasonStats.assists}/${p.seasonStats.stocks}`}</td>
                    <td className="px-6 py-4"><Button label="View" onClick={() => dispatch({ type: 'MODAL_OPEN', payload: { type: 'PLAYER', playerId: p.id } })} variant="secondary" className="py-1 px-3">View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white mb-3">Goalkeepers</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th><th scope="col" className="px-6 py-3">Pos</th>
                  <th scope="col" className="px-6 py-3">Age</th><th scope="col" className="px-6 py-3">OVR</th>
                  <th scope="col" className="px-6 py-3">Stats (S/A/S%)</th><th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {goalkeepers.map(p => {
                  const savePct = (p.seasonStats.shotsFaced > 0 ? (p.seasonStats.saves / p.seasonStats.shotsFaced * 100) : 0).toFixed(1);
                  return (
                    <tr key={p.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                      <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{p.name}</th>
                      <td className="px-6 py-4">{p.position}</td><td className="px-6 py-4">{p.age}</td>
                      <td className="px-6 py-4 font-bold">{p.overall}</td>
                      <td className="px-6 py-4">{`${p.seasonStats.saves}/${p.seasonStats.assists}/${savePct}%`}</td>
                      <td className="px-6 py-4"><Button label="View" onClick={() => dispatch({ type: 'MODAL_OPEN', payload: { type: 'PLAYER', playerId: p.id } })} variant="secondary" className="py-1 px-3">View</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
