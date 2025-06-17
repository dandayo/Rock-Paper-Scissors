const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const gameLogic = require('./gameLogic');
const { getStats, initializeStats, applySessionChanges } = require('./stats');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await initializeStats();
  })
  .catch(err => {
    console.error(' MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/play', async (req, res) => {
    try {
        const playerChoice = req.body.playerChoice; 
        
        if (!playerChoice || !['rock', 'paper', 'scissors'].includes(playerChoice.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid player choice.' });
        }

        const serverChoice = gameLogic.getRandomChoice();
        const result = gameLogic.determineWinner(playerChoice, serverChoice);

        // Update stats
        const sessionStats = {
            totalGames: 1,
            playerWins: result.result === 'win' ? 1 : 0,
            computerWins: result.result === 'lose' ? 1 : 0,
            choiceWins: {
                [playerChoice]: result.result === 'win' ? 1 : 0
            }
        };
        
        await applySessionChanges(sessionStats);

        res.json({
            message: `You selected ${playerChoice}. ${result.message}`,
            serverChoice: serverChoice,
            gameResult: result.result 
        });
    } catch (error) {
        console.error('Error processing game:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/stats', async (req, res) => {
    try {
        const stats = await getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});