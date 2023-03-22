const mongoose = require('mongoose');


const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['comment', 'like', 'follow', 'post'],
    required: true,
  },
  generator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel',
  },
  onModel: {
    type: String,
    enum: ['Post', 'PR'],
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;

