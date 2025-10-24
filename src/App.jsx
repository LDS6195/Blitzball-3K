import React, { 
  useState, 
  useEffect, 
  useReducer, 
  useMemo, 
  useCallback 
} from 'react';
import { 
  Users, 
  Shield, 
  Swords, 
  Target, 
  Trophy, 
  ClipboardList, 
  ArrowRight, 
  User, 
  Repeat, 
  Plus, 
  Minus,
  Save,
  FilePlus,
  BarChart,
  CalendarDays,
  Shirt,
  Star,
  Zap,
  TrendingUp,
  TrendingDown,
  ChevronsRight,
  Home,
  Award, // For awards
  Menu, // For sidebar toggle
  X, // For sidebar toggle
  ChevronsLeft, // For sidebar toggle
  BookOpen, // For Team History
  List, // For Standings
  LogOut, // For retirement
  DollarSign, // For contracts
  UserPlus, // For free agency
  PackagePlus, // For draft
} from 'lucide-react';

// --- GAME CONSTANTS ---

const POSITIONS = {
  FWD: 'Forward',
  MID: 'Midfielder',
  DEF: 'Defender',
  GK: 'Goalkeeper',
};

const SALARY_CAP = 15000;

const TEAM_NAMES = [
  "Besaid Aurochs", "Luca Goers", "Kilika Beasts", "Al Bhed Psyches",
  "Ronso Fangs", "Guado Glories", "Zanarkand Abes", "Norg Nightmares"
];

const PLAYER_FIRST_NAMES = [
  "Tidus", "Wakka", "Datto", "Letty", "Jassu", "Botta", "Keepa", "Larbeight",
  "Bickson", "Abus", "Graav", "Ropp", "Balgerda", "Zalitz", "Navara", "Vuroja"
];
const PLAYER_LAST_NAMES = [
  "Sky", "Ocean", "Fang", "Horn", "River", "Rock", "Wind", "Storm",
  "Sun", "Moon", "Star", "Wave", "Reef", "Deep", "Gale", "Current"
];

// --- GAME ENGINE UTILITIES ---

// Helper: Get a random integer
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: Get a random item from an array
const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper: Get a weighted random item from an array
const weightedRand = (items, weights) => {
  if (items.length === 0 || items.length !== weights.length) {
    return randItem(items); // Fallback to random item if weights are bad or items are empty
  }
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]) {
      return items[i];
    }
    random -= weights[i];
  }
  
  return randItem(items); // Fallback
};

// Helper: Generate a unique ID
const newId = (prefix = 'id') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Helper: Calculate a player's expected salary
const getPlayerExpectedSalary = (player) => {
  const { overall, potential, age } = player;
  const base = 50;
  const ovrBonus = Math.pow(overall / 10, 2) * 5; // Exponential bonus for high OVR
  const potBonus = potential * 50;
  const agePenalty = Math.max(0, age - 28) * 100; // Penalize older players
  
  const expected = base + ovrBonus + potBonus - agePenalty;
  return Math.max(100, Math.round(expected / 50) * 50); // Round to nearest 50, min 100
};

// Helper: Calculate a team's total salary
const calculateTeamSalary = (team, allPlayers) => {
  return team.roster.reduce((sum, playerId) => {
    const player = allPlayers[playerId];
    return sum + (player?.contract?.salary || 0);
  }, 0);
};

/**
 * Generates a new player object
 */
const generatePlayer = (isRookie = false, season = 1) => {
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

/**
 * Generates a full team with a roster
 */
const generateTeam = (id, name, season) => {
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
    salary, // NEW
    allTimeStats: { wins: 0, losses: 0, draws: 0 },
    accolades: { leagueBanners: 0, championships: 0 },
  };

  return { team, players: newPlayers };
};

/**
 * Creates the full league schedule
 */
const createSchedule = (teamIds) => {
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

/**
 * Initializes a brand new game state
 */
const initializeNewGame = () => {
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
  for(let i = 0; i < 15; i++) {
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
      offSeasonData: { // NEW: To hold temporary off-season data
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
      freeAgents: Object.keys(freeAgents), // NEW: List of player IDs
    },
    history: {
      champions: [],
      awards: [],
      playerSeasons: [],
    },
  };
};

/**
 * The core match simulation engine
 */
const simulateMatchLogic = (homeTeam, awayTeam, allPlayers) => {
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
    const defBlocker = weightedRand(defendingPlayers, defWeights) || randItem(defendingPlayers) || defDEF[0];

    const attackPower = (avgStat(atkFWD, 'SH') + avgStat(atkMID, 'PA')) / 2;
    const defensePower = defBlocker ? (defBlocker.stats.AT + defBlocker.stats.BL) / 2 : 20;
    const attackRoll = randInt(1, 100) + (attackPower - defensePower);

    if (attackRoll > 60) {
      const attackingPlayers = [...atkFWD, ...atkMID, ...atkDEF].filter(Boolean);
      const atkWeights = attackingPlayers.map(p => p.position === 'FWD' ? 4 : (p.position === 'MID' ? 2 : 1));
      const atkShooter = weightedRand(attackingPlayers, atkWeights) || randItem(atkFWD);
      
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

/**
 * Calculates a performance score for a player based on season stats
 */
const getPlayerPerfScore = (player) => {
  if (!player || !player.seasonStats) return 0;
  const { goals, assists, saves, stocks } = player.seasonStats;
  switch (player.position) {
    case 'FWD': return (goals * 3) + (assists * 1) + (stocks * 0.5);
    case 'MID': return (goals * 2) + (assists * 3) + (stocks * 1);
    case 'DEF': return (stocks * 3) + (assists * 1) + (goals * 1);
    case 'GK': return (saves * 3) + (assists * 1);
    default: return 0;
  }
};

/**
 * Calculates all end-of-season awards
 */
const calculateAwards = (allPlayers) => {
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

// --- NEW OFF-SEASON HELPER FUNCTIONS ---

/**
 * Generates a new draft class
 */
const generateDraftClass = (season) => {
    const draftClass = [];
    for(let i = 0; i < 24; i++) { // 24 rookies in the class
        draftClass.push(generatePlayer(true, season));
    }
    // Sort by potential descending
    return draftClass.sort((a, b) => b.potential - a.potential || b.overall - a.overall);
};

/**
 * Runs retirement logic
 */
const runRetirements = (players) => {
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
const runPlayerProgression = (players) => {
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

// --- STATE MANAGEMENT (useReducer) ---

const gameReducer = (state, action) => {
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
      // ... (Simulation logic remains the same as before)
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
      // ... (Simulation logic remains the same, including playoff setup)
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
      // ... (Simulation logic remains the same, including awards)
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
      const r1_m1_sim = simulateMatchLogic(allTeams.find(t=>t.id === r1_match1.teamA), allTeams.find(t=>t.id === r1_match1.teamB), allPlayers);
      r1_match1.winner = r1_m1_sim.homeScore > r1_m1_sim.awayScore ? r1_match1.teamA : r1_match1.teamB;
      r1_match1.matchData = r1_m1_sim; addPlayoffStats(r1_m1_sim.playerStats);
      const r1_m2_sim = simulateMatchLogic(allTeams.find(t=>t.id === r1_match2.teamA), allTeams.find(t=>t.id === r1_match2.teamB), allPlayers);
      r1_match2.winner = r1_m2_sim.homeScore > r1_m2_sim.awayScore ? r1_match2.teamA : r1_match2.teamB;
      r1_match2.matchData = r1_m2_sim; addPlayoffStats(r1_m2_sim.playerStats);
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `Playoff R1: ${allTeams.find(t=>t.id === r1_match1.winner).name} defeats ${allTeams.find(t=>t.id === (r1_match1.winner === r1_match1.teamA ? r1_match1.teamB : r1_match1.teamA)).name}!` });
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `Playoff R1: ${allTeams.find(t=>t.id === r1_match2.winner).name} defeats ${allTeams.find(t=>t.id === (r1_match2.winner === r1_match2.teamA ? r1_match2.teamB : r1_match2.teamA)).name}!` });
      const r2_match1 = playoffBracket.round2[0]; const r2_match2 = playoffBracket.round2[1];
      r2_match1.teamB = r1_match1.winner; r2_match2.teamB = r1_match2.winner;
      const r2_m1_sim = simulateMatchLogic(allTeams.find(t=>t.id === r2_match1.teamA), allTeams.find(t=>t.id === r2_match1.teamB), allPlayers);
      r2_match1.winner = r2_m1_sim.homeScore > r2_m1_sim.awayScore ? r2_match1.teamA : r2_match1.teamB;
      r2_match1.matchData = r2_m1_sim; addPlayoffStats(r2_m1_sim.playerStats);
      const r2_m2_sim = simulateMatchLogic(allTeams.find(t=>t.id === r2_match2.teamA), allTeams.find(t=>t.id === r2_match2.teamB), allPlayers);
      r2_match2.winner = r2_m2_sim.homeScore > r2_m2_sim.awayScore ? r2_match2.teamA : r2_match2.teamB;
      r2_match2.matchData = r2_m2_sim; addPlayoffStats(r2_m2_sim.playerStats);
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `Semifinals: ${allTeams.find(t=>t.id === r2_match1.winner).name} is heading to the Finals!` });
      tempState.game.news.unshift({ id: newId('news'), season: currentSeason, text: `Semifinals: ${allTeams.find(t=>t.id === r2_match2.winner).name} advances to the Finals!` });
      const rF_match = playoffBracket.finals[0];
      rF_match.teamA = r2_match1.winner; rF_match.teamB = r2_match2.winner;
      const rF_sim = simulateMatchLogic(allTeams.find(t=>t.id === rF_match.teamA), allTeams.find(t=>t.id === rF_match.teamB), allPlayers);
      rF_match.winner = rF_sim.homeScore > rF_sim.awayScore ? rF_match.teamA : rF_match.teamB;
      rF_match.matchData = rF_sim; addPlayoffStats(rF_sim.playerStats);
      const champion = allTeams.find(t=>t.id === rF_match.winner);
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

    // --- NEW OFF-SEASON REDUCERS ---
    
    case 'ACKNOWLEDGE_AWARDS': {
      // Season is officially over. Archive stats.
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
      
      // Update team all-time stats
      let newTeams = state.league.teams.map(t => ({
          ...t,
          allTimeStats: {
              wins: t.allTimeStats.wins + t.wins,
              losses: t.allTimeStats.losses + t.losses,
              draws: t.allTimeStats.draws + t.draws,
          }
      }));

      // Run retirements
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
            retiringPlayers: retiringPlayers, // Store list of retired players
          },
        },
        ui: { ...state.ui, modal: { type: 'RETIREMENTS' } },
      };
    }

    case 'ACKNOWLEDGE_RETIREMENTS': {
      // Generate draft class and update free agents list
      const draftClass = generateDraftClass(state.game.currentSeason + 1);
      
      // Add all expiring players to free agency
      const expiringPlayerIds = Object.values(state.league.players)
        .filter(p => p.teamId && p.contract.years <= 0 && p.position !== 'RET')
        .map(p => p.id);
        
      const newFreeAgents = [...new Set([...state.league.freeAgents, ...expiringPlayerIds])];

      // Update players map with new draft class
      const newPlayers = { ...state.league.players };
      draftClass.forEach(player => {
        newPlayers[player.id] = player; // Add rookies to master list
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
            draftClass: draftClass.map(p => p.id), // Store by ID
            userDraftPicks: 2, // Reset draft picks
          },
        },
        ui: { ...state.ui, modal: null, currentPage: 'OFF_SEASON_RE_SIGNING' },
      };
    }
    
    case 'RE_SIGN_PLAYER': {
        const { playerId, offer } = action.payload;
        const player = state.league.players[playerId];
        const team = state.league.teams.find(t => t.id === state.game.userTeamId);
        
        // Check cap space
        const newSalary = team.salary + offer.salary;
        if (newSalary > state.game.salaryCap) {
            // Can't afford
            return { ...state, ui: { ...state.ui, modal: { type: 'MESSAGE', text: 'Not enough cap space!' } } };
        }
        
        // Simple acceptance logic
        const expectedSalary = getPlayerExpectedSalary(player);
        const salaryDiff = offer.salary - expectedSalary;
        let acceptChance = 50 + (salaryDiff / expectedSalary) * 100 + (offer.years * 5);
        
        if (Math.random() * 100 < acceptChance) {
            // ACCEPTED
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
            // REJECTED
            return { ...state, ui: { ...state.ui, modal: { type: 'MESSAGE', text: `${player.name} rejects the offer!` } } };
        }
    }
    
    case 'FINISH_RE_SIGNING': {
        const userTeam = state.league.teams.find(t => t.id === state.game.userTeamId);
        let newFreeAgents = [...state.league.freeAgents];
        let newRoster = [...userTeam.roster];
        let newSalary = 0;
        
        // Check user's roster for unsigned players
        userTeam.roster.forEach(playerId => {
            const player = state.league.players[playerId];
            if (player.contract.years <= 0) {
                newFreeAgents.push(playerId); // Add to FA
                newRoster = newRoster.filter(pid => pid !== playerId); // Remove from roster
            } else {
                newSalary += player.contract.salary; // Recalculate salary
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

        // Simple bidding logic: 75% chance to win if you meet expectation
        const expectedSalary = getPlayerExpectedSalary(player);
        if (offer.salary < expectedSalary) {
             return { ...state, ui: { ...state.ui, modal: { type: 'MESSAGE', text: `${player.name} refuses to sign for that low!` } } };
        }
        
        if (Math.random() < 0.75) {
            // SIGNED
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
            // Lost bidding war
             const newFreeAgents = state.league.freeAgents.filter(pid => pid !== playerId); // Another team signed him
             return { ...state, league: { ...state.league, freeAgents: newFreeAgents }, ui: { ...state.ui, modal: { type: 'MESSAGE', text: `${player.name} signed with another team!` } } };
        }
    }

    case 'FINISH_FREE_AGENCY': {
        // AI teams sign some FAs (simplified)
        // ... (can add logic here later)
        return {
            ...state,
            game: { ...state.game, phase: 'OFF_SEASON_DRAFT' },
            ui: { ...state.ui, currentPage: 'OFF_SEASON_DRAFT' }
        };
    }
    
    case 'DRAFT_PLAYER': {
        const { playerId } = action.payload;
        const { userDraftPicks } = state.game.offSeasonData;
        
        if (userDraftPicks <= 0) return state; // No picks left
        
        const player = state.league.players[playerId];
        const team = state.league.teams.find(t => t.id === state.game.userTeamId);
        
        const newSalary = team.salary + player.contract.salary;
        if (newSalary > state.game.salaryCap) {
            return { ...state, ui: { ...state.ui, modal: { type: 'MESSAGE', text: 'Not enough cap space to sign rookie!' } } };
        }
        
        // Add player to team
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
        // AI teams draft players (simplified)
        let newDraftClass = [...state.game.offSeasonData.draftClass];
        let newPlayers = { ...state.league.players };
        let newTeams = [...state.league.teams];
        
        const aiTeams = newTeams.filter(t => t.id !== state.game.userTeamId);
        
        for (let i = 0; i < 2; i++) { // 2 rounds
            for(const team of aiTeams) {
                const draftPickId = newDraftClass.shift(); // Get best available
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

        // Run progression
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
        // Setup new season
        const newSeasonNum = state.game.currentSeason + 1;
        const newSchedule = createSchedule(state.league.teams.map(t => t.id));
        newSchedule.forEach(m => m.season = newSeasonNum);
        
        const newTeams = state.league.teams.map(t => ({
            ...t,
            // Reset season stats
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


// --- UI COMPONENTS ---

const Button = ({ Icon, label, onClick, variant = 'primary', className = '', children, disabled = false }) => {
  const colors = {
    primary: 'bg-yellow-500 hover:bg-yellow-400 text-blue-950 shadow-lg shadow-yellow-500/50 hover:shadow-yellow-400/70 border border-yellow-600',
    secondary: 'bg-blue-600 hover:bg-blue-500 text-yellow-400 border border-blue-500 shadow-md shadow-blue-500/30',
    danger: 'bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-md shadow-red-500/30',
    success: 'bg-green-600 hover:bg-green-500 text-white border border-green-500 shadow-md shadow-green-500/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded font-bold transition-all duration-200 ${colors[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label && <span>{label}</span>}
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-gradient-to-br from-blue-800 to-blue-900 shadow-lg shadow-blue-900/50 rounded border-2 border-yellow-600/30 overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 px-4 py-3 border-b-2 border-yellow-600/40 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

// --- Layout Components ---
const Sidebar = ({ onNav, onNewGame, isExpanded, currentPage }) => {
  const NavLink = ({ Icon, label, page }) => (
    <button
      onClick={() => onNav(page)}
      className={`flex items-center w-full p-3 rounded transition-all duration-200 border ${
        currentPage === page
          ? 'bg-yellow-500 text-blue-950 font-bold shadow-lg shadow-yellow-500/50 border-yellow-400'
          : 'text-blue-100 hover:bg-blue-700/50 hover:text-yellow-400 border-transparent hover:border-yellow-600/20 hover:shadow-md hover:shadow-yellow-500/20'
      } ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}`}
    >
      <Icon className="w-6 h-6 shrink-0" />
      {isExpanded && <span className="font-medium">{label}</span>}
    </button>
  );

  return (
    <div
      className={`flex flex-col h-screen bg-gradient-to-br from-blue-900 to-blue-800 text-white shadow-2xl shadow-blue-950 border-r-2 border-yellow-600/30 transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      <div className={`flex items-center p-4 h-20 border-b border-yellow-600/30 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        {isExpanded && (
          <h1 className="text-2xl font-bold text-yellow-400">
            BlitzSim
          </h1>
        )}
      </div>
      
      <nav className="flex-1 p-3 space-y-2">
        <NavLink Icon={Home} label="Home" page="HOME" />
        <NavLink Icon={Shirt} label="My Team" page="TEAM" />
        <NavLink Icon={List} label="Standings" page="STANDINGS" />
        <NavLink Icon={CalendarDays} label="Schedule" page="SCHEDULE" />
        <NavLink Icon={Trophy} label="Playoffs" page="PLAYOFFS" />
        <NavLink Icon={BarChart} label="League History" page="LEAGUE_HISTORY" />
        <NavLink Icon={BookOpen} label="Team History" page="TEAM_HISTORY" />
      </nav>
      
      <div className="p-3 border-t border-yellow-600/30">
        <button
          onClick={onNewGame}
          className={`flex items-center w-full p-3 rounded transition-all duration-200 text-white bg-red-600 hover:bg-red-500 border-2 border-red-500 shadow-lg shadow-red-600/50 hover:shadow-red-500/70 font-bold ${
            isExpanded ? 'justify-start space-x-3' : 'justify-center'
          }`}
        >
          <FilePlus className="w-6 h-6 shrink-0" />
          {isExpanded && <span className="font-medium">New Game</span>}
        </button>
      </div>
    </div>
  );
};

const TopBar = ({ userTeam, season, onToggleSidebar, isExpanded }) => (
  <header className="flex items-center justify-between h-20 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 shadow-lg shadow-blue-950/50 border-b-2 border-yellow-600/40">
    <div className="flex items-center">
      <button onClick={onToggleSidebar} className="p-2 rounded text-blue-100 hover:bg-blue-700/50 hover:text-yellow-400 border border-transparent hover:border-yellow-600/30 mr-4 transition-all">
        {isExpanded ? <ChevronsLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      <h1 className="text-xl md:text-2xl font-bold text-white">
        BlitzSim: Sphere League Manager
      </h1>
    </div>
    <div className="flex items-center space-x-4">
      <span className="text-blue-100 hidden md:block">{userTeam.name}</span>
      <span className="font-bold bg-yellow-500 text-blue-950 px-3 py-1 rounded-full text-sm border-2 border-yellow-400 shadow-lg shadow-yellow-500/50">
        Season {season}
      </span>
    </div>
  </header>
);

// --- Page Components ---

const Dashboard = ({ state, dispatch }) => {
  const { game, league } = state;
  const userTeam = league.teams.find(t => t.id === game.userTeamId);
  
  const nextMatch = league.schedule
    .filter(m => !m.played && (m.homeTeamId === userTeam.id || m.awayTeamId === userTeam.id))
    .sort((a, b) => a.id.localeCompare(b.id))[0];
    
  const getTeamName = (id) => league.teams.find(t => t.id === id)?.name || 'Unknown';

  const userRecord = `${userTeam.wins}-${userTeam.losses}-${userTeam.draws}`;
  
  const renderPhaseControls = () => {
    switch(game.phase) {
        case 'REGULAR_SEASON':
            if (nextMatch) {
                return (
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-around text-center">
                          <div><h4 className="text-2xl font-bold text-white">{getTeamName(nextMatch.homeTeamId)}</h4><span className="text-blue-200">Home</span></div>
                          <span className="text-4xl font-light text-blue-300">VS</span>
                          <div><h4 className="text-2xl font-bold text-white">{getTeamName(nextMatch.awayTeamId)}</h4><span className="text-blue-200">Away</span></div>
                        </div>
                        <div className="flex space-x-4">
                          <Button Icon={ChevronsRight} label="Play Match" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'SIM_MATCH', matchId: nextMatch.id })} className="w-full" variant="success" />
                          <Button Icon={Repeat} label="Simulate Match" onClick={() => dispatch({ type: 'SIMULATE_MATCH', payload: { matchId: nextMatch.id } })} className="w-full" variant="secondary" />
                        </div>
                    </CardContent>
                );
            }
            return (
                <CardContent>
                    <p className="text-blue-100 text-center">No more matches this season!</p>
                    <Button Icon={ChevronsRight} label="Simulate to Playoffs" onClick={() => dispatch({ type: 'SIMULATE_SEASON' })} className="w-full mt-4" variant="danger" />
                </CardContent>
            );
        case 'PLAYOFFS':
            return <CardContent><Button Icon={Trophy} label="Simulate Playoffs" onClick={() => dispatch({ type: 'SIMULATE_PLAYOFFS' })} className="w-full mt-4" variant="success" /></CardContent>;
        case 'AWARDS':
            return <CardContent><Button Icon={Award} label="View Season Awards" onClick={() => dispatch({ type: 'MODAL_OPEN', payload: { type: 'AWARDS' } })} className="w-full mt-4" variant="primary" /></CardContent>;
        case 'OFF_SEASON_RETIREMENTS':
             return <CardContent><Button Icon={LogOut} label="View Retirements" onClick={() => dispatch({ type: 'MODAL_OPEN', payload: { type: 'RETIREMENTS' } })} className="w-full mt-4" variant="primary" /></CardContent>;
        case 'OFF_SEASON_RE_SIGNING':
             return <CardContent><Button Icon={DollarSign} label="Go to Player Re-Signing" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'OFF_SEASON_RE_SIGNING' })} className="w-full mt-4" variant="success" /></CardContent>;
        case 'OFF_SEASON_FREE_AGENCY':
             return <CardContent><Button Icon={UserPlus} label="Go to Free Agency" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'OFF_SEASON_FREE_AGENCY' })} className="w-full mt-4" variant="success" /></CardContent>;
        case 'OFF_SEASON_DRAFT':
             return <CardContent><Button Icon={PackagePlus} label="Go to Rookie Draft" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'OFF_SEASON_DRAFT' })} className="w-full mt-4" variant="success" /></CardContent>;
        case 'OFF_SEASON_PROGRESSION':
             return <CardContent><Button Icon={TrendingUp} label="View Player Progression" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'OFF_SEASON_PROGRESSION' })} className="w-full mt-4" variant="success" /></CardContent>;
        default:
             return <CardContent><p className="text-blue-100 text-center">Current Phase: {game.phase}</p></CardContent>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader><h3 className="text-lg font-semibold text-white">{userTeam.name} Overview</h3></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-blue-700 rounded-lg">
            <span className="text-blue-100 text-lg">Record</span>
            <span className="text-2xl font-bold text-white">{userRecord}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-blue-700 rounded-lg">
            <span className="text-blue-100 text-lg">Salary</span>
            <span className={`text-2xl font-bold ${userTeam.salary > game.salaryCap ? 'text-red-500' : 'text-white'}`}>
                ${(userTeam.salary / 1000).toFixed(1)}k / ${(game.salaryCap / 1000)}k
            </span>
          </div>
          <Button Icon={Shirt} label="Manage Team" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'TEAM' })} className="w-full" />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader><h3 className="text-lg font-semibold text-white">Current Activity</h3></CardHeader>
        {renderPhaseControls()}
      </Card>

      <Card className="md:col-span-3">
        <CardHeader><h3 className="text-lg font-semibold text-white">Sphere League News</h3></CardHeader>
        <CardContent className="max-h-64 overflow-y-auto">
          <ul className="space-y-3">
            {game.news.map(item => (
              <li key={item.id} className="p-3 bg-blue-700 rounded-lg">
                <span className="font-semibold text-yellow-400">[S{item.season}]</span>
                <span className="text-blue-100 ml-2">{item.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

const StatBar = ({ label, value, max = 99 }) => {
  const width = `${(value / max) * 100}%`;
  let color = 'bg-yellow-400 shadow-yellow-400/50';
  if (value > 80) color = 'bg-green-500 shadow-green-500/50';
  else if (value > 60) color = 'bg-yellow-500 shadow-yellow-500/50';
  else if (value < 40) color = 'bg-red-500 shadow-red-500/50';
  return (
    <div className="flex items-center space-x-2">
      <span className="w-8 font-bold text-sm text-yellow-400">{label}</span>
      <div className="w-full bg-blue-900 rounded-full h-4 overflow-hidden border border-blue-600"><div className={`h-full rounded-full ${color} shadow-md transition-all duration-300`} style={{ width }}></div></div>
      <span className="w-8 font-bold text-sm text-yellow-400 text-right">{value}</span>
    </div>
  );
};

const PlayerCard = ({ player, state, onClose }) => {
  if (!player || !state) return null;
  const { stats, careerStats, seasonStats, contract } = player;
  const { history, game } = state;
  const statPairs = [
    { label: 'EN', value: stats.EN }, { label: 'AT', value: stats.AT }, { label: 'PA', value: stats.PA },
    { label: 'SH', value: stats.SH }, { label: 'BL', value: stats.BL }, { label: 'CA', value: stats.CA },
    { label: 'SP', value: stats.SP },
  ];
  const getPotentialStars = (pot) => '★'.repeat(Math.ceil(pot/2)) + '☆'.repeat(5 - Math.ceil(pot/2));
  const { goals, assists, saves, stocks, shotsFaced } = seasonStats;
  const { goals: cGoals, assists: cAssists, saves: cSaves, stocks: cStocks, shotsFaced: cShotsFaced } = careerStats;
  const savePct = (shotsFaced > 0 ? (saves / shotsFaced * 100) : 0).toFixed(1);
  const cSavePct = (cShotsFaced > 0 ? (cSaves / cShotsFaced * 100) : 0).toFixed(1);

  const careerAwards = useMemo(() => {
    const awards = { mvp: [], finalsMvp: [], dpoy: [], firstTeam: [], secondTeam: [], championships: [] };
    if (history) {
      history.awards.forEach(a => {
        if (a.mvp === player.id) awards.mvp.push(a.season);
        if (a.finalsMvp === player.id) awards.finalsMvp.push(a.season);
        if (a.dpoy === player.id) awards.dpoy.push(a.season);
        if (a.firstTeam.includes(player.id)) awards.firstTeam.push(a.season);
        if (a.secondTeam.includes(player.id)) awards.secondTeam.push(a.season);
      });
      history.champions.forEach(c => {
        let wasOnTeam = history.playerSeasons.some(ps => ps.season === c.season && ps.teamId === c.teamId && ps.playerId === player.id);
        if (wasOnTeam) { awards.championships.push(c.season); }
      });
    }
    return awards;
  }, [player.id, history]);

  const AwardItem = ({ label, seasons }) => (
    seasons.length > 0 && (<div className="text-blue-100"><span className="font-semibold text-white">{label} ({seasons.length}):</span><span className="text-sm ml-2">{seasons.join(', ')}</span></div>)
  );

  return (
    <div className="fixed inset-0 bg-blue-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl border border-yellow-500 shadow-2xl">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{player.name}</h2>
            <span className="text-lg text-blue-200">{POSITIONS[player.position]} | Age: {player.age} | OVR: {player.overall}</span>
          </div>
          <Button onClick={onClose} variant="secondary">Close</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3 p-4 bg-blue-700 rounded-lg md:col-span-1">
            <h4 className="text-xl font-semibold text-white mb-2">Attributes</h4>
            {statPairs.map(s => <StatBar key={s.label} label={s.label} value={s.value} />)}
             <div className="flex items-center pt-2"><span className="w-8 font-bold text-sm text-blue-100">POT</span><span className="text-xl text-yellow-400 ml-2">{getPotentialStars(player.potential)}</span></div>
             <div className="pt-2">
                <h4 className="text-lg font-semibold text-white">Contract</h4>
                {contract && contract.years > 0 ? (
                    <p className="text-blue-100">${contract.salary} / {contract.years} Year(s)</p>
                ) : (
                    <p className="text-yellow-400">Contract Expired</p>
                )}
             </div>
          </div>
          <div className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               <div className="p-4 bg-blue-700 rounded-lg">
                  <h4 className="text-xl font-semibold text-white mb-2">This Season</h4>
                  <div className="grid grid-cols-2 gap-2 text-blue-100">
                    {player.position !== 'GK' ? (<><span>Goals: <span className="font-bold text-white">{goals}</span></span><span>Assists: <span className="font-bold text-white">{assists}</span></span><span>Stocks: <span className="font-bold text-white">{stocks}</span></span></>)
                    : (<><span>Saves: <span className="font-bold text-white">{saves}</span></span><span>Save %: <span className="font-bold text-white">{savePct}%</span></span><span>Assists: <span className="font-bold text-white">{assists}</span></span></>)}
                  </div>
               </div>
               <div className="p-4 bg-blue-700 rounded-lg">
                  <h4 className="text-xl font-semibold text-white mb-2">Career</h4>
                  <div className="grid grid-cols-2 gap-2 text-blue-100">
                    {player.position !== 'GK' ? (<><span>Goals: <span className="font-bold text-white">{cGoals}</span></span><span>Assists: <span className="font-bold text-white">{cAssists}</span></span><span>Stocks: <span className="font-bold text-white">{cStocks}</span></span></>)
                    : (<><span>Saves: <span className="font-bold text-white">{cSaves}</span></span><span>Save %: <span className="font-bold text-white">{cSavePct}%</span></span><span>Assists: <span className="font-bold text-white">{cAssists}</span></span></>)}
                  </div>
               </div>
            </div>
            <div className="p-4 bg-blue-700 rounded-lg">
              <h4 className="text-xl font-semibold text-white mb-2">Career Awards</h4>
              <div className="space-y-1">
                <AwardItem label="🏆 Championship" seasons={careerAwards.championships} />
                <AwardItem label="⭐ League MVP" seasons={careerAwards.mvp} />
                <AwardItem label="🏅 Finals MVP" seasons={careerAwards.finalsMvp} />
                <AwardItem label="🛡️ DPOY" seasons={careerAwards.dpoy} />
                <AwardItem label="🥇 1st Team All-Blitz" seasons={careerAwards.firstTeam} />
                <AwardItem label="🥈 2nd Team All-Blitz" seasons={careerAwards.secondTeam} />
                {Object.values(careerAwards).every(arr => arr.length === 0) && (<p className="text-blue-200 italic">No awards yet.</p>)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TeamRosterModal = ({ teamId, state, dispatch }) => {
  if (!teamId) return null;
  const { league } = state;
  const team = league.teams.find(t => t.id === teamId);
  if (!team) return null;
  const teamPlayers = team.roster.map(pid => league.players[pid]).filter(Boolean)
    .sort((a, b) => {
      const posOrder = { 'FWD': 1, 'MID': 2, 'DEF': 3, 'GK': 4 };
      return posOrder[a.position] - posOrder[b.position] || b.overall - a.overall;
    });
  const handlePlayerClick = (playerId) => { dispatch({ type: 'MODAL_OPEN', payload: { type: 'PLAYER', playerId } }); };
  return (
    <div className="fixed inset-0 bg-blue-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl border border-yellow-500 shadow-2xl">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{team.name} Roster</h2>
          <Button onClick={() => dispatch({ type: 'MODAL_CLOSE' })} variant="secondary">Close</Button>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-blue-100">
              <thead className="text-xs text-blue-200 uppercase bg-blue-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Pos</th>
                  <th scope="col" className="px-6 py-3">Age</th>
                  <th scope="col" className="px-6 py-3">OVR</th>
                  <th scope="col" className="px-6 py-3">Season Stats (G/A/St or S/A/S%)</th>
                </tr>
              </thead>
              <tbody>
                {teamPlayers.map(p => {
                  let statsDisplay = '';
                  if (p.position === 'GK') {
                    const savePct = (p.seasonStats.shotsFaced > 0 ? (p.seasonStats.saves / p.seasonStats.shotsFaced * 100) : 0).toFixed(1);
                    statsDisplay = `${p.seasonStats.saves}/${p.seasonStats.assists}/${savePct}%`;
                  } else {
                    statsDisplay = `${p.seasonStats.goals}/${p.seasonStats.assists}/${p.seasonStats.stocks}`;
                  }
                  return (
                    <tr key={p.id} className="bg-gradient-to-br from-blue-800 to-blue-900 border-b border-yellow-600/30 hover:bg-blue-700">
                      <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap"><button onClick={() => handlePlayerClick(p.id)} className="hover:underline text-yellow-400 font-semibold">{p.name}</button></th>
                      <td className="px-6 py-4">{p.position}</td>
                      <td className="px-6 py-4">{p.age}</td>
                      <td className="px-6 py-4 font-bold">{p.overall}</td>
                      <td className="px-6 py-4">{statsDisplay}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TeamManagement = ({ state, dispatch }) => {
  const { game, league } = state;
  const userTeam = league.teams.find(t => t.id === game.userTeamId);
  const teamPlayers = userTeam.roster.map(pid => league.players[pid]).filter(Boolean)
    .sort((a, b) => {
      const posOrder = { 'FWD': 1, 'MID': 2, 'DEF': 3, 'GK': 4 };
      return posOrder[a.position] - posOrder[b.position] || b.overall - a.overall;
    });
  const fieldPlayers = teamPlayers.filter(p => p.position !== 'GK');
  const goalkeepers = teamPlayers.filter(p => p.position === 'GK');
  return (
    <Card>
      <CardHeader><h3 className="text-lg font-semibold text-white">{userTeam.name} - Roster Management</h3></CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-xl font-semibold text-white mb-3">Field Players</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-blue-100">
              <thead className="text-xs text-blue-200 uppercase bg-blue-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th><th scope="col" className="px-6 py-3">Pos</th>
                  <th scope="col" className="px-6 py-3">Age</th><th scope="col" className="px-6 py-3">OVR</th>
                  <th scope="col" className="px-6 py-3">Stats (G/A/St)</th><th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fieldPlayers.map(p => (
                  <tr key={p.id} className="bg-gradient-to-br from-blue-800 to-blue-900 border-b border-yellow-600/30 hover:bg-blue-700">
                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{p.name}</th>
                    <td className="px-6 py-4">{p.position}</td><td className="px-6 py-4">{p.age}</td>
                    <td className="px-6 py-4 font-bold">{p.overall}</td>
                    <td className="px-6 py-4">{`${p.seasonStats.goals}/${p.seasonStats.assists}/${p.seasonStats.stocks}`}</td>
                    <td className="px-6 py-4"><Button label="View" onClick={() => dispatch({ type: 'MODAL_OPEN', payload: { type: 'PLAYER', playerId: p.id } })} variant="secondary" className="py-1 px-3">View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white mb-3">Goalkeepers</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-blue-100">
              <thead className="text-xs text-blue-200 uppercase bg-blue-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th><th scope="col" className="px-6 py-3">Pos</th>
                  <th scope="col" className="px-6 py-3">Age</th><th scope="col" className="px-6 py-3">OVR</th>
                  <th scope="col" className="px-6 py-3">Stats (S/A/S%)</th><th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {goalkeepers.map(p => {
                  const savePct = (p.seasonStats.shotsFaced > 0 ? (p.seasonStats.saves / p.seasonStats.shotsFaced * 100) : 0).toFixed(1);
                  return (
                    <tr key={p.id} className="bg-gradient-to-br from-blue-800 to-blue-900 border-b border-yellow-600/30 hover:bg-blue-700">
                      <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{p.name}</th>
                      <td className="px-6 py-4">{p.position}</td><td className="px-6 py-4">{p.age}</td>
                      <td className="px-6 py-4 font-bold">{p.overall}</td>
                      <td className="px-6 py-4">{`${p.seasonStats.saves}/${p.seasonStats.assists}/${savePct}%`}</td>
                      <td className="px-6 py-4"><Button label="View" onClick={() => dispatch({ type: 'MODAL_OPEN', payload: { type: 'PLAYER', playerId: p.id } })} variant="secondary" className="py-1 px-3">View</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LeagueStandings = ({ state, dispatch }) => {
  const { league } = state;
  const sortedTeams = [...league.teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor);
  const playoffCutoff = 6;
  const handleTeamClick = (teamId) => { dispatch({ type: 'MODAL_OPEN', payload: { type: 'TEAM_ROSTER', teamId } }); };
  return (
    <Card>
      <CardHeader><h3 className="text-lg font-semibold text-white">League Standings - Season {state.game.currentSeason}</h3></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-blue-100">
            <thead className="text-xs text-blue-200 uppercase bg-blue-700">
              <tr>
                <th scope="col" className="px-6 py-3">#</th><th scope="col" className="px-6 py-3">Team</th>
                <th scope="col" className="px-6 py-3">W</th><th scope="col" className="px-6 py-3">D</th>
                <th scope="col" className="px-6 py-3">L</th><th scope="col" className="px-6 py-3">GF</th>
                <th scope="col" className="px-6 py-3">GA</th><th scope="col" className="px-6 py-3">GD</th>
                <th scope="col" className="px-6 py-3">Pts</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((t, index) => (
                <tr key={t.id} className={`border-b border-yellow-600/30 ${t.id === state.game.userTeamId ? 'bg-cyan-900' : 'bg-gradient-to-br from-blue-800 to-blue-900'} ${index < playoffCutoff ? 'border-l-4 border-yellow-500' : ''}`}>
                  <td className="px-6 py-4 font-bold">{index + 1}</td>
                  <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap"><button onClick={() => handleTeamClick(t.id)} className="hover:underline font-semibold">{t.name}</button></th>
                  <td className="px-6 py-4">{t.wins}</td><td className="px-6 py-4">{t.draws}</td>
                  <td className="px-6 py-4">{t.losses}</td><td className="px-6 py-4">{t.goalsFor}</td>
                  <td className="px-6 py-4">{t.goalsAgainst}</td><td className="px-6 py-4">{t.goalsFor - t.goalsAgainst}</td>
                  <td className="px-6 py-4 font-bold text-lg">{t.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center space-x-2"><div className="w-4 h-4 bg-yellow-500 border-2 border-yellow-500"></div><span className="text-sm text-blue-200">Playoff Team</span></div>
        </div>
      </CardContent>
    </Card>
  );
};

const ScheduleView = ({ state, dispatch }) => {
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
           <h4 className="text-xl font-semibold text-yellow-400 border-b border-blue-600/40 pb-2">Week {weekIndex + 1}</h4>
           {games.map(match => {
             const MatchWrapper = match.played ? 'button' : 'div';
             return (
               <MatchWrapper key={match.id} onClick={match.played ? () => dispatch({ type: 'MODAL_OPEN', payload: { type: 'BOX_SCORE', match } }) : undefined}
                 className={`p-4 bg-blue-700 rounded-lg flex items-center justify-between w-full text-left ${match.played ? 'hover:bg-blue-600 cursor-pointer transition-colors' : ''}`}>
                 <span className="w-1/3 text-right font-semibold text-lg text-white">{getTeamName(match.homeTeamId)}</span>
                 <div className="w-1/3 text-center">
                   {match.played ? (<span className="text-2xl font-bold">{`${match.homeScore} - ${match.awayScore}`}</span>)
                   : (<span className="text-blue-200">vs</span>)}
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

const BoxScoreModal = ({ match, state, dispatch }) => {
  if (!match) return null;
  const { league } = state;
  const homeTeam = league.teams.find(t => t.id === match.homeTeamId);
  const awayTeam = league.teams.find(t => t.id === match.awayTeamId);
  if (!homeTeam || !awayTeam) return null;
  const getStats = (team) => {
    const fieldPlayers = []; const goalkeepers = [];
    team.roster.forEach(pid => {
      const player = league.players[pid]; if (!player) return;
      const stats = match.playerStats ? (match.playerStats[pid] || {}) : {};
      const goals = stats.goals || 0; const assists = stats.assists || 0;
      const saves = stats.saves || 0; const stocks = stats.stocks || 0;
      const shotsFaced = stats.shotsFaced || 0;
      if (player.position === 'GK') {
        const savePct = (shotsFaced > 0 ? (saves / shotsFaced * 100) : 0).toFixed(1);
        goalkeepers.push({ name: player.name, saves, assists, savePct });
      } else {
        if (goals > 0 || assists > 0 || stocks > 0) {
          fieldPlayers.push({ name: player.name, pos: player.position, goals, assists, stocks });
        }
      }
    });
    fieldPlayers.sort((a, b) => (b.goals * 3 + b.assists * 2 + b.stocks) - (a.goals * 3 + a.assists * 2 + a.stocks));
    return { fieldPlayers, goalkeepers };
  };
  const homeStats = getStats(homeTeam);
  const awayStats = getStats(awayTeam);
  const FieldPlayerStatTable = ({ title, stats }) => (
    <div className="p-4 bg-blue-700 rounded-lg">
      <h4 className="text-xl font-semibold text-white mb-2">{title}</h4>
      <table className="w-full text-left text-sm text-blue-100">
        <thead className="text-xs text-blue-200 uppercase bg-gradient-to-br from-blue-900 to-blue-800"><tr><th scope="col" className="px-4 py-2">Player</th><th scope="col" className="px-4 py-2">Pos</th><th scope="col" className="px-4 py-2">G</th><th scope="col" className="px-4 py-2">A</th><th scope="col" className="px-4 py-2">St</th></tr></thead>
        <tbody>
          {stats.length === 0 && (<tr><td colSpan="5" className="px-4 py-3 text-center text-blue-200 italic">No stats recorded.</td></tr>)}
          {stats.map((p, i) => (<tr key={i} className="border-b border-gray-900"><th scope="row" className="px-4 py-2 font-medium text-white">{p.name}</th><td className="px-4 py-2">{p.pos}</td><td className="px-4 py-2">{p.goals}</td><td className="px-4 py-2">{p.assists}</td><td className="px-4 py-2">{p.stocks}</td></tr>))}
        </tbody>
      </table>
    </div>
  );
  const GoalkeeperStatTable = ({ title, stats }) => (
    <div className="p-4 bg-blue-700 rounded-lg">
      <h4 className="text-xl font-semibold text-white mb-2">{title}</h4>
      <table className="w-full text-left text-sm text-blue-100">
        <thead className="text-xs text-blue-200 uppercase bg-gradient-to-br from-blue-900 to-blue-800"><tr><th scope="col" className="px-4 py-2">Player</th><th scope="col" className="px-4 py-2">S</th><th scope="col" className="px-4 py-2">A</th><th scope="col" className="px-4 py-2">S%</th></tr></thead>
        <tbody>
          {stats.length === 0 && (<tr><td colSpan="4" className="px-4 py-3 text-center text-blue-200 italic">No stats recorded.</td></tr>)}
          {stats.map((p, i) => (<tr key={i} className="border-b border-gray-900"><th scope="row" className="px-4 py-2 font-medium text-white">{p.name}</th><td className="px-4 py-2">{p.saves}</td><td className="px-4 py-2">{p.assists}</td><td className="px-4 py-2">{p.savePct}%</td></tr>))}
        </tbody>
      </table>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-blue-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl border border-yellow-500 shadow-2xl">
        <CardHeader className="flex justify-between items-center">
          <div className="text-center w-full"><h2 className="text-2xl font-bold text-white">{homeTeam.name} vs {awayTeam.name}</h2><span className="text-3xl font-bold text-yellow-400">{match.homeScore} - {match.awayScore}</span></div>
          <Button onClick={() => dispatch({ type: 'MODAL_CLOSE' })} variant="secondary" className="absolute top-4 right-4">Close</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4"><FieldPlayerStatTable title={`${homeTeam.name} Field Players`} stats={homeStats.fieldPlayers} /><GoalkeeperStatTable title={`${homeTeam.name} Goalkeeper`} stats={homeStats.goalkeepers} /></div>
          <div className="space-y-4"><FieldPlayerStatTable title={`${awayTeam.name} Field Players`} stats={awayStats.fieldPlayers} /><GoalkeeperStatTable title={`${awayTeam.name} Goalkeeper`} stats={awayStats.goalkeepers} /></div>
        </CardContent>
      </Card>
    </div>
  );
};

const AwardsModal = ({ state, dispatch }) => {
  const { game, league, history } = state;
  const currentAwards = history.awards.find(a => a.season === game.currentSeason);
  if (!currentAwards) return null;
  const getPlayer = (id) => league.players[id] || { name: 'N/A', position: 'N/A', teamId: null };
  const getTeamName = (id) => league.teams.find(t => t.id === id)?.name || 'N/A';
  const mvp = getPlayer(currentAwards.mvp);
  const dpoy = getPlayer(currentAwards.dpoy);
  const finalsMvp = getPlayer(currentAwards.finalsMvp);
  const AwardCard = ({ title, player }) => (
    <div className="p-4 bg-blue-700 rounded-lg text-center h-full"><h4 className="text-lg font-semibold text-yellow-400">{title}</h4><p className="text-2xl font-bold text-white">{player.name}</p><p className="text-sm text-blue-200">{POSITIONS[player.position]} | {getTeamName(player.teamId)}</p></div>
  );
  const TeamList = ({ title, playerIds }) => (
    <div className="p-4 bg-blue-700 rounded-lg"><h4 className="text-lg font-semibold text-yellow-400 mb-2">{title}</h4><ul className="space-y-2">
        {playerIds.map((pid, i) => {
          const player = getPlayer(pid);
          return (<li key={i} className="flex justify-between items-center bg-gradient-to-br from-blue-900 to-blue-800 p-2 rounded"><span className="font-semibold text-white">{player.name}</span><span className="text-sm text-blue-200">{POSITIONS[player.position]} | {getTeamName(player.teamId)}</span></li>);
        })}
    </ul></div>
  );
  return (
    <div className="fixed inset-0 bg-blue-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl border border-yellow-500 shadow-2xl">
        <CardHeader className="text-center relative"><Award className="w-12 h-12 text-yellow-400 mx-auto mb-2" /><h2 className="text-3xl font-bold text-white">Season {game.currentSeason} Awards</h2></CardHeader>
        <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><AwardCard title="League MVP" player={mvp} /><AwardCard title="Finals MVP" player={finalsMvp} /><AwardCard title="Defensive Player of the Year" player={dpoy} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><TeamList title="1st Team All-Blitz" playerIds={currentAwards.firstTeam} /><TeamList title="2nd Team All-Blitz" playerIds={currentAwards.secondTeam} /></div>
        </CardContent>
        <div className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 text-center"><Button Icon={ChevronsRight} label="Continue to Off-Season" onClick={() => dispatch({ type: 'ACKNOWLEDGE_AWARDS' })} variant="success" /></div>
      </Card>
    </div>
  );
};


const LeagueHistory = ({ state }) => {
  const { history, league } = state;
  const [activeTab, setActiveTab] = useState('CHAMPIONS');
  const getPlayer = (id) => league.players[id] || { name: 'N/A', position: 'N/A', teamId: null };
  const getTeamName = (id) => league.teams.find(t => t.id === id)?.name || 'N/A';
  const TabButton = ({ label, tabId }) => (
    <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 font-semibold rounded-t-lg ${activeTab === tabId ? 'bg-blue-700 text-yellow-400' : 'bg-gradient-to-br from-blue-900 to-blue-800 text-blue-200 hover:bg-gradient-to-br from-blue-800 to-blue-900'}`}>{label}</button>
  );
  const renderContent = () => {
    switch (activeTab) {
      case 'CHAMPIONS':
        return (<ul className="space-y-2">{history.champions.length === 0 ? (<p className="text-blue-200">No champions yet.</p>) : ([...history.champions].reverse().map((c, index) => (<li key={index} className="flex justify-between p-3 bg-blue-700 rounded-lg"><span className="font-semibold text-blue-100">Season {c.season}</span><span className="font-bold text-yellow-400">{c.teamName}</span></li>)))}</ul>);
      case 'MVP': case 'DPOY': case 'FINALS_MVP':
        const awardKey = activeTab === 'MVP' ? 'mvp' : (activeTab === 'DPOY' ? 'dpoy' : 'finalsMvp');
        return (<ul className="space-y-2">{history.awards.length === 0 ? (<p className="text-blue-200">No awards yet.</p>) : ([...history.awards].reverse().map((a, index) => { const player = getPlayer(a[awardKey]); return (<li key={index} className="flex justify-between p-3 bg-blue-700 rounded-lg"><span className="font-semibold text-blue-100">Season {a.season}</span><div className="text-right"><span className="font-bold text-yellow-400">{player.name}</span><span className="text-sm text-blue-200 ml-2">({getTeamName(player.teamId)})</span></div></li>);}))}</ul>);
      case 'ALL_BLITZ':
        return (<div className="space-y-6">{history.awards.length === 0 ? (<p className="text-blue-200">No awards yet.</p>) : ([...history.awards].reverse().map((a, index) => (<div key={index} className="p-4 bg-blue-700 rounded-lg"><h5 className="text-xl font-bold text-white mb-3">Season {a.season}</h5><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><TeamList title="1st Team All-Blitz" playerIds={a.firstTeam} getPlayer={getPlayer} getTeamName={getTeamName} /><TeamList title="2nd Team All-Blitz" playerIds={a.secondTeam} getPlayer={getPlayer} getTeamName={getTeamName} /></div></div>)))}</div>);
      default: return null;
    }
  };
  const TeamList = ({ title, playerIds, getPlayer, getTeamName }) => (
    <div className="p-3 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg"><h4 className="text-lg font-semibold text-yellow-400 mb-2">{title}</h4><ul className="space-y-2">
        {playerIds.map((pid, i) => { const player = getPlayer(pid); return (<li key={i} className="flex justify-between items-center bg-gradient-to-br from-blue-800 to-blue-900 p-2 rounded"><div><span className="font-semibold text-white">{player.name}</span><span className="text-xs text-blue-300 ml-2">{POSITIONS[player.position]}</span></div><span className="text-sm text-blue-200">{getTeamName(player.teamId)}</span></li>);})}
    </ul></div>
  );
  return (
    <Card>
      <CardHeader><h3 className="text-lg font-semibold text-white">League History</h3></CardHeader>
      <div className="px-4 pt-4 bg-gradient-to-br from-blue-800 to-blue-900"><nav className="flex space-x-1"><TabButton label="Champions" tabId="CHAMPIONS" /><TabButton label="MVP" tabId="MVP" /><TabButton label="Finals MVP" tabId="FINALS_MVP" /><TabButton label="DPOY" tabId="DPOY" /><TabButton label="All-Blitz Teams" tabId="ALL_BLITZ" /></nav></div>
      <CardContent className="bg-blue-700 rounded-b-xl max-h-[70vh] overflow-y-auto">{renderContent()}</CardContent>
    </Card>
  );
}

const TeamHistory = ({ state }) => {
  const { game, league, history } = state;
  const [activeTab, setActiveTab] = useState('RECORDS_SEASON');
  const userTeam = league.teams.find(t => t.id === game.userTeamId);
  const { allTimeStats, accolades } = userTeam;
  const teamPlayerSeasons = useMemo(() => history.playerSeasons.filter(ps => ps.teamId === userTeam.id), [history.playerSeasons, userTeam.id]);
  const findRecord = (stat, isGk = false) => {
    if (teamPlayerSeasons.length === 0) { return { player: 'N/A', value: 0, season: 'N/A' }; }
    let record = { player: 'N/A', value: -1, season: 'N/A' };
    if (stat === 'savePct') {
      teamPlayerSeasons.forEach(ps => {
        if (!isGk) return;
        const { saves, shotsFaced } = ps.stats;
        if (shotsFaced >= 20) {
          const pct = (saves / shotsFaced);
          if (pct > record.value) { record = { player: ps.playerName, value: pct, season: ps.season }; }
        }
      });
      record.value = (record.value * 100).toFixed(1) + '%';
    } else {
      teamPlayerSeasons.forEach(ps => {
        if (isGk && (stat === 'goals' || stat === 'stocks')) return;
        if (!isGk && (stat === 'saves')) return;
        const value = ps.stats[stat] || 0;
        if (value > record.value) { record = { player: ps.playerName, value, season: ps.season }; }
      });
    }
    if (record.value === -1) record.value = 0;
    return record;
  };
  const careerRecords = useMemo(() => {
    const playerTotals = new Map();
    teamPlayerSeasons.forEach(ps => {
      if (!playerTotals.has(ps.playerId)) {
        playerTotals.set(ps.playerId, { name: ps.playerName, goals: 0, assists: 0, stocks: 0, saves: 0, shotsFaced: 0, });
      }
      const totals = playerTotals.get(ps.playerId);
      totals.goals += ps.stats.goals || 0; totals.assists += ps.stats.assists || 0;
      totals.stocks += ps.stats.stocks || 0; totals.saves += ps.stats.saves || 0;
      totals.shotsFaced += ps.stats.shotsFaced || 0;
    });
    const records = { goals: { player: 'N/A', value: 0 }, assists: { player: 'N/A', value: 0 }, stocks: { player: 'N/A', value: 0 }, saves: { player: 'N/A', value: 0 }, savePct: { player: 'N/A', value: 0 }, };
    playerTotals.forEach(p => {
      if (p.goals > records.goals.value) records.goals = { player: p.name, value: p.goals };
      if (p.assists > records.assists.value) records.assists = { player: p.name, value: p.assists };
      if (p.stocks > records.stocks.value) records.stocks = { player: p.name, value: p.stocks };
      if (p.saves > records.saves.value) records.saves = { player: p.name, value: p.saves };
      if (p.shotsFaced >= 50) {
        const pct = (p.saves / p.shotsFaced);
        if (pct > records.savePct.value) { records.savePct = { player: p.name, value: pct }; }
      }
    });
    records.savePct.value = (records.savePct.value * 100).toFixed(1) + '%';
    return records;
  }, [teamPlayerSeasons]);
  const seasonRecords = useMemo(() => ({
    goals: findRecord('goals'), assists: findRecord('assists'), stocks: findRecord('stocks'),
    saves: findRecord('saves', true), savePct: findRecord('savePct', true),
  }), [teamPlayerSeasons]);
  const TabButton = ({ label, tabId }) => (
    <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 font-semibold rounded-t-lg ${activeTab === tabId ? 'bg-blue-700 text-yellow-400' : 'bg-gradient-to-br from-blue-900 to-blue-800 text-blue-200 hover:bg-gradient-to-br from-blue-800 to-blue-900'}`}>{label}</button>
  );
  const RecordRow = ({ label, record }) => (
    <li className="flex justify-between p-3 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg"><span className="font-semibold text-blue-100">{label}</span><div className="text-right"><span className="font-bold text-yellow-400 text-lg">{record.value}</span><span className="text-sm text-blue-200 ml-2">({record.player}{record.season && `, S${record.season}`})</span></div></li>
  );
  const CareerRecordRow = ({ label, record }) => (
    <li className="flex justify-between p-3 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg"><span className="font-semibold text-blue-100">{label}</span><div className="text-right"><span className="font-bold text-yellow-400 text-lg">{record.value}</span><span className="text-sm text-blue-200 ml-2">({record.player})</span></div></li>
  );
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><h3 className="text-lg font-semibold text-white">{userTeam.name} - Team History</h3></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-700 rounded-lg text-center"><h4 className="text-lg text-blue-100">All-Time Record</h4><p className="text-3xl font-bold text-white">{`${allTimeStats.wins}-${allTimeStats.losses}-${allTimeStats.draws}`}</p></div>
          <div className="p-4 bg-blue-700 rounded-lg text-center"><h4 className="text-lg text-blue-100">League Banners</h4><p className="text-3xl font-bold text-yellow-400">{accolades.leagueBanners}</p><span className="text-sm text-blue-200">(#1 Regular Season)</span></div>
          <div className="p-4 bg-blue-700 rounded-lg text-center"><h4 className="text-lg text-blue-100">Championships</h4><p className="text-3xl font-bold text-yellow-400">{accolades.championships}</p><span className="text-sm text-blue-200">(Playoff Winners)</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><h3 className="text-lg font-semibold text-white">Team Records</h3></CardHeader>
        <div className="px-4 pt-4 bg-gradient-to-br from-blue-800 to-blue-900"><nav className="flex space-x-1"><TabButton label="Single Season" tabId="RECORDS_SEASON" /><TabButton label="Career (with Team)" tabId="RECORDS_CAREER" /></nav></div>
        <CardContent className="bg-blue-700 rounded-b-xl">
          {activeTab === 'RECORDS_SEASON' && (<ul className="space-y-3"><h4 className="text-xl font-semibold text-white mb-2">Single Season Records</h4><RecordRow label="Goals" record={seasonRecords.goals} /><RecordRow label="Assists" record={seasonRecords.assists} /><RecordRow label="Stocks (Tkl/Blk)" record={seasonRecords.stocks} /><RecordRow label="Saves" record={seasonRecords.saves} /><RecordRow label="Save %" record={seasonRecords.savePct} /></ul>)}
          {activeTab === 'RECORDS_CAREER' && (<ul className="space-y-3"><h4 className="text-xl font-semibold text-white mb-2">Career Records (while on team)</h4><CareerRecordRow label="Goals" record={careerRecords.goals} /><CareerRecordRow label="Assists" record={careerRecords.assists} /><CareerRecordRow label="Stocks (Tkl/Blk)" record={careerRecords.stocks} /><CareerRecordRow label="Saves" record={careerRecords.saves} /><CareerRecordRow label="Save %" record={careerRecords.savePct} /></ul>)}
        </CardContent>
      </Card>
    </div>
  );
};

const PlayoffBracketView = ({ state, dispatch }) => {
  const { playoffBracket } = state.game;
  const { teams } = state.league;
  const getTeamName = (id) => teams.find(t => t.id === id)?.name || 'TBD';
  if (!playoffBracket) {
    return (<Card><CardHeader><h3 className="text-lg font-semibold text-white">Playoff Bracket</h3></CardHeader><CardContent><p className="text-blue-200">The playoffs have not started yet.</p></CardContent></Card>);
  }
  const { round1, round2, finals } = playoffBracket;
  const MatchCard = ({ match, seedA, seedB }) => {
    const teamA = getTeamName(match.teamA); const teamB = getTeamName(match.teamB);
    const scoreA = match.matchData?.homeScore; const scoreB = match.matchData?.awayScore;
    const winnerA = match.winner === match.teamA; const winnerB = match.winner === match.teamB;
    const Wrapper = match.matchData ? 'button' : 'div';
    return (
      <Wrapper className={`bg-blue-700 p-4 rounded-lg w-full text-left ${match.matchData ? 'hover:bg-blue-600 cursor-pointer' : ''}`}
        onClick={match.matchData ? () => dispatch({ type: 'MODAL_OPEN', payload: { type: 'BOX_SCORE', match: match.matchData } }) : undefined}>
        <div className={`flex justify-between items-center ${winnerA ? 'font-bold text-white' : 'text-blue-100'}`}><span>({seedA}) {teamA}</span>{scoreA !== undefined && <span className="text-lg font-bold">{scoreA}</span>}</div>
        <div className="border-t border-blue-600/40 my-2"></div>
        <div className={`flex justify-between items-center ${winnerB ? 'font-bold text-white' : 'text-blue-100'}`}><span>({seedB}) {teamB}</span>{scoreB !== undefined && <span className="text-lg font-bold">{scoreB}</span>}</div>
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
          <div className="space-y-4 w-full md:w-1/3"><h4 className="text-xl font-semibold text-yellow-400 text-center">Round 1</h4><MatchCard match={round1[0]} seedA={round1[0].seedA} seedB={round1[0].seedB} /><MatchCard match={round1[1]} seedA={round1[1].seedA} seedB={round1[1].seedB} /></div>
          <div className="space-y-8 w-full md:w-1/3 md:mt-16"><h4 className="text-xl font-semibold text-yellow-400 text-center">Semifinals</h4><MatchCard match={round2[0]} seedA={round2[0].seedA} seedB={round2[0].seedB} /><MatchCard match={round2[1]} seedA={round2[1].seedA} seedB={round2[1].seedB} /></div>
          <div className="space-y-4 w-full md:w-1/3 md:mt-32"><h4 className="text-xl font-semibold text-yellow-400 text-center">Finals</h4><MatchCard match={finals[0]} seedA={finals[0].seedA} seedB={finals[0].seedB} /></div>
        </div>
      </CardContent>
    </Card>
  );
};

const MatchSimScreen = ({ state, dispatch, matchId }) => {
  const [simSpeed, setSimSpeed] = useState(500);
  const [log, setLog] = useState([]);
  const [isSimming, setIsSimming] = useState(false);
  const match = state.league.schedule.find(m => m.id === matchId);
  if (!match) return <div>Error: Match not found.</div>;
  const homeTeam = state.league.teams.find(t => t.id === match.homeTeamId);
  const awayTeam = state.league.teams.find(t => t.id === match.awayTeamId);
  useEffect(() => {
    if (match.played) { setLog(match.playByPlay); }
    else { setLog([{ time: 0, text: "Waiting to start match..."}]); }
  }, [matchId, match.played, match.playByPlay]);
  const runSimulation = () => { setIsSimming(true); dispatch({ type: 'SIMULATE_MATCH', payload: { matchId } }); };
  const updatedMatch = state.league.schedule.find(m => m.id === matchId);
  useEffect(() => {
    if (isSimming && updatedMatch.played) {
      let i = 0; setLog([]);
      const interval = setInterval(() => {
        if (i < updatedMatch.playByPlay.length) { setLog(prev => [...prev, updatedMatch.playByPlay[i]]); i++; }
        else { clearInterval(interval); setIsSimming(false); }
      }, simSpeed);
      return () => clearInterval(interval);
    }
  }, [isSimming, updatedMatch, simSpeed]);
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-around items-center"><span className="text-2xl font-bold">{homeTeam.name}</span><span className="text-4xl font-bold text-yellow-400">{updatedMatch.played ? `${updatedMatch.homeScore} - ${updatedMatch.awayScore}` : 'VS'}</span><span className="text-2xl font-bold">{awayTeam.name}</span></div>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4 overflow-y-auto mb-4 font-mono text-sm">
          {log.map((entry, index) => (<p key={index} className={`mb-1 ${entry.text.includes('GOAL') ? 'text-green-400 font-bold' : entry.text.includes('SAVE') ? 'text-yellow-400' : 'text-blue-100'}`}><span className="text-blue-300 mr-2">[{entry.time}]</span>{entry.text}</p>))}
        </div>
        <div className="flex justify-between items-center">
          {updatedMatch.played ? (<Button Icon={ArrowRight} label="Back to Home" onClick={() => dispatch({ type: 'NAVIGATE', payload: 'HOME' })} />)
          : (<Button Icon={ChevronsRight} label="Start Simulation" onClick={runSimulation} variant="success" disabled={isSimming} />)}
          <div className="flex items-center space-x-2 text-white"><label>Speed:</label><button onClick={() => setSimSpeed(1000)} className={`px-2 py-1 rounded ${simSpeed === 1000 ? 'bg-cyan-500' : 'bg-blue-700'}`}>Slow</button><button onClick={() => setSimSpeed(500)} className={`px-2 py-1 rounded ${simSpeed === 500 ? 'bg-cyan-500' : 'bg-blue-700'}`}>Mid</button><button onClick={() => setSimSpeed(100)} className={`px-2 py-1 rounded ${simSpeed === 100 ? 'bg-cyan-500' : 'bg-blue-700'}`}>Fast</button></div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- NEW OFF-SEASON PAGES ---

const OffSeasonRetirementsModal = ({ state, dispatch }) => {
    const { retiringPlayers } = state.game.offSeasonData;
    const { league } = state;
    
    const getTeamName = (id) => league.teams.find(t => t.id === id)?.name || 'N/A';
    
    return (
        <div className="fixed inset-0 bg-blue-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border border-yellow-600/30 shadow-2xl">
            <CardHeader className="text-center"><h2 className="text-3xl font-bold text-white">Player Retirements</h2></CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
                {retiringPlayers.length > 0 ? (
                    <ul className="space-y-2">
                        {retiringPlayers.map(player => (
                            <li key={player.id} className="p-3 bg-blue-700 rounded-lg flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-white text-lg">{player.name}</span>
                                    <span className="text-sm text-blue-200 ml-2">({POSITIONS[player.position]} | Age {player.age})</span>
                                </div>
                                <span className="text-blue-100">{getTeamName(player.teamId)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-blue-200 text-center">No players retired this season.</p>
                )}
            </CardContent>
            <div className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 text-center">
                <Button Icon={ChevronsRight} label="Continue to Re-Signing" onClick={() => dispatch({ type: 'ACKNOWLEDGE_RETIREMENTS' })} variant="success" />
            </div>
          </Card>
        </div>
    );
};

const OffSeasonReSigning = ({ state, dispatch }) => {
    const { game, league } = state;
    const userTeam = league.teams.find(t => t.id === game.userTeamId);
    
    const expiringPlayers = userTeam.roster
        .map(pid => league.players[pid])
        .filter(p => p.contract.years <= 0);
        
    const [offers, setOffers] = useState({}); // { playerId: { years: 1, salary: 500 } }

    const handleOfferChange = (playerId, field, value) => {
        const numValue = parseInt(value, 10) || 0;
        setOffers(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [field]: numValue
            }
        }));
    };
    
    const handleOffer = (playerId) => {
        const offer = offers[playerId];
        if (offer && offer.years > 0 && offer.salary > 0) {
            dispatch({ type: 'RE_SIGN_PLAYER', payload: { playerId, offer } });
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Off-Season: Player Re-Signing</h3>
                    <div className="text-right">
                        <div className="text-sm text-blue-200">Salary Cap</div>
                        <div className={`text-lg font-bold ${userTeam.salary > game.salaryCap ? 'text-red-500' : 'text-white'}`}>
                            ${(userTeam.salary / 1000).toFixed(1)}k / ${(game.salaryCap / 1000)}k
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                {expiringPlayers.length === 0 && <p className="text-blue-200">You have no players with expiring contracts.</p>}
                {expiringPlayers.map(player => {
                    const expectedSalary = getPlayerExpectedSalary(player);
                    const currentOffer = offers[player.id] || { years: 1, salary: expectedSalary };
                    return (
                        <div key={player.id} className="p-4 bg-blue-700 rounded-lg grid grid-cols-4 gap-4 items-center">
                            <div>
                                <p className="font-bold text-white text-lg">{player.name}</p>
                                <p className="text-sm text-blue-200">{POSITIONS[player.position]} | OVR: {player.overall}</p>
                                <p className="text-sm text-blue-100">Expects: ~${expectedSalary}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-blue-100">Years:</label>
                                <input type="number" min="1" max="5" value={currentOffer.years} onChange={e => handleOfferChange(player.id, 'years', e.target.value)}
                                    className="w-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded p-2" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-blue-100">Salary:</label>
                                <input type="number" min="100" step="50" value={currentOffer.salary} onChange={e => handleOfferChange(player.id, 'salary', e.target.value)}
                                    className="w-24 bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded p-2" />
                            </div>
                            <Button Icon={DollarSign} label="Offer" onClick={() => handleOffer(player.id)} variant="success" />
                        </div>
                    );
                })}
            </CardContent>
            <div className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 text-center">
                <Button Icon={ChevronsRight} label="Finish Re-Signing & Enter Free Agency" onClick={() => dispatch({ type: 'FINISH_RE_SIGNING' })} variant="primary" />
            </div>
        </Card>
    );
};

const OffSeasonFreeAgency = ({ state, dispatch }) => {
    const { game, league } = state;
    const userTeam = league.teams.find(t => t.id === game.userTeamId);
    
    const freeAgents = league.freeAgents
        .map(pid => league.players[pid])
        .filter(p => p && p.position !== 'RET')
        .sort((a, b) => b.overall - a.overall);
        
    const [offers, setOffers] = useState({}); // { playerId: { years: 1, salary: 500 } }

    const handleOfferChange = (playerId, field, value) => {
        const numValue = parseInt(value, 10) || 0;
        setOffers(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [field]: numValue
            }
        }));
    };
    
    const handleOffer = (playerId) => {
        const offer = offers[playerId];
        if (offer && offer.years > 0 && offer.salary > 0) {
            dispatch({ type: 'SIGN_FREE_AGENT', payload: { playerId, offer } });
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Off-Season: Free Agency</h3>
                    <div className="text-right">
                        <div className="text-sm text-blue-200">Cap Space</div>
                        <div className={`text-lg font-bold ${userTeam.salary > game.salaryCap ? 'text-red-500' : 'text-white'}`}>
                            ${(game.salaryCap - userTeam.salary)}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                {freeAgents.length === 0 && <p className="text-blue-200">There are no free agents available.</p>}
                {freeAgents.map(player => {
                    const expectedSalary = getPlayerExpectedSalary(player);
                    const currentOffer = offers[player.id] || { years: 1, salary: expectedSalary };
                    return (
                        <div key={player.id} className="p-4 bg-blue-700 rounded-lg grid grid-cols-4 gap-4 items-center">
                            <div>
                                <p className="font-bold text-white text-lg">{player.name}</p>
                                <p className="text-sm text-blue-200">{POSITIONS[player.position]} | OVR: {player.overall}</p>
                                <p className="text-sm text-blue-100">Expects: ~${expectedSalary}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-blue-100">Years:</label>
                                <input type="number" min="1" max="5" value={currentOffer.years} onChange={e => handleOfferChange(player.id, 'years', e.target.value)}
                                    className="w-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded p-2" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-blue-100">Salary:</label>
                                <input type="number" min="100" step="50" value={currentOffer.salary} onChange={e => handleOfferChange(player.id, 'salary', e.target.value)}
                                    className="w-24 bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded p-2" />
                            </div>
                            <Button Icon={UserPlus} label="Offer" onClick={() => handleOffer(player.id)} variant="success" />
                        </div>
                    );
                })}
            </CardContent>
            <div className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 text-center">
                <Button Icon={ChevronsRight} label="Finish Free Agency & Proceed to Draft" onClick={() => dispatch({ type: 'FINISH_FREE_AGENCY' })} variant="primary" />
            </div>
        </Card>
    );
};

const OffSeasonDraft = ({ state, dispatch }) => {
    const { game, league } = state;
    const { draftClass, userDraftPicks } = game.offSeasonData;
    
    const draftablePlayers = draftClass
        .map(pid => league.players[pid])
        .filter(p => p && p.teamId === null); // Already sorted by potential
        
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Off-Season: Rookie Draft</h3>
                    <div className="text-right">
                        <div className="text-sm text-blue-200">Picks Remaining</div>
                        <div className="text-lg font-bold text-white">{userDraftPicks}</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                {draftablePlayers.length === 0 && <p className="text-blue-200">The draft class is empty.</p>}
                {draftablePlayers.map(player => {
                    const salary = player.contract.salary;
                    return (
                        <div key={player.id} className="p-4 bg-blue-700 rounded-lg grid grid-cols-4 gap-4 items-center">
                            <div>
                                <p className="font-bold text-white text-lg">{player.name}</p>
                                <p className="text-sm text-blue-200">{POSITIONS[player.position]} | Age: {player.age}</p>
                            </div>
                             <div>
                                <p className="text-sm text-blue-200">Overall</p>
                                <p className="font-bold text-white text-lg">{player.overall}</p>
                            </div>
                            <div>
                                <p className="text-sm text-blue-200">Potential</p>
                                <p className="font-bold text-yellow-400 text-lg">{player.potential} / 10</p>
                            </div>
                            <Button Icon={PackagePlus} label={`Draft ($${salary})`} onClick={() => dispatch({ type: 'DRAFT_PLAYER', payload: { playerId: player.id } })} variant="success" disabled={userDraftPicks <= 0} />
                        </div>
                    );
                })}
            </CardContent>
            <div className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 text-center">
                <Button Icon={ChevronsRight} label="Finish Draft & Proceed to Progression" onClick={() => dispatch({ type: 'FINISH_DRAFT' })} variant="primary" />
            </div>
        </Card>
    );
};

const OffSeasonProgression = ({ state, dispatch }) => {
    const { game, league } = state;
    const userTeam = league.teams.find(t => t.id === game.userTeamId);
    const { progressionLog } = game.offSeasonData;
    
    const userProgression = progressionLog.filter(log => 
        userTeam.roster.includes(log.playerId)
    );
    
    return (
        <Card>
            <CardHeader><h3 className="text-xl font-semibold text-white">Off-Season: Player Progression</h3></CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                {userProgression.length === 0 && <p className="text-blue-200">No players on your team had significant changes.</p>}
                {userProgression.map(log => {
                    const ovrChange = log.newOvr - log.oldOvr;
                    const ovrColor = ovrChange > 0 ? 'text-green-500' : 'text-red-500';
                    return (
                        <div key={log.playerId} className="p-4 bg-blue-700 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold text-white text-lg">{log.name}</p>
                                <p className={`font-bold text-lg ${ovrColor}`}>
                                    {log.oldOvr} → {log.newOvr} ({ovrChange > 0 ? `+${ovrChange}` : ovrChange})
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {log.changes.map(change => {
                                    const changeColor = change.new > change.old ? 'text-green-400' : 'text-red-400';
                                    return (
                                        <p key={change.stat} className="text-sm text-blue-100">
                                            {change.stat}: {change.old} → <span className={`font-bold ${changeColor}`}>{change.new}</span>
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
            <div className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 text-center">
                <Button Icon={ChevronsRight} label="Start New Season" onClick={() => dispatch({ type: 'FINISH_PROGRESSION' })} variant="success" />
            </div>
        </Card>
    );
};

// --- MODAL COMPONENTS ---

const MessageModal = ({ text, onClose }) => (
    <div className="fixed inset-0 bg-blue-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm border border-yellow-500 shadow-2xl">
        <CardHeader><h3 className="text-lg font-semibold text-white">Notification</h3></CardHeader>
        <CardContent>
            <p className="text-blue-100 text-center text-lg">{text}</p>
        </CardContent>
        <div className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 text-center">
            <Button onClick={onClose} variant="primary">OK</Button>
        </div>
      </Card>
    </div>
);


// --- MAIN APP COMPONENT ---

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    const savedGame = localStorage.getItem('blitzSimSave');
    try {
      if (savedGame) { return JSON.parse(savedGame); }
    } catch (e) {
      console.error("Failed to parse saved game:", e);
      localStorage.removeItem('blitzSimSave');
    }
    return initializeNewGame();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    localStorage.setItem('blitzSimSave', JSON.stringify(state));
  }, [state]);

  const handleNewGame = () => {
    setIsLoading(true);
    dispatch({ type: 'START_NEW_GAME' });
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleNav = (page) => { dispatch({ type: 'NAVIGATE', payload: page }); };
  
  const userTeam = state.league.teams.find(t => t.id === state.game.userTeamId);
  if (!userTeam) {
    dispatch({ type: 'START_NEW_GAME' });
    return <div>Loading...</div>;
  }

  const renderPage = () => {
    const { ui } = state;
    switch (ui.currentPage) {
      case 'HOME': return <Dashboard state={state} dispatch={dispatch} />;
      case 'TEAM': return <TeamManagement state={state} dispatch={dispatch} />;
      case 'STANDINGS': return <LeagueStandings state={state} dispatch={dispatch} />;
      case 'SCHEDULE': return <ScheduleView state={state} dispatch={dispatch} />;
      case 'PLAYOFFS': return <PlayoffBracketView state={state} dispatch={dispatch} />;
      case 'LEAGUE_HISTORY': return <LeagueHistory state={state} />;
      case 'TEAM_HISTORY': return <TeamHistory state={state} />;
      case 'SIM_MATCH': return <MatchSimScreen state={state} dispatch={dispatch} matchId={ui.matchId} />;
      // Off-Season Pages
      case 'OFF_SEASON_RE_SIGNING': return <OffSeasonReSigning state={state} dispatch={dispatch} />;
      case 'OFF_SEASON_FREE_AGENCY': return <OffSeasonFreeAgency state={state} dispatch={dispatch} />;
      case 'OFF_SEASON_DRAFT': return <OffSeasonDraft state={state} dispatch={dispatch} />;
      case 'OFF_SEASON_PROGRESSION': return <OffSeasonProgression state={state} dispatch={dispatch} />;
      default: return <Dashboard state={state} dispatch={dispatch} />;
    }
  };
  
  // Modal State
  const modalPlayer = state.ui.modal?.type === 'PLAYER' ? state.league.players[state.ui.modal.playerId] : null;
  const modalMatch = state.ui.modal?.type === 'BOX_SCORE' ? state.ui.modal.match : null;
  const showAwards = state.ui.modal?.type === 'AWARDS';
  const modalTeamId = state.ui.modal?.type === 'TEAM_ROSTER' ? state.ui.modal.teamId : null;
  const showRetirements = state.ui.modal?.type === 'RETIREMENTS';
  const messageText = state.ui.modal?.type === 'MESSAGE' ? state.ui.modal.text : null;


  if (isLoading) {
     return (<div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 min-h-screen flex items-center justify-center text-white"><h1 className="text-3xl font-bold animate-pulse text-yellow-400 drop-shadow-lg shadow-yellow-500">Loading New Game...</h1></div>);
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 text-blue-50 font-sans">
      <Sidebar onNav={handleNav} onNewGame={handleNewGame} isExpanded={isSidebarExpanded} currentPage={state.ui.currentPage} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar userTeam={userTeam} season={state.game.currentSeason} onToggleSidebar={() => setIsSidebarExpanded(prev => !prev)} isExpanded={isSidebarExpanded} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </main>
      </div>
      
      {/* Modals */}
      {modalPlayer && <PlayerCard player={modalPlayer} state={state} onClose={() => dispatch({ type: 'MODAL_CLOSE' })} />}
      {modalMatch && <BoxScoreModal match={modalMatch} state={state} dispatch={dispatch} />}
      {showAwards && <AwardsModal state={state} dispatch={dispatch} />}
      {modalTeamId && <TeamRosterModal teamId={modalTeamId} state={state} dispatch={dispatch} />}
      {showRetirements && <OffSeasonRetirementsModal state={state} dispatch={dispatch} />}
      {messageText && <MessageModal text={messageText} onClose={() => dispatch({ type: 'MODAL_CLOSE' })} />}
    </div>
  );
}

