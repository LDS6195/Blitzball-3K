import React from 'react';
import { ChevronsRight, Repeat, Shirt, Trophy, Award, LogOut, DollarSign, UserPlus, PackagePlus, TrendingUp } from 'lucide-react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';

export const Dashboard = ({ state, dispatch }) => {
  const { game, league } = state;
  const userTeam = league.teams.find(t => t.id === game.userTeamId);

  const nextMatch = league.schedule
    .filter(m => !m.played && (m.homeTeamId === userTeam.id || m.awayTeamId === userTeam.id))
    .sort((a, b) => a.id.localeCompare(b.id))[0];

  const getTeamName = (id) => league.teams.find(t => t.id === id)?.name || 'Unknown';

  const userRecord = `${userTeam.wins}-${userTeam.losses}-${userTeam.draws}`;

  const renderPhaseControls = () => {
    switch(game.phase) {
        case 'REGULAR_SEASON':
            if (nextMatch) {
                return (
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-around text-center">
                          <div><h4 className="text-2xl font-bold text-white">{getTeamName(nextMatch.homeTeamId)}</h4><span className="text-gray-400">Home</span></div>
                          <span className="text-4xl font-light text-gray-500">VS</span>
                          <div><h4 className="text-2xl font-bold text-white">{getTeamName(nextMatch.awayTeamId)}</h4><span className="text-gray-400">Away</span></div>
                        </div>
                        <div className="flex space-x-4">
                          <Button Icon={ChevronsRight} label="Play Match" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'SIM_MATCH', matchId: nextMatch.id })} className="w-full" variant="success" />
                          <Button Icon={Repeat} label="Simulate Match" onClick={() => dispatch({ type: 'SIMULATE_MATCH', payload: { matchId: nextMatch.id } })} className="w-full" variant="secondary" />
                        </div>
                    </CardContent>
                );
            }
            return (
                <CardContent>
                    <p className="text-gray-300 text-center">No more matches this season!</p>
                    <Button Icon={ChevronsRight} label="Simulate to Playoffs" onClick={() => dispatch({ type: 'SIMULATE_SEASON' })} className="w-full mt-4" variant="danger" />
                </CardContent>
            );
        case 'PLAYOFFS':
            return <CardContent><Button Icon={Trophy} label="Simulate Playoffs" onClick={() => dispatch({ type: 'SIMULATE_PLAYOFFS' })} className="w-full mt-4" variant="success" /></CardContent>;
        case 'AWARDS':
            return <CardContent><Button Icon={Award} label="View Season Awards" onClick={() => dispatch({ type: 'MODAL_OPEN', payload: { type: 'AWARDS' } })} className="w-full mt-4" variant="primary" /></CardContent>;
        case 'OFF_SEASON_RETIREMENTS':
             return <CardContent><Button Icon={LogOut} label="View Retirements" onClick={() => dispatch({ type: 'MODAL_OPEN', payload: { type: 'RETIREMENTS' } })} className="w-full mt-4" variant="primary" /></CardContent>;
        case 'OFF_SEASON_RE_SIGNING':
             return <CardContent><Button Icon={DollarSign} label="Go to Player Re-Signing" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'OFF_SEASON_RE_SIGNING' })} className="w-full mt-4" variant="success" /></CardContent>;
        case 'OFF_SEASON_FREE_AGENCY':
             return <CardContent><Button Icon={UserPlus} label="Go to Free Agency" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'OFF_SEASON_FREE_AGENCY' })} className="w-full mt-4" variant="success" /></CardContent>;
        case 'OFF_SEASON_DRAFT':
             return <CardContent><Button Icon={PackagePlus} label="Go to Rookie Draft" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'OFF_SEASON_DRAFT' })} className="w-full mt-4" variant="success" /></CardContent>;
        case 'OFF_SEASON_PROGRESSION':
             return <CardContent><Button Icon={TrendingUp} label="View Player Progression" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'OFF_SEASON_PROGRESSION' })} className="w-full mt-4" variant="success" /></CardContent>;
        default:
             return <CardContent><p className="text-gray-300 text-center">Current Phase: {game.phase}</p></CardContent>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader><h3 className="text-lg font-semibold text-white">{userTeam.name} Overview</h3></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
            <span className="text-gray-300 text-lg">Record</span>
            <span className="text-2xl font-bold text-white">{userRecord}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
            <span className="text-gray-300 text-lg">Salary</span>
            <span className={`text-2xl font-bold ${userTeam.salary > game.salaryCap ? 'text-red-500' : 'text-white'}`}>
                ${(userTeam.salary / 1000).toFixed(1)}k / ${(game.salaryCap / 1000)}k
            </span>
          </div>
          <Button Icon={Shirt} label="Manage Team" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'TEAM' })} className="w-full" />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader><h3 className="text-lg font-semibold text-white">Current Activity</h3></CardHeader>
        {renderPhaseControls()}
      </Card>

      <Card className="md:col-span-3">
        <CardHeader><h3 className="text-lg font-semibold text-white">Sphere League News</h3></CardHeader>
        <CardContent className="max-h-64 overflow-y-auto">
          <ul className="space-y-3">
            {game.news.map(item => (
              <li key={item.id} className="p-3 bg-gray-700 rounded-lg">
                <span className="font-semibold text-cyan-400">[S{item.season}]</span>
                <span className="text-gray-300 ml-2">{item.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
