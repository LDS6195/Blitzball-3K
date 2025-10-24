/**
 * Match simulation engine
 */

import { randInt } from '../utils/random';
import { weightedRand } from '../utils/random';
import { newId } from '../utils/idGenerator';

/**
 * The core match simulation engine
 */
export const simulateMatchLogic = (homeTeam, awayTeam, allPlayers) => {
  const getPlayers = (team) =>
    team.roster.map(pid => allPlayers[pid]).filter(Boolean);

  const homePlayers = getPlayers(homeTeam);
  const awayPlayers = getPlayers(awayTeam);

  const getPos = (players, pos) => players.filter(p => p.position === pos);

  const homeFWD = getPos(homePlayers, 'FWD');
  const homeMID = getPos(homePlayers, 'MID');
  const homeDEF = getPos(homePlayers, 'DEF');
  const homeGK = getPos(homePlayers, 'GK')[0];

  const awayFWD = getPos(awayPlayers, 'FWD');
  const awayMID = getPos(awayPlayers, 'MID');
  const awayDEF = getPos(awayPlayers, 'DEF');
  const awayGK = getPos(awayPlayers, 'GK')[0];

  let homeScore = 0;
  let awayScore = 0;
  let playByPlay = [{ time: 0, text: "The match begins!" }];
  let playerStats = {}; // To store in-game stats like goals, saves

  const addStat = (playerId, stat, value = 1) => {
    if (!playerId) return;
    if (!playerStats[playerId]) playerStats[playerId] = {};
    if (!playerStats[playerId][stat]) playerStats[playerId][stat] = 0;
    playerStats[playerId][stat] += value;
  };

  const avgStat = (players, stat) => {
    if (!players || players.length === 0) return 1;
    const total = players.reduce((sum, p) => sum + (p.stats[stat] || 1), 0);
    return total / players.length;
  };

  // Simplified Probabilistic Simulation (30 "plays")
  for (let time = 1; time <= 30; time++) {
    const homeMidStrength = avgStat(homeMID, 'PA') + avgStat(homeMID, 'EN');
    const awayMidStrength = avgStat(awayMID, 'AT') + avgStat(awayMID, 'BL');
    const possessionRoll = randInt(1, 100) + (homeMidStrength - awayMidStrength) / 2;
    const hasPossession = possessionRoll > 50 ? homeTeam : awayTeam;
    const noPossession = hasPossession.id === homeTeam.id ? awayTeam : homeTeam;

    const atk = hasPossession.id === homeTeam.id;
    const atkName = hasPossession.name;
    const defName = noPossession.name;

    const atkFWD = atk ? homeFWD : awayFWD;
    const atkMID = atk ? homeMID : awayMID;
    const atkDEF = atk ? homeDEF : awayDEF;
    const defMID = atk ? awayMID : homeMID;
    const defDEF = atk ? awayDEF : homeDEF;
    const defGK = atk ? awayGK : homeGK;

    playByPlay.push({ time, text: `${atkName} gains possession in midfield.` });

    const defendingPlayers = [...defDEF, ...defMID].filter(Boolean);
    const defWeights = defendingPlayers.map(p => p.position === 'DEF' ? 3 : 2);
    const defBlocker = weightedRand(defendingPlayers, defWeights) || defendingPlayers[Math.floor(Math.random() * defendingPlayers.length)] || defDEF[0];

    const attackPower = (avgStat(atkFWD, 'SH') + avgStat(atkMID, 'PA')) / 2;
    const defensePower = defBlocker ? (defBlocker.stats.AT + defBlocker.stats.BL) / 2 : 20;
    const attackRoll = randInt(1, 100) + (attackPower - defensePower);

    if (attackRoll > 60) {
      const attackingPlayers = [...atkFWD, ...atkMID, ...atkDEF].filter(Boolean);
      const atkWeights = attackingPlayers.map(p => p.position === 'FWD' ? 4 : (p.position === 'MID' ? 2 : 1));
      const atkShooter = weightedRand(attackingPlayers, atkWeights) || atkFWD[Math.floor(Math.random() * atkFWD.length)];

      if (!atkShooter || !defGK) continue;

      playByPlay.push({ time, text: `${atkShooter.name} breaks past the defense!` });
      addStat(defGK.id, 'shotsFaced');

      const shotPower = atkShooter.stats.SH * (randInt(75, 125) / 100);
      const savePower = defGK.stats.CA * (randInt(75, 125) / 100);
      const shotRoll = randInt(1, 100) + (shotPower - savePower);

      if (shotRoll > 50) {
        playByPlay.push({ time, text: `GOAL!!! ${atkShooter.name} scores for ${atkName}!` });
        if (atk) homeScore++;
        else awayScore++;
        addStat(atkShooter.id, 'goals');

        if (randInt(1, 100) <= 70) {
          const potentialAssisters = [...atkFWD, ...atkMID, ...atkDEF].filter(p => p && p.id !== atkShooter.id);
          const assistWeights = potentialAssisters.map(p => p.position === 'MID' ? 3 : (p.position === 'FWD' ? 2 : 1));
          const assister = weightedRand(potentialAssisters, assistWeights);

          if (assister) {
            addStat(assister.id, 'assists');
            playByPlay.push({ time, text: `Assist from ${assister.name}.` });
          }
        }
      } else {
        playByPlay.push({ time, text: `SAVE! ${defGK.name} makes a brilliant stop!` });
        addStat(defGK.id, 'saves');
        if (randInt(1, 100) <= 5) {
          addStat(defGK.id, 'assists');
          playByPlay.push({ time, text: `...and ${defGK.name} starts a rapid counter-attack!` });
        }
      }
    } else {
      if (!defBlocker) continue;
      playByPlay.push({ time, text: `${defBlocker.name} shuts down the attack with a solid stop!` });
      addStat(defBlocker.id, 'stocks');
    }
  }

  playByPlay.push({ time: 31, text: `Full time! Final Score: ${homeTeam.name} ${homeScore} - ${awayTeam.name} ${awayScore}` });

  return {
    id: newId('match-sim'),
    homeScore,
    awayScore,
    playByPlay,
    playerStats,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    played: true,
  };
};
