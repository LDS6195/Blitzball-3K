import React, { useState } from 'react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { POSITIONS } from '../../constants';

export const LeagueHistory = ({ state }) => {
  const { history, league } = state;
  const [activeTab, setActiveTab] = useState('CHAMPIONS');
  const getPlayer = (id) => league.players[id] || { name: 'N/A', position: 'N/A', teamId: null };
  const getTeamName = (id) => league.teams.find(t => t.id === id)?.name || 'N/A';
  const TabButton = ({ label, tabId }) => (
    <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 font-semibold rounded-t-lg ${activeTab === tabId ? 'bg-gray-700 text-cyan-400' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>{label}</button>
  );
  const renderContent = () => {
    switch (activeTab) {
      case 'CHAMPIONS':
        return (<ul className="space-y-2">{history.champions.length === 0 ? (<p className="text-gray-400">No champions yet.</p>) : ([...history.champions].reverse().map((c, index) => (<li key={index} className="flex justify-between p-3 bg-gray-700 rounded-lg"><span className="font-semibold text-gray-300">Season {c.season}</span><span className="font-bold text-yellow-400">{c.teamName}</span></li>)))}</ul>);
      case 'MVP': case 'DPOY': case 'FINALS_MVP':
        const awardKey = activeTab === 'MVP' ? 'mvp' : (activeTab === 'DPOY' ? 'dpoy' : 'finalsMvp');
        return (<ul className="space-y-2">{history.awards.length === 0 ? (<p className="text-gray-400">No awards yet.</p>) : ([...history.awards].reverse().map((a, index) => { const player = getPlayer(a[awardKey]); return (<li key={index} className="flex justify-between p-3 bg-gray-700 rounded-lg"><span className="font-semibold text-gray-300">Season {a.season}</span><div className="text-right"><span className="font-bold text-yellow-400">{player.name}</span><span className="text-sm text-gray-400 ml-2">({getTeamName(player.teamId)})</span></div></li>);}))}</ul>);
      case 'ALL_BLITZ':
        return (<div className="space-y-6">{history.awards.length === 0 ? (<p className="text-gray-400">No awards yet.</p>) : ([...history.awards].reverse().map((a, index) => (<div key={index} className="p-4 bg-gray-700 rounded-lg"><h5 className="text-xl font-bold text-white mb-3">Season {a.season}</h5><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><TeamList title="1st Team All-Blitz" playerIds={a.firstTeam} getPlayer={getPlayer} getTeamName={getTeamName} /><TeamList title="2nd Team All-Blitz" playerIds={a.secondTeam} getPlayer={getPlayer} getTeamName={getTeamName} /></div></div>)))}</div>);
      default: return null;
    }
  };
  const TeamList = ({ title, playerIds, getPlayer, getTeamName }) => (
    <div className="p-3 bg-gray-900 rounded-lg"><h4 className="text-lg font-semibold text-yellow-400 mb-2">{title}</h4><ul className="space-y-2">
        {playerIds.map((pid, i) => { const player = getPlayer(pid); return (<li key={i} className="flex justify-between items-center bg-gray-800 p-2 rounded"><div><span className="font-semibold text-white">{player.name}</span><span className="text-xs text-gray-500 ml-2">{POSITIONS[player.position]}</span></div><span className="text-sm text-gray-400">{getTeamName(player.teamId)}</span></li>);})}
    </ul></div>
  );
  return (
    <Card>
      <CardHeader><h3 className="text-lg font-semibold text-white">League History</h3></CardHeader>
      <div className="px-4 pt-4 bg-gray-800"><nav className="flex space-x-1"><TabButton label="Champions" tabId="CHAMPIONS" /><TabButton label="MVP" tabId="MVP" /><TabButton label="Finals MVP" tabId="FINALS_MVP" /><TabButton label="DPOY" tabId="DPOY" /><TabButton label="All-Blitz Teams" tabId="ALL_BLITZ" /></nav></div>
      <CardContent className="bg-gray-700 rounded-b-xl max-h-[70vh] overflow-y-auto">{renderContent()}</CardContent>
    </Card>
  );
}
