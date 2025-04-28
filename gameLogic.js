const choices = ['rock', 'paper', 'scissors'];

function getRandomChoice() {
    return choices[Math.floor(Math.random() * 3)];
}

function determineWinner(playerChoice, serverChoice) {
    if (playerChoice === serverChoice) {
        return {
            message: `Aww, we tied! I also chose ${serverChoice}.`,
            result: 'tie'
        };
    } else if (
        (playerChoice === 'rock' && serverChoice === 'paper') ||
        (playerChoice === 'paper' && serverChoice === 'scissors') ||
        (playerChoice === 'scissors' && serverChoice === 'rock')
    ) {
        return {
            message: `Ha! You lost. I chose ${serverChoice}.`,
            result: 'lose'
        };
    } else {
        return {
            message: `Dang it, you won! I chose ${serverChoice}.`,
            result: 'win'
        };
    }
}

module.exports = {
    getRandomChoice,
    determineWinner
}; 