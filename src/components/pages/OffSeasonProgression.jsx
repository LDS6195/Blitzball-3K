import React from 'react';
import { ChevronsRight } from 'lucide-react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';

export const OffSeasonProgression = ({ state, dispatch }) => {
    const { game, league } = state;
    const userTeam = league.teams.find(t => t.id === game.userTeamId);
    const { progressionLog } = game.offSeasonData;

    const userProgression = progressionLog.filter(log =>
        userTeam.roster.includes(log.playerId)
    );

    return (
        <Card>
            <CardHeader><h3 className="text-xl font-semibold text-white">Off-Season: Player Progression</h3></CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                {userProgression.length === 0 && <p className="text-gray-400">No players on your team had significant changes.</p>}
                {userProgression.map(log => {
                    const ovrChange = log.newOvr - log.oldOvr;
                    const ovrColor = ovrChange > 0 ? 'text-green-500' : 'text-red-500';
                    return (
                        <div key={log.playerId} className="p-4 bg-gray-700 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold text-white text-lg">{log.name}</p>
                                <p className={`font-bold text-lg ${ovrColor}`}>
                                    {log.oldOvr} → {log.newOvr} ({ovrChange > 0 ? `+${ovrChange}` : ovrChange})
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {log.changes.map(change => {
                                    const changeColor = change.new > change.old ? 'text-green-400' : 'text-red-400';
                                    return (
                                        <p key={change.stat} className="text-sm text-gray-300">
                                            {change.stat}: {change.old} → <span className={`font-bold ${changeColor}`}>{change.new}</span>
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
            <div className="p-4 bg-gray-900 text-center">
                <Button Icon={ChevronsRight} label="Start New Season" onClick={() => dispatch({ type: 'FINISH_PROGRESSION' })} variant="success" />
            </div>
        </Card>
    );
};
