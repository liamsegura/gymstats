const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  leaderboard: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
    },
  ],
});

module.exports = mongoose.model('Challenge', challengeSchema);
