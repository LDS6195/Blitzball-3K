import React from 'react';
import { ChevronsRight } from 'lucide-react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';
import { POSITIONS } from '../../constants';

export const OffSeasonRetirementsModal = ({ state, dispatch }) => {
    const { retiringPlayers } = state.game.offSeasonData;
    const { league } = state;

    const getTeamName = (id) => league.teams.find(t => t.id === id)?.name || 'N/A';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border border-gray-700 shadow-2xl">
            <CardHeader className="text-center"><h2 className="text-3xl font-bold text-white">Player Retirements</h2></CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
                {retiringPlayers.length > 0 ? (
                    <ul className="space-y-2">
                        {retiringPlayers.map(player => (
                            <li key={player.id} className="p-3 bg-gray-700 rounded-lg flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-white text-lg">{player.name}</span>
                                    <span className="text-sm text-gray-400 ml-2">({POSITIONS[player.position]} | Age {player.age})</span>
                                </div>
                                <span className="text-gray-300">{getTeamName(player.teamId)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-center">No players retired this season.</p>
                )}
            </CardContent>
            <div className="p-4 bg-gray-900 text-center">
                <Button Icon={ChevronsRight} label="Continue to Re-Signing" onClick={() => dispatch({ type: 'ACKNOWLEDGE_RETIREMENTS' })} variant="success" />
            </div>
          </Card>
        </div>
    );
};
