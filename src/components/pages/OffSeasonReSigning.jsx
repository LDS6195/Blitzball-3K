import React, { useState } from 'react';
import { DollarSign, ChevronsRight } from 'lucide-react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';
import { POSITIONS } from '../../constants';
import { getPlayerExpectedSalary } from '../../utils';

export const OffSeasonReSigning = ({ state, dispatch }) => {
    const { game, league } = state;
    const userTeam = league.teams.find(t => t.id === game.userTeamId);

    const expiringPlayers = userTeam.roster
        .map(pid => league.players[pid])
        .filter(p => p.contract.years <= 0);

    const [offers, setOffers] = useState({}); // { playerId: { years: 1, salary: 500 } }

    const handleOfferChange = (playerId, field, value) => {
        const numValue = parseInt(value, 10) || 0;
        setOffers(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [field]: numValue
            }
        }));
    };

    const handleOffer = (playerId) => {
        const offer = offers[playerId];
        if (offer && offer.years > 0 && offer.salary > 0) {
            dispatch({ type: 'RE_SIGN_PLAYER', payload: { playerId, offer } });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Off-Season: Player Re-Signing</h3>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Salary Cap</div>
                        <div className={`text-lg font-bold ${userTeam.salary > game.salaryCap ? 'text-red-500' : 'text-white'}`}>
                            ${(userTeam.salary / 1000).toFixed(1)}k / ${(game.salaryCap / 1000)}k
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                {expiringPlayers.length === 0 && <p className="text-gray-400">You have no players with expiring contracts.</p>}
                {expiringPlayers.map(player => {
                    const expectedSalary = getPlayerExpectedSalary(player);
                    const currentOffer = offers[player.id] || { years: 1, salary: expectedSalary };
                    return (
                        <div key={player.id} className="p-4 bg-gray-700 rounded-lg grid grid-cols-4 gap-4 items-center">
                            <div>
                                <p className="font-bold text-white text-lg">{player.name}</p>
                                <p className="text-sm text-gray-400">{POSITIONS[player.position]} | OVR: {player.overall}</p>
                                <p className="text-sm text-gray-300">Expects: ~${expectedSalary}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-gray-300">Years:</label>
                                <input type="number" min="1" max="5" value={currentOffer.years} onChange={e => handleOfferChange(player.id, 'years', e.target.value)}
                                    className="w-20 bg-gray-900 text-white rounded p-2" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-gray-300">Salary:</label>
                                <input type="number" min="100" step="50" value={currentOffer.salary} onChange={e => handleOfferChange(player.id, 'salary', e.target.value)}
                                    className="w-24 bg-gray-900 text-white rounded p-2" />
                            </div>
                            <Button Icon={DollarSign} label="Offer" onClick={() => handleOffer(player.id)} variant="success" />
                        </div>
                    );
                })}
            </CardContent>
            <div className="p-4 bg-gray-900 text-center">
                <Button Icon={ChevronsRight} label="Finish Re-Signing & Enter Free Agency" onClick={() => dispatch({ type: 'FINISH_RE_SIGNING' })} variant="primary" />
            </div>
        </Card>
    );
};
