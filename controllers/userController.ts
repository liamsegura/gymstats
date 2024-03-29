import User from '../models/User'
import Relationship from '../models/Relationship'
import Notification from "../models/Notification"
import moment from 'moment'
import cloudinary from "../middleware/cloudinary"


export default {



getNotifications: async (req: any, res: any) => {
  try {
    const userId = req.user._id;
  
    // Find all notifications for the current user
    const notifications = await Notification.find({ recipient: userId })
      .populate({ path: 'generator', model: 'User'})
      .populate({path: 'post'})
      .sort({ read: 1, createdAt: 'desc' });
    
  
    await User.findByIdAndUpdate(userId, { unreadCount: 0 });

    
    notifications.forEach((notification: { read: boolean; _id: string }) => {
      if (notification.read) {
        setTimeout(async () => {
          await Notification.deleteOne({_id: notification._id});
        }, 1000); // delete after 10 seconds for testing
      }
    })
    //currently not running due to free service closing server after 15 minutes of inactivity 
    // delete after 24/hrs - 24 * 60 * 60 * 1000
    
    // Format the createdAt date of each notification
notifications.forEach((notification: { createdAt: string; formattedElapsedTime: string }) => {
  // Calculate the elapsed time
  const elapsedTime = moment(notification.createdAt).fromNow(true);

  // Format the elapsed time string
  let elapsedTimeString;
  if (elapsedTime.startsWith('a few seconds')) {
    elapsedTimeString = 'Just now';
  } else if (elapsedTime.startsWith('a minute')) {
    elapsedTimeString = '1m';
  } else if (elapsedTime.startsWith('an hour')) {
    elapsedTimeString = '1h';
  } else if (elapsedTime.startsWith('a day')) {
    elapsedTimeString = '1d';
  } else {
    elapsedTimeString = elapsedTime.replace('minutes', 'm').replace('hours', 'h').replace('days', 'd');
  }

  // Set the formatted elapsed time string on the notification object
  notification.formattedElapsedTime = elapsedTimeString.replace(/\s+/g, '');
});

res.render('notifications.ejs', {
  pageTitle: 'notifications',
  notifications,
  loggedUser: req.user,
  onNotificationsPage: true
});

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
},


saveProfile: async (req:any, res:any) => {
  try {
    console.log(req.file)
    console.log(req.body)
    // Check if the new username already exists in the database
    const user = await User.findOne({ userName: req.body.userName });
    if (user && user._id.toString() !== req.params.id) {
      req.flash("errors", {
        msg: "Account with that username already exists.",
      });
      // If the username exists and belongs to a different user, don't update
      console.log(`Username "${req.body.userName}" already exists`);
      res.redirect(`/editProfile/${req.params.id}`);
      return;
    }

    // Update the user document
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          userName: req.body.userName,
          bodyweight: req.body.bodyweight,
        },
      },
      { new: true }
    );
    console.log("User Updated");
    res.redirect(`/profile/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
},


saveProfilePic: async (req:any, res:any) => {
  try {
    console.log(req.file)
      const user = await User.findById(req.params.id)
      console.log(user)

      if(user && user.cloudinaryId){
      await cloudinary.uploader.destroy(user.cloudinaryId, { resource_type: "image" })
      }
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        transformation: [
         { width: 200, height: 200, crop: "fill" }
        ]})

    // Update the user document
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          profilePic: {
            url: result.secure_url,
            type: req.file ? req.file.mimetype : user ? user.profilePic.type : null,  
          },
          cloudinaryId: result.public_id
        },
      },
      { new: true }
    );
    console.log("User Updated");
    res.redirect(`/profile/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
},

getFollowers: async (req: any, res: any) => {
  try {

    const userId = req.params.userId;
    const user = await User.findById(userId).populate({ path: 'followers', model: 'User'}).populate({ path: 'following', model: 'User'})
    res.render("followers.ejs", {
      pageTitle: user ? user.userName : null,
      loggedUser: req.user,
      user,
      onNotificationsPage: false

    });
  } catch (err) {
    console.log(err);
  }
},

followUser: async (req:any, res:any) => {
  try {
    const userId = req.params.userId;
    const userToFollowId = req.params.userToFollowId;



    if (userId === userToFollowId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const [user, userToFollow] = await Promise.all([
      User.findById(userId),
      User.findById(userToFollowId)
    ]);

   

    if (!user || !userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const relationship = await Relationship.findOneAndUpdate(
      { follower: userId, following: userToFollowId },
      { follower: userId, following: userToFollowId },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, { $addToSet: { following: userToFollowId } });
    await User.findByIdAndUpdate(userToFollowId, { $addToSet: { followers: userId } });

    
      // Create notification for the user being followed
      const notification:any = new Notification({
        type: 'follow',
        generator: userId,
        recipient: userToFollowId
      });
      await notification.save();
      await User.findByIdAndUpdate(notification.recipient, { $inc: { unreadCount: 1 } });

    res.redirect(`/profile/${userToFollowId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
},

unfollowUser: async (req:any, res:any) => {
  try {
    const userId = req.params.userId;
    const userToUnfollowId = req.params.userToUnfollowId;

    console.log('userId:', userId);
    console.log('userToUnfollowId:', userToUnfollowId);

    if (userId === userToUnfollowId) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const [user, userToUnfollow] = await Promise.all([
      User.findById(userId),
      User.findById(userToUnfollowId)
    ]);

    console.log('user:', user);
    console.log('userToUnfollow:', userToUnfollow);

    if (!user || !userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Relationship.findOneAndDelete({ follower: userId, following: userToUnfollowId });
    await User.findByIdAndUpdate(userId, { $pull: { following: userToUnfollowId } });
    await User.findByIdAndUpdate(userToUnfollowId, { $pull: { followers: userId } });
    const notification = await Notification.findOne({
      type: 'follow',
      generator: userId,
      recipient: userToUnfollowId,
    });
    if (notification) {
      const notificationId = notification._id;
      await Notification.findByIdAndDelete(notificationId);
      await User.findByIdAndUpdate(notification.recipient, { $inc: { unreadCount: -1 } });
    }

    res.redirect(`/profile/${userToUnfollowId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}


}