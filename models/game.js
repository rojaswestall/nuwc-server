const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const gameSchema = new Schema({
  team1: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  score1: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  team2: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  score2: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  type: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  tournament: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  game: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
})

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;