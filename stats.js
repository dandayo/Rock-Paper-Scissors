const GameStats = require('./models/Stats');

let gameStatsSingleton = null; // Will store the single instance of stats loaded from DB

// Async function to initialize stats
async function initializeStats() {
  try {
    let stats = await GameStats.findOne();

    if (!stats) {
      stats = new GameStats(); // Use default values from schema
      await stats.save();
      console.log('📊 Initial game stats created in MongoDB.');
    } else {
      console.log('📊 Existing game stats loaded from MongoDB.');
    }
    gameStatsSingleton = stats; // Save loaded/created stats to singleton
    return stats;
  } catch (error) {
    console.error('❌ Error initializing game stats from MongoDB:', error);
    // In case of error, return default values for local work,
    // but in production this needs stricter handling
    const defaultStats = new GameStats();
    gameStatsSingleton = defaultStats;
    return defaultStats;
  }
}

// Applies session changes to main stats in DB
async function applySessionChanges(sessionStatsChanges) {
    if (!gameStatsSingleton) {
        gameStatsSingleton = await initializeStats(); // Ensure stats are loaded
    }

    // Apply changes to current singleton
    gameStatsSingleton.totalGames += sessionStatsChanges.totalGames || 0;
    gameStatsSingleton.playerWins += sessionStatsChanges.playerWins || 0;
    gameStatsSingleton.computerWins += sessionStatsChanges.computerWins || 0;

    // Update choiceWins
    if (sessionStatsChanges.choiceWins) {
        for (const choice in sessionStatsChanges.choiceWins) {
          if (!(choice in gameStatsSingleton.choiceWins)) {
            gameStatsSingleton.choiceWins[choice] = 0;
          }
            gameStatsSingleton.choiceWins[choice] += sessionStatsChanges.choiceWins[choice] || 0;
        }
    }

    gameStatsSingleton.lastUpdated = Date.now(); // Update last modified time

    try {
        await gameStatsSingleton.save(); // Save updated stats to DB
        console.log('Session game stats applied and saved to MongoDB.');
    } catch (error) {
        console.error('Error applying and saving session stats to MongoDB:', error);
    }
}

// Function to get stats (always gets current from singleton)
async function getStats() {
  if (!gameStatsSingleton) {
    gameStatsSingleton = await initializeStats();
  }

  // Make a copy to avoid modifying original object
  const statsData = {
    totalGames: Number(gameStatsSingleton.totalGames),
    choiceWins: { ...gameStatsSingleton.choiceWins },
    playerWins: Number(gameStatsSingleton.playerWins),
    computerWins: Number(gameStatsSingleton.computerWins)
  };

  // Add logic to determine most frequent winner
  if (statsData.playerWins > statsData.computerWins) {
    statsData.mostFrequentWinner = 'Human';
  } else if (statsData.computerWins > statsData.playerWins) {
    statsData.mostFrequentWinner = 'Computer';
  } else {
    statsData.mostFrequentWinner = 'Tie';
  }
  return statsData;
}

module.exports = {
  getStats,
  initializeStats,
  applySessionChanges 
};