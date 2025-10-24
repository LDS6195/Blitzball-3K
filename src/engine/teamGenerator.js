/**
 * Team generation logic
 */

import { generatePlayer } from './playerGenerator';

/**
 * Generates a full team with a roster
 */
export const generateTeam = (id, name, season) => {
  let newPlayers = {};

  // 2 FWD, 3 MID, 2 DEF, 1 GK
  const rosterCounts = { FWD: 2, MID: 3, DEF: 2, GK: 1 };

  for (const [pos, count] of Object.entries(rosterCounts)) {
    for (let i = 0; i < count; i++) {
      const player = generatePlayer(false, season);
      player.teamId = id;
      player.position = pos; // Ensure roster balance
      newPlayers[player.id] = player;
    }
  }

  const roster = Object.keys(newPlayers);
  const salary = roster.reduce((sum, pid) => sum + newPlayers[pid].contract.salary, 0);

  const team = {
    id,
    name,
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    budget: 10000,
    tactics: {
      formation: '3-3-2', // FWD-MID-DEF (GK is implied)
      tempo: 'balanced',
      aggression: 'medium',
    },
    roster,
    salary,
    allTimeStats: { wins: 0, losses: 0, draws: 0 },
    accolades: { leagueBanners: 0, championships: 0 },
  };

  return { team, players: newPlayers };
};
