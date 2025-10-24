/**
 * Player and team calculation utilities
 */

// Helper: Calculate a player's expected salary
export const getPlayerExpectedSalary = (player) => {
  const { overall, potential, age } = player;
  const base = 50;
  const ovrBonus = Math.pow(overall / 10, 2) * 5; // Exponential bonus for high OVR
  const potBonus = potential * 50;
  const agePenalty = Math.max(0, age - 28) * 100; // Penalize older players

  const expected = base + ovrBonus + potBonus - agePenalty;
  return Math.max(100, Math.round(expected / 50) * 50); // Round to nearest 50, min 100
};

// Helper: Calculate a team's total salary
export const calculateTeamSalary = (team, allPlayers) => {
  return team.roster.reduce((sum, playerId) => {
    const player = allPlayers[playerId];
    return sum + (player?.contract?.salary || 0);
  }, 0);
};

/**
 * Calculates a performance score for a player based on season stats
 */
export const getPlayerPerfScore = (player) => {
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
