const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  app: String,
  domain: String,
  title: String,
  duration: Number,
  type: {
    type: String,
    enum: ['app', 'tab'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
