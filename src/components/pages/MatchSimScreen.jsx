import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronsRight } from 'lucide-react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';
import { Button } from '../common/Button';

export const MatchSimScreen = ({ state, dispatch, matchId }) => {
  const [simSpeed, setSimSpeed] = useState(500);
  const [log, setLog] = useState([]);
  const [isSimming, setIsSimming] = useState(false);
  const match = state.league.schedule.find(m => m.id === matchId);
  if (!match) return <div>Error: Match not found.</div>;
  const homeTeam = state.league.teams.find(t => t.id === match.homeTeamId);
  const awayTeam = state.league.teams.find(t => t.id === match.awayTeamId);
  useEffect(() => {
    if (match.played) { setLog(match.playByPlay); }
    else { setLog([{ time: 0, text: "Waiting to start match..."}]); }
  }, [matchId, match.played, match.playByPlay]);
  const runSimulation = () => { setIsSimming(true); dispatch({ type: 'SIMULATE_MATCH', payload: { matchId } }); };
  const updatedMatch = state.league.schedule.find(m => m.id === matchId);
  useEffect(() => {
    if (isSimming && updatedMatch.played) {
      let i = 0; setLog([]);
      const interval = setInterval(() => {
        if (i < updatedMatch.playByPlay.length) { setLog(prev => [...prev, updatedMatch.playByPlay[i]]); i++; }
        else { clearInterval(interval); setIsSimming(false); }
      }, simSpeed);
      return () => clearInterval(interval);
    }
  }, [isSimming, updatedMatch, simSpeed]);
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-around items-center"><span className="text-2xl font-bold">{homeTeam.name}</span><span className="text-4xl font-bold text-cyan-400">{updatedMatch.played ? `${updatedMatch.homeScore} - ${updatedMatch.awayScore}` : 'VS'}</span><span className="text-2xl font-bold">{awayTeam.name}</span></div>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gray-900 rounded-lg p-4 overflow-y-auto mb-4 font-mono text-sm">
          {log.map((entry, index) => (<p key={index} className={`mb-1 ${entry.text.includes('GOAL') ? 'text-green-400 font-bold' : entry.text.includes('SAVE') ? 'text-yellow-400' : 'text-gray-300'}`}><span className="text-gray-500 mr-2">[{entry.time}]</span>{entry.text}</p>))}
        </div>
        <div className="flex justify-between items-center">
          {updatedMatch.played ? (<Button Icon={ArrowRight} label="Back to Home" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'HOME' })} />)
          : (<Button Icon={ChevronsRight} label="Start Simulation" onClick={runSimulation} variant="success" disabled={isSimming} />)}
          <div className="flex items-center space-x-2 text-white"><label>Speed:</label><button onClick={() => setSimSpeed(1000)} className={`px-2 py-1 rounded ${simSpeed === 1000 ? 'bg-cyan-500' : 'bg-gray-700'}`}>Slow</button><button onClick={() => setSimSpeed(500)} className={`px-2 py-1 rounded ${simSpeed === 500 ? 'bg-cyan-500' : 'bg-gray-700'}`}>Mid</button><button onClick={() => setSimSpeed(100)} className={`px-2 py-1 rounded ${simSpeed === 100 ? 'bg-cyan-500' : 'bg-gray-700'}`}>Fast</button></div>
        </div>
      </CardContent>
    </Card>
  );
};
