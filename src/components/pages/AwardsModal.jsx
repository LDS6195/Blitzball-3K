import React from 'react';
import { Award, ChevronsRight } from 'lucide-react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';
import { POSITIONS } from '../../constants';

export const AwardsModal = ({ state, dispatch }) => {
  const { game, league, history } = state;
  const currentAwards = history.awards.find(a => a.season === game.currentSeason);
  if (!currentAwards) return null;
  const getPlayer = (id) => league.players[id] || { name: 'N/A', position: 'N/A', teamId: null };
  const getTeamName = (id) => league.teams.find(t => t.id === id)?.name || 'N/A';
  const mvp = getPlayer(currentAwards.mvp);
  const dpoy = getPlayer(currentAwards.dpoy);
  const finalsMvp = getPlayer(currentAwards.finalsMvp);
  const AwardCard = ({ title, player }) => (
    <div className="p-4 bg-gray-700 rounded-lg text-center h-full"><h4 className="text-lg font-semibold text-yellow-400">{title}</h4><p className="text-2xl font-bold text-white">{player.name}</p><p className="text-sm text-gray-400">{POSITIONS[player.position]} | {getTeamName(player.teamId)}</p></div>
  );
  const TeamList = ({ title, playerIds }) => (
    <div className="p-4 bg-gray-700 rounded-lg"><h4 className="text-lg font-semibold text-yellow-400 mb-2">{title}</h4><ul className="space-y-2">
        {playerIds.map((pid, i) => {
          const player = getPlayer(pid);
          return (<li key={i} className="flex justify-between items-center bg-gray-900 p-2 rounded"><span className="font-semibold text-white">{player.name}</span><span className="text-sm text-gray-400">{POSITIONS[player.position]} | {getTeamName(player.teamId)}</span></li>);
        })}
    </ul></div>
  );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl border border-yellow-500 shadow-2xl">
        <CardHeader className="text-center relative"><Award className="w-12 h-12 text-yellow-400 mx-auto mb-2" /><h2 className="text-3xl font-bold text-white">Season {game.currentSeason} Awards</h2></CardHeader>
        <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><AwardCard title="League MVP" player={mvp} /><AwardCard title="Finals MVP" player={finalsMvp} /><AwardCard title="Defensive Player of the Year" player={dpoy} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><TeamList title="1st Team All-Blitz" playerIds={currentAwards.firstTeam} /><TeamList title="2nd Team All-Blitz" playerIds={currentAwards.secondTeam} /></div>
        </CardContent>
        <div className="p-4 bg-gray-900 text-center"><Button Icon={ChevronsRight} label="Continue to Off-Season" onClick={() => dispatch({ type: 'ACKNOWLEDGE_AWARDS' })} variant="success" /></div>
      </Card>
    </div>
  );
};
