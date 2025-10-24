import React from 'react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';

export const TeamRosterModal = ({ teamId, state, dispatch }) => {
  if (!teamId) return null;
  const { league } = state;
  const team = league.teams.find(t => t.id === teamId);
  if (!team) return null;
  const teamPlayers = team.roster.map(pid => league.players[pid]).filter(Boolean)
    .sort((a, b) => {
      const posOrder = { 'FWD': 1, 'MID': 2, 'DEF': 3, 'GK': 4 };
      return posOrder[a.position] - posOrder[b.position] || b.overall - a.overall;
    });
  const handlePlayerClick = (playerId) => { dispatch({ type: 'MODAL_OPEN', payload: { type: 'PLAYER', playerId } }); };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl border border-cyan-500 shadow-2xl">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{team.name} Roster</h2>
          <Button onClick={() => dispatch({ type: 'MODAL_CLOSE' })} variant="secondary">Close</Button>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Pos</th>
                  <th scope="col" className="px-6 py-3">Age</th>
                  <th scope="col" className="px-6 py-3">OVR</th>
                  <th scope="col" className="px-6 py-3">Season Stats (G/A/St or S/A/S%)</th>
                </tr>
              </thead>
              <tbody>
                {teamPlayers.map(p => {
                  let statsDisplay = '';
                  if (p.position === 'GK') {
                    const savePct = (p.seasonStats.shotsFaced > 0 ? (p.seasonStats.saves / p.seasonStats.shotsFaced * 100) : 0).toFixed(1);
                    statsDisplay = `${p.seasonStats.saves}/${p.seasonStats.assists}/${savePct}%`;
                  } else {
                    statsDisplay = `${p.seasonStats.goals}/${p.seasonStats.assists}/${p.seasonStats.stocks}`;
                  }
                  return (
                    <tr key={p.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                      <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap"><button onClick={() => handlePlayerClick(p.id)} className="hover:underline text-cyan-400 font-semibold">{p.name}</button></th>
                      <td className="px-6 py-4">{p.position}</td>
                      <td className="px-6 py-4">{p.age}</td>
                      <td className="px-6 py-4 font-bold">{p.overall}</td>
                      <td className="px-6 py-4">{statsDisplay}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
