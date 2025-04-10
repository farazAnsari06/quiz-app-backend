const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    answer: String,
    isCorrect: Boolean,
    timeToAnswer: Number // in milliseconds
  }]
});

const GameSessionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  players: [PlayerSchema],
  isSinglePlayer: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('GameSession', GameSessionSchema);