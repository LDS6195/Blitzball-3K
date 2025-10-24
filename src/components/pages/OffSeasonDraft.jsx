import React from 'react';
import { PackagePlus, ChevronsRight } from 'lucide-react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';
import { POSITIONS } from '../../constants';

export const OffSeasonDraft = ({ state, dispatch }) => {
    const { game, league } = state;
    const { draftClass, userDraftPicks } = game.offSeasonData;

    const draftablePlayers = draftClass
        .map(pid => league.players[pid])
        .filter(p => p && p.teamId === null); // Already sorted by potential

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Off-Season: Rookie Draft</h3>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Picks Remaining</div>
                        <div className="text-lg font-bold text-white">{userDraftPicks}</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                {draftablePlayers.length === 0 && <p className="text-gray-400">The draft class is empty.</p>}
                {draftablePlayers.map(player => {
                    const salary = player.contract.salary;
                    return (
                        <div key={player.id} className="p-4 bg-gray-700 rounded-lg grid grid-cols-4 gap-4 items-center">
                            <div>
                                <p className="font-bold text-white text-lg">{player.name}</p>
                                <p className="text-sm text-gray-400">{POSITIONS[player.position]} | Age: {player.age}</p>
                            </div>
                             <div>
                                <p className="text-sm text-gray-400">Overall</p>
                                <p className="font-bold text-white text-lg">{player.overall}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Potential</p>
                                <p className="font-bold text-yellow-400 text-lg">{player.potential} / 10</p>
                            </div>
                            <Button Icon={PackagePlus} label={`Draft ($${salary})`} onClick={() => dispatch({ type: 'DRAFT_PLAYER', payload: { playerId: player.id } })} variant="success" disabled={userDraftPicks <= 0} />
                        </div>
                    );
                })}
            </CardContent>
            <div className="p-4 bg-gray-900 text-center">
                <Button Icon={ChevronsRight} label="Finish Draft & Proceed to Progression" onClick={() => dispatch({ type: 'FINISH_DRAFT' })} variant="primary" />
            </div>
        </Card>
    );
};
