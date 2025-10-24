import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';
import { StatBar } from '../common/StatBar';
import { POSITIONS } from '../../constants';

export const PlayerCard = ({ player, state, onClose }) => {
  if (!player || !state) return null;
  const { stats, careerStats, seasonStats, contract } = player;
  const { history, game } = state;
  const statPairs = [
    { label: 'EN', value: stats.EN }, { label: 'AT', value: stats.AT }, { label: 'PA', value: stats.PA },
    { label: 'SH', value: stats.SH }, { label: 'BL', value: stats.BL }, { label: 'CA', value: stats.CA },
    { label: 'SP', value: stats.SP },
  ];
  const getPotentialStars = (pot) => '★'.repeat(Math.ceil(pot/2)) + '☆'.repeat(5 - Math.ceil(pot/2));
  const { goals, assists, saves, stocks, shotsFaced } = seasonStats;
  const { goals: cGoals, assists: cAssists, saves: cSaves, stocks: cStocks, shotsFaced: cShotsFaced } = careerStats;
  const savePct = (shotsFaced > 0 ? (saves / shotsFaced * 100) : 0).toFixed(1);
  const cSavePct = (cShotsFaced > 0 ? (cSaves / cShotsFaced * 100) : 0).toFixed(1);

  const careerAwards = useMemo(() => {
    const awards = { mvp: [], finalsMvp: [], dpoy: [], firstTeam: [], secondTeam: [], championships: [] };
    if (history) {
      history.awards.forEach(a => {
        if (a.mvp === player.id) awards.mvp.push(a.season);
        if (a.finalsMvp === player.id) awards.finalsMvp.push(a.season);
        if (a.dpoy === player.id) awards.dpoy.push(a.season);
        if (a.firstTeam.includes(player.id)) awards.firstTeam.push(a.season);
        if (a.secondTeam.includes(player.id)) awards.secondTeam.push(a.season);
      });
      history.champions.forEach(c => {
        let wasOnTeam = history.playerSeasons.some(ps => ps.season === c.season && ps.teamId === c.teamId && ps.playerId === player.id);
        if (wasOnTeam) { awards.championships.push(c.season); }
      });
    }
    return awards;
  }, [player.id, history]);

  const AwardItem = ({ label, seasons }) => (
    seasons.length > 0 && (<div className="text-gray-300"><span className="font-semibold text-white">{label} ({seasons.length}):</span><span className="text-sm ml-2">{seasons.join(', ')}</span></div>)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl border border-cyan-500 shadow-2xl">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{player.name}</h2>
            <span className="text-lg text-gray-400">{POSITIONS[player.position]} | Age: {player.age} | OVR: {player.overall}</span>
          </div>
          <Button onClick={onClose} variant="secondary">Close</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3 p-4 bg-gray-700 rounded-lg md:col-span-1">
            <h4 className="text-xl font-semibold text-white mb-2">Attributes</h4>
            {statPairs.map(s => <StatBar key={s.label} label={s.label} value={s.value} />)}
             <div className="flex items-center pt-2"><span className="w-8 font-bold text-sm text-gray-300">POT</span><span className="text-xl text-yellow-400 ml-2">{getPotentialStars(player.potential)}</span></div>
             <div className="pt-2">
                <h4 className="text-lg font-semibold text-white">Contract</h4>
                {contract && contract.years > 0 ? (
                    <p className="text-gray-300">${contract.salary} / {contract.years} Year(s)</p>
                ) : (
                    <p className="text-yellow-400">Contract Expired</p>
                )}
             </div>
          </div>
          <div className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-xl font-semibold text-white mb-2">This Season</h4>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    {player.position !== 'GK' ? (<><span>Goals: <span className="font-bold text-white">{goals}</span></span><span>Assists: <span className="font-bold text-white">{assists}</span></span><span>Stocks: <span className="font-bold text-white">{stocks}</span></span></>)
                    : (<><span>Saves: <span className="font-bold text-white">{saves}</span></span><span>Save %: <span className="font-bold text-white">{savePct}%</span></span><span>Assists: <span className="font-bold text-white">{assists}</span></span></>)}
                  </div>
               </div>
               <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-xl font-semibold text-white mb-2">Career</h4>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    {player.position !== 'GK' ? (<><span>Goals: <span className="font-bold text-white">{cGoals}</span></span><span>Assists: <span className="font-bold text-white">{cAssists}</span></span><span>Stocks: <span className="font-bold text-white">{cStocks}</span></span></>)
                    : (<><span>Saves: <span className="font-bold text-white">{cSaves}</span></span><span>Save %: <span className="font-bold text-white">{cSavePct}%</span></span><span>Assists: <span className="font-bold text-white">{cAssists}</span></span></>)}
                  </div>
               </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="text-xl font-semibold text-white mb-2">Career Awards</h4>
              <div className="space-y-1">
                <AwardItem label="🏆 Championship" seasons={careerAwards.championships} />
                <AwardItem label="⭐ League MVP" seasons={careerAwards.mvp} />
                <AwardItem label="🏅 Finals MVP" seasons={careerAwards.finalsMvp} />
                <AwardItem label="🛡️ DPOY" seasons={careerAwards.dpoy} />
                <AwardItem label="🥇 1st Team All-Blitz" seasons={careerAwards.firstTeam} />
                <AwardItem label="🥈 2nd Team All-Blitz" seasons={careerAwards.secondTeam} />
                {Object.values(careerAwards).every(arr => arr.length === 0) && (<p className="text-gray-400 italic">No awards yet.</p>)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
