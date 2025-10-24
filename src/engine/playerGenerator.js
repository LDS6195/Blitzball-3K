/**
 * Player generation logic
 */

import { POSITIONS, PLAYER_FIRST_NAMES, PLAYER_LAST_NAMES } from '../constants';
import { randInt, randItem } from '../utils/random';
import { newId } from '../utils/idGenerator';
import { getPlayerExpectedSalary } from '../utils/calculations';

/**
 * Generates a new player object
 */
export const generatePlayer = (isRookie = false, season = 1) => {
  const base = isRookie ? 20 : 40;
  const potential = isRookie ? randInt(5, 10) : randInt(1, 10); // Rookies have higher potential
  const age = isRookie ? randInt(18, 21) : randInt(22, 30);

  const position = randItem(Object.keys(POSITIONS));
  let stats = {
    EN: randInt(base, base + 30), // Endurance
    AT: randInt(base, base + 30), // Attack
    PA: randInt(base, base + 30), // Pass
    SH: randInt(base, base + 30), // Shoot
    BL: randInt(base, base + 30), // Block
    CA: randInt(base, base + 30), // Catch
    SP: randInt(base, base + 30), // Speed
  };

  // Assign stats based on position
  switch (position) {
    case 'FWD':
      stats.SH = Math.min(99, stats.SH + randInt(10, 20));
      stats.EN = Math.min(99, stats.EN + randInt(5, 10));
      break;
    case 'MID':
      stats.PA = Math.min(99, stats.PA + randInt(10, 20));
      stats.EN = Math.min(99, stats.EN + randInt(5, 10));
      break;
    case 'DEF':
      stats.AT = Math.min(99, stats.AT + randInt(10, 20));
      stats.BL = Math.min(99, stats.BL + randInt(5, 10));
      break;
    case 'GK':
      stats.CA = Math.min(99, stats.CA + randInt(20, 30));
      stats.BL = Math.min(99, stats.BL + randInt(5, 10));
      break;
  }

  // Chance for a "phenom" rookie
  if (isRookie && randInt(1, 100) > 95) { // 5% chance
    Object.keys(stats).forEach(stat => {
      stats[stat] = Math.min(99, stats[stat] + randInt(20, 30));
    });
  }

  // Calculate overall rating
  const overall = Math.round(
    Object.values(stats).reduce((a, b) => a + b) / Object.values(stats).length
  );

  const newPlayer = {
    id: newId('plr'),
    name: `${randItem(PLAYER_FIRST_NAMES)} ${randItem(PLAYER_LAST_NAMES)}`,
    age,
    position,
    stats,
    potential,
    morale: 75,
    fitness: 100,
    contract: null, // Will be set by signing
    experience: 0,
    careerStats: { seasons: 0, goals: 0, assists: 0, saves: 0, stocks: 0, shotsFaced: 0 },
    seasonStats: { goals: 0, assists: 0, saves: 0, stocks: 0, shotsFaced: 0 },
    teamId: null,
    overall,
  };

  // Set initial contract
  const salary = getPlayerExpectedSalary(newPlayer);
  newPlayer.contract = { years: randInt(1, 3), salary };

  return newPlayer;
};
