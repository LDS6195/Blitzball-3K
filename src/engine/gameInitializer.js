/**
 * Game initialization logic
 */

import { TEAM_NAMES, SALARY_CAP } from '../constants';
import { newId } from '../utils/idGenerator';
import { generateTeam } from './teamGenerator';
import { generatePlayer } from './playerGenerator';
import { createSchedule } from './scheduleGenerator';

/**
 * Initializes a brand new game state
 */
export const initializeNewGame = () => {
  let allPlayers = {};
  let allTeams = [];

  TEAM_NAMES.forEach((name, index) => {
    const id = newId('team');
    const { team, players } = generateTeam(id, name, 1);
    allTeams.push(team);
    Object.assign(allPlayers, players);
  });

  // Create some initial free agents
  let freeAgents = {};
  for (let i = 0; i < 15; i++) {
    const player = generatePlayer(false, 1);
    player.contract.years = 0; // Expired contract
    freeAgents[player.id] = player;
  }
  Object.assign(allPlayers, freeAgents);

  const schedule = createSchedule(allTeams.map(t => t.id));

  return {
    ui: {
      currentPage: 'HOME',
      modal: null,
    },
    game: {
      currentSeason: 1,
      userTeamId: allTeams[0].id,
      phase: 'REGULAR_SEASON', // REGULAR_SEASON, PLAYOFFS, AWARDS, OFF_SEASON_...
      playoffBracket: null,
      news: [{ id: newId('news'), season: 1, text: "The new BlitzSim season begins!" }],
      salaryCap: SALARY_CAP,
      offSeasonData: {
        retiringPlayers: [],
        draftClass: [],
        progressionLog: [],
        userDraftPicks: 2,
      },
    },
    league: {
      teams: allTeams,
      players: allPlayers,
      schedule: schedule,
      freeAgents: Object.keys(freeAgents),
    },
    history: {
      champions: [],
      awards: [],
      playerSeasons: [],
    },
  };
};
