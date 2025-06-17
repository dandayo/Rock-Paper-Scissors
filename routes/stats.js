const express = require('express');
const router = express.Router();
const stats = require('../stats');

router.get('/stats', async (req, res) => {
    try {
        const gameStats = await stats.getStats();
        res.json(gameStats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

router.post('/stats', async (req, res) => {
    try {

    const { playerChoice, result } = req.body;
    await stats.updateStats(playerChoice, result);
    res.json({ message: 'Stats updated successfully' });
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(500).json({ error: 'Failed to update stats' });
    }
});

module.exports = router;