let sessionStatsChanges = {
    totalGames: 0,
    choiceWins: {
        rock: 0,
        paper: 0,
        scissors: 0
    },
    playerWins: 0,
    computerWins: 0
};

let currentDisplayedStats = {
    totalGames: 0,
    choiceWins: {
        rock: 0,
        paper: 0,
        scissors: 0
    },
    playerWins: 0,
    computerWins: 0
};

window.playGame = (playerChoice) => { 
    fetch('/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerChoice })
    })
    .then(response => response.json())
    .then(data => {
        const resultElement = document.getElementById('result');
        resultElement.innerText = data.message;
        resultElement.hidden = false;

        const computerChoiceElement = document.querySelector('.computer-svg');
        computerChoiceElement.classList.remove('animate-choice');
        setTimeout(() => {
            computerChoiceElement.classList.add('animate-choice');
            computerChoiceElement.src = `/public/svg/${data.serverChoice.toLowerCase()}.svg`;
            computerChoiceElement.alt = data.serverChoice.toLowerCase();
        }, 10);
    
        sessionStatsChanges.totalGames++;
        if (data.gameResult === 'win') {
            sessionStatsChanges.choiceWins[playerChoice]++;
            sessionStatsChanges.playerWins++;
        } else if (data.gameResult === 'lose') {
            sessionStatsChanges.computerWins++;
        }
        updateDisplayedStats();
    })
    .catch(error => {
        console.error('Error playing game:', error);
    });
}

const capitalizeFirstLetter = (string) => {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  function updateDisplayedStats() {
    currentDisplayedStats.totalGames = initialBaseStats.totalGames + sessionStatsChanges.totalGames;
    currentDisplayedStats.playerWins = initialBaseStats.playerWins + sessionStatsChanges.playerWins;
    currentDisplayedStats.computerWins = initialBaseStats.computerWins + sessionStatsChanges.computerWins;
  
    for (const choice in initialBaseStats.choiceWins) {
      currentDisplayedStats.choiceWins[choice] = initialBaseStats.choiceWins[choice] + sessionStatsChanges.choiceWins[choice];
    }

    document.getElementById('totalGames').textContent = currentDisplayedStats.totalGames;

    let mostWins = 0;
    let mostFrequent = 'None';
    for (const choice in currentDisplayedStats.choiceWins) {
      if (currentDisplayedStats.choiceWins[choice] > mostWins) {
        mostWins = currentDisplayedStats.choiceWins[choice];
        mostFrequent = choice;
      }
    }
    document.getElementById('mostFrequentWin').textContent = capitalizeFirstLetter(mostFrequent);

    let mostFrequentWinnerText = 'Tie';
    if (currentDisplayedStats.playerWins > currentDisplayedStats.computerWins) {
        mostFrequentWinnerText = 'Human';
    } else if (currentDisplayedStats.computerWins > currentDisplayedStats.playerWins) {
        mostFrequentWinnerText = 'Computer';
    }
    document.getElementById('mostFrequentWinner').textContent = mostFrequentWinnerText;
  }

let initialBaseStats = null; 

fetch('/stats')
.then(response => response.json())
.then(data => {
    initialBaseStats = data; 
    updateDisplayedStats();
})
.catch(error => console.error('Error loading initial stats:', error));

window.addEventListener('beforeunload', () => {
    if (sessionStatsChanges.totalGames > 0) { 
        navigator.sendBeacon('/stats/session-end', JSON.stringify(sessionStatsChanges));
    }
});

  setInterval(() => {
   if (sessionStatsChanges.totalGames > 0) {
    fetch('/stats/session-end', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionStatsChanges)
    })
    .then(() => {
        console.log('Session stats periodically saved.');
        sessionStatsChanges = { totalGames: 0, choiceWins: { rock: 0, paper: 0, scissors: 0 }, playerWins: 0, computerWins: 0 };
    })
    .catch(error => console.error('Error periodically saving session stats:', error));
    }
  }, 100000); 