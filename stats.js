const fs = require('fs');
const STATS_FILE = 'gameStats.json';

let gameStats = {
    totalGames: 0,
    choiceWins: {
        rock: 0,
        paper: 0,
        scissors: 0
    },
    playerWins: 0,
    computerWins: 0
};

// Load existing stats from file (if any)
try {
    const data = fs.readFileSync(STATS_FILE, 'utf8');
    gameStats = JSON.parse(data);
} catch (err) {
    // If the file doesn't exist or is invalid, use the default stats
    console.log('No existing stats file found, or file is invalid. Using default stats.');
}

function updateStats(playerChoice, result) {
    gameStats.totalGames++;
    if (result === 'win') {
        gameStats.choiceWins[playerChoice]++;
        gameStats.playerWins++;
    } else if (result === 'lose') {
        gameStats.computerWins++;
    }

    // Save stats to file
    fs.writeFileSync(STATS_FILE, JSON.stringify(gameStats, null, 2), 'utf8');
}

function getStats() {
    const stats = { ...gameStats };
    // Determine who wins more often
    if (stats.playerWins > stats.computerWins) {
        stats.mostFrequentWinner = 'Human';
    } else if (stats.computerWins > stats.playerWins) {
        stats.mostFrequentWinner = 'Computer';
    } else {
        stats.mostFrequentWinner = 'Tie';
    }
    return stats;
}

module.exports = {
    updateStats,
    getStats
};