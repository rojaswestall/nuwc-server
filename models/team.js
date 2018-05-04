const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const teamSchema = new Schema({
  name: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  flag: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  points: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  tournament: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  abb: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
})

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;