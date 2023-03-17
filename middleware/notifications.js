const Notification = require('../models/Notification');
const User = require('../models/User');


async function notifications(req, res, next) {
    if (!req.user) {
      return next();
    }
  
    try {
      const count = await User.findById(req.user._id); 
      console.log(count)
      res.locals.notificationsCount = count.unreadCount || 0; // Initialize count to zero if undefined or null
      return next();
    } catch (err) {
      console.error(err);
      return next(err);
    }
  }
  
  module.exports = notifications;