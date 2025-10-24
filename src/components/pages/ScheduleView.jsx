import React from 'react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';

export const ScheduleView = ({ state, dispatch }) => {
  const { league } = state;
  const getTeamName = (id) => league.teams.find(t => t.id === id)?.name || 'Unknown';
  const gamesPerWeek = league.teams.length / 2;
  const weeks = [];
  for (let i = 0; i < league.schedule.length; i += gamesPerWeek) {
    weeks.push(league.schedule.slice(i, i + gamesPerWeek));
  }
  return (
    <Card>
       <CardHeader><h3 className="text-lg font-semibold text-white">League Schedule - Season {state.game.currentSeason}</h3></CardHeader>
       <CardContent className="space-y-6 max-h-[80vh] overflow-y-auto">
       {weeks.map((games, weekIndex) => (
         <div key={weekIndex} className="space-y-3">
           <h4 className="text-xl font-semibold text-cyan-400 border-b border-gray-600 pb-2">Week {weekIndex + 1}</h4>
           {games.map(match => {
             const MatchWrapper = match.played ? 'button' : 'div';
             return (
               <MatchWrapper key={match.id} onClick={match.played ? () => dispatch({ type: 'MODAL_OPEN', payload: { type: 'BOX_SCORE', match } }) : undefined}
                 className={`p-4 bg-gray-700 rounded-lg flex items-center justify-between w-full text-left ${match.played ? 'hover:bg-gray-600 cursor-pointer transition-colors' : ''}`}>
                 <span className="w-1/3 text-right font-semibold text-lg text-white">{getTeamName(match.homeTeamId)}</span>
                 <div className="w-1/3 text-center">
                   {match.played ? (<span className="text-2xl font-bold">{`${match.homeScore} - ${match.awayScore}`}</span>)
                   : (<span className="text-gray-400">vs</span>)}
                 </div>
                 <span className="w-1/3 text-left font-semibold text-lg text-white">{getTeamName(match.awayTeamId)}</span>
               </MatchWrapper>
             );
           })}
         </div>
       ))}
       </CardContent>
    </Card>
  );
};
