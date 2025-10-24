/**
 * Off-season logic (draft, retirements, progression)
 */

import { generatePlayer } from './playerGenerator';
import { randInt } from '../utils/random';

/**
 * Generates a new draft class
 */
export const generateDraftClass = (season) => {
  const draftClass = [];
  for (let i = 0; i < 24; i++) { // 24 rookies in the class
    draftClass.push(generatePlayer(true, season));
  }
  // Sort by potential descending
  return draftClass.sort((a, b) => b.potential - a.potential || b.overall - a.overall);
};

/**
 * Runs retirement logic
 */
export const runRetirements = (players) => {
  const retiringPlayers = [];
  const updatedPlayers = JSON.parse(JSON.stringify(players));

  Object.values(updatedPlayers).forEach(p => {
    if (p.position === 'RET') return;

    // Age all players
    p.age += 1;

    // Check for retirement
    if (p.age > 30 + randInt(0, 5)) {
      if (randInt(1, 100) > 70) {
        retiringPlayers.push({ ...p }); // Store a copy
        p.teamId = null;
        p.position = 'RET'; // Retired
      }
    }
  });

  return { retiringPlayers, updatedPlayers };
};

/**
 * Runs player progression/regression logic
 */
export const runPlayerProgression = (players) => {
  const updatedPlayers = JSON.parse(JSON.stringify(players));
  const progressionLog = []; // { playerId, name, changes: [{ stat, old, new }] }

  Object.values(updatedPlayers).forEach(p => {
    if (p.position === 'RET') return;

    // Reset season stats
    p.seasonStats = { goals: 0, assists: 0, saves: 0, stocks: 0, shotsFaced: 0 };

    // Decrement contract years
    if (p.contract) {
      p.contract.years = Math.max(0, p.contract.years - 1);
    }

    let statChanges = 0;
    if (p.age < 28) {
      const improvement = Math.floor(p.potential / 2) + randInt(0, 2);
      statChanges = improvement;
    } else if (p.age > 30) {
      const decline = randInt(1, 4);
      statChanges = -decline;
    }

    if (statChanges !== 0) {
      const playerLog = { playerId: p.id, name: p.name, changes: [], oldOvr: p.overall };
      Object.keys(p.stats).forEach(stat => {
        const oldStat = p.stats[stat];
        const change = randInt(0, 1) * statChanges + randInt(-1, 1); // Add some variance
        const newStat = Math.max(1, Math.min(99, oldStat + change));
        if (oldStat !== newStat) {
          p.stats[stat] = newStat;
          playerLog.changes.push({ stat, old: oldStat, new: newStat });
        }
      });

      // Recalculate overall
      const newOverall = Math.round(
        Object.values(p.stats).reduce((a, b) => a + b) / Object.values(p.stats).length
      );
      p.overall = newOverall;
      playerLog.newOvr = newOverall;

      if (playerLog.changes.length > 0) {
        progressionLog.push(playerLog);
      }
    }
  });

  return { updatedPlayers, progressionLog };
};
