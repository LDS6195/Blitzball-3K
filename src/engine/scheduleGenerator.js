/**
 * Schedule generation logic
 */

import { newId } from '../utils/idGenerator';

/**
 * Creates the full league schedule
 */
export const createSchedule = (teamIds) => {
  const schedule = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      schedule.push({
        id: newId('match'),
        season: 1,
        homeTeamId: teamIds[i],
        awayTeamId: teamIds[j],
        homeScore: null,
        awayScore: null,
        played: false,
        playByPlay: [],
      });
      schedule.push({
        id: newId('match'),
        season: 1,
        homeTeamId: teamIds[j],
        awayTeamId: teamIds[i],
        homeScore: null,
        awayScore: null,
        played: false,
        playByPlay: [],
      });
    }
  }
  return schedule.sort(() => Math.random() - 0.5); // Shuffle schedule
};
