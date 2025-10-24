import React from 'react';
import { Card } from '../common/Card';
import { CardHeader } from '../common/CardHeader';
import { CardContent } from '../common/CardContent';

export const PlayoffBracketView = ({ state, dispatch }) => {
  const { playoffBracket } = state.game;
  const { teams } = state.league;
  const getTeamName = (id) => teams.find(t => t.id === id)?.name || 'TBD';
  if (!playoffBracket) {
    return (<Card><CardHeader><h3 className="text-lg font-semibold text-white">Playoff Bracket</h3></CardHeader><CardContent><p className="text-gray-400">The playoffs have not started yet.</p></CardContent></Card>);
  }
  const { round1, round2, finals } = playoffBracket;
  const MatchCard = ({ match, seedA, seedB }) => {
    const teamA = getTeamName(match.teamA); const teamB = getTeamName(match.teamB);
    const scoreA = match.matchData?.homeScore; const scoreB = match.matchData?.awayScore;
    const winnerA = match.winner === match.teamA; const winnerB = match.winner === match.teamB;
    const Wrapper = match.matchData ? 'button' : 'div';
    return (
      <Wrapper className={`bg-gray-700 p-4 rounded-lg w-full text-left ${match.matchData ? 'hover:bg-gray-600 cursor-pointer' : ''}`}
        onClick={match.matchData ? () => dispatch({ type: 'MODAL_OPEN', payload: { type: 'BOX_SCORE', match: match.matchData } }) : undefined}>
        <div className={`flex justify-between items-center ${winnerA ? 'font-bold text-white' : 'text-gray-300'}`}><span>({seedA}) {teamA}</span>{scoreA !== undefined && <span className="text-lg font-bold">{scoreA}</span>}</div>
        <div className="border-t border-gray-600 my-2"></div>
        <div className={`flex justify-between items-center ${winnerB ? 'font-bold text-white' : 'text-gray-300'}`}><span>({seedB}) {teamB}</span>{scoreB !== undefined && <span className="text-lg font-bold">{scoreB}</span>}</div>
      </Wrapper>
    );
  };
  const champion = finals[0].winner ? getTeamName(finals[0].winner) : null;
  return (
    <Card>
      <CardHeader><h3 className="text-lg font-semibold text-white">Playoff Bracket - Season {state.game.currentSeason}</h3></CardHeader>
      <CardContent className="space-y-6">
        {champion && (<div className="text-center p-4 bg-yellow-600 rounded-lg"><h2 className="text-2xl font-bold text-white">CHAMPION: {champion}</h2></div>)}
        <div className="flex flex-col md:flex-row justify-around items-start space-y-8 md:space-y-0 md:space-x-4">
          <div className="space-y-4 w-full md:w-1/3"><h4 className="text-xl font-semibold text-cyan-400 text-center">Round 1</h4><MatchCard match={round1[0]} seedA={round1[0].seedA} seedB={round1[0].seedB} /><MatchCard match={round1[1]} seedA={round1[1].seedA} seedB={round1[1].seedB} /></div>
          <div className="space-y-8 w-full md:w-1/3 md:mt-16"><h4 className="text-xl font-semibold text-cyan-400 text-center">Semifinals</h4><MatchCard match={round2[0]} seedA={round2[0].seedA} seedB={round2[0].seedB} /><MatchCard match={round2[1]} seedA={round2[1].seedA} seedB={round2[1].seedB} /></div>
          <div className="space-y-4 w-full md:w-1/3 md:mt-32"><h4 className="text-xl font-semibold text-cyan-400 text-center">Finals</h4><MatchCard match={finals[0]} seedA={finals[0].seedA} seedB={finals[0].seedB} /></div>
        </div>
      </CardContent>
    </Card>
  );
};
