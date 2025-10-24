/**
 * Awards calculation logic
 */

import { getPlayerPerfScore } from '../utils/calculations';

/**
 * Calculates all end-of-season awards
 */
export const calculateAwards = (allPlayers) => {
  const players = allPlayers.filter(p => p && p.position !== 'RET' && p.teamId);
  if (players.length === 0) {
    return { mvp: null, dpoy: null, firstTeam: [null, null, null, null], secondTeam: [null, null, null, null] };
  }
  players.forEach(p => { p.perfScore = getPlayerPerfScore(p); });
  const mvp = players.reduce((max, p) => (p.perfScore > max.perfScore ? p : max), players[0]);
  const defenders = players.filter(p => p.position === 'DEF' || p.position === 'GK');
  const dpoy = defenders.length > 0
    ? defenders.reduce((max, p) => p.perfScore > max.perfScore ? p : max, defenders[0])
    : (players[0] || null);
  const getTopTwo = (pos) => {
    const posPlayers = players.filter(p => p.position === pos).sort((a, b) => b.perfScore - a.perfScore);
    return [posPlayers[0] || null, posPlayers[1] || null];
  };
  const [fwd1, fwd2] = getTopTwo('FWD');
  const [mid1, mid2] = getTopTwo('MID');
  const [def1, def2] = getTopTwo('DEF');
  const [gk1, gk2] = getTopTwo('GK');
  return {
    mvp: mvp?.id || null,
    dpoy: dpoy?.id || null,
    firstTeam: [fwd1?.id || null, mid1?.id || null, def1?.id || null, gk1?.id || null],
    secondTeam: [fwd2?.id || null, mid2?.id || null, def2?.id || null, gk2?.id || null],
  };
};
