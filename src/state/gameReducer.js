/**
 * Main game state reducer
 */

import { newId } from '../utils/idGenerator';
import { getPlayerExpectedSalary } from '../utils/calculations';
import {
  initializeNewGame,
  simulateMatchLogic,
  calculateAwards,
  generateDraftClass,
  runRetirements,
  runPlayerProgression,
  createSchedule,
} from '../engine';

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_GAME':
      return action.payload;

    case 'START_NEW_GAME':
      return initializeNewGame();

    case 'NAVIGATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          currentPage: action.payload,
          matchId: action.matchId !== undefined ? action.matchId : state.ui.matchId
        }
      };

    case 'MODAL_OPEN':
      return { ...state, ui: { ...state.ui, modal: action.payload } };

    case 'MODAL_CLOSE':
      return { ...state, ui: { ...state.ui, modal: null } };

    case 'SIMULATE_MATCH': {
      const { matchId } = action.payload;
      const userMatch = state.league.schedule.find(m => m.id === matchId);
      if (!userMatch || userMatch.played) return state;
      const gamesPerWeek = state.league.teams.length / 2;
      const userMatchIndexInSchedule = state.league.schedule.findIndex(m => m.id === matchId);
      const weekIndex = Math.floor(userMatchIndexInSchedule / gamesPerWeek);
      const weekStartIndex = weekIndex * gamesPerWeek;
      const weekEndIndex = weekStartIndex + gamesPerWeek;
      const currentWeekMatches = state.league.schedule.slice(weekStartIndex, weekEndIndex);
      const matchesToSim = currentWeekMatches.filter(m => !m.played);
      let newSchedule = [...state.league.schedule];
      let newTeams = [...state.league.teams];
      let newPlayers = JSON.parse(JSON.stringify(state.league.players));
      for (const match of matchesToSim) {
        const homeTeam = newTeams.find(t => t.id === match.homeTeamId);
        const awayTeam = newTeams.find(t => t.id === match.awayTeamId);
        if (newSchedule.find(m => m.id === match.id)?.played) continue;
        const { id, homeScore, awayScore, playByPlay, playerStats, ...simData } =
          simulateMatchLogic(homeTeam, awayTeam, newPlayers);
        const matchIndex = newSchedule.findIndex(m => m.id === match.id);
        newSchedule[matchIndex] = {
          ...match,
          homeScore,
          awayScore,
          played: true,
          playByPlay: match.id === userMatch.id ? playByPlay : [{ time: 0, text: "Simulated match." }],
          playerStats: playerStats,
        };
        Object.entries(playerStats).forEach(([playerId, stats]) => {
          if (newPlayers[playerId]) {
            Object.entries(stats).forEach(([statKey, value]) => {
              if (newPlayers[playerId].seasonStats[statKey] !== undefined) {
                newPlayers[playerId].seasonStats[statKey] += value;
              }
              if (newPlayers[playerId].careerStats[statKey] !== undefined) {
                newPlayers[playerId].careerStats[statKey] += value;
              }
            });
          }
        });
        const homeTeamIndex = newTeams.findIndex(t => t.id === homeTeam.id);
        const awayTeamIndex = newTeams.findIndex(t => t.id === awayTeam.id);
        const newHomeTeam = { ...newTeams[homeTeamIndex] };
        const newAwayTeam = { ...newTeams[awayTeamIndex] };
        newHomeTeam.goalsFor += homeScore;
        newHomeTeam.goalsAgainst += awayScore;
        newAwayTeam.goalsFor += awayScore;
        newAwayTeam.goalsAgainst += homeScore;
        if (homeScore > awayScore) {
          newHomeTeam.wins += 1; newHomeTeam.points += 3; newAwayTeam.losses += 1;
        } else if (homeScore < awayScore) {
          newAwayTeam.wins += 1; newAwayTeam.points += 3; newHomeTeam.losses += 1;
        } else {
          newHomeTeam.draws += 1; newAwayTeam.draws += 1; newHomeTeam.points += 1; newAwayTeam.points += 1;
        }
        newTeams[homeTeamIndex] = newHomeTeam;
        newTeams[awayTeamIndex] = newAwayTeam;
      }
      return { ...state, league: { ...state.league, schedule: newSchedule, teams: newTeams, players: newPlayers } };
    }

    case 'SIMULATE_SEASON': {
      let tempState = JSON.parse(JSON.stringify(state));
      const unplayedMatches = tempState.league.schedule.filter(m => !m.played);
      for (const match of unplayedMatches) {
        const homeTeam = tempState.league.teams.find(t => t.id === match.homeTeamId);
        const awayTeam = tempState.league.teams.find(t => t.id === match.awayTeamId);
        const { id, homeScore, awayScore, playByPlay, playerStats, ...simData } =
          simulateMatchLogic(homeTeam, awayTeam, tempState.league.players);
        const matchIndex = tempState.league.schedule.findIndex(m => m.id === match.id);
        tempState.league.schedule[matchIndex] = {
          ...match, homeScore, awayScore, played: true,
          playByPlay: [{ time: 0, text: "Simulated match." }], playerStats: playerStats,
        };
        Object.entries(playerStats).forEach(([playerId, stats]) => {
          if (tempState.league.players[playerId]) {
            Object.entries(stats).forEach(([statKey, value]) => {
              if (tempState.league.players[playerId].seasonStats[statKey] !== undefined) {
                tempState.league.players[playerId].seasonStats[statKey] += value;
              }
              if (tempState.league.players[playerId].careerStats[statKey] !== undefined) {
                tempState.league.players[playerId].careerStats[statKey] += value;
              }
            });
          }
        });
        const homeTeamIndex = tempState.league.teams.findIndex(t => t.id === homeTeam.id);
        const awayTeamIndex = tempState.league.teams.findIndex(t => t.id === awayTeam.id);
        const newHomeTeam = { ...tempState.league.teams[homeTeamIndex] };
        const newAwayTeam = { ...tempState.league.teams[awayTeamIndex] };
        newHomeTeam.goalsFor += homeScore; newHomeTeam.goalsAgainst += awayScore;
        newAwayTeam.goalsFor += awayScore; newAwayTeam.goalsAgainst += homeScore;
        if (homeScore > awayScore) {
          newHomeTeam.wins += 1; newHomeTeam.points += 3; newAwayTeam.losses += 1;
        } else if (homeScore < awayScore) {
          newAwayTeam.wins += 1; newAwayTeam.points += 3; newHomeTeam.losses += 1;
        } else {
          newHomeTeam.draws += 1; newAwayTeam.draws += 1; newHomeTeam.points += 1; newAwayTeam.points += 1;
        }
        tempState.league.teams[homeTeamIndex] = newHomeTeam;
        tempState.league.teams[awayTeamIndex] = newAwayTeam;
      }
      const sortedTeams = [...tempState.league.teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
      const top6 = sortedTeams.slice(0, 6).map((team, index) => ({ team, seed: index + 1 }));
      const topSeedTeamId = sortedTeams[0]?.id;
      if (topSeedTeamId) {
        const topSeedTeamIndex = tempState.league.teams.findIndex(t => t.id === topSeedTeamId);
        if (topSeedTeamIndex !== -1) {
          tempState.league.teams[topSeedTeamIndex].accolades.leagueBanners += 1;
          tempState.game.news.unshift({ id: newId('news'), season: tempState.game.currentSeason, text: `${sortedTeams[0].name} have won the regular season League Banner!` });
        }
      }
      const getTeamBySeed = (seed) => top6.find(t => t.seed === seed)?.team;
      const team1 = getTeamBySeed(1); const team2 = getTeamBySeed(2); const team3 = getTeamBySeed(3);
      const team4 = getTeamBySeed(4); const team5 = getTeamBySeed(5); const team6 = getTeamBySeed(6);
      const playoffBracket = {
        round1: [
          { id: newId('pMatch'), round: 1, seedA: 4, seedB: 5, teamA: team4?.id, teamB: team5?.id, winner: null, matchData: null },
          { id: newId('pMatch'), round: 1, seedA: 3, seedB: 6, teamA: team3?.id, teamB: team6?.id, winner: null, matchData: null }
        ],
        round2: [
          { id: newId('pMatch'), round: 2, seedA: 1, seedB: 'Winner 4/5', teamA: team1?.id, teamB: null, winner: null, matchData: null },
          { id: newId('pMatch'), round: 2, seedA: 2, seedB: 'Winner 3/6', teamA: team2?.id, teamB: null, winner: null, matchData: null }
        ],
        finals: [
          { id: newId('pMatch'), round: 3, seedA: 'Winner R2.1', seedB: 'Winner R2.2', teamA: null, teamB: null, winner: null, matchData: null }
        ]
      };
      tempState.game.playoffBracket = playoffBracket;
      tempState.game.phase = 'PLAYOFFS';
      tempState.game.news.unshift({ id: newId('news'), season: tempState.game.currentSeason, text: "The regular season is over. The playoff bracket is set!" });
      return tempState;
    }

    case 'SIMULATE_PLAYOFFS': {
      let tempState = JSON.parse(JSON.stringify(state));
      let { playoffBracket, currentSeason } = tempState.game;
      if (!playoffBracket || state.game.phase !== 'PLAYOFFS') return state;
      const allPlayers = tempState.league.players;
      const allTeams = tempState.league.teams;
      let playoffStats = {};
      const addPlayoffStats = (gamePlayerStats) => {
        Object.entries(gamePlayerStats).forEach(([playerId, stats]) => {
          if (!playoffStats[playerId]) {
            playoffStats[playerId] = { goals: 0, assists: 0, saves: 0, stocks: 0, shotsFaced: 0, games: 0 };
          }
          playoffStats[playerId].games += 1;
          Object.entries(stats).forEach(([statKey, value]) => {
            if (playoffStats[playerId][statKey] !== undefined) {
              playoffStats[playerId][statKey] += value;
            }
          });
        });
      };
      const r1_match1 = playoffBracket.round1[0]; const r1_match2 = playoffBracket.round1[1];
      const r1_m1_sim = simulateMatchLogic(allTeams.find(t => t.id === r1_match1.teamA), allTeams.find(t => t.id === r1_match1.teamB), allPlayers);
      r1_match1.winner = r1_m1_sim.homeScore > r1_m1_sim.awayScore ? r1_match1.teamA : r1_match1.teamB;
      r1_match1.matchData = r1_m1_sim; addPlayoffStats(r1_m1_sim.playerStats);
      const r1_m2_sim = simulateMatchLogic(allTeams.find(t => t.id === r1_match2.teamA), allTeams.find(t => t.id === r1_match2.teamB), allPlayers);
      r1_match2.winner = r1_m2_sim.homeScore > r1_m2_sim.awayScore ? r1_match2.teamA : r1_match2.teamB;
      r1_match2.matchData = r1_m2_sim; addPlayoffStats(r1_m2_sim.playerStats);
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `Playoff R1: ${allTeams.find(t => t.id === r1_match1.winner).name} defeats ${allTeams.find(t => t.id === (r1_match1.winner === r1_match1.teamA ? r1_match1.teamB : r1_match1.teamA)).name}!` });
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `Playoff R1: ${allTeams.find(t => t.id === r1_match2.winner).name} defeats ${allTeams.find(t => t.id === (r1_match2.winner === r1_match2.teamA ? r1_match2.teamB : r1_match2.teamA)).name}!` });
      const r2_match1 = playoffBracket.round2[0]; const r2_match2 = playoffBracket.round2[1];
      r2_match1.teamB = r1_match1.winner; r2_match2.teamB = r1_match2.winner;
      const r2_m1_sim = simulateMatchLogic(allTeams.find(t => t.id === r2_match1.teamA), allTeams.find(t => t.id === r2_match1.teamB), allPlayers);
      r2_match1.winner = r2_m1_sim.homeScore > r2_m1_sim.awayScore ? r2_match1.teamA : r2_match1.teamB;
      r2_match1.matchData = r2_m1_sim; addPlayoffStats(r2_m1_sim.playerStats);
      const r2_m2_sim = simulateMatchLogic(allTeams.find(t => t.id === r2_match2.teamA), allTeams.find(t => t.id === r2_match2.teamB), allPlayers);
      r2_match2.winner = r2_m2_sim.homeScore > r2_m2_sim.awayScore ? r2_match2.teamA : r2_match2.teamB;
      r2_match2.matchData = r2_m2_sim; addPlayoffStats(r2_m2_sim.playerStats);
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `Semifinals: ${allTeams.find(t => t.id === r2_match1.winner).name} is heading to the Finals!` });
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `Semifinals: ${allTeams.find(t => t.id === r2_match2.winner).name} advances to the Finals!` });
      const rF_match = playoffBracket.finals[0];
      rF_match.teamA = r2_match1.winner; rF_match.teamB = r2_match2.winner;
      const rF_sim = simulateMatchLogic(allTeams.find(t => t.id === rF_match.teamA), allTeams.find(t => t.id === rF_match.teamB), allPlayers);
      rF_match.winner = rF_sim.homeScore > rF_sim.awayScore ? rF_match.teamA : rF_match.teamB;
      rF_match.matchData = rF_sim; addPlayoffStats(rF_sim.playerStats);
      const champion = allTeams.find(t => t.id === rF_match.winner);
      tempState.history.champions.push({ season: currentSeason, teamId: champion.id, teamName: champion.name });
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `CHAMPIONS: ${champion.name} have won the Season ${currentSeason} championship!` });
      const championTeamIndex = tempState.league.teams.findIndex(t => t.id === champion.id);
      if (championTeamIndex !== -1) {
        tempState.league.teams[championTeamIndex].accolades.championships += 1;
      }
      const regularSeasonAwards = calculateAwards(Object.values(allPlayers));
      const finalistTeamA = allTeams.find(t => t.id === rF_match.teamA);
      const finalistTeamB = allTeams.find(t => t.id === rF_match.teamB);
      const finalistPlayers = [...finalistTeamA.roster, ...finalistTeamB.roster].map(pid => allPlayers[pid]).filter(p => p && playoffStats[p.id]);
      let finalsMvp = null;
      if (finalistPlayers.length > 0) {
        finalistPlayers.forEach(p => {
          const { goals, assists, saves, stocks } = playoffStats[p.id]; let score = 0;
          switch (p.position) {
            case 'FWD': score = (goals * 3) + (assists * 1) + (stocks * 0.5); break;
            case 'MID': score = (goals * 2) + (assists * 3) + (stocks * 1); break;
            case 'DEF': score = (stocks * 3) + (assists * 1) + (goals * 1); break;
            case 'GK': score = (saves * 3) + (assists * 1); break;
            default: score = 0;
          } p.playoffPerfScore = score;
        });
        const championPlayerIds = champion.roster;
        const championFinalists = finalistPlayers.filter(p => championPlayerIds.includes(p.id));
        let mvpContenders = championFinalists.length > 0 ? championFinalists : finalistPlayers;
        finalsMvp = mvpContenders.reduce((max, p) => (p.playoffPerfScore > max.playoffPerfScore ? p : max), mvpContenders[0]);
      }
      tempState.history.awards.push({ season: currentSeason, ...regularSeasonAwards, finalsMvp: finalsMvp?.id || null });
      const finalsMvpName = finalsMvp?.name || 'Unnamed';
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `🏅 ${finalsMvpName} has won the Finals MVP award!` });
      const mvpName = tempState.league.players[regularSeasonAwards.mvp]?.name || 'Unnamed';
      const dpoyName = tempState.league.players[regularSeasonAwards.dpoy]?.name || 'Unnamed';
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `⭐ ${dpoyName} has won the Defensive Player of the Year award!` });
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `🏆 ${mvpName} has won the Season ${currentSeason} MVP award!` });
      tempState.game.phase = 'AWARDS';
      tempState.ui.modal = { type: 'AWARDS' };
      return tempState;
    }

    // --- OFF-SEASON REDUCERS ---

    case 'ACKNOWLEDGE_AWARDS': {
      let newHistory = JSON.parse(JSON.stringify(state.history));
      const currentSeasonNum = state.game.currentSeason;
      Object.values(state.league.players).forEach(p => {
        if (p.teamId && p.position !== 'RET') {
          newHistory.playerSeasons.push({
            season: currentSeasonNum,
            playerId: p.id,
            playerName: p.name,
            teamId: p.teamId,
            stats: JSON.parse(JSON.stringify(p.seasonStats)),
          });
        }
      });

      let newTeams = state.league.teams.map(t => ({
        ...t,
        allTimeStats: {
          wins: t.allTimeStats.wins + t.wins,
          losses: t.allTimeStats.losses + t.losses,
          draws: t.allTimeStats.draws + t.draws,
        }
      }));

      const { retiringPlayers, updatedPlayers } = runRetirements(state.league.players);

      return {
        ...state,
        history: newHistory,
        league: { ...state.league, players: updatedPlayers, teams: newTeams },
        game: {
          ...state.game,
          phase: 'OFF_SEASON_RETIREMENTS',
          offSeasonData: {
            ...state.game.offSeasonData,
            retiringPlayers: retiringPlayers,
          },
        },
        ui: { ...state.ui, modal: { type: 'RETIREMENTS' } },
      };
    }

    case 'ACKNOWLEDGE_RETIREMENTS': {
      const draftClass = generateDraftClass(state.game.currentSeason + 1);

      const expiringPlayerIds = Object.values(state.league.players)
        .filter(p => p.teamId && p.contract.years <= 0 && p.position !== 'RET')
        .map(p => p.id);

      const newFreeAgents = [...new Set([...state.league.freeAgents, ...expiringPlayerIds])];

      const newPlayers = { ...state.league.players };
      draftClass.forEach(player => {
        newPlayers[player.id] = player;
      });

      return {
        ...state,
        league: {
          ...state.league,
          freeAgents: newFreeAgents,
          players: newPlayers,
        },
        game: {
          ...state.game,
          phase: 'OFF_SEASON_RE_SIGNING',
          offSeasonData: {
            ...state.game.offSeasonData,
            draftClass: draftClass.map(p => p.id),
            userDraftPicks: 2,
          },
        },
        ui: { ...state.ui, modal: null, currentPage: 'OFF_SEASON_RE_SIGNING' },
      };
    }

    case 'RE_SIGN_PLAYER': {
      const { playerId, offer } = action.payload;
      const player = state.league.players[playerId];
      const team = state.league.teams.find(t => t.id === state.game.userTeamId);

      const newSalary = team.salary + offer.salary;
      if (newSalary > state.game.salaryCap) {
        return { ...state, ui: { ...state.ui, modal: { type: 'MESSAGE', text: 'Not enough cap space!' } } };
      }

      const expectedSalary = getPlayerExpectedSalary(player);
      const salaryDiff = offer.salary - expectedSalary;
      let acceptChance = 50 + (salaryDiff / expectedSalary) * 100 + (offer.years * 5);

      if (Math.random() * 100 < acceptChance) {
        const newPlayers = {
          ...state.league.players,
          [playerId]: {
            ...player,
            contract: { ...offer }
          }
        };
        const newTeams = state.league.teams.map(t =>
          t.id === team.id ? { ...t, salary: t.salary + offer.salary } : t
        );
        return { ...state, league: { ...state.league, players: newPlayers, teams: newTeams }, ui: { ...state.ui, modal: { type: 'MESSAGE', text: `${player.name} accepts the offer!` } } };
      } else {
        return { ...state, ui: { ...state.ui, modal: { type: 'MESSAGE', text: `${player.name} rejects the offer!` } } };
      }
    }

    case 'FINISH_RE_SIGNING': {
      const userTeam = state.league.teams.find(t => t.id === state.game.userTeamId);
      let newFreeAgents = [...state.league.freeAgents];
      let newRoster = [...userTeam.roster];
      let newSalary = 0;

      userTeam.roster.forEach(playerId => {
        const player = state.league.players[playerId];
        if (player.contract.years <= 0) {
          newFreeAgents.push(playerId);
          newRoster = newRoster.filter(pid => pid !== playerId);
        } else {
          newSalary += player.contract.salary;
        }
      });

      const newTeams = state.league.teams.map(t =>
        t.id === userTeam.id ? { ...t, roster: newRoster, salary: newSalary } : t
      );

      return {
        ...state,
        league: { ...state.league, teams: newTeams, freeAgents: [...new Set(newFreeAgents)] },
        game: { ...state.game, phase: 'OFF_SEASON_FREE_AGENCY' },
        ui: { ...state.ui, currentPage: 'OFF_SEASON_FREE_AGENCY' }
      };
    }

    case 'SIGN_FREE_AGENT': {
      const { playerId, offer } = action.payload;
      const player = state.league.players[playerId];
      const team = state.league.teams.find(t => t.id === state.game.userTeamId);

      const newSalary = team.salary + offer.salary;
      if (newSalary > state.game.salaryCap) {
        return { ...state, ui: { ...state.ui, modal: { type: 'MESSAGE', text: 'Not enough cap space!' } } };
      }

      const expectedSalary = getPlayerExpectedSalary(player);
      if (offer.salary < expectedSalary) {
        return { ...state, ui: { ...state.ui, modal: { type: 'MESSAGE', text: `${player.name} refuses to sign for that low!` } } };
      }

      if (Math.random() < 0.75) {
        const newPlayers = {
          ...state.league.players,
          [playerId]: { ...player, contract: { ...offer }, teamId: team.id }
        };
        const newTeams = state.league.teams.map(t =>
          t.id === team.id ? { ...t, roster: [...t.roster, playerId], salary: newSalary } : t
        );
        const newFreeAgents = state.league.freeAgents.filter(pid => pid !== playerId);
        return { ...state, league: { ...state.league, players: newPlayers, teams: newTeams, freeAgents: newFreeAgents }, ui: { ...state.ui, modal: { type: 'MESSAGE', text: `Signed ${player.name}!` } } };
      } else {
        const newFreeAgents = state.league.freeAgents.filter(pid => pid !== playerId);
        return { ...state, league: { ...state.league, freeAgents: newFreeAgents }, ui: { ...state.ui, modal: { type: 'MESSAGE', text: `${player.name} signed with another team!` } } };
      }
    }

    case 'FINISH_FREE_AGENCY': {
      return {
        ...state,
        game: { ...state.game, phase: 'OFF_SEASON_DRAFT' },
        ui: { ...state.ui, currentPage: 'OFF_SEASON_DRAFT' }
      };
    }

    case 'DRAFT_PLAYER': {
      const { playerId } = action.payload;
      const { userDraftPicks } = state.game.offSeasonData;

      if (userDraftPicks <= 0) return state;

      const player = state.league.players[playerId];
      const team = state.league.teams.find(t => t.id === state.game.userTeamId);

      const newSalary = team.salary + player.contract.salary;
      if (newSalary > state.game.salaryCap) {
        return { ...state, ui: { ...state.ui, modal: { type: 'MESSAGE', text: 'Not enough cap space to sign rookie!' } } };
      }

      const newPlayers = {
        ...state.league.players,
        [playerId]: { ...player, teamId: team.id }
      };
      const newTeams = state.league.teams.map(t =>
        t.id === team.id ? { ...t, roster: [...t.roster, playerId], salary: newSalary } : t
      );
      const newDraftClass = state.game.offSeasonData.draftClass.filter(pid => pid !== playerId);

      return {
        ...state,
        league: { ...state.league, players: newPlayers, teams: newTeams },
        game: {
          ...state.game,
          offSeasonData: {
            ...state.game.offSeasonData,
            draftClass: newDraftClass,
            userDraftPicks: userDraftPicks - 1,
          }
        }
      };
    }

    case 'FINISH_DRAFT': {
      let newDraftClass = [...state.game.offSeasonData.draftClass];
      let newPlayers = { ...state.league.players };
      let newTeams = [...state.league.teams];

      const aiTeams = newTeams.filter(t => t.id !== state.game.userTeamId);

      for (let i = 0; i < 2; i++) {
        for (const team of aiTeams) {
          const draftPickId = newDraftClass.shift();
          if (!draftPickId) break;

          const player = newPlayers[draftPickId];
          const newSalary = team.salary + player.contract.salary;

          if (newSalary <= state.game.salaryCap) {
            newPlayers[draftPickId].teamId = team.id;
            const teamIndex = newTeams.findIndex(t => t.id === team.id);
            newTeams[teamIndex].roster.push(draftPickId);
            newTeams[teamIndex].salary = newSalary;
          }
        }
      }

      const { updatedPlayers, progressionLog } = runPlayerProgression(newPlayers);

      return {
        ...state,
        league: { ...state.league, players: updatedPlayers, teams: newTeams },
        game: {
          ...state.game,
          phase: 'OFF_SEASON_PROGRESSION',
          offSeasonData: {
            ...state.game.offSeasonData,
            draftClass: [],
            progressionLog,
          }
        },
        ui: { ...state.ui, currentPage: 'OFF_SEASON_PROGRESSION' }
      };
    }

    case 'FINISH_PROGRESSION': {
      const newSeasonNum = state.game.currentSeason + 1;
      const newSchedule = createSchedule(state.league.teams.map(t => t.id));
      newSchedule.forEach(m => m.season = newSeasonNum);

      const newTeams = state.league.teams.map(t => ({
        ...t,
        wins: 0,
        losses: 0,
        draws: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      }));

      return {
        ...state,
        league: { ...state.league, teams: newTeams, schedule: newSchedule, freeAgents: [] },
        game: {
          ...state.game,
          currentSeason: newSeasonNum,
          phase: 'REGULAR_SEASON',
          playoffBracket: null,
          news: [
            { id: newId('news'), season: newSeasonNum, text: `Season ${newSeasonNum} is underway!` },
            ...state.game.news.slice(0, 20)
          ],
          offSeasonData: {
            retiringPlayers: [],
            draftClass: [],
            progressionLog: [],
            userDraftPicks: 2,
          }
        },
        ui: { ...state.ui, currentPage: 'HOME' }
      };
    }

    default:
      return state;
  }
};
