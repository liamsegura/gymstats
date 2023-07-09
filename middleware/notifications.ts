import User from '../models/User'

async function notifications(req:any, res:any, next:any) {
    if (!req.user) {
      return next();
    }
  
    try {
      const count = await User.findById(req.user._id); 
      if(count != null){
      res.locals.notificationsCount = count.unreadCount || 0; // Initialize count to zero if undefined or null
      }
      return next();
    } catch (err) {
      console.error(err);
      return next(err);
    }
  }
  
export default notifications;