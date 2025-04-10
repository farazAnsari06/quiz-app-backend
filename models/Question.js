const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: [
      function(val) {
        return val.length >= 4 && val.length <= 5;
      },
      'Questions must have 4 or 5 options'
    ]
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: [
      function(val) {
        return this.options.includes(val);
      },
      'Correct answer must be one of the options'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['anime', 'movies', 'sports', 'knowledge', 'technology', 'science', 'history', 'geography'],
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for efficient queries
QuestionSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model('Question', QuestionSchema);



// models/GameSession.js
