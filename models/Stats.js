const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  totalGames: {
    type: Number,
    default: 0,
  },
  playerWins: {
    type: Number,
    default: 0,
  },
  computerWins: {
    type: Number,
    default: 0,
  },
  choiceWins: {
    rock: { type: Number, default: 0 },
    paper: { type: Number, default: 0 },
    scissors: { type: Number, default: 0 },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('GameStats', statsSchema);
