import React, { useState, useMemo } from 'react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { POSITIONS } from '../../constants';

export const TeamHistory = ({ state }) => {
  const { game, league, history } = state;
  const [activeTab, setActiveTab] = useState('RECORDS_SEASON');
  const userTeam = league.teams.find(t => t.id === game.userTeamId);
  const { allTimeStats, accolades } = userTeam;
  const teamPlayerSeasons = useMemo(() => history.playerSeasons.filter(ps => ps.teamId === userTeam.id), [history.playerSeasons, userTeam.id]);
  const findRecord = (stat, isGk = false) => {
    if (teamPlayerSeasons.length === 0) { return { player: 'N/A', value: 0, season: 'N/A' }; }
    let record = { player: 'N/A', value: -1, season: 'N/A' };
    if (stat === 'savePct') {
      teamPlayerSeasons.forEach(ps => {
        if (!isGk) return;
        const { saves, shotsFaced } = ps.stats;
        if (shotsFaced >= 20) {
          const pct = (saves / shotsFaced);
          if (pct > record.value) { record = { player: ps.playerName, value: pct, season: ps.season }; }
        }
      });
      record.value = (record.value * 100).toFixed(1) + '%';
    } else {
      teamPlayerSeasons.forEach(ps => {
        if (isGk && (stat === 'goals' || stat === 'stocks')) return;
        if (!isGk && (stat === 'saves')) return;
        const value = ps.stats[stat] || 0;
        if (value > record.value) { record = { player: ps.playerName, value, season: ps.season }; }
      });
    }
    if (record.value === -1) record.value = 0;
    return record;
  };
  const careerRecords = useMemo(() => {
    const playerTotals = new Map();
    teamPlayerSeasons.forEach(ps => {
      if (!playerTotals.has(ps.playerId)) {
        playerTotals.set(ps.playerId, { name: ps.playerName, goals: 0, assists: 0, stocks: 0, saves: 0, shotsFaced: 0, });
      }
      const totals = playerTotals.get(ps.playerId);
      totals.goals += ps.stats.goals || 0; totals.assists += ps.stats.assists || 0;
      totals.stocks += ps.stats.stocks || 0; totals.saves += ps.stats.saves || 0;
      totals.shotsFaced += ps.stats.shotsFaced || 0;
    });
    const records = { goals: { player: 'N/A', value: 0 }, assists: { player: 'N/A', value: 0 }, stocks: { player: 'N/A', value: 0 }, saves: { player: 'N/A', value: 0 }, savePct: { player: 'N/A', value: 0 }, };
    playerTotals.forEach(p => {
      if (p.goals > records.goals.value) records.goals = { player: p.name, value: p.goals };
      if (p.assists > records.assists.value) records.assists = { player: p.name, value: p.assists };
      if (p.stocks > records.stocks.value) records.stocks = { player: p.name, value: p.stocks };
      if (p.saves > records.saves.value) records.saves = { player: p.name, value: p.saves };
      if (p.shotsFaced >= 50) {
        const pct = (p.saves / p.shotsFaced);
        if (pct > records.savePct.value) { records.savePct = { player: p.name, value: pct }; }
      }
    });
    records.savePct.value = (records.savePct.value * 100).toFixed(1) + '%';
    return records;
  }, [teamPlayerSeasons]);
  const seasonRecords = useMemo(() => ({
    goals: findRecord('goals'), assists: findRecord('assists'), stocks: findRecord('stocks'),
    saves: findRecord('saves', true), savePct: findRecord('savePct', true),
  }), [teamPlayerSeasons]);
  const TabButton = ({ label, tabId }) => (
    <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 font-semibold rounded-t-lg ${activeTab === tabId ? 'bg-gray-700 text-cyan-400' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>{label}</button>
  );
  const RecordRow = ({ label, record }) => (
    <li className="flex justify-between p-3 bg-gray-900 rounded-lg"><span className="font-semibold text-gray-300">{label}</span><div className="text-right"><span className="font-bold text-yellow-400 text-lg">{record.value}</span><span className="text-sm text-gray-400 ml-2">({record.player}{record.season && `, S${record.season}`})</span></div></li>
  );
  const CareerRecordRow = ({ label, record }) => (
    <li className="flex justify-between p-3 bg-gray-900 rounded-lg"><span className="font-semibold text-gray-300">{label}</span><div className="text-right"><span className="font-bold text-yellow-400 text-lg">{record.value}</span><span className="text-sm text-gray-400 ml-2">({record.player})</span></div></li>
  );
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><h3 className="text-lg font-semibold text-white">{userTeam.name} - Team History</h3></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700 rounded-lg text-center"><h4 className="text-lg text-gray-300">All-Time Record</h4><p className="text-3xl font-bold text-white">{`${allTimeStats.wins}-${allTimeStats.losses}-${allTimeStats.draws}`}</p></div>
          <div className="p-4 bg-gray-700 rounded-lg text-center"><h4 className="text-lg text-gray-300">League Banners</h4><p className="text-3xl font-bold text-yellow-400">{accolades.leagueBanners}</p><span className="text-sm text-gray-400">(#1 Regular Season)</span></div>
          <div className="p-4 bg-gray-700 rounded-lg text-center"><h4 className="text-lg text-gray-300">Championships</h4><p className="text-3xl font-bold text-yellow-400">{accolades.championships}</p><span className="text-sm text-gray-400">(Playoff Winners)</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><h3 className="text-lg font-semibold text-white">Team Records</h3></CardHeader>
        <div className="px-4 pt-4 bg-gray-800"><nav className="flex space-x-1"><TabButton label="Single Season" tabId="RECORDS_SEASON" /><TabButton label="Career (with Team)" tabId="RECORDS_CAREER" /></nav></div>
        <CardContent className="bg-gray-700 rounded-b-xl">
          {activeTab === 'RECORDS_SEASON' && (<ul className="space-y-3"><h4 className="text-xl font-semibold text-white mb-2">Single Season Records</h4><RecordRow label="Goals" record={seasonRecords.goals} /><RecordRow label="Assists" record={seasonRecords.assists} /><RecordRow label="Stocks (Tkl/Blk)" record={seasonRecords.stocks} /><RecordRow label="Saves" record={seasonRecords.saves} /><RecordRow label="Save %" record={seasonRecords.savePct} /></ul>)}
          {activeTab === 'RECORDS_CAREER' && (<ul className="space-y-3"><h4 className="text-xl font-semibold text-white mb-2">Career Records (while on team)</h4><CareerRecordRow label="Goals" record={careerRecords.goals} /><CareerRecordRow label="Assists" record={careerRecords.assists} /><CareerRecordRow label="Stocks (Tkl/Blk)" record={careerRecords.stocks} /><CareerRecordRow label="Saves" record={careerRecords.saves} /><CareerRecordRow label="Save %" record={careerRecords.savePct} /></ul>)}
        </CardContent>
      </Card>
    </div>
  );
};
