const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  iconName: {
    type: String,
    default: 'help-circle'
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Category', CategorySchema);